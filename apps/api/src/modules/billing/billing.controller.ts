import {
  Controller, Get, Post, Body, Headers, RawBodyRequest, Req, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AccessTokenPayload } from '@sme/shared';
import { BillingService } from './billing.service';
import { Request } from 'express';

@Controller('v1/billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('plans')
  getPlans() {
    return this.billingService.getPlans();
  }

  @UseGuards(JwtAuthGuard)
  @Get('subscription')
  getSubscription(@CurrentUser() user: AccessTokenPayload) {
    return this.billingService.getSubscription(user.locationId!);
  }

  // Stripe webhook — no JWT guard, validated via Stripe-Signature header
  @Post('webhooks/stripe')
  async stripeWebhook(
    @Headers('stripe-signature') sig: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    // In production: verify with stripe.webhooks.constructEvent(req.rawBody, sig, STRIPE_WEBHOOK_SECRET)
    // For now, parse body directly (raw body middleware required)
    const body = req.body as { type: string; data: { object: Record<string, unknown> } };
    await this.billingService.handleStripeWebhook(body.type, body.data?.object ?? {});
    return { received: true };
  }
}
