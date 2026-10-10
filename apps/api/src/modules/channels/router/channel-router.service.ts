import { Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { ChannelType } from '@sme/shared';
import { TwilioService } from '../twilio/twilio.service';
import { SendgridService } from '../sendgrid/sendgrid.service';

export interface OutboundDto {
  locationId: string;
  contactId: string;
  toPhone?: string;
  toEmail?: string;
  facebookPsid?: string;
  instagramIgsid?: string;
  body: string;
  attachments?: Array<{ url: string; mimeType: string }>;
  subject?: string;       // email
  messageTag?: string;    // facebook
  templateSid?: string;   // whatsapp outside 24h window
}

@Injectable()
export class ChannelRouterService {
  private readonly logger = new Logger(ChannelRouterService.name);

  constructor(
    private readonly twilioService: TwilioService,
    private readonly sendgridService: SendgridService,
  ) {}

  async send(channel: ChannelType, dto: OutboundDto): Promise<string> {
    this.logger.log(`Routing outbound ${channel} for location ${dto.locationId}`);

    switch (channel) {
      case 'SMS':
      case 'MMS':
        return this.twilioService.sendSms({
          locationId: dto.locationId,
          to: dto.toPhone!,
          body: dto.body,
          mediaUrls: dto.attachments?.map((a) => a.url),
        });

      case 'EMAIL':
        return this.sendgridService.sendEmail({
          locationId: dto.locationId,
          to: dto.toEmail!,
          subject: dto.subject ?? '(no subject)',
          body: dto.body,
        });

      case 'WHATSAPP':
        return this.twilioService.sendWhatsApp({
          locationId: dto.locationId,
          to: dto.toPhone!,
          body: dto.body,
          templateSid: dto.templateSid,
        });

      case 'FACEBOOK':
      case 'INSTAGRAM':
      case 'WEBCHAT':
        // These adapters will be added in Phase 3 (Meta integration)
        throw new NotImplementedException(`${channel} outbound not yet implemented`);

      default:
        throw new NotImplementedException(`Unknown channel: ${channel}`);
    }
  }
}
