import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewRequest, Review } from './reputation.entities';
import { getAnthropic, CLAUDE_MODEL } from '@sme/ai';
import { ContactsService } from '../contacts/contacts.service';

export interface SendReviewRequestDto {
  contactId: string;
  channel: 'SMS' | 'EMAIL' | 'WHATSAPP';
  platform: 'GOOGLE' | 'FACEBOOK' | 'TRUSTPILOT' | 'CUSTOM';
  reviewLink: string;
  customMessage?: string;
}

@Injectable()
export class ReputationService {
  private readonly logger = new Logger(ReputationService.name);

  constructor(
    @InjectRepository(ReviewRequest) private readonly requestRepo: Repository<ReviewRequest>,
    @InjectRepository(Review) private readonly reviewRepo: Repository<Review>,
    private readonly contactsService: ContactsService,
  ) {}

  // ─── Review Requests ──────────────────────────────────────────────────────

  async findRequests(locationId: string): Promise<ReviewRequest[]> {
    return this.requestRepo.find({ where: { locationId }, order: { createdAt: 'DESC' } });
  }

  async sendReviewRequest(locationId: string, dto: SendReviewRequestDto): Promise<ReviewRequest> {
    const contact = await this.contactsService.findById(locationId, dto.contactId);
    const firstName = contact.firstName ?? 'there';

    // If no custom message, generate one with Claude
    let messageBody = dto.customMessage;
    if (!messageBody) {
      messageBody = await this.generateReviewMessage(firstName, locationId, dto.platform);
    }

    // Append the review link
    const fullMessage = `${messageBody}\n${dto.reviewLink}`;

    const request = this.requestRepo.create({
      locationId,
      contactId: dto.contactId,
      channel: dto.channel,
      status: 'PENDING',
      messageBody: fullMessage,
      reviewLink: dto.reviewLink,
      platform: dto.platform,
    });
    const saved = await this.requestRepo.save(request);

    // In production: actually send SMS/email via the channel service
    // For now, mark as SENT immediately
    saved.status = 'SENT';
    saved.sentAt = new Date();
    return this.requestRepo.save(saved);
  }

  async trackClick(requestId: string): Promise<void> {
    await this.requestRepo.update(requestId, { status: 'CLICKED', clickedAt: new Date() });
  }

  async markReviewed(requestId: string, rating: number, reviewText?: string): Promise<void> {
    await this.requestRepo.update(requestId, {
      status: 'REVIEWED',
      reviewedAt: new Date(),
      rating,
      reviewText: reviewText ?? null,
    });
  }

  // ─── Reviews ──────────────────────────────────────────────────────────────

  async findReviews(locationId: string, platform?: string): Promise<Review[]> {
    const where: Record<string, unknown> = { locationId };
    if (platform) where['platform'] = platform;
    return this.reviewRepo.find({ where, order: { reviewedAt: 'DESC' } });
  }

  async importReview(locationId: string, dto: Partial<Review>): Promise<Review> {
    const existing = dto.externalId
      ? await this.reviewRepo.findOne({ where: { locationId, externalId: dto.externalId } })
      : null;
    if (existing) {
      Object.assign(existing, dto);
      return this.reviewRepo.save(existing);
    }
    return this.reviewRepo.save(this.reviewRepo.create({ ...dto, locationId }));
  }

  async respondToReview(locationId: string, reviewId: string, responseText: string): Promise<Review> {
    const review = await this.reviewRepo.findOne({ where: { id: reviewId, locationId } });
    if (!review) throw new NotFoundException('Review not found');
    review.responseText = responseText;
    review.responseAt = new Date();
    return this.reviewRepo.save(review);
  }

  // ─── Stats ────────────────────────────────────────────────────────────────

  async getStats(locationId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingBreakdown: Record<number, number>;
    sentRequests: number;
    conversionRate: number;
  }> {
    const reviews = await this.reviewRepo.find({ where: { locationId } });
    const requests = await this.requestRepo.find({ where: { locationId } });

    const totalReviews = reviews.length;
    const averageRating = totalReviews
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

    const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of reviews) {
      ratingBreakdown[r.rating as keyof typeof ratingBreakdown]++;
    }

    const sentRequests = requests.filter((r) => r.status !== 'PENDING').length;
    const reviewed = requests.filter((r) => r.status === 'REVIEWED').length;
    const conversionRate = sentRequests > 0 ? (reviewed / sentRequests) * 100 : 0;

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
      ratingBreakdown,
      sentRequests,
      conversionRate: Math.round(conversionRate * 10) / 10,
    };
  }

  // ─── AI Response Generator ────────────────────────────────────────────────

  async aiGenerateResponse(reviewId: string, locationId: string): Promise<string> {
    const review = await this.reviewRepo.findOne({ where: { id: reviewId, locationId } });
    if (!review) throw new NotFoundException('Review not found');

    const anthropic = getAnthropic();
    const sentiment = review.rating >= 4 ? 'positive' : review.rating === 3 ? 'neutral' : 'negative';

    const res = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: `Write a professional business response to this ${sentiment} ${review.platform} review.

Reviewer: ${review.reviewerName}
Rating: ${review.rating}/5
Review: "${review.reviewText ?? '(no text provided)'}"

Rules:
- Thank the reviewer by first name if possible
- For positive: express genuine appreciation, reinforce their positive experience
- For negative: acknowledge the concern, apologise sincerely, offer to make it right (include a way to contact)
- For neutral: thank them and highlight commitment to improvement
- Keep it under 100 words
- Professional but warm tone
- Do NOT be defensive
- Return only the response text, no preamble`,
      }],
    });

    return res.content[0].type === 'text' ? res.content[0].text.trim() : '';
  }

  async aiGenerateReviewMessage(contactName: string, locationId: string, platform: string): Promise<string> {
    return this.generateReviewMessage(contactName, locationId, platform);
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  private async generateReviewMessage(contactName: string, locationId: string, platform: string): Promise<string> {
    const anthropic = getAnthropic();
    const res = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: `Write a short, genuine SMS review request message for ${contactName} asking them to leave a ${platform} review.
Rules: personal, not pushy, under 100 chars (before the link), no emojis unless very subtle.
Return only the message text.`,
      }],
    });
    return res.content[0].type === 'text' ? res.content[0].text.trim() : `Hi ${contactName}, we'd love your feedback!`;
  }
}
