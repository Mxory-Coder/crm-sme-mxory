import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getAnthropic, CLAUDE_MODEL } from '@sme/ai';
import { WorkflowDefinition } from './workflow-definition.entity';

export interface WorkflowNode {
  id: string;
  type: string;
  label: string;
  config: Record<string, unknown>;
  position?: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface GeneratedWorkflow {
  name: string;
  triggerType: string;
  triggerConfig: Record<string, unknown>;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

const WORKFLOW_TOOL = {
  name: 'generate_workflow',
  description: 'Generate a complete workflow definition from a plain English description',
  input_schema: {
    type: 'object' as const,
    properties: {
      name: { type: 'string', description: 'Short descriptive name for this workflow' },
      triggerType: {
        type: 'string',
        enum: [
          'CONTACT_CREATED', 'FORM_SUBMITTED', 'MISSED_CALL', 'INBOUND_MESSAGE',
          'TAG_ADDED', 'OPPORTUNITY_CREATED', 'OPPORTUNITY_STAGE_CHANGED',
          'APPOINTMENT_BOOKED', 'PAYMENT_RECEIVED', 'MANUAL',
        ],
      },
      triggerConfig: { type: 'object' },
      nodes: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            type: {
              type: 'string',
              enum: [
                'TRIGGER', 'SEND_SMS', 'SEND_EMAIL', 'SEND_WHATSAPP',
                'WAIT_DELAY', 'WAIT_CONDITION', 'IF_ELSE', 'AI_DECISION',
                'UPDATE_CONTACT', 'UPDATE_OPPORTUNITY', 'ADD_TAG', 'REMOVE_TAG',
                'ASSIGN_USER', 'CREATE_TASK', 'SEND_WEBHOOK', 'AI_REPLY',
                'BOOK_APPOINTMENT', 'SEND_PAYMENT_LINK', 'SEND_VOICEMAIL_DROP', 'END',
              ],
            },
            label: { type: 'string' },
            config: { type: 'object' },
            position: { type: 'object', properties: { x: { type: 'number' }, y: { type: 'number' } } },
          },
          required: ['id', 'type', 'label', 'config'],
        },
      },
      edges: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            source: { type: 'string' },
            target: { type: 'string' },
            label: { type: 'string' },
          },
          required: ['id', 'source', 'target'],
        },
      },
    },
    required: ['name', 'triggerType', 'nodes', 'edges'],
  },
};

const SYSTEM_PROMPT = `You are a workflow automation builder for an SME CRM platform.

Available node types: TRIGGER, SEND_SMS, SEND_EMAIL, SEND_WHATSAPP, WAIT_DELAY, WAIT_CONDITION,
IF_ELSE, AI_DECISION, UPDATE_CONTACT, UPDATE_OPPORTUNITY, ADD_TAG, REMOVE_TAG, ASSIGN_USER,
CREATE_TASK, SEND_WEBHOOK, AI_REPLY, BOOK_APPOINTMENT, SEND_PAYMENT_LINK, SEND_VOICEMAIL_DROP, END.

Rules:
- Always start with a TRIGGER node (id: "trigger-1")
- Always end branches with an END node
- Use IDs like "node-1", "node-2", etc.
- WAIT_DELAY config: { value: number, unit: "minutes"|"hours"|"days" }
- SEND_SMS config: { message: "Hi {{contact.first_name}}, ..." }
- IF_ELSE config: { field: "contact.tags", operator: "contains", value: "VIP", trueTarget: "node-x", falseTarget: "node-y" }
- AI_DECISION config: { prompt: "Should we prioritise this contact?", branches: [{ key: "yes", label: "High priority" }, { key: "no", label: "Normal" }] }
- Position nodes left-to-right: x increases by 250 per step, y centers at 300
- Use merge tags like {{contact.first_name}}, {{location.name}}, {{appointment.date}}

Generate a clean, logical workflow that fully implements the user's request.`;

@Injectable()
export class WorkflowAiBuilderService {
  private readonly logger = new Logger(WorkflowAiBuilderService.name);

  constructor(
    @InjectRepository(WorkflowDefinition) private readonly wfRepo: Repository<WorkflowDefinition>,
  ) {}

  async generate(
    locationId: string,
    prompt: string,
    userId: string,
    save = true,
  ): Promise<WorkflowDefinition> {
    this.logger.log(`Generating workflow for: "${prompt.substring(0, 80)}..."`);

    const anthropic = getAnthropic();
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools: [WORKFLOW_TOOL],
      tool_choice: { type: 'tool', name: 'generate_workflow' },
      messages: [{ role: 'user', content: `Build this workflow: ${prompt}` }],
    });

    const toolBlock = response.content.find((b) => b.type === 'tool_use');
    if (!toolBlock || toolBlock.type !== 'tool_use') {
      throw new Error('Claude did not return a workflow definition');
    }

    const wf = toolBlock.input as GeneratedWorkflow;

    const definition = this.wfRepo.create({
      locationId,
      name: wf.name,
      description: prompt.substring(0, 255),
      status: 'DRAFT',
      triggerType: wf.triggerType,
      triggerConfig: wf.triggerConfig ?? {},
      nodes: wf.nodes,
      edges: wf.edges,
      aiGenerated: true,
      aiPrompt: prompt,
      createdBy: userId,
    });

    if (save) {
      return this.wfRepo.save(definition);
    }

    // Return unsaved (preview mode)
    return definition;
  }

  async findAll(locationId: string): Promise<WorkflowDefinition[]> {
    return this.wfRepo.find({
      where: { locationId },
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(id: string, locationId: string): Promise<WorkflowDefinition> {
    const wf = await this.wfRepo.findOne({ where: { id, locationId } });
    if (!wf) throw new Error('Workflow not found');
    return wf;
  }

  async update(
    id: string,
    locationId: string,
    dto: { name?: string; nodes?: unknown[]; edges?: unknown[]; status?: string },
  ): Promise<WorkflowDefinition> {
    const wf = await this.findOne(id, locationId);
    Object.assign(wf, dto);
    if (dto.status === 'ACTIVE') wf.publishedAt = new Date();
    return this.wfRepo.save(wf);
  }

  async remove(id: string, locationId: string): Promise<void> {
    await this.findOne(id, locationId);
    await this.wfRepo.delete(id);
  }
}
