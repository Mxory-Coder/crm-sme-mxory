import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Opportunity } from './opportunity.entity';

@Entity('opportunity_contacts')
export class OpportunityContact {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'opportunity_id' }) opportunityId: string;
  @ManyToOne(() => Opportunity, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'opportunity_id' }) opportunity: Opportunity;
  @Column({ name: 'contact_id' }) contactId: string;
  @Column({ name: 'location_id' }) locationId: string;
  @Column({ nullable: true, type: 'varchar' }) role: string | null;
  @Column({ name: 'is_primary', default: false }) isPrimary: boolean;
  @CreateDateColumn({ name: 'added_at' }) addedAt: Date;
}
