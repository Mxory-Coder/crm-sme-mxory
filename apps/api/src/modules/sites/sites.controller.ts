import {
  Controller, Get, Post, Patch, Delete, Body, Param,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  SitesService, CreateSiteDto, CreatePageDto, CreateBlogPostDto,
} from './sites.service';

@UseGuards(JwtAuthGuard)
@Controller('v1/sites')
export class SitesController {
  constructor(private readonly svc: SitesService) {}

  // ─── Sites ────────────────────────────────────────────────────────────────
  @Get()
  findAll(@CurrentUser() user: { locationId: string }) {
    return this.svc.findAll(user.locationId);
  }

  @Get(':id')
  findById(@CurrentUser() user: { locationId: string }, @Param('id') id: string) {
    return this.svc.findById(user.locationId, id);
  }

  @Post()
  create(
    @CurrentUser() user: { locationId: string; id: string },
    @Body() dto: CreateSiteDto,
  ) {
    return this.svc.create(user.locationId, dto, user.id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { locationId: string },
    @Param('id') id: string,
    @Body() dto: Partial<CreateSiteDto>,
  ) {
    return this.svc.update(user.locationId, id, dto);
  }

  @Post(':id/publish')
  publish(@CurrentUser() user: { locationId: string }, @Param('id') id: string) {
    return this.svc.publish(user.locationId, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@CurrentUser() user: { locationId: string }, @Param('id') id: string) {
    return this.svc.delete(user.locationId, id);
  }

  // ─── Pages ────────────────────────────────────────────────────────────────
  @Get(':id/pages')
  findPages(@CurrentUser() user: { locationId: string }, @Param('id') siteId: string) {
    return this.svc.findPages(user.locationId, siteId);
  }

  @Post(':id/pages')
  createPage(
    @CurrentUser() user: { locationId: string },
    @Param('id') siteId: string,
    @Body() dto: CreatePageDto,
  ) {
    return this.svc.createPage(user.locationId, siteId, dto);
  }

  @Patch(':id/pages/:pageId')
  updatePage(
    @CurrentUser() user: { locationId: string },
    @Param('pageId') pageId: string,
    @Body() dto: Partial<CreatePageDto>,
  ) {
    return this.svc.updatePage(user.locationId, pageId, dto);
  }

  @Delete(':id/pages/:pageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deletePage(@CurrentUser() user: { locationId: string }, @Param('pageId') pageId: string) {
    return this.svc.deletePage(user.locationId, pageId);
  }

  @Post('ai/generate-section')
  generateSection(@Body() body: { prompt: string; sectionType: string }) {
    return this.svc.generatePageSection(body.prompt, body.sectionType);
  }

  // ─── Blog ─────────────────────────────────────────────────────────────────
  @Get(':id/blog')
  findBlog(@CurrentUser() user: { locationId: string }, @Param('id') siteId: string) {
    return this.svc.findBlogPosts(user.locationId, siteId);
  }

  @Post(':id/blog')
  createBlog(
    @CurrentUser() user: { locationId: string; id: string },
    @Param('id') siteId: string,
    @Body() dto: CreateBlogPostDto,
  ) {
    return this.svc.createBlogPost(user.locationId, siteId, dto, user.id);
  }

  @Patch(':id/blog/:postId')
  updateBlog(
    @CurrentUser() user: { locationId: string },
    @Param('postId') postId: string,
    @Body() dto: Partial<CreateBlogPostDto>,
  ) {
    return this.svc.updateBlogPost(user.locationId, postId, dto);
  }

  @Delete(':id/blog/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteBlog(@CurrentUser() user: { locationId: string }, @Param('postId') postId: string) {
    return this.svc.deleteBlogPost(user.locationId, postId);
  }

  @Post('ai/write-blog')
  writeBlog(@Body() body: { topic: string; tone: string; wordCount: number }) {
    return this.svc.generateBlogPost(body.topic, body.tone ?? 'professional', body.wordCount ?? 800);
  }
}
