import {
  Controller,
  Post,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiExcludeEndpoint } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { ContactsService } from '../../contacts/contacts.service';
import { ConversationsService } from '../../conversations/conversations.service';
import { InboxGateway } from '../../../gateways/inbox.gateway';
import { Location } from '../../locations/location.entity';

// SendGrid Inbound Parse delivers multipart/form-data.
// NestJS body-parser parses the form fields into plain object.
interface SendGridInboundBody {
  to?: string;
  from?: string;
  subject?: string;
  text?: string;
  html?: string;
  'message-id'?: string;
  headers?: string;
  charsets?: string;
  // Attachments come as separate fields; we ignore them in this handler
  [key: string]: string | undefined;
}

// SendGrid Inbound Parse IP ranges (as of 2024).
// We block all other IPs at the guard level.
const SENDGRID_IP_RANGES = [
  '167.89.0.0/17',
  '198.37.144.0/20',
  '149.72.0.0/16',
  '208.117.48.0/20',
];

function isIpAllowed(ip: string): boolean {
  // In production this should use a proper CIDR lib.
  // For now we allow all in development and check the class-A prefix in production.
  // Replace with `ip-cidr` package for full CIDR matching.
  if (process.env.NODE_ENV !== 'production') return true;
  return SENDGRID_IP_RANGES.some((range) => {
    const [base] = range.split('/');
    const baseOctets = base.split('.');
    const ipOctets = ip.split('.');
    // Simple prefix check — upgrade to full CIDR in prod
    return baseOctets.slice(0, 2).join('.') === ipOctets.slice(0, 2).join('.');
  });
}

@ApiTags('Webhooks — SendGrid')
@Controller('v1/webhooks/sendgrid')
export class SendgridWebhookController {
  private readonly logger = new Logger(SendgridWebhookController.name);

  constructor(
    private readonly config: ConfigService,
    private readonly contactsService: ContactsService,
    private readonly conversationsService: ConversationsService,
    private readonly inboxGateway: InboxGateway,
    @InjectRepository(Location) private readonly locationRepo: Repository<Location>,
  ) {}

  /**
   * POST /v1/webhooks/sendgrid/inbound
   * SendGrid Inbound Parse webhook — receives inbound emails routed via MX.
   * Must be registered in SendGrid Dashboard → Settings → Inbound Parse.
   * Destination domain MX → mx.sendgrid.net
   */
  @Post('inbound')
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  async inboundEmail(
    @Body() body: SendGridInboundBody,
    @Req() req: Request,
  ): Promise<string> {
    // 1. IP allowlist check
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
      ?? req.socket.remoteAddress
      ?? '';
    if (!isIpAllowed(ip)) {
      this.logger.warn(`SendGrid inbound from unknown IP: ${ip}`);
      throw new UnauthorizedException('IP not in SendGrid CIDR range');
    }

    const to = body.to ?? '';
    const from = body.from ?? '';
    const subject = body.subject ?? '(no subject)';
    const text = body.text ?? '';
    const messageId = body['message-id'] ?? `sg_${Date.now()}`;

    this.logger.log(`Inbound email: ${from} → ${to} | subject: ${subject}`);

    // 2. Find location by inbound email address
    //    Convention: location email = <locationSlug>@<SENDGRID_INBOUND_PARSE_DOMAIN>
    //    or a custom reply-to per location stored in location.settings.inboundEmail
    const inboundDomain = this.config.get<string>('SENDGRID_INBOUND_PARSE_DOMAIN') ?? '';
    const location = await this.locationRepo
      .createQueryBuilder('l')
      .where(
        `l.settings->>'inboundEmail' = :to OR (:to LIKE '%@' || :domain AND l.id IS NOT NULL)`,
        { to: to.toLowerCase().trim(), domain: inboundDomain },
      )
      .getOne();

    // Fallback: find the first location that has sendgrid configured
    // In a real multi-tenant setup you'd have a dedicated inbound address per location.
    const resolvedLocation =
      location ??
      (await this.locationRepo
        .createQueryBuilder('l')
        .where(`l.settings ? 'sendgridEnabled'`)
        .getOne());

    if (!resolvedLocation) {
      this.logger.warn(`No location found for inbound email to: ${to}`);
      // Return 200 so SendGrid doesn't retry — just discard.
      return 'ok';
    }

    // 3. Extract sender email
    const senderEmail = extractEmail(from);
    if (!senderEmail) {
      this.logger.warn(`Could not parse sender email from: ${from}`);
      return 'ok';
    }

    // 4. Dedup / create contact
    const contact = await this.contactsService.findOrCreateByIdentifier({
      locationId: resolvedLocation.id,
      email: senderEmail,
      source: 'INBOUND_EMAIL',
    });

    // 5. Save inbound message
    const msg = await this.conversationsService.saveInbound({
      externalId: messageId,
      channel: 'EMAIL',
      body: text.trim() || stripHtml(body.html ?? ''),
      attachments: [],
      senderId: senderEmail,
      locationId: resolvedLocation.id,
      contactId: contact.id,
      subject,
      sentAt: new Date(),
    });

    // 6. Real-time broadcast
    const conv = await this.conversationsService.findConvOrFail(
      msg.conversationId,
      resolvedLocation.id,
    );
    this.inboxGateway.emitNewMessage(conv.id, msg);
    this.inboxGateway.emitConversationUpdated(resolvedLocation.id, {
      id: conv.id,
      lastMessageBody: msg.body ?? subject,
      lastMessageAt: msg.sentAt,
      unreadCount: conv.unreadCount,
    });

    return 'ok';
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractEmail(raw: string): string | null {
  // "John Smith <john@example.com>" → "john@example.com"
  const match = raw.match(/<([^>]+)>/);
  if (match) return match[1].toLowerCase().trim();
  // plain "john@example.com"
  if (raw.includes('@')) return raw.toLowerCase().trim();
  return null;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
