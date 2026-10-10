import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from 'bull';
import { getAnthropic, CLAUDE_MODEL } from '@sme/ai';
import { Opportunity } from '../opportunities/opportunity.entity';
import { ConversationMessage } from '../conversations/conversation-message.entity';
import { OpportunityStageHistory } from '../opportunities/opportunity-stage-history.entity';
import { OPPORTUNITY_AI_QUEUE } from '../opportunities/opportunities.service';

interface ScoreJobData {
  opportunityId: string;
  locationId: string;
}

const SCORE_TOOL = {
  name: 'score_opportunity',
  description: 'Score a sales opportunity and suggest next action',
  input_schema: {
    type: 'object' as const,
    properties: {
      score: { type: 'number', minimum: 0, maximum: 100 },
      reason: { type: 'string' },
      next_action: { type: 'string' },
      risk_flags: { type: 'array', items: { type: 'string' } },
    },
    required: ['score', 'reason', 'next_action'],
  },
};

@Processor(OPPORTUNITY_AI_QUEUE)
export class OpportunityAiProcessor {
  private readonly logger = new Logger(OpportunityAiProcessor.name);

  constructor(
    @InjectRepository(Opportunity) private readonly oppRepo: Repository<Opportunity>,
    @InjectRepository(ConversationMessage) private readonly msgRepo: Repository<ConversationMessage>,
    @InjectRepository(OpportunityStageHistory) private readonly historyRepo: Repository<OpportunityStageHistory>,
  ) {}

  @Process('score')
  async score(job: Job<ScoreJobData>): Promise<void> {
    const { opportunityId } = job.data;

    try {
      const opp = await this.oppRepo.findOne({ where: { id: opportunityId } });
      if (!opp) return;

      const [messages, history] = await Promise.all([
        this.msgRepo.find({
          where: { contactId: opp.primaryContactId ?? undefined },
          order: { sentAt: 'DESC' },
          take: 20,
        }),
        this.historyRepo.find({
          where: { opportunityId },
          order: { changedAt: 'DESC' },
          take: 10,
        }),
      ]);

      const daysSinceStageChange = opp.lastStageChangedAt
        ? Math.floor((Date.now() - opp.lastStageChangedAt.getTime()) / 86_400_000)
        : 0;

      const prompt = [
        `Opportunity: "${opp.name}"`,
        `Value: ${opp.currency} ${opp.monetaryValue}`,
        `Status: ${opp.status}`,
        `Days in current stage: ${daysSinceStageChange}`,
        history.length
          ? `Stage history: ${history.map((h) => h.toStageId).join(' → ')}`
          : '',
        messages.length
          ? `Recent conversation (last ${messages.length} messages):\n${messages
              .map((m) => `${m.direction}: ${(m.body ?? '').substring(0, 120)}`)
              .join('\n')}`
          : 'No conversation history yet.',
      ]
        .filter(Boolean)
        .join('\n');

      const anthropic = getAnthropic();
      const response = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 512,
        tools: [SCORE_TOOL],
        tool_choice: { type: 'tool', name: 'score_opportunity' },
        messages: [{ role: 'user', content: `Score this opportunity:\n${prompt}` }],
      });

      const toolBlock = response.content.find((b) => b.type === 'tool_use');
      if (!toolBlock || toolBlock.type !== 'tool_use') return;

      const { score, reason, next_action, risk_flags } = toolBlock.input as any;

      await this.oppRepo.update(opportunityId, {
        aiScore: Math.round(score),
        aiScoreReason: reason,
        aiNextAction: next_action,
        aiRiskFlags: risk_flags ?? [],
        aiScoredAt: new Date(),
      });

      this.logger.log(`Scored opportunity ${opportunityId}: ${score}/100`);
    } catch (err) {
      this.logger.error(`AI scoring failed for ${opportunityId}: ${(err as Error).message}`);
    }
  }
}
