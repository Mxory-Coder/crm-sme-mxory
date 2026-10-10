import {
  Controller,
  Post,
  Body,
  Headers,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiTags, ApiExcludeEndpoint } from '@nestjs/swagger';
import { TwilioService } from './twilio.service';
import { ContactsService } from '../../contacts/contacts.service';
import { ConversationsService } from '../../conversations/conversations.service';
import { ChannelRouterService } from '../router/channel-router.service';
import { InboxGateway } from '../../../gateways/inbox.gateway';
import { renderTemplate, buildContactVarMap } from '@sme/shared';
import { InjectRepository } from '@nestjs/typeorm';
import { Location } from '../../locations/location.entity';
import { Repository } from 'typeorm';

interface TwilioSmsBody {
  MessageSid: string;
  From: string;
  To: string;
  Body: string;
  NumMedia?: string;
  MediaUrl0?: string;
  MediaContentType0?: string;
  AccountSid: string;
}

interface TwilioCallStatusBody {
  CallSid: string;
  CallStatus: string;
  From: string;
  To: string;
  CallDuration?: string;
  AccountSid: string;
}

@ApiTags('Webhooks — Twilio')
@Controller('v1/webhooks/twilio')
export class TwilioWebhookController {
  private readonly logger = new Logger(TwilioWebhookController.name);

  constructor(
    private readonly twilioService: TwilioService,
    private readonly contactsService: ContactsService,
    private readonly conversationsService: ConversationsService,
    private readonly channelRouter: ChannelRouterService,
    private readonly inboxGateway: InboxGateway,
    @InjectRepository(Location) private readonly locationRepo: Repository<Location>,
  ) {}

  // ─── Inbound SMS ──────────────────────────────────────────────────────────
  @Post('sms')
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  async inboundSms(
    @Body() body: TwilioSmsBody,
    @Headers('x-twilio-signature') signature: string,
    @Req() req: Request & { rawBody?: Buffer },
    @Res() res: Response,
  ) {
    // 1. Validate signature
    const webhookUrl = `${this.twilioService['config'].get('API_BASE_URL')}/api/v1/webhooks/twilio/sms`;
    const params = Object.fromEntries(
      Object.entries(body).map(([k, v]) => [k, String(v ?? '')]),
    );
    if (!this.twilioService.validateSignature(signature, webhookUrl, params)) {
      this.logger.warn('Invalid Twilio SMS signature');
      throw new BadRequestException('Invalid signature');
    }

    // 2. Find location by Twilio number (To)
    const location = await this.locationRepo
      .createQueryBuilder('l')
      .where(`l.settings->>'twilioNumber' = :to`, { to: body.To })
      .getOne();

    if (!location) {
      this.logger.warn(`No location found for Twilio number ${body.To}`);
      return res.status(200).send('<Response/>');
    }

    // 3. Dedup/create contact
    const contact = await this.contactsService.findOrCreateByIdentifier({
      locationId: location.id,
      phone: body.From,
      source: 'TWILIO_SMS',
    });

    // 4. Build attachments from MMS
    const attachments = [];
    const numMedia = parseInt(body.NumMedia ?? '0');
    for (let i = 0; i < numMedia; i++) {
      const urlKey = `MediaUrl${i}` as keyof TwilioSmsBody;
      const typeKey = `MediaContentType${i}` as keyof TwilioSmsBody;
      if (body[urlKey]) {
        attachments.push({ url: body[urlKey] as string, mimeType: (body[typeKey] as string) ?? 'application/octet-stream' });
      }
    }

    // 5. Save inbound message
    const msg = await this.conversationsService.saveInbound({
      externalId: body.MessageSid,
      channel: numMedia > 0 ? 'MMS' : 'SMS',
      body: body.Body,
      attachments,
      senderId: body.From,
      locationId: location.id,
      contactId: contact.id,
      sentAt: new Date(),
    });

    // 6. Real-time broadcast
    const conv = await this.conversationsService.findConvOrFail(msg.conversationId, location.id);
    this.inboxGateway.emitNewMessage(conv.id, msg);
    this.inboxGateway.emitConversationUpdated(location.id, {
      id: conv.id,
      lastMessageBody: msg.body ?? '',
      lastMessageAt: msg.sentAt,
      unreadCount: conv.unreadCount,
    });

    // 7. Respond with empty TwiML (we handle reply separately)
    res.type('text/xml').status(200).send('<Response/>');
  }

  // ─── Call status webhook (missed call text-back) ─────────────────────────
  @Post('call-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiExcludeEndpoint()
  async callStatus(
    @Body() body: TwilioCallStatusBody,
    @Headers('x-twilio-signature') signature: string,
  ) {
    const isMissed =
      ['no-answer', 'busy', 'failed'].includes(body.CallStatus) ||
      (body.CallStatus === 'completed' && parseInt(body.CallDuration ?? '1') === 0);

    if (!isMissed) return;

    this.logger.log(`Missed call from ${body.From} → triggering text-back`);

    // Find location by number
    const location = await this.locationRepo
      .createQueryBuilder('l')
      .where(`l.settings->>'twilioNumber' = :to`, { to: body.To })
      .getOne();

    if (!location) return;

    const settings = location.settings as any;
    if (!settings?.missedCallTextBackEnabled) return;

    // Dedup/create contact
    const contact = await this.contactsService.findOrCreateByIdentifier({
      locationId: location.id,
      phone: body.From,
      source: 'MISSED_CALL',
    });

    // Render template
    const template =
      settings.missedCallTemplate ??
      "Hi {{contact.first_name}}, sorry we missed your call! We'll get back to you shortly. 😊";
    const vars = buildContactVarMap(
      { ...contact, firstName: contact.firstName ?? '', lastName: contact.lastName ?? '' },
      { name: location.name, phone: location.phone ?? '', website: location.website ?? '' },
    );
    const messageBody = renderTemplate(template, vars);

    // Send SMS
    const externalId = await this.channelRouter.send('SMS', {
      locationId: location.id,
      contactId: contact.id,
      toPhone: body.From,
      body: messageBody,
    });

    // Log as outbound message
    const conv = await this.conversationsService.findOrCreate(location.id, contact.id, 'SMS');
    await this.conversationsService.saveOutbound(
      conv.id,
      location.id,
      messageBody,
      'SYSTEM',
      externalId,
    );

    this.logger.log(`Missed-call text-back sent: ${externalId} → ${body.From}`);
  }

  // ─── TwiML endpoint for voice AI ─────────────────────────────────────────
  @Post('voice/inbound')
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  async voiceInbound(@Body() body: any, @Res() res: Response) {
    const location = await this.locationRepo
      .createQueryBuilder('l')
      .where(`l.settings->>'twilioNumber' = :to`, { to: body.To })
      .getOne();

    if (!location) {
      const twiml = this.twilioService.buildSayTwiml(
        "Thank you for calling. We're unable to take your call right now.",
      );
      return res.type('text/xml').send(twiml);
    }

    const settings = location.settings as any;
    if (settings?.voiceAiEnabled) {
      const twiml = this.twilioService.buildVoiceStreamTwiml(location.id);
      return res.type('text/xml').send(twiml);
    }

    // Fallback: just say a message
    const greeting = settings?.voiceGreeting ?? 'Thanks for calling. Please leave a message.';
    return res.type('text/xml').send(this.twilioService.buildSayTwiml(greeting));
  }
}
