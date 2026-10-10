import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getAnthropic, CLAUDE_MODEL } from '@sme/ai';
import { AiAgent } from './ai-agent.entity';
import { KnowledgeBaseService } from '../knowledge-base/knowledge-base.service';
import { ConversationMessage } from '../conversations/conversation-message.entity';

export interface CreateAgentDto {
  name: string;
  systemPrompt: string;
  greeting?: string;
  mode?: string;
  channels?: string[];
  calendarId?: string;
  humanHandoffTriggers?: string[];
  bookingIntentPhrases?: string[];
  outOfHoursMessage?: string;
  toneProfile?: Record<string, unknown>;
  responseDelayMs?: number;
}

export interface AgentRunResult {
  reply: string;
  toolCallsMade: string[];
  handoffTriggered: boolean;
  handoffReason?: string;
  kbChunksUsed: number;
}

// Claude tools available to every agent
const AGENT_TOOLS = [
  {
    name: 'book_appointment',
    description: 'Book a calendar appointment for the contact',
    input_schema: {
      type: 'object' as const,
      properties: {
        calendarId: { type: 'string' },
        datetime: { type: 'string', description: 'ISO 8601 date-time' },
        notes: { type: 'string' },
      },
      required: ['calendarId', 'datetime'],
    },
  },
  {
    name: 'update_contact_field',
    description: 'Update a custom field on the contact record mid-conversation',
    input_schema: {
      type: 'object' as const,
      properties: {
        fieldKey: { type: 'string' },
        value: { type: 'string' },
      },
      required: ['fieldKey', 'value'],
    },
  },
  {
    name: 'transfer_to_human',
    description: 'Pause AI and alert a human agent to take over',
    input_schema: {
      type: 'object' as const,
      properties: {
        reason: { type: 'string' },
        urgency: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
      },
      required: ['reason'],
    },
  },
  {
    name: 'send_payment_link',
    description: 'Send a payment link to the contact',
    input_schema: {
      type: 'object' as const,
      properties: {
        amount: { type: 'number' },
        currency: { type: 'string' },
        description: { type: 'string' },
      },
      required: ['amount', 'description'],
    },
  },
];

@Injectable()
export class AgentsService {
  private readonly logger = new Logger(AgentsService.name);

  constructor(
    @InjectRepository(AiAgent) private readonly agentRepo: Repository<AiAgent>,
    private readonly kbService: KnowledgeBaseService,
  ) {}

  async findAll(locationId: string): Promise<AiAgent[]> {
    return this.agentRepo.find({ where: { locationId, isActive: true }, order: { createdAt: 'ASC' } });
  }

  async findOne(id: string, locationId: string): Promise<AiAgent> {
    const agent = await this.agentRepo.findOne({ where: { id, locationId, isActive: true } });
    if (!agent) throw new NotFoundException('Agent not found');
    return agent;
  }

  async create(locationId: string, dto: CreateAgentDto): Promise<AiAgent> {
    return this.agentRepo.save(
      this.agentRepo.create({
        locationId,
        name: dto.name,
        systemPrompt: dto.systemPrompt,
        greeting: dto.greeting ?? 'Hi! How can I help you today?',
        mode: dto.mode ?? 'SUGGESTIVE',
        channels: dto.channels ?? [],
        calendarId: dto.calendarId ?? null,
        humanHandoffTriggers: dto.humanHandoffTriggers ?? [],
        bookingIntentPhrases: dto.bookingIntentPhrases ?? [],
        outOfHoursMessage: dto.outOfHoursMessage ?? null,
        toneProfile: dto.toneProfile ?? {},
        responseDelayMs: dto.responseDelayMs ?? 5000,
        createdBy: 'MANUAL',
      }),
    );
  }

  async update(id: string, locationId: string, dto: Partial<CreateAgentDto>): Promise<AiAgent> {
    const agent = await this.findOne(id, locationId);
    Object.assign(agent, dto);
    return this.agentRepo.save(agent);
  }

  async remove(id: string, locationId: string): Promise<void> {
    const agent = await this.findOne(id, locationId);
    await this.agentRepo.update(agent.id, { isActive: false });
  }

  async setMode(id: string, locationId: string, mode: 'OFF' | 'SUGGESTIVE' | 'AUTOPILOT'): Promise<AiAgent> {
    const agent = await this.findOne(id, locationId);
    agent.mode = mode;
    return this.agentRepo.save(agent);
  }

  // ─── Run agent against a conversation ─────────────────────────────────────
  async run(
    agentId: string,
    locationId: string,
    contactId: string,
    messages: ConversationMessage[],
    lastMessage: string,
  ): Promise<AgentRunResult> {
    const agent = await this.findOne(agentId, locationId);

    // 1. RAG: fetch relevant KB context
    const kbContext = await this.kbService.buildContext(locationId, lastMessage, agentId);
    const kbChunksUsed = kbContext ? (kbContext.match(/Q:/g) ?? []).length : 0;

    // 2. Build system prompt with KB context injected
    const systemPrompt = [
      agent.systemPrompt,
      kbContext ? `\n\n${kbContext}` : '',
    ].join('');

    // 3. Build message history (last 20 messages)
    const history = messages.slice(-20).map((m) => ({
      role: (m.direction === 'inbound' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: m.body ?? '',
    }));

    // 4. Call Claude with tool-use
    const anthropic = getAnthropic();
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 500,
      system: systemPrompt,
      tools: AGENT_TOOLS,
      tool_choice: { type: 'auto' },
      messages: history,
    });

    // 5. Parse response
    const toolCallsMade: string[] = [];
    let reply = '';
    let handoffTriggered = false;
    let handoffReason: string | undefined;

    for (const block of response.content) {
      if (block.type === 'text') {
        reply += block.text;
      } else if (block.type === 'tool_use') {
        toolCallsMade.push(block.name);
        if (block.name === 'transfer_to_human') {
          handoffTriggered = true;
          handoffReason = (block.input as any).reason;
        }
      }
    }

    // 6. Keyword-based handoff detection
    if (!handoffTriggered && agent.humanHandoffTriggers.length) {
      const lowerMsg = lastMessage.toLowerCase();
      const triggered = agent.humanHandoffTriggers.some((t) => lowerMsg.includes(t.toLowerCase()));
      if (triggered) {
        handoffTriggered = true;
        handoffReason = 'Handoff keyword detected';
      }
    }

    return { reply: reply.trim(), toolCallsMade, handoffTriggered, handoffReason, kbChunksUsed };
  }

  // ─── Auto-build agent from onboarding answers via Claude ──────────────────
  async autoBuild(
    locationId: string,
    answers: Record<string, unknown>,
  ): Promise<AiAgent> {
    const BUILD_TOOL = {
      name: 'create_agent_config',
      description: 'Generate complete AI agent configuration from onboarding answers',
      input_schema: {
        type: 'object' as const,
        properties: {
          agentName: { type: 'string' },
          systemPrompt: { type: 'string', description: '400-600 word system prompt with persona, objective, guardrails' },
          greeting: { type: 'string' },
          humanHandoffTriggers: { type: 'array', items: { type: 'string' } },
          bookingIntentPhrases: { type: 'array', items: { type: 'string' } },
          outOfHoursMessage: { type: 'string' },
          kbEntries: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                q: { type: 'string' }, a: { type: 'string' },
                category: { type: 'string' }, priority: { type: 'number' },
              },
            },
          },
        },
        required: ['agentName', 'systemPrompt', 'greeting', 'humanHandoffTriggers', 'outOfHoursMessage', 'kbEntries'],
      },
    };

    const anthropic = getAnthropic();
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      tools: [BUILD_TOOL],
      tool_choice: { type: 'tool', name: 'create_agent_config' },
      messages: [{
        role: 'user',
        content: `Build a conversational AI agent config from these business onboarding answers:\n${JSON.stringify(answers, null, 2)}`,
      }],
    });

    const toolBlock = response.content.find((b) => b.type === 'tool_use');
    if (!toolBlock || toolBlock.type !== 'tool_use') throw new Error('Claude did not return agent config');

    const config = toolBlock.input as any;

    const agent = await this.agentRepo.save(
      this.agentRepo.create({
        locationId,
        name: config.agentName,
        systemPrompt: config.systemPrompt,
        greeting: config.greeting,
        mode: 'SUGGESTIVE',
        channels: (answers['activeChannels'] as string[]) ?? [],
        humanHandoffTriggers: config.humanHandoffTriggers,
        bookingIntentPhrases: config.bookingIntentPhrases ?? [],
        outOfHoursMessage: config.outOfHoursMessage,
        isAutoBuilt: true,
        createdBy: 'ONBOARDING_AUTO',
      }),
    );

    // Seed KB with extracted Q&A pairs
    if (config.kbEntries?.length) {
      await this.kbService.addQAPairs(locationId, agent.id, config.kbEntries, 'ONBOARDING_QA');
    }

    return agent;
  }

  // ─── Test agent in playground ──────────────────────────────────────────────
  async test(
    agentId: string,
    locationId: string,
    message: string,
  ): Promise<AgentRunResult & { kbResults: unknown[] }> {
    const agent = await this.findOne(agentId, locationId);
    const kbResults = await this.kbService.search(locationId, message, 5, agentId);
    const result = await this.run(agentId, locationId, 'test', [], message);
    return { ...result, kbResults };
  }
}
