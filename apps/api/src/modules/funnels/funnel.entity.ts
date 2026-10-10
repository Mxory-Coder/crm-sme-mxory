import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, OneToMany,
} from 'typeorm';
import { Location } from '../locations/location.entity';

@Entity('funnels')
export class Funnel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'location_id' })
  locationId: string;

  @ManyToOne(() => Location, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'location_id' })
  location: Location;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text', default: 'DRAFT' })
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

  @Column({ nullable: true, type: 'varchar' })
  domain: string | null;

  @Column({ name: 'path_prefix', nullable: true, type: 'varchar' })
  pathPrefix: string | null;

  @Column({ name: 'favicon_url', nullable: true, type: 'varchar' })
  faviconUrl: string | null;

  @Column({ name: 'total_visits', default: 0 })
  totalVisits: number;

  @Column({ name: 'total_optins', default: 0 })
  totalOptins: number;

  @Column({ name: 'created_by', nullable: true, type: 'varchar' })
  createdBy: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany('FunnelStep', 'funnel')
  steps: unknown[];
}

@Entity('funnel_steps')
export class FunnelStep {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'funnel_id' })
  funnelId: string;

  @ManyToOne(() => Funnel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'funnel_id' })
  funnel: Funnel;

  @Column({ name: 'location_id' })
  locationId: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', default: 'OPTIN' })
  type: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ type: 'text' })
  slug: string;

  @Column({ name: 'page_content', type: 'jsonb', default: {} })
  pageContent: Record<string, unknown>;

  @Column({ name: 'product_id', nullable: true, type: 'varchar' })
  productId: string | null;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  price: number | null;

  @Column({ default: 'ZAR' })
  currency: string;

  @Column({ name: 'is_one_click', default: false })
  isOneClick: boolean;

  @Column({ name: 'on_accept', nullable: true, type: 'varchar' })
  onAccept: string | null;

  @Column({ name: 'on_decline', nullable: true, type: 'varchar' })
  onDecline: string | null;

  @Column({ default: 0 })
  visits: number;

  @Column({ default: 0 })
  conversions: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
