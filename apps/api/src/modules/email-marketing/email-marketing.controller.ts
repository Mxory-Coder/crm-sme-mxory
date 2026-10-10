import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { EmailMarketingService, CreateCampaignDto, AiEmailDto } from './email-marketing.service';
import { EmailTemplate } from './email-template.entity';

@UseGuards(JwtAuthGuard)
@Controller('v1/email')
export class EmailMarketingController {
  constructor(private readonly svc: EmailMarketingService) {}

  // ─── Campaigns ────────────────────────────────────────────────────────────
  @Get('campaigns')
  findAll(@CurrentUser() user: { locationId: string }) {
    return this.svc.findAll(user.locationId);
  }

  @Get('campaigns/stats')
  getStats(@CurrentUser() user: { locationId: string }) {
    return this.svc.getStats(user.locationId);
  }

  @Get('campaigns/:id')
  findById(@CurrentUser() user: { locationId: string }, @Param('id') id: string) {
    return this.svc.findById(user.locationId, id);
  }

  @Post('campaigns')
  create(
    @CurrentUser() user: { locationId: string; id: string },
    @Body() dto: CreateCampaignDto,
  ) {
    return this.svc.create(user.locationId, dto, user.id);
  }

  @Patch('campaigns/:id')
  update(
    @CurrentUser() user: { locationId: string },
    @Param('id') id: string,
    @Body() dto: Partial<CreateCampaignDto>,
  ) {
    return this.svc.update(user.locationId, id, dto);
  }

  @Delete('campaigns/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@CurrentUser() user: { locationId: string }, @Param('id') id: string) {
    return this.svc.delete(user.locationId, id);
  }

  // ─── Templates ────────────────────────────────────────────────────────────
  @Get('templates')
  findTemplates(@CurrentUser() user: { locationId: string }) {
    return this.svc.findAllTemplates(user.locationId);
  }

  @Post('templates')
  createTemplate(
    @CurrentUser() user: { locationId: string },
    @Body() dto: Partial<EmailTemplate>,
  ) {
    return this.svc.createTemplate(user.locationId, dto);
  }

  @Delete('templates/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteTemplate(@CurrentUser() user: { locationId: string }, @Param('id') id: string) {
    return this.svc.deleteTemplate(user.locationId, id);
  }

  // ─── AI ───────────────────────────────────────────────────────────────────
  @Post('ai/generate')
  generateEmail(@Body() dto: AiEmailDto) {
    return this.svc.generateEmail(dto);
  }

  @Post('ai/subject-variants')
  subjectVariants(@Body() body: { topic: string; tone: string }) {
    return this.svc.generateSubjectVariants(body.topic, body.tone);
  }
}
