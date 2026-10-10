import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

@Entity('subscription_plans')
export class SubscriptionPlan {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column({ name: 'stripe_price_id', unique: true }) stripePriceId: string;
  @Column({ name: 'monthly_price', type: 'decimal', precision: 10, scale: 2 }) monthlyPrice: number;
  @Column({ name: 'sms_credits_included', default: 0 }) smsCreditsIncluded: number;
  @Column({ name: 'feature_gates', type: 'jsonb', default: {} }) featureGates: Record<string, boolean>;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
