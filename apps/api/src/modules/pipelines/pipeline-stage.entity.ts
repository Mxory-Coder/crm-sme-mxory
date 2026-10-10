import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Pipeline } from './pipeline.entity';

@Entity('pipeline_stages')
export class PipelineStage {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'pipeline_id' }) pipelineId: string;
  @ManyToOne(() => Pipeline, (p) => p.stages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pipeline_id' })
  pipeline: Pipeline;
  @Column({ name: 'location_id' }) locationId: string;
  @Column() name: string;
  @Column({ name: 'sort_order', default: 0 }) sortOrder: number;
  @Column({ default: '#6B7280' }) color: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
