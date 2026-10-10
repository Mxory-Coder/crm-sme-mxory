import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Location } from '../locations/location.entity';

@Entity('email_campaigns')
export class EmailCampaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'location_id' })
  locationId: string;

  @ManyToOne(() => Location, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'location_id' })
  location: Location;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  subject: string;

  @Column({ name: 'preview_text', nullable: true, type: 'varchar' })
  previewText: string | null;

  @Column({ name: 'from_name' })
  fromName: string;

  @Column({ name: 'from_email' })
  fromEmail: string;

  @Column({ name: 'reply_to', nullable: true, type: 'varchar' })
  replyTo: string | null;

  @Column({ name: 'body_html', type: 'text', default: '' })
  bodyHtml: string;

  @Column({ name: 'body_text', type: 'text', nullable: true })
  bodyText: string | null;

  @Column({ type: 'text', default: 'DRAFT' })
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'PAUSED' | 'CANCELLED';

  @Column({ type: 'text', default: 'ONE_TIME' })
  type: 'ONE_TIME' | 'AUTOMATED' | 'AB_TEST';

  @Column({ name: 'segment_filters', type: 'jsonb', default: {} })
  segmentFilters: Record<string, unknown>;

  @Column({ name: 'scheduled_at', nullable: true, type: 'timestamp' })
  scheduledAt: Date | null;

  @Column({ name: 'sent_at', nullable: true, type: 'timestamp' })
  sentAt: Date | null;

  @Column({ name: 'total_recipients', default: 0 })
  totalRecipients: number;

  @Column({ default: 0 })
  delivered: number;

  @Column({ default: 0 })
  opens: number;

  @Column({ name: 'unique_opens', default: 0 })
  uniqueOpens: number;

  @Column({ default: 0 })
  clicks: number;

  @Column({ name: 'unique_clicks', default: 0 })
  uniqueClicks: number;

  @Column({ default: 0 })
  unsubscribes: number;

  @Column({ default: 0 })
  bounces: number;

  @Column({ name: 'spam_reports', default: 0 })
  spamReports: number;

  @Column({ name: 'created_by', nullable: true, type: 'varchar' })
  createdBy: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
