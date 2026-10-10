import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Site, SitePage, BlogPost } from './site.entity';
import { getAnthropic, CLAUDE_MODEL } from '@sme/ai';

export interface CreateSiteDto {
  name: string;
  type?: 'WEBSITE' | 'BLOG' | 'LANDING_PAGE';
  domain?: string;
  subdomain?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface CreatePageDto {
  title: string;
  slug: string;
  isHome?: boolean;
  pageContent?: Record<string, unknown>;
  metaTitle?: string;
  metaDescription?: string;
}

export interface CreateBlogPostDto {
  title: string;
  slug: string;
  excerpt?: string;
  bodyHtml?: string;
  featuredImage?: string;
  tags?: string[];
  categories?: string[];
  status?: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED';
  scheduledAt?: string;
}

@Injectable()
export class SitesService {
  constructor(
    @InjectRepository(Site) private readonly siteRepo: Repository<Site>,
    @InjectRepository(SitePage) private readonly pageRepo: Repository<SitePage>,
    @InjectRepository(BlogPost) private readonly blogRepo: Repository<BlogPost>,
  ) {}

  // ─── Sites ────────────────────────────────────────────────────────────────

  async findAll(locationId: string): Promise<Site[]> {
    return this.siteRepo.find({ where: { locationId }, order: { createdAt: 'DESC' } });
  }

  async findById(locationId: string, id: string): Promise<Site> {
    const site = await this.siteRepo.findOne({ where: { id, locationId } });
    if (!site) throw new NotFoundException('Site not found');
    return site;
  }

  async create(locationId: string, dto: CreateSiteDto, userId: string): Promise<Site> {
    const site = this.siteRepo.create({
      locationId,
      name: dto.name,
      type: dto.type ?? 'WEBSITE',
      domain: dto.domain ?? null,
      subdomain: dto.subdomain ?? null,
      metaTitle: dto.metaTitle ?? null,
      metaDescription: dto.metaDescription ?? null,
      status: 'DRAFT',
      createdBy: userId,
    });
    return this.siteRepo.save(site);
  }

  async update(locationId: string, id: string, dto: Partial<CreateSiteDto>): Promise<Site> {
    const site = await this.findById(locationId, id);
    Object.assign(site, dto);
    return this.siteRepo.save(site);
  }

  async publish(locationId: string, id: string): Promise<Site> {
    const site = await this.findById(locationId, id);
    site.status = 'PUBLISHED';
    site.publishedAt = new Date();
    return this.siteRepo.save(site);
  }

  async delete(locationId: string, id: string): Promise<void> {
    const site = await this.findById(locationId, id);
    await this.siteRepo.remove(site);
  }

  // ─── Pages ────────────────────────────────────────────────────────────────

  async findPages(locationId: string, siteId: string): Promise<SitePage[]> {
    await this.findById(locationId, siteId);
    return this.pageRepo.find({ where: { siteId, locationId }, order: { isHome: 'DESC' } });
  }

  async createPage(locationId: string, siteId: string, dto: CreatePageDto): Promise<SitePage> {
    await this.findById(locationId, siteId);
    const page = this.pageRepo.create({
      siteId,
      locationId,
      title: dto.title,
      slug: dto.slug,
      isHome: dto.isHome ?? false,
      pageContent: dto.pageContent ?? {},
      metaTitle: dto.metaTitle ?? null,
      metaDescription: dto.metaDescription ?? null,
      status: 'DRAFT',
    });
    return this.pageRepo.save(page);
  }

  async updatePage(locationId: string, pageId: string, dto: Partial<CreatePageDto>): Promise<SitePage> {
    const page = await this.pageRepo.findOne({ where: { id: pageId, locationId } });
    if (!page) throw new NotFoundException('Page not found');
    Object.assign(page, dto);
    return this.pageRepo.save(page);
  }

  async deletePage(locationId: string, pageId: string): Promise<void> {
    const page = await this.pageRepo.findOne({ where: { id: pageId, locationId } });
    if (!page) throw new NotFoundException('Page not found');
    await this.pageRepo.remove(page);
  }

  // ─── AI Page Section Generator ────────────────────────────────────────────

  async generatePageSection(prompt: string, sectionType: string): Promise<Record<string, unknown>> {
    const anthropic = getAnthropic();

    const TOOL = {
      name: 'create_page_section',
      description: 'Generate a web page section with content blocks',
      input_schema: {
        type: 'object' as const,
        properties: {
          headline: { type: 'string' },
          subheadline: { type: 'string' },
          body: { type: 'string' },
          cta: { type: 'string' },
          bullets: { type: 'array', items: { type: 'string' } },
          imageAlt: { type: 'string' },
        },
        required: ['headline'],
      },
    };

    const res = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      tools: [TOOL],
      tool_choice: { type: 'tool', name: 'create_page_section' },
      messages: [{
        role: 'user',
        content: `Generate a ${sectionType} section for a website page. Prompt: "${prompt}"`,
      }],
    });

    const toolBlock = res.content.find((b) => b.type === 'tool_use');
    if (!toolBlock || toolBlock.type !== 'tool_use') return {};
    return toolBlock.input as Record<string, unknown>;
  }

  // ─── Blog Posts ───────────────────────────────────────────────────────────

  async findBlogPosts(locationId: string, siteId: string, status?: string): Promise<BlogPost[]> {
    await this.findById(locationId, siteId);
    const where: Record<string, unknown> = { siteId, locationId };
    if (status) where['status'] = status;
    return this.blogRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async createBlogPost(locationId: string, siteId: string, dto: CreateBlogPostDto, userId: string): Promise<BlogPost> {
    await this.findById(locationId, siteId);
    const wordCount = dto.bodyHtml ? dto.bodyHtml.replace(/<[^>]+>/g, '').split(/\s+/).length : 0;
    const post = this.blogRepo.create({
      siteId,
      locationId,
      title: dto.title,
      slug: dto.slug,
      excerpt: dto.excerpt ?? null,
      bodyHtml: dto.bodyHtml ?? '',
      featuredImage: dto.featuredImage ?? null,
      authorId: userId,
      status: dto.status ?? 'DRAFT',
      tags: dto.tags ?? [],
      categories: dto.categories ?? [],
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
      publishedAt: dto.status === 'PUBLISHED' ? new Date() : null,
      readTimeMins: Math.max(1, Math.ceil(wordCount / 200)),
    });
    return this.blogRepo.save(post);
  }

  async updateBlogPost(locationId: string, postId: string, dto: Partial<CreateBlogPostDto>): Promise<BlogPost> {
    const post = await this.blogRepo.findOne({ where: { id: postId, locationId } });
    if (!post) throw new NotFoundException('Blog post not found');
    if (dto.status === 'PUBLISHED' && !post.publishedAt) {
      post.publishedAt = new Date();
    }
    Object.assign(post, dto);
    return this.blogRepo.save(post);
  }

  async deleteBlogPost(locationId: string, postId: string): Promise<void> {
    const post = await this.blogRepo.findOne({ where: { id: postId, locationId } });
    if (!post) throw new NotFoundException('Blog post not found');
    await this.blogRepo.remove(post);
  }

  // ─── AI Blog Writer ───────────────────────────────────────────────────────

  async generateBlogPost(topic: string, tone: string, wordCount: number): Promise<{ title: string; bodyHtml: string; metaDescription: string }> {
    const anthropic = getAnthropic();

    const TOOL = {
      name: 'write_blog_post',
      description: 'Write a complete SEO-optimised blog post',
      input_schema: {
        type: 'object' as const,
        properties: {
          title: { type: 'string', description: 'SEO-friendly H1 title' },
          metaDescription: { type: 'string', description: 'Meta description, 120-160 chars' },
          bodyHtml: { type: 'string', description: 'Full blog post in HTML with H2/H3 headings, paragraphs, lists. No <html> or <body> tags.' },
        },
        required: ['title', 'metaDescription', 'bodyHtml'],
      },
    };

    const res = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      tools: [TOOL],
      tool_choice: { type: 'tool', name: 'write_blog_post' },
      messages: [{
        role: 'user',
        content: `Write a ${wordCount}-word blog post about: "${topic}".
Tone: ${tone}.
Include: engaging intro, 3-5 H2 sections, conclusion with CTA.
Optimise for SEO naturally (don't stuff keywords).`,
      }],
    });

    const toolBlock = res.content.find((b) => b.type === 'tool_use');
    if (!toolBlock || toolBlock.type !== 'tool_use') {
      return { title: topic, bodyHtml: '', metaDescription: '' };
    }
    return toolBlock.input as { title: string; bodyHtml: string; metaDescription: string };
  }
}
