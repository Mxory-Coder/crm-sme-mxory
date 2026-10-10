import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { SubscriptionPlan } from './subscription-plan.entity';

@Entity('location_subscriptions')
export class LocationSubscription {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'location_id', unique: true }) locationId: string;
  @Column({ name: 'stripe_customer_id' }) stripeCustomerId: string;
  @Column({ name: 'stripe_subscription_id' }) stripeSubscriptionId: string;
  @Column({ name: 'plan_id' }) planId: string;
  @ManyToOne(() => SubscriptionPlan) @JoinColumn({ name: 'plan_id' }) plan: SubscriptionPlan;
  @Column() status: string;
  @Column({ name: 'trial_ends_at', nullable: true, type: 'timestamp' }) trialEndsAt: Date | null;
  @Column({ name: 'current_period_end' }) currentPeriodEnd: Date;
  @Column({ name: 'sms_credits_remaining', default: 0 }) smsCreditsRemaining: number;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
