import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Location } from '../locations/location.entity';

@Entity('social_posts')
export class SocialPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'location_id' })
  locationId: string;

  @ManyToOne(() => Location, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'location_id' })
  location: Location;

  @Column({ type: 'text' })
  caption: string;

  @Column({ type: 'text', array: true, default: [] })
  mediaUrls: string[];

  @Column({ type: 'text', array: true, default: [] })
  platforms: string[];

  @Column({ type: 'text', default: 'DRAFT' })
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED';

  @Column({ name: 'scheduled_at', nullable: true, type: 'timestamp' })
  scheduledAt: Date | null;

  @Column({ name: 'published_at', nullable: true, type: 'timestamp' })
  publishedAt: Date | null;

  @Column({ name: 'facebook_post_id', nullable: true, type: 'varchar' })
  facebookPostId: string | null;

  @Column({ name: 'instagram_post_id', nullable: true, type: 'varchar' })
  instagramPostId: string | null;

  @Column({ name: 'error_message', nullable: true, type: 'varchar' })
  errorMessage: string | null;

  @Column({ name: 'created_by', nullable: true, type: 'varchar' })
  createdBy: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
