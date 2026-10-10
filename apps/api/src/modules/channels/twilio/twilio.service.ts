import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import twilio = require('twilio');
import * as crypto from 'crypto';
import { Location } from '../../locations/location.entity';

export interface SendSmsDto {
  locationId: string;
  to: string;
  body: string;
  mediaUrls?: string[];
}

export interface SendWhatsAppDto {
  locationId: string;
  to: string;
  body: string;
  templateSid?: string;
}

@Injectable()
export class TwilioService {
  private readonly logger = new Logger(TwilioService.name);
  private client: twilio.Twilio;

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(Location) private readonly locationRepo: Repository<Location>,
  ) {
    this.client = twilio(
      config.get<string>('TWILIO_ACCOUNT_SID'),
      config.get<string>('TWILIO_AUTH_TOKEN'),
    );
  }

  // ─── Validate Twilio webhook signature ───────────────────────────────────
  validateSignature(
    signature: string,
    url: string,
    params: Record<string, string>,
  ): boolean {
    const authToken = this.config.get<string>('TWILIO_AUTH_TOKEN') ?? '';
    return twilio.validateRequest(authToken, signature, url, params);
  }

  // ─── Send SMS or MMS ──────────────────────────────────────────────────────
  async sendSms(dto: SendSmsDto): Promise<string> {
    const location = await this.locationRepo.findOne({ where: { id: dto.locationId } });
    const fromNumber = (location?.settings as any)?.twilioNumber;
    if (!fromNumber) throw new Error(`No Twilio number configured for location ${dto.locationId}`);

    const msg = await this.client.messages.create({
      to: dto.to,
      from: fromNumber,
      body: dto.body,
      ...(dto.mediaUrls?.length ? { mediaUrl: dto.mediaUrls } : {}),
    });

    this.logger.log(`SMS sent: ${msg.sid} → ${dto.to}`);
    return msg.sid;
  }

  // ─── Send WhatsApp ────────────────────────────────────────────────────────
  async sendWhatsApp(dto: SendWhatsAppDto): Promise<string> {
    const location = await this.locationRepo.findOne({ where: { id: dto.locationId } });
    const waNumber = (location?.settings as any)?.whatsappNumber;
    if (!waNumber) throw new Error(`No WhatsApp number for location ${dto.locationId}`);

    const payload: twilio.Twilio['messages']['create'] extends (...args: infer P) => any
      ? P[0]
      : never = {
      to: `whatsapp:${dto.to}`,
      from: `whatsapp:${waNumber}`,
      body: dto.body,
      ...(dto.templateSid
        ? { contentSid: dto.templateSid, messagingServiceSid: undefined }
        : {}),
    };

    const msg = await this.client.messages.create(payload as any);
    return msg.sid;
  }

  // ─── Generate TwiML for voice AI ─────────────────────────────────────────
  buildVoiceStreamTwiml(locationId: string): string {
    const baseUrl = this.config.get<string>('API_BASE_URL') ?? 'http://localhost:3001';
    const twiml = new twilio.twiml.VoiceResponse();
    const connect = twiml.connect();
    connect.stream({ url: `wss://${new URL(baseUrl).host}/api/voice/stream/${locationId}` });
    return twiml.toString();
  }

  // ─── Simple TwiML say + hangup (for transfer, missed call, etc.) ─────────
  buildSayTwiml(message: string): string {
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say({ voice: 'Polly.Joanna' }, message);
    twiml.hangup();
    return twiml.toString();
  }

  // ─── Lookup phone carrier info (optional enrichment) ─────────────────────
  async lookupPhone(phone: string): Promise<{ carrier?: string; lineType?: string }> {
    try {
      const result = await this.client.lookups.v2.phoneNumbers(phone).fetch({
        fields: 'line_type_intelligence',
      });
      return {
        carrier: (result as any).lineTypeIntelligence?.carrier_name,
        lineType: (result as any).lineTypeIntelligence?.type,
      };
    } catch {
      return {};
    }
  }
}
