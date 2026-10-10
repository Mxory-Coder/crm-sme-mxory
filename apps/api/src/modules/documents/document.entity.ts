import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'location_id' }) locationId: string;
  @Column({ name: 'contact_id', nullable: true, type: 'varchar' }) contactId: string | null;
  @Column({ name: 'opportunity_id', nullable: true, type: 'varchar' }) opportunityId: string | null;
  @Column({ name: 'created_by', nullable: true, type: 'varchar' }) createdBy: string | null;
  @Column() title: string;
  @Column({ default: 'PROPOSAL' }) type: string;
  @Column({ default: 'DRAFT' }) status: string;
  @Column({ name: 'body_json', type: 'jsonb', default: {} }) bodyJson: Record<string, unknown>;
  @Column({ name: 'merge_fields', type: 'jsonb', default: {} }) mergeFields: Record<string, unknown>;
  @Column({ name: 'sent_at', nullable: true, type: 'timestamp' }) sentAt: Date | null;
  @Column({ name: 'first_viewed_at', nullable: true, type: 'timestamp' }) firstViewedAt: Date | null;
  @Column({ name: 'view_count', default: 0 }) viewCount: number;
  @Column({ name: 'signed_at', nullable: true, type: 'timestamp' }) signedAt: Date | null;
  @Column({ name: 'expires_at', nullable: true, type: 'timestamp' }) expiresAt: Date | null;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
