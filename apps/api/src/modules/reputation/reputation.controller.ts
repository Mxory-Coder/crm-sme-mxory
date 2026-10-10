import {
  Controller, Get, Post, Param, Body, Query,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ReputationService, SendReviewRequestDto } from './reputation.service';
import { Review } from './reputation.entities';

@UseGuards(JwtAuthGuard)
@Controller('v1/reputation')
export class ReputationController {
  constructor(private readonly svc: ReputationService) {}

  @Get('stats')
  getStats(@CurrentUser() user: { locationId: string }) {
    return this.svc.getStats(user.locationId);
  }

  // ─── Review Requests ──────────────────────────────────────────────────────

  @Get('requests')
  findRequests(@CurrentUser() user: { locationId: string }) {
    return this.svc.findRequests(user.locationId);
  }

  @Post('requests')
  sendRequest(
    @CurrentUser() user: { locationId: string },
    @Body() dto: SendReviewRequestDto,
  ) {
    return this.svc.sendReviewRequest(user.locationId, dto);
  }

  @Post('ai/review-message')
  generateMessage(
    @CurrentUser() user: { locationId: string },
    @Body() body: { contactName: string; platform: string },
  ) {
    return this.svc.aiGenerateReviewMessage(body.contactName, user.locationId, body.platform);
  }

  // ─── Reviews ──────────────────────────────────────────────────────────────

  @Get('reviews')
  findReviews(
    @CurrentUser() user: { locationId: string },
    @Query('platform') platform?: string,
  ) {
    return this.svc.findReviews(user.locationId, platform);
  }

  @Post('reviews/import')
  importReview(
    @CurrentUser() user: { locationId: string },
    @Body() dto: Partial<Review>,
  ) {
    return this.svc.importReview(user.locationId, dto);
  }

  @Post('reviews/:id/respond')
  respondToReview(
    @CurrentUser() user: { locationId: string },
    @Param('id') id: string,
    @Body() body: { responseText: string },
  ) {
    return this.svc.respondToReview(user.locationId, id, body.responseText);
  }

  @Post('reviews/:id/ai-response')
  aiResponse(@CurrentUser() user: { locationId: string }, @Param('id') id: string) {
    return this.svc.aiGenerateResponse(id, user.locationId);
  }
}
