import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from 'bull';
import { getAnthropic, CLAUDE_MODEL } from '@sme/ai';
import { Conversation } from '../conversations/conversation.entity';
import { ConversationMessage } from '../conversations/conversation-message.entity';
import { ConversationAiDraft } from '../conversations/conversation-ai-draft.entity';
import { Location } from '../locations/location.entity';
import { InboxGateway } from '../../gateways/inbox.gateway';

export const CONVERSATION_AI_QUEUE = 'conversation-ai';

export interface ConversationAiJobData {
  conversationId: string;
  messageId: string;
  locationId: string;
}

@Processor(CONVERSATION_AI_QUEUE)
export class ConversationAiProcessor {
  private readonly logger = new Logger(ConversationAiProcessor.name);

  constructor(
    @InjectRepository(Conversation)
    private readonly convRepo: Repository<Conversation>,
    @InjectRepository(ConversationMessage)
    private readonly msgRepo: Repository<ConversationMessage>,
    @InjectRepository(ConversationAiDraft)
    private readonly draftRepo: Repository<ConversationAiDraft>,
    @InjectRepository(Location)
    private readonly locationRepo: Repository<Location>,
    private readonly inboxGateway: InboxGateway,
  ) {}

  @Process('generate-draft')
  async generateDraft(job: Job<ConversationAiJobData>): Promise<void> {
    const { conversationId, messageId, locationId } = job.data;
    this.logger.debug(`Generating AI draft for conversation ${conversationId}`);

    try {
      // 1. Load conversation + location
      const [conv, location] = await Promise.all([
        this.convRepo.findOne({
          where: { id: conversationId },
        }),
        this.locationRepo.findOne({ where: { id: locationId } }),
      ]);

      if (!conv || !location) {
        this.logger.warn(`Conv or location not found for draft job ${job.id}`);
        return;
      }

      // 2. Load last 10 messages for context
      const recentMessages = await this.msgRepo.find({
        where: { conversationId },
        order: { sentAt: 'DESC' },
        take: 10,
      });
      // Reverse so oldest first (chronological order for Claude)
      recentMessages.reverse();

      // 3. Skip if the most recent message is outbound (we just sent something)
      const lastMsg = recentMessages[recentMessages.length - 1];
      if (!lastMsg || lastMsg.direction === 'outbound' || lastMsg.direction === 'internal') {
        return;
      }

      // 4. Build Claude messages array
      const claudeMessages = recentMessages
        .filter((m) => m.direction !== 'internal')
        .map((m) => ({
          role: m.direction === 'inbound' ? ('user' as const) : ('assistant' as const),
          content: m.body ?? '',
        }))
        .filter((m) => m.content.length > 0);

      if (claudeMessages.length === 0) return;

      // 5. Build system prompt from location settings
      const settings = (location.settings ?? {}) as Record<string, string>;
      const businessName = location.name ?? 'our business';
      const systemPrompt = [
        `You are a helpful customer service assistant for ${businessName}.`,
        `Always be professional, friendly, and concise.`,
        `Keep replies under 3 sentences unless more detail is genuinely needed.`,
        `Never invent pricing or policy — if unsure, offer to connect them with the team.`,
        settings.aiPersona ? `\nPersonality: ${settings.aiPersona}` : '',
        settings.aiInstructions ? `\nAdditional instructions: ${settings.aiInstructions}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      // 6. Call Claude
      const anthropic = getAnthropic();
      const response = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 300,
        system: systemPrompt,
        messages: claudeMessages,
      });

      const draftBody =
        response.content[0]?.type === 'text' ? response.content[0].text.trim() : null;

      if (!draftBody) return;

      // 7. Save draft
      const draft = await this.draftRepo.save(
        this.draftRepo.create({
          conversationId,
          messageId,
          locationId,
          body: draftBody,
          modelUsed: CLAUDE_MODEL,
          status: 'pending',
          confidence: response.stop_reason === 'end_turn' ? 0.85 : 0.6,
        }),
      );

      // 8. Push to open browser tabs via Socket.io
      this.inboxGateway.emitAiDraft(conversationId, {
        id: draft.id,
        body: draft.body,
        confidence: draft.confidence ?? undefined,
      });

      this.logger.log(`AI draft ${draft.id} generated for conversation ${conversationId}`);
    } catch (err) {
      this.logger.error(`AI draft generation failed: ${(err as Error).message}`, (err as Error).stack);
      // Don't rethrow — failed drafts are non-critical
    }
  }
}
