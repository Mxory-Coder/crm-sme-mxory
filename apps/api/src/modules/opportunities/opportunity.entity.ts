import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Pipeline } from '../pipelines/pipeline.entity';
import { PipelineStage } from '../pipelines/pipeline-stage.entity';

@Entity('opportunities')
export class Opportunity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'location_id' }) locationId: string;
  @Column() name: string;
  @Column({ name: 'pipeline_id' }) pipelineId: string;
  @ManyToOne(() => Pipeline) @JoinColumn({ name: 'pipeline_id' }) pipeline: Pipeline;
  @Column({ name: 'pipeline_stage_id' }) pipelineStageId: string;
  @ManyToOne(() => PipelineStage) @JoinColumn({ name: 'pipeline_stage_id' }) stage: PipelineStage;
  @Column({ name: 'primary_contact_id', nullable: true, type: 'varchar' }) primaryContactId: string | null;
  @Column({ name: 'monetary_value', type: 'decimal', precision: 15, scale: 2, default: 0 }) monetaryValue: number;
  @Column({ default: 'ZAR' }) currency: string;
  @Column({ name: 'monetary_value_usd', type: 'decimal', precision: 15, scale: 2, nullable: true }) monetaryValueUsd: number | null;
  @Column({ default: 'open' }) status: string;
  @Column({ name: 'assigned_to', nullable: true, type: 'varchar' }) assignedTo: string | null;
  @Column({ name: 'custom_fields', type: 'jsonb', default: {} }) customFields: Record<string, unknown>;
  @Column({ name: 'ai_score', nullable: true, type: 'float' }) aiScore: number | null;
  @Column({ name: 'ai_score_reason', nullable: true, type: 'varchar' }) aiScoreReason: string | null;
  @Column({ name: 'ai_next_action', nullable: true, type: 'varchar' }) aiNextAction: string | null;
  @Column({ name: 'ai_risk_flags', type: 'text', array: true, default: [] }) aiRiskFlags: string[];
  @Column({ name: 'ai_scored_at', nullable: true, type: 'timestamp' }) aiScoredAt: Date | null;
  @Column({ name: 'last_stage_changed_at', nullable: true, type: 'timestamp' }) lastStageChangedAt: Date | null;
  @Column({ name: 'last_activity_at', nullable: true, type: 'timestamp' }) lastActivityAt: Date | null;
  @Column({ name: 'close_date', type: 'date', nullable: true }) closeDate: Date | null;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
  @DeleteDateColumn({ name: 'deleted_at' }) deletedAt: Date;
}
