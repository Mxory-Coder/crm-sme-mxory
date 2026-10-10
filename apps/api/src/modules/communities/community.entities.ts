import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Location } from '../locations/location.entity';

@Entity('communities')
export class Community {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'location_id' }) locationId: string;
  @ManyToOne(() => Location, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'location_id' }) location: Location;
  @Column({ name: 'product_id', nullable: true, type: 'varchar' }) productId: string | null;
  @Column({ type: 'text' }) name: string;
  @Column({ type: 'text', nullable: true }) description: string | null;
  @Column({ name: 'cover_image_url', nullable: true, type: 'varchar' }) coverImageUrl: string | null;
  @Column({ type: 'text', default: 'ACTIVE' }) status: string;
  @Column({ name: 'member_count', default: 0 }) memberCount: number;
  @Column({ name: 'post_count', default: 0 }) postCount: number;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

@Entity('community_posts')
export class CommunityPost {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'community_id' }) communityId: string;
  @ManyToOne(() => Community, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'community_id' }) community: Community;
  @Column({ name: 'location_id' }) locationId: string;
  @Column({ name: 'contact_id', nullable: true, type: 'varchar' }) contactId: string | null;
  @Column({ name: 'user_id', nullable: true, type: 'varchar' }) userId: string | null;
  @Column({ type: 'text' }) body: string;
  @Column({ name: 'media_urls', type: 'text', array: true, default: [] }) mediaUrls: string[];
  @Column({ name: 'is_pinned', default: false }) isPinned: boolean;
  @Column({ name: 'like_count', default: 0 }) likeCount: number;
  @Column({ name: 'comment_count', default: 0 }) commentCount: number;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

@Entity('community_post_comments')
export class CommunityPostComment {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'post_id' }) postId: string;
  @ManyToOne(() => CommunityPost, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'post_id' }) post: CommunityPost;
  @Column({ name: 'location_id' }) locationId: string;
  @Column({ name: 'contact_id', nullable: true, type: 'varchar' }) contactId: string | null;
  @Column({ name: 'user_id', nullable: true, type: 'varchar' }) userId: string | null;
  @Column({ type: 'text' }) body: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
