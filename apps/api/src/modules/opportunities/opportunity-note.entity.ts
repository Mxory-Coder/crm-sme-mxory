import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('opportunity_notes')
export class OpportunityNote {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'opportunity_id' }) opportunityId: string;
  @Column({ name: 'location_id' }) locationId: string;
  @Column({ name: 'user_id', nullable: true, type: 'varchar' }) userId: string | null;
  @Column({ type: 'text' }) body: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
