import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { Location } from '../locations/location.entity';
import { User } from '../users/user.entity';

@Entity('contacts')
@Index(['locationId', 'phoneNormalized'], { where: '"deleted_at" IS NULL' })
@Index(['locationId', 'emailLower'], { where: '"deleted_at" IS NULL' })
@Index(['locationId', 'facebookPsid'], { where: '"facebook_psid" IS NOT NULL' })
@Index(['locationId', 'instagramIgsid'], { where: '"instagram_igsid" IS NOT NULL' })
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'location_id' })
  locationId: string;

  @ManyToOne(() => Location, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'location_id' })
  location: Location;

  @Column({ name: 'first_name', nullable: true, length: 100 })
  firstName: string;

  @Column({ name: 'last_name', nullable: true, length: 100 })
  lastName: string;

  @Column({ nullable: true, length: 255 })
  email: string;

  @Column({ name: 'email_lower', nullable: true, length: 255 })
  emailLower: string;

  @Column({ nullable: true, length: 50 })
  phone: string;

  @Column({ name: 'phone_normalized', nullable: true, length: 20 })
  phoneNormalized: string;

  @Column({ name: 'company_name', nullable: true, length: 255 })
  companyName: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true, length: 100 })
  city: string;

  @Column({ nullable: true, length: 100 })
  country: string;

  @Column({ nullable: true })
  timezone: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string;

  @Column({ type: 'text', array: true, default: [] })
  tags: string[];

  @Column({ name: 'custom_fields', type: 'jsonb', default: {} })
  customFields: Record<string, unknown>;

  @Column({ name: 'assigned_to', nullable: true })
  assignedTo: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigned_to' })
  assignedUser: User;

  // ─── Channel identifiers ──────────────────────────────────────────────────
  @Column({ name: 'facebook_psid', nullable: true })
  facebookPsid: string;

  @Column({ name: 'instagram_igsid', nullable: true })
  instagramIgsid: string;

  // ─── Lead source tracking ─────────────────────────────────────────────────
  @Column({ nullable: true, length: 100 })
  source: string; // 'FACEBOOK_LEAD_AD' | 'FORM' | 'MANUAL' | 'TWILIO_INBOUND' | ...

  @Column({ name: 'source_meta', type: 'jsonb', nullable: true })
  sourceMeta: Record<string, unknown>;

  // ─── DND (Do Not Disturb) per channel ────────────────────────────────────
  @Column({ name: 'dnd_settings', type: 'jsonb', default: {} })
  dndSettings: Record<string, boolean>;
  // { sms: false, email: false, whatsapp: false, ... }

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date;
}
