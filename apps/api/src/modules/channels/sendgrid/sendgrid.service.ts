import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';

export interface SendEmailDto {
  locationId: string;
  to: string;
  subject: string;
  body: string;
  html?: string;
  fromName?: string;
  fromEmail?: string;
  replyTo?: string;
}

@Injectable()
export class SendgridService {
  private readonly logger = new Logger(SendgridService.name);

  constructor(private readonly config: ConfigService) {
    sgMail.setApiKey(config.get<string>('SENDGRID_API_KEY') ?? '');
  }

  async sendEmail(dto: SendEmailDto): Promise<string> {
    const [response] = await sgMail.send({
      to: dto.to,
      from: {
        email: dto.fromEmail ?? `noreply@${this.config.get('SENDGRID_INBOUND_PARSE_DOMAIN') ?? 'mail.smeconnect.co.za'}`,
        name: dto.fromName ?? 'SME Connect',
      },
      subject: dto.subject,
      text: dto.body,
      html: dto.html ?? `<p>${dto.body.replace(/\n/g, '<br/>')}</p>`,
      ...(dto.replyTo ? { replyTo: dto.replyTo } : {}),
    });

    const messageId = response.headers['x-message-id'] as string ?? 'unknown';
    this.logger.log(`Email sent: ${messageId} → ${dto.to}`);
    return messageId;
  }
}
