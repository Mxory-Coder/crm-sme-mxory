import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProspectingLead } from './agency.entities';
import { getAnthropic, CLAUDE_MODEL } from '@sme/ai';

export interface ProspectSearchDto {
  city: string;
  industry: string;
  country?: string;
  limit?: number;
}

@Injectable()
export class ProspectingService {
  constructor(
    @InjectRepository(ProspectingLead)
    private readonly leadRepo: Repository<ProspectingLead>,
  ) {}

  async findAll(agencyId: string): Promise<ProspectingLead[]> {
    return this.leadRepo.find({
      where: { agencyId },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(agencyId: string, id: string): Promise<ProspectingLead> {
    const lead = await this.leadRepo.findOne({ where: { id, agencyId } });
    if (!lead) throw new NotFoundException('Prospecting lead not found');
    return lead;
  }

  async create(agencyId: string, dto: Partial<ProspectingLead>): Promise<ProspectingLead> {
    return this.leadRepo.save(this.leadRepo.create({ ...dto, agencyId }));
  }

  async update(agencyId: string, id: string, dto: Partial<ProspectingLead>): Promise<ProspectingLead> {
    const lead = await this.findById(agencyId, id);
    Object.assign(lead, dto);
    return this.leadRepo.save(lead);
  }

  async delete(agencyId: string, id: string): Promise<void> {
    await this.findById(agencyId, id);
    await this.leadRepo.delete({ id, agencyId });
  }

  async aiGenerateAuditReport(agencyId: string, leadId: string): Promise<string> {
    const lead = await this.findById(agencyId, leadId);
    const anthropic = getAnthropic();

    const res = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1200,
      tools: [{
        name: 'create_audit_report',
        description: 'Generate a digital marketing audit report for a local business prospect',
        input_schema: {
          type: 'object' as const,
          properties: {
            score: { type: 'number', description: 'Overall digital presence score 0-100' },
            summary: { type: 'string', description: 'Executive summary (2-3 sentences)' },
            strengths: { type: 'array', items: { type: 'string' } },
            weaknesses: { type: 'array', items: { type: 'string' } },
            opportunities: { type: 'array', items: { type: 'string' } },
            recommended_services: {
              type: 'array',
              items: { type: 'string' },
              description: 'CRM/marketing services most relevant to this business',
            },
            pitch_angle: { type: 'string', description: 'Best sales angle for this prospect in 1-2 sentences' },
          },
          required: ['score', 'summary', 'strengths', 'weaknesses', 'opportunities', 'recommended_services', 'pitch_angle'],
        },
      }],
      tool_choice: { type: 'tool', name: 'create_audit_report' },
      messages: [{
        role: 'user',
        content: `Generate a digital marketing audit report for this local business prospect:

Business: ${lead.businessName}
Industry: ${lead.industry ?? 'Unknown'}
Location: ${[lead.city, lead.country].filter(Boolean).join(', ')}
Website: ${lead.website ?? 'None found'}
Google Rating: ${lead.rating ?? 'Unknown'}/5 (${lead.reviewCount ?? 0} reviews)

Assess their likely digital presence gaps (missed call follow-up, no CRM, no automated review collection, no AI chatbot) and generate a compelling audit report showing how a CRM/marketing automation platform would help them grow.`,
      }],
    });

    const toolResult = res.content.find((b) => b.type === 'tool_use');
    if (!toolResult || toolResult.type !== 'tool_use') return 'Audit generation failed.';

    const result = toolResult.input as {
      score: number;
      summary: string;
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
      recommended_services: string[];
      pitch_angle: string;
    };

    const report = [
      `# Digital Presence Audit: ${lead.businessName}`,
      `**Overall Score: ${result.score}/100**`,
      '',
      `## Summary`,
      result.summary,
      '',
      `## Strengths`,
      ...result.strengths.map((s) => `- ${s}`),
      '',
      `## Areas for Improvement`,
      ...result.weaknesses.map((w) => `- ${w}`),
      '',
      `## Growth Opportunities`,
      ...result.opportunities.map((o) => `- ${o}`),
      '',
      `## Recommended Services`,
      ...result.recommended_services.map((s) => `- ${s}`),
      '',
      `## Sales Approach`,
      result.pitch_angle,
    ].join('\n');

    // Save report and score
    await this.leadRepo.update({ id: leadId }, {
      aiAuditReport: report,
      aiScore: result.score,
    });

    return report;
  }

  async bulkImport(agencyId: string, leads: Partial<ProspectingLead>[]): Promise<ProspectingLead[]> {
    const entities = leads.map((l) => this.leadRepo.create({ ...l, agencyId, source: 'IMPORT' }));
    return this.leadRepo.save(entities);
  }
}
