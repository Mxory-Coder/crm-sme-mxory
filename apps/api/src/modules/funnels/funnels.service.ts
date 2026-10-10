import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Funnel, FunnelStep } from './funnel.entity';
import { getAnthropic, CLAUDE_MODEL } from '@sme/ai';

export interface CreateFunnelDto {
  name: string;
  description?: string;
  domain?: string;
  pathPrefix?: string;
}

export interface CreateFunnelStepDto {
  name: string;
  type: string;
  slug: string;
  pageContent?: Record<string, unknown>;
  productId?: string;
  price?: number;
  currency?: string;
  isOneClick?: boolean;
  onAccept?: string;
  onDecline?: string;
}

export interface AiFunnelDto {
  niche: string;
  goal: string;
  product?: string;
  price?: number;
  audience?: string;
}

@Injectable()
export class FunnelsService {
  constructor(
    @InjectRepository(Funnel) private readonly funnelRepo: Repository<Funnel>,
    @InjectRepository(FunnelStep) private readonly stepRepo: Repository<FunnelStep>,
  ) {}

  // ─── Funnels CRUD ─────────────────────────────────────────────────────────

  async findAll(locationId: string): Promise<Funnel[]> {
    return this.funnelRepo.find({
      where: { locationId },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(locationId: string, id: string): Promise<Funnel> {
    const funnel = await this.funnelRepo.findOne({ where: { id, locationId } });
    if (!funnel) throw new NotFoundException('Funnel not found');
    return funnel;
  }

  async findWithSteps(locationId: string, id: string): Promise<Funnel & { steps: FunnelStep[] }> {
    const funnel = await this.findById(locationId, id);
    const steps = await this.stepRepo.find({
      where: { funnelId: id, locationId },
      order: { sortOrder: 'ASC' },
    });
    return { ...funnel, steps };
  }

  async create(locationId: string, dto: CreateFunnelDto, userId: string): Promise<Funnel> {
    const funnel = this.funnelRepo.create({
      locationId,
      name: dto.name,
      description: dto.description ?? null,
      domain: dto.domain ?? null,
      pathPrefix: dto.pathPrefix ?? null,
      status: 'DRAFT',
      createdBy: userId,
    });
    return this.funnelRepo.save(funnel);
  }

  async update(locationId: string, id: string, dto: Partial<CreateFunnelDto>): Promise<Funnel> {
    const funnel = await this.findById(locationId, id);
    Object.assign(funnel, dto);
    return this.funnelRepo.save(funnel);
  }

  async publish(locationId: string, id: string): Promise<Funnel> {
    const funnel = await this.findById(locationId, id);
    const steps = await this.stepRepo.count({ where: { funnelId: id } });
    if (steps === 0) throw new BadRequestException('Funnel must have at least one step before publishing');
    funnel.status = 'PUBLISHED';
    return this.funnelRepo.save(funnel);
  }

  async delete(locationId: string, id: string): Promise<void> {
    const funnel = await this.findById(locationId, id);
    await this.funnelRepo.remove(funnel);
  }

  // ─── Steps CRUD ───────────────────────────────────────────────────────────

  async createStep(locationId: string, funnelId: string, dto: CreateFunnelStepDto): Promise<FunnelStep> {
    await this.findById(locationId, funnelId); // verify ownership
    const count = await this.stepRepo.count({ where: { funnelId } });
    const step = this.stepRepo.create({
      funnelId,
      locationId,
      name: dto.name,
      type: dto.type,
      slug: dto.slug,
      pageContent: dto.pageContent ?? {},
      productId: dto.productId ?? null,
      price: dto.price ?? null,
      currency: dto.currency ?? 'ZAR',
      isOneClick: dto.isOneClick ?? false,
      onAccept: dto.onAccept ?? null,
      onDecline: dto.onDecline ?? null,
      sortOrder: count,
    });
    return this.stepRepo.save(step);
  }

  async updateStep(locationId: string, stepId: string, dto: Partial<CreateFunnelStepDto>): Promise<FunnelStep> {
    const step = await this.stepRepo.findOne({ where: { id: stepId, locationId } });
    if (!step) throw new NotFoundException('Funnel step not found');
    Object.assign(step, dto);
    return this.stepRepo.save(step);
  }

  async deleteStep(locationId: string, stepId: string): Promise<void> {
    const step = await this.stepRepo.findOne({ where: { id: stepId, locationId } });
    if (!step) throw new NotFoundException('Funnel step not found');
    await this.stepRepo.remove(step);
  }

  async reorderSteps(locationId: string, funnelId: string, stepIds: string[]): Promise<void> {
    await this.findById(locationId, funnelId);
    await Promise.all(
      stepIds.map((id, index) =>
        this.stepRepo.update({ id, funnelId, locationId }, { sortOrder: index }),
      ),
    );
  }

  // ─── AI Funnel Generator ──────────────────────────────────────────────────

  async generateWithAi(locationId: string, dto: AiFunnelDto, userId: string): Promise<Funnel & { steps: FunnelStep[] }> {
    const anthropic = getAnthropic();

    const TOOL = {
      name: 'create_funnel',
      description: 'Generate a complete conversion funnel with steps',
      input_schema: {
        type: 'object' as const,
        properties: {
          funnelName: { type: 'string' },
          steps: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                type: {
                  type: 'string',
                  enum: ['OPTIN', 'SALES_PAGE', 'ORDER_BUMP', 'UPSELL', 'DOWNSELL', 'CONFIRMATION'],
                },
                slug: { type: 'string', description: 'URL slug, kebab-case' },
                headline: { type: 'string', description: 'Hero headline for this page' },
                subheadline: { type: 'string' },
                cta: { type: 'string', description: 'Call-to-action button text' },
                bullets: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Up to 5 benefit bullet points',
                },
              },
              required: ['name', 'type', 'slug', 'headline', 'cta'],
            },
          },
        },
        required: ['funnelName', 'steps'],
      },
    };

    const res = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      tools: [TOOL],
      tool_choice: { type: 'tool', name: 'create_funnel' },
      messages: [{
        role: 'user',
        content: `Create a high-converting ${dto.goal} funnel for:
Niche: ${dto.niche}
${dto.product ? `Product: ${dto.product}` : ''}
${dto.price ? `Price: R${dto.price}` : ''}
${dto.audience ? `Target audience: ${dto.audience}` : ''}

Build a complete funnel with 3-5 steps. Include an optin, sales page, and confirmation minimum.
Optionally add an upsell/downsell after purchase.`,
      }],
    });

    const toolBlock = res.content.find((b) => b.type === 'tool_use');
    if (!toolBlock || toolBlock.type !== 'tool_use') {
      throw new BadRequestException('AI failed to generate funnel');
    }

    const result = toolBlock.input as {
      funnelName: string;
      steps: Array<{
        name: string;
        type: string;
        slug: string;
        headline: string;
        subheadline?: string;
        cta: string;
        bullets?: string[];
      }>;
    };

    // Persist
    const funnel = await this.create(locationId, { name: result.funnelName }, userId);
    const steps: FunnelStep[] = [];
    for (let i = 0; i < result.steps.length; i++) {
      const s = result.steps[i];
      const step = await this.createStep(locationId, funnel.id, {
        name: s.name,
        type: s.type,
        slug: s.slug,
        pageContent: {
          headline: s.headline,
          subheadline: s.subheadline ?? '',
          cta: s.cta,
          bullets: s.bullets ?? [],
          aiGenerated: true,
        },
        onAccept: i < result.steps.length - 1 ? 'next' : undefined,
      });
      steps.push(step);
    }
    return { ...funnel, steps };
  }
}
