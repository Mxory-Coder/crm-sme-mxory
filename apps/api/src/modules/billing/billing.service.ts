import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionPlan } from './subscription-plan.entity';
import { LocationSubscription } from './location-subscription.entity';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(SubscriptionPlan) private readonly planRepo: Repository<SubscriptionPlan>,
    @InjectRepository(LocationSubscription) private readonly subRepo: Repository<LocationSubscription>,
  ) {}

  async getPlans(): Promise<SubscriptionPlan[]> {
    return this.planRepo.find({ where: { isActive: true }, order: { monthlyPrice: 'ASC' } });
  }

  async getPlan(id: string): Promise<SubscriptionPlan> {
    const plan = await this.planRepo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('Plan not found');
    return plan;
  }

  async getSubscription(locationId: string): Promise<LocationSubscription | null> {
    return this.subRepo.findOne({ where: { locationId }, relations: ['plan'] });
  }

  async getOrCreateSubscription(locationId: string): Promise<LocationSubscription | null> {
    return this.getSubscription(locationId);
  }

  async handleStripeWebhook(eventType: string, data: Record<string, unknown>): Promise<void> {
    switch (eventType) {
      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const sub = data as any;
        const existing = await this.subRepo.findOne({
          where: { stripeSubscriptionId: sub.id },
        });
        if (existing) {
          await this.subRepo.update(existing.id, {
            status: sub.status,
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          });
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = data as any;
        await this.subRepo.update(
          { stripeSubscriptionId: sub.id },
          { status: 'canceled' },
        );
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = data as any;
        await this.subRepo.update(
          { stripeSubscriptionId: invoice.subscription },
          { status: 'past_due' },
        );
        break;
      }
    }
  }

  async deductSmsCredit(locationId: string, count = 1): Promise<void> {
    const sub = await this.subRepo.findOne({ where: { locationId } });
    if (!sub) return; // no subscription check in dev
    if (sub.smsCreditsRemaining < count) {
      throw new BadRequestException('Insufficient SMS credits');
    }
    await this.subRepo.decrement({ locationId }, 'smsCreditsRemaining', count);
  }

  async seedDefaultPlans(): Promise<void> {
    const existing = await this.planRepo.count();
    if (existing > 0) return;

    await this.planRepo.save([
      this.planRepo.create({
        name: 'Starter',
        stripePriceId: 'price_starter_placeholder',
        monthlyPrice: 497,
        smsCreditsIncluded: 500,
        featureGates: { voice_ai: false, custom_objects: false, white_label: false },
        isActive: true,
      }),
      this.planRepo.create({
        name: 'Pro',
        stripePriceId: 'price_pro_placeholder',
        monthlyPrice: 997,
        smsCreditsIncluded: 2000,
        featureGates: { voice_ai: true, custom_objects: true, white_label: false },
        isActive: true,
      }),
      this.planRepo.create({
        name: 'Agency',
        stripePriceId: 'price_agency_placeholder',
        monthlyPrice: 2497,
        smsCreditsIncluded: 10000,
        featureGates: { voice_ai: true, custom_objects: true, white_label: true },
        isActive: true,
      }),
    ]);
  }
}
