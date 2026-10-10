import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { SocialPost } from './social-post.entity';
import { getAnthropic, getOpenAI, CLAUDE_MODEL } from '@sme/ai';

export interface CreateSocialPostDto {
  caption: string;
  mediaUrls?: string[];
  platforms: ('FACEBOOK' | 'INSTAGRAM' | 'TWITTER' | 'LINKEDIN')[];
  scheduledAt?: string;
}

export interface AiCaptionDto {
  topic: string;
  tone?: string;
  businessName?: string;
  platforms: string[];
  includeHashtags?: boolean;
}

@Injectable()
export class SocialService {
  constructor(
    @InjectRepository(SocialPost)
    private readonly postRepo: Repository<SocialPost>,
  ) {}

  // ─── CRUD ─────────────────────────────────────────────────────────────────

  async findAll(locationId: string, status?: string): Promise<SocialPost[]> {
    const where: Record<string, unknown> = { locationId };
    if (status) where['status'] = status;
    return this.postRepo.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findById(locationId: string, id: string): Promise<SocialPost> {
    const post = await this.postRepo.findOne({ where: { id, locationId } });
    if (!post) throw new NotFoundException('Social post not found');
    return post;
  }

  async create(locationId: string, dto: CreateSocialPostDto, userId: string): Promise<SocialPost> {
    const post = this.postRepo.create({
      locationId,
      caption: dto.caption,
      mediaUrls: dto.mediaUrls ?? [],
      platforms: dto.platforms,
      status: dto.scheduledAt ? 'SCHEDULED' : 'DRAFT',
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
      createdBy: userId,
    });
    return this.postRepo.save(post);
  }

  async update(locationId: string, id: string, dto: Partial<CreateSocialPostDto>): Promise<SocialPost> {
    const post = await this.findById(locationId, id);
    if (post.status === 'PUBLISHED') {
      throw new BadRequestException('Cannot edit a published post');
    }
    if (dto.caption !== undefined) post.caption = dto.caption;
    if (dto.mediaUrls !== undefined) post.mediaUrls = dto.mediaUrls;
    if (dto.platforms !== undefined) post.platforms = dto.platforms;
    if (dto.scheduledAt !== undefined) {
      post.scheduledAt = new Date(dto.scheduledAt);
      post.status = 'SCHEDULED';
    }
    return this.postRepo.save(post);
  }

  async delete(locationId: string, id: string): Promise<void> {
    const post = await this.findById(locationId, id);
    await this.postRepo.remove(post);
  }

  // ─── Publish ──────────────────────────────────────────────────────────────

  async publish(locationId: string, id: string): Promise<SocialPost> {
    const post = await this.findById(locationId, id);
    // In production this would call the Meta Graph API / Twitter API
    // For now, mark as published
    post.status = 'PUBLISHED';
    post.publishedAt = new Date();
    return this.postRepo.save(post);
  }

  // ─── Calendar view ────────────────────────────────────────────────────────

  async getCalendar(locationId: string, from: Date, to: Date): Promise<SocialPost[]> {
    return this.postRepo
      .createQueryBuilder('p')
      .where('p.location_id = :locationId', { locationId })
      .andWhere('p.scheduled_at >= :from', { from })
      .andWhere('p.scheduled_at <= :to', { to })
      .orderBy('p.scheduled_at', 'ASC')
      .getMany();
  }

  // ─── AI Caption Generation ────────────────────────────────────────────────

  async generateCaption(dto: AiCaptionDto): Promise<Record<string, string>> {
    const openai = getOpenAI();
    const res = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 1200,
      messages: [
        {
          role: 'system',
          content: 'You are a social media content expert. Create platform-optimised captions. Return JSON only.',
        },
        {
          role: 'user',
          content: `Create captions for these platforms: ${dto.platforms.join(', ')}.
Topic: "${dto.topic}"
Tone: ${dto.tone ?? 'engaging'}
Business: ${dto.businessName ?? 'the business'}
${dto.includeHashtags ? 'Include relevant hashtags for Instagram.' : ''}

Rules:
- Twitter/X: max 280 chars
- Instagram: punchy opener + 5-10 hashtags at end
- Facebook: conversational, story-driven, end with CTA
- LinkedIn: professional tone, insight-driven

Return JSON: { "FACEBOOK": "...", "INSTAGRAM": "...", "TWITTER": "...", "LINKEDIN": "..." }
Include only the platforms requested.`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const text = res.choices[0].message.content ?? '{}';
    try {
      return JSON.parse(text) as Record<string, string>;
    } catch {
      return { error: 'Failed to parse AI response' };
    }
  }

  // ─── AI Blog-to-Social ────────────────────────────────────────────────────

  async blogToSocial(blogTitle: string, blogExcerpt: string, platforms: string[]): Promise<Record<string, string>> {
    return this.generateCaption({
      topic: `${blogTitle}: ${blogExcerpt.substring(0, 200)}`,
      tone: 'informative',
      platforms,
      includeHashtags: true,
    });
  }
}
