import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';

@Entity('agency_branding')
export class AgencyBranding {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'agency_id' })
  agencyId: string;

  @Column({ name: 'platform_name', default: 'SME Connect' })
  platformName: string;

  @Column({ name: 'logo_url', nullable: true, type: 'varchar' })
  logoUrl: string | null;

  @Column({ name: 'favicon_url', nullable: true, type: 'varchar' })
  faviconUrl: string | null;

  @Column({ name: 'primary_color', default: '#009B87' })
  primaryColor: string;

  @Column({ name: 'accent_color', default: '#39B54A' })
  accentColor: string;

  @Column({ name: 'custom_domain', nullable: true, unique: true, type: 'varchar' })
  customDomain: string | null;

  @Column({ name: 'support_email', nullable: true, type: 'varchar' })
  supportEmail: string | null;

  @Column({ name: 'support_phone', nullable: true, type: 'varchar' })
  supportPhone: string | null;

  @Column({ name: 'hide_powered_by', default: false })
  hidePoweredBy: boolean;

  @Column({ name: 'custom_login_bg_url', nullable: true, type: 'varchar' })
  customLoginBgUrl: string | null;

  @Column({ name: 'mobile_app_name', nullable: true, type: 'varchar' })
  mobileAppName: string | null;

  @Column({ name: 'mobile_app_icon_url', nullable: true, type: 'varchar' })
  mobileAppIconUrl: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('subscription_plans')
export class SubscriptionPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'agency_id', nullable: true, type: 'varchar' })
  agencyId: string | null;

  @Column()
  name: string;

  @Column({ nullable: true, type: 'varchar' })
  description: string | null;

  @Column({ name: 'stripe_price_id', nullable: true, type: 'varchar' })
  stripePriceId: string | null;

  @Column({ name: 'monthly_price', type: 'numeric', precision: 10, scale: 2, default: 0 })
  monthlyPrice: number;

  @Column({ name: 'annual_price', type: 'numeric', precision: 10, scale: 2, nullable: true })
  annualPrice: number | null;

  @Column({ name: 'trial_days', default: 14 })
  trialDays: number;

  @Column({ name: 'sms_credits_included', default: 0 })
  smsCreditsIncluded: number;

  @Column({ name: 'feature_gates', type: 'jsonb', default: {} })
  featureGates: Record<string, boolean>;

  @Column({ name: 'is_public', default: true })
  isPublic: boolean;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('location_subscriptions')
export class LocationSubscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'location_id', unique: true })
  locationId: string;

  @Column({ name: 'plan_id', nullable: true, type: 'varchar' })
  planId: string | null;

  @Column({ name: 'stripe_customer_id', nullable: true, type: 'varchar' })
  stripeCustomerId: string | null;

  @Column({ name: 'stripe_subscription_id', nullable: true, type: 'varchar' })
  stripeSubscriptionId: string | null;

  @Column({ default: 'trialing' })
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'paused';

  @Column({ name: 'trial_ends_at', nullable: true, type: 'timestamp' })
  trialEndsAt: Date | null;

  @Column({ name: 'current_period_end', nullable: true, type: 'timestamp' })
  currentPeriodEnd: Date | null;

  @Column({ name: 'sms_credits_remaining', default: 0 })
  smsCreditsRemaining: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('sms_credit_ledger')
export class SmsCreditLedger {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'location_id' })
  locationId: string;

  @Column({ type: 'int' })
  delta: number;

  @Column()
  reason: string;

  @Column({ type: 'int' })
  balance: number;

  @Column({ name: 'reference_id', nullable: true, type: 'varchar' })
  referenceId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('snapshots')
export class Snapshot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'agency_id' })
  agencyId: string;

  @Column()
  name: string;

  @Column({ nullable: true, type: 'varchar' })
  description: string | null;

  @Column({ type: 'jsonb', default: {} })
  payload: Record<string, unknown>;

  @Column({ name: 'is_public', default: false })
  isPublic: boolean;

  @Column({ name: 'created_by', nullable: true, type: 'varchar' })
  createdBy: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('snapshot_deployments')
export class SnapshotDeployment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'snapshot_id' })
  snapshotId: string;

  @Column({ name: 'location_id' })
  locationId: string;

  @Column({ default: 'pending' })
  status: 'pending' | 'running' | 'completed' | 'failed';

  @Column({ name: 'error_message', nullable: true, type: 'varchar' })
  errorMessage: string | null;

  @Column({ name: 'deployed_by', nullable: true, type: 'varchar' })
  deployedBy: string | null;

  @CreateDateColumn({ name: 'started_at' })
  startedAt: Date;

  @Column({ name: 'completed_at', nullable: true, type: 'timestamp' })
  completedAt: Date | null;
}

@Entity('prospecting_leads')
export class ProspectingLead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'agency_id' })
  agencyId: string;

  @Column({ name: 'business_name' })
  businessName: string;

  @Column({ nullable: true, type: 'varchar' })
  industry: string | null;

  @Column({ nullable: true, type: 'varchar' })
  website: string | null;

  @Column({ nullable: true, type: 'varchar' })
  phone: string | null;

  @Column({ nullable: true, type: 'varchar' })
  email: string | null;

  @Column({ nullable: true, type: 'varchar' })
  address: string | null;

  @Column({ nullable: true, type: 'varchar' })
  city: string | null;

  @Column({ nullable: true, type: 'varchar' })
  country: string | null;

  @Column({ type: 'numeric', precision: 3, scale: 1, nullable: true })
  rating: number | null;

  @Column({ name: 'review_count', nullable: true, type: 'int' })
  reviewCount: number | null;

  @Column({ default: 'MANUAL' })
  source: string;

  @Column({ name: 'ai_audit_report', nullable: true, type: 'text' })
  aiAuditReport: string | null;

  @Column({ name: 'ai_score', nullable: true, type: 'float' })
  aiScore: number | null;

  @Column({ default: 'NEW' })
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST';

  @Column({ name: 'assigned_to', nullable: true, type: 'varchar' })
  assignedTo: string | null;

  @Column({ nullable: true, type: 'text' })
  notes: string | null;

  @Column({ name: 'converted_at', nullable: true, type: 'timestamp' })
  convertedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'agency_id', nullable: true, type: 'varchar' })
  agencyId: string | null;

  @Column({ name: 'location_id', nullable: true, type: 'varchar' })
  locationId: string | null;

  @Column({ name: 'user_id', nullable: true, type: 'varchar' })
  userId: string | null;

  @Column()
  action: string;

  @Column()
  resource: string;

  @Column({ name: 'resource_id', nullable: true, type: 'varchar' })
  resourceId: string | null;

  @Column({ name: 'old_value', type: 'jsonb', nullable: true })
  oldValue: Record<string, unknown> | null;

  @Column({ name: 'new_value', type: 'jsonb', nullable: true })
  newValue: Record<string, unknown> | null;

  @Column({ name: 'ip_address', nullable: true, type: 'varchar' })
  ipAddress: string | null;

  @Column({ name: 'user_agent', nullable: true, type: 'varchar' })
  userAgent: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('saved_reports')
export class SavedReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'location_id' })
  locationId: string;

  @Column()
  name: string;

  @Column({ name: 'report_type' })
  reportType: string;

  @Column({ type: 'jsonb', default: {} })
  config: Record<string, unknown>;

  @Column({ nullable: true, type: 'varchar' })
  schedule: string | null;

  @Column({ name: 'last_run_at', nullable: true, type: 'timestamp' })
  lastRunAt: Date | null;

  @Column({ name: 'created_by', nullable: true, type: 'varchar' })
  createdBy: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('agency_wallet_transactions')
export class AgencyWalletTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'agency_id' })
  agencyId: string;

  @Column()
  type: 'CREDIT' | 'DEBIT';

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column()
  description: string;

  @Column({ name: 'reference_id', nullable: true, type: 'varchar' })
  referenceId: string | null;

  @Column({ name: 'balance_after', type: 'numeric', precision: 10, scale: 2 })
  balanceAfter: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
