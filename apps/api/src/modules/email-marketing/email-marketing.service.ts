import {
  Injectable, NotFoundException, BadRequestException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailCampaign } from './email-campaign.entity';
import { EmailTemplate } from './email-template.entity';
import { getAnthropic, CLAUDE_MODEL } from '@sme/ai';

export interface CreateCampaignDto {
  name: string;
  subject: string;
  previewText?: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  bodyHtml: string;
  bodyText?: string;
  type?: 'ONE_TIME' | 'AUTOMATED' | 'AB_TEST';
  segmentFilters?: Record<string, unknown>;
  scheduledAt?: string;
}

export interface AiEmailDto {
  topic: string;
  tone?: string;
  businessName?: string;
  contactName?: string;
  goal: 'nurture' | 'promo' | 'announcement' | 'reengagement' | 'welcome';
}

@Injectable()
export class EmailMarketingService {
  private readonly logger = new Logger(EmailMarketingService.name);

  constructor(
    @InjectRepository(EmailCampaign)
    private readonly campaignRepo: Repository<EmailCampaign>,
    @InjectRepository(EmailTemplate)
    private readonly templateRepo: Repository<EmailTemplate>,
  ) {}

  // ─── Campaigns CRUD ───────────────────────────────────────────────────────

  async findAll(locationId: string): Promise<EmailCampaign[]> {
    return this.campaignRepo.find({
      where: { locationId },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(locationId: string, id: string): Promise<EmailCampaign> {
    const campaign = await this.campaignRepo.findOne({ where: { id, locationId } });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  async create(locationId: string, dto: CreateCampaignDto, userId: string): Promise<EmailCampaign> {
    const campaign = this.campaignRepo.create({
      locationId,
      name: dto.name,
      subject: dto.subject,
      previewText: dto.previewText ?? null,
      fromName: dto.fromName,
      fromEmail: dto.fromEmail,
      replyTo: dto.replyTo ?? null,
      bodyHtml: dto.bodyHtml,
      bodyText: dto.bodyText ?? null,
      type: dto.type ?? 'ONE_TIME',
      segmentFilters: dto.segmentFilters ?? {},
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
      status: dto.scheduledAt ? 'SCHEDULED' : 'DRAFT',
      createdBy: userId,
    });
    return this.campaignRepo.save(campaign);
  }

  async update(locationId: string, id: string, dto: Partial<CreateCampaignDto>): Promise<EmailCampaign> {
    const campaign = await this.findById(locationId, id);
    if (campaign.status === 'SENT') {
      throw new BadRequestException('Cannot edit a sent campaign');
    }
    Object.assign(campaign, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.subject !== undefined && { subject: dto.subject }),
      ...(dto.previewText !== undefined && { previewText: dto.previewText }),
      ...(dto.fromName !== undefined && { fromName: dto.fromName }),
      ...(dto.fromEmail !== undefined && { fromEmail: dto.fromEmail }),
      ...(dto.replyTo !== undefined && { replyTo: dto.replyTo }),
      ...(dto.bodyHtml !== undefined && { bodyHtml: dto.bodyHtml }),
      ...(dto.bodyText !== undefined && { bodyText: dto.bodyText }),
      ...(dto.segmentFilters !== undefined && { segmentFilters: dto.segmentFilters }),
      ...(dto.scheduledAt !== undefined && {
        scheduledAt: new Date(dto.scheduledAt),
        status: 'SCHEDULED' as const,
      }),
    });
    return this.campaignRepo.save(campaign);
  }

  async delete(locationId: string, id: string): Promise<void> {
    const campaign = await this.findById(locationId, id);
    if (campaign.status === 'SENDING') {
      throw new BadRequestException('Cannot delete a campaign while it is sending');
    }
    await this.campaignRepo.remove(campaign);
  }

  // ─── Templates CRUD ───────────────────────────────────────────────────────

  async findAllTemplates(locationId: string): Promise<EmailTemplate[]> {
    return this.templateRepo.find({
      where: [{ locationId }, { isGlobal: true }],
      order: { createdAt: 'DESC' },
    });
  }

  async createTemplate(locationId: string, dto: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const t = this.templateRepo.create({ ...dto, locationId });
    return this.templateRepo.save(t);
  }

  async deleteTemplate(locationId: string, id: string): Promise<void> {
    const t = await this.templateRepo.findOne({ where: { id, locationId } });
    if (!t) throw new NotFoundException('Template not found');
    await this.templateRepo.remove(t);
  }

  // ─── AI Email Generation ─────────────────────────────────────────────────

  async generateEmail(dto: AiEmailDto): Promise<{ subject: string; body: string }> {
    const anthropic = getAnthropic();

    const goalInstructions: Record<AiEmailDto['goal'], string> = {
      nurture: 'Write a warm, educational email that builds trust and provides value. No hard sell.',
      promo: 'Write a promotional email with a clear CTA and limited-time offer angle.',
      announcement: 'Write a clean, concise announcement email. Professional and exciting.',
      reengagement: 'Write a re-engagement email for a contact who has gone quiet. Empathetic, not pushy.',
      welcome: 'Write a warm welcome email for a new contact. Set expectations and highlight benefits.',
    };

    const TOOL = {
      name: 'create_email',
      description: 'Create a marketing email with subject line and HTML body',
      input_schema: {
        type: 'object' as const,
        properties: {
          subject: { type: 'string', description: 'Email subject line, max 60 chars' },
          preheader: { type: 'string', description: 'Preview text shown after subject, max 90 chars' },
          body: {
            type: 'string',
            description: 'Email body in HTML. Use inline styles. Keep it mobile-friendly. Use {{contact.first_name}} for personalisation.',
          },
        },
        required: ['subject', 'body'],
      },
    };

    const res = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      tools: [TOOL],
      tool_choice: { type: 'tool', name: 'create_email' },
      messages: [{
        role: 'user',
        content: `${goalInstructions[dto.goal]}

Topic: "${dto.topic}"
Tone: ${dto.tone ?? 'professional and friendly'}
Business: ${dto.businessName ?? 'our business'}
${dto.contactName ? `Contact name: ${dto.contactName}` : ''}

Write the email now.`,
      }],
    });

    const toolBlock = res.content.find((b) => b.type === 'tool_use');
    if (!toolBlock || toolBlock.type !== 'tool_use') {
      return { subject: '', body: '' };
    }
    const input = toolBlock.input as { subject: string; body: string };
    return { subject: input.subject, body: input.body };
  }

  // ─── AI Subject Line Variants ─────────────────────────────────────────────

  async generateSubjectVariants(topic: string, tone: string): Promise<string[]> {
    const anthropic = getAnthropic();
    const res = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: `Write 5 email subject line variants for this topic: "${topic}".
Tone: ${tone}.
Rules: max 60 chars each, no clickbait, drive curiosity or urgency.
Return one per line, no numbering.`,
      }],
    });
    const text = res.content[0].type === 'text' ? res.content[0].text : '';
    return text.split('\n').map((s) => s.trim()).filter((s) => s.length > 0).slice(0, 5);
  }

  // ─── Stats snapshot ───────────────────────────────────────────────────────

  async getStats(locationId: string): Promise<{
    total: number;
    sent: number;
    scheduled: number;
    avgOpenRate: number;
  }> {
    const campaigns = await this.campaignRepo.find({ where: { locationId } });
    const sent = campaigns.filter((c) => c.status === 'SENT');
    const scheduled = campaigns.filter((c) => c.status === 'SCHEDULED').length;
    const avgOpenRate = sent.length
      ? sent.reduce((acc, c) => {
          const rate = c.totalRecipients > 0 ? (c.uniqueOpens / c.totalRecipients) * 100 : 0;
          return acc + rate;
        }, 0) / sent.length
      : 0;
    return {
      total: campaigns.length,
      sent: sent.length,
      scheduled,
      avgOpenRate: Math.round(avgOpenRate * 10) / 10,
    };
  }
}
