import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

@Entity('opportunity_stage_history')
export class OpportunityStageHistory {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'opportunity_id' }) opportunityId: string;
  @Column({ name: 'location_id' }) locationId: string;
  @Column({ name: 'from_stage_id', nullable: true, type: 'varchar' }) fromStageId: string | null;
  @Column({ name: 'to_stage_id' }) toStageId: string;
  @Column({ name: 'changed_by', nullable: true, type: 'varchar' }) changedBy: string | null;
  @Column({ name: 'time_in_stage_ms', type: 'bigint', nullable: true }) timeInStageMs: string | null;
  @CreateDateColumn({ name: 'changed_at' }) changedAt: Date;
}
