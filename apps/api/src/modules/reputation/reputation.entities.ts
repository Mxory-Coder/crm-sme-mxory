import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Location } from '../locations/location.entity';

@Entity('review_requests')
export class ReviewRequest {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'location_id' }) locationId: string;
  @ManyToOne(() => Location, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'location_id' }) location: Location;
  @Column({ name: 'contact_id' }) contactId: string;
  @Column({ type: 'text', default: 'SMS' }) channel: string;
  @Column({ type: 'text', default: 'PENDING' }) status: string;
  @Column({ name: 'message_body', type: 'text' }) messageBody: string;
  @Column({ name: 'review_link', nullable: true, type: 'varchar' }) reviewLink: string | null;
  @Column({ name: 'sent_at', nullable: true, type: 'timestamp' }) sentAt: Date | null;
  @Column({ name: 'clicked_at', nullable: true, type: 'timestamp' }) clickedAt: Date | null;
  @Column({ name: 'reviewed_at', nullable: true, type: 'timestamp' }) reviewedAt: Date | null;
  @Column({ nullable: true, type: 'varchar' }) platform: string | null;
  @Column({ nullable: true, type: 'float' }) rating: number | null;
  @Column({ name: 'review_text', type: 'text', nullable: true }) reviewText: string | null;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'location_id' }) locationId: string;
  @ManyToOne(() => Location, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'location_id' }) location: Location;
  @Column({ name: 'contact_id', nullable: true, type: 'varchar' }) contactId: string | null;
  @Column({ default: 'GOOGLE' }) platform: string;
  @Column({ name: 'reviewer_name' }) reviewerName: string;
  @Column() rating: number;
  @Column({ name: 'review_text', type: 'text', nullable: true }) reviewText: string | null;
  @Column({ name: 'response_text', type: 'text', nullable: true }) responseText: string | null;
  @Column({ name: 'response_at', nullable: true, type: 'timestamp' }) responseAt: Date | null;
  @Column({ name: 'external_id', nullable: true, type: 'varchar' }) externalId: string | null;
  @Column({ name: 'is_verified', default: false }) isVerified: boolean;
  @Column({ name: 'reviewed_at', default: () => 'NOW()' }) reviewedAt: Date;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
