import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Location } from '../locations/location.entity';

@Entity('sites')
export class Site {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'location_id' })
  locationId: string;

  @ManyToOne(() => Location, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'location_id' })
  location: Location;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', default: 'WEBSITE' })
  type: 'WEBSITE' | 'BLOG' | 'LANDING_PAGE';

  @Column({ type: 'text', default: 'DRAFT' })
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

  @Column({ nullable: true, type: 'varchar' })
  domain: string | null;

  @Column({ nullable: true, type: 'varchar' })
  subdomain: string | null;

  @Column({ name: 'favicon_url', nullable: true, type: 'varchar' })
  faviconUrl: string | null;

  @Column({ name: 'meta_title', nullable: true, type: 'varchar' })
  metaTitle: string | null;

  @Column({ name: 'meta_description', nullable: true, type: 'varchar' })
  metaDescription: string | null;

  @Column({ name: 'header_code', type: 'text', nullable: true })
  headerCode: string | null;

  @Column({ name: 'footer_code', type: 'text', nullable: true })
  footerCode: string | null;

  @Column({ name: 'global_css', type: 'text', nullable: true })
  globalCss: string | null;

  @Column({ name: 'published_at', nullable: true, type: 'timestamp' })
  publishedAt: Date | null;

  @Column({ name: 'created_by', nullable: true, type: 'varchar' })
  createdBy: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('site_pages')
export class SitePage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'site_id' })
  siteId: string;

  @ManyToOne(() => Site, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'site_id' })
  site: Site;

  @Column({ name: 'location_id' })
  locationId: string;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text' })
  slug: string;

  @Column({ name: 'is_home', default: false })
  isHome: boolean;

  @Column({ type: 'text', default: 'DRAFT' })
  status: 'DRAFT' | 'PUBLISHED';

  @Column({ name: 'page_content', type: 'jsonb', default: {} })
  pageContent: Record<string, unknown>;

  @Column({ name: 'meta_title', nullable: true, type: 'varchar' })
  metaTitle: string | null;

  @Column({ name: 'meta_description', nullable: true, type: 'varchar' })
  metaDescription: string | null;

  @Column({ name: 'og_image', nullable: true, type: 'varchar' })
  ogImage: string | null;

  @Column({ default: 0 })
  visits: number;

  @Column({ name: 'published_at', nullable: true, type: 'timestamp' })
  publishedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('blog_posts')
export class BlogPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'site_id' })
  siteId: string;

  @ManyToOne(() => Site, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'site_id' })
  site: Site;

  @Column({ name: 'location_id' })
  locationId: string;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text' })
  slug: string;

  @Column({ type: 'text', nullable: true })
  excerpt: string | null;

  @Column({ name: 'body_html', type: 'text', default: '' })
  bodyHtml: string;

  @Column({ name: 'featured_image', nullable: true, type: 'varchar' })
  featuredImage: string | null;

  @Column({ name: 'author_id', nullable: true, type: 'varchar' })
  authorId: string | null;

  @Column({ type: 'text', default: 'DRAFT' })
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';

  @Column({ type: 'text', array: true, default: [] })
  tags: string[];

  @Column({ type: 'text', array: true, default: [] })
  categories: string[];

  @Column({ name: 'meta_title', nullable: true, type: 'varchar' })
  metaTitle: string | null;

  @Column({ name: 'meta_description', nullable: true, type: 'varchar' })
  metaDescription: string | null;

  @Column({ name: 'og_image', nullable: true, type: 'varchar' })
  ogImage: string | null;

  @Column({ name: 'read_time_mins', nullable: true, type: 'float' })
  readTimeMins: number | null;

  @Column({ default: 0 })
  views: number;

  @Column({ name: 'published_at', nullable: true, type: 'timestamp' })
  publishedAt: Date | null;

  @Column({ name: 'scheduled_at', nullable: true, type: 'timestamp' })
  scheduledAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
