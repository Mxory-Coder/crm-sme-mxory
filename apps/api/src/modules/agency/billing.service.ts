import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SubscriptionPlan,
  LocationSubscription,
  SmsCreditLedger,
} from './agency.entities';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    @InjectRepository(SubscriptionPlan)
    private readonly planRepo: Repository<SubscriptionPlan>,
    @InjectRepository(LocationSubscription)
    private readonly subRepo: Repository<LocationSubscription>,
    @InjectRepository(SmsCreditLedger)
    private readonly ledgerRepo: Repository<SmsCreditLedger>,
  ) {}

  // ─── Plans ────────────────────────────────────────────────────────────────

  async findPlans(agencyId: string): Promise<SubscriptionPlan[]> {
    return this.planRepo.find({
      where: [{ agencyId }, { agencyId: null as any, isPublic: true }],
      order: { sortOrder: 'ASC', monthlyPrice: 'ASC' },
    });
  }

  async createPlan(agencyId: string, dto: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
    return this.planRepo.save(this.planRepo.create({ ...dto, agencyId }));
  }

  async updatePlan(agencyId: string, planId: string, dto: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
    const plan = await this.planRepo.findOne({ where: { id: planId, agencyId } });
    if (!plan) throw new NotFoundException('Plan not found');
    Object.assign(plan, dto);
    return this.planRepo.save(plan);
  }

  // ─── Subscriptions ────────────────────────────────────────────────────────

  async getSubscription(locationId: string): Promise<LocationSubscription | null> {
    return this.subRepo.findOne({ where: { locationId } });
  }

  async createTrial(locationId: string, planId: string, trialDays = 14): Promise<LocationSubscription> {
    const existing = await this.subRepo.findOne({ where: { locationId } });
    if (existing) return existing;

    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);

    const sub = this.subRepo.create({
      locationId,
      planId,
      status: 'trialing',
      trialEndsAt,
      currentPeriodEnd: trialEndsAt,
      smsCreditsRemaining: 50,
    });
    return this.subRepo.save(sub);
  }

  async activate(locationId: string, stripeSubscriptionId: string, stripeCustomerId: string, periodEnd: Date): Promise<LocationSubscription> {
    const sub = await this.subRepo.findOne({ where: { locationId } });
    if (!sub) throw new NotFoundException('Subscription not found');
    sub.status = 'active';
    sub.stripeSubscriptionId = stripeSubscriptionId;
    sub.stripeCustomerId = stripeCustomerId;
    sub.currentPeriodEnd = periodEnd;
    return this.subRepo.save(sub);
  }

  async updateStatus(locationId: string, status: LocationSubscription['status']): Promise<void> {
    await this.subRepo.update({ locationId }, { status });
  }

  // ─── SMS Credits ──────────────────────────────────────────────────────────

  async addCredits(locationId: string, amount: number, reason: string, referenceId?: string): Promise<SmsCreditLedger> {
    const sub = await this.subRepo.findOne({ where: { locationId } });
    const currentBalance = sub?.smsCreditsRemaining ?? 0;
    const newBalance = currentBalance + amount;

    if (sub) {
      await this.subRepo.update({ locationId }, { smsCreditsRemaining: newBalance });
    }

    return this.ledgerRepo.save(this.ledgerRepo.create({
      locationId,
      delta: amount,
      reason,
      balance: newBalance,
      referenceId,
    }));
  }

  async consumeCredit(locationId: string, referenceId?: string): Promise<boolean> {
    const sub = await this.subRepo.findOne({ where: { locationId } });
    if (!sub || sub.smsCreditsRemaining <= 0) return false;

    const newBalance = sub.smsCreditsRemaining - 1;
    await this.subRepo.update({ locationId }, { smsCreditsRemaining: newBalance });

    await this.ledgerRepo.save(this.ledgerRepo.create({
      locationId,
      delta: -1,
      reason: 'SMS_SENT',
      balance: newBalance,
      referenceId,
    }));

    return true;
  }

  async getCreditBalance(locationId: string): Promise<number> {
    const sub = await this.subRepo.findOne({ where: { locationId } });
    return sub?.smsCreditsRemaining ?? 0;
  }

  async getCreditHistory(locationId: string): Promise<SmsCreditLedger[]> {
    return this.ledgerRepo.find({
      where: { locationId },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }
}
