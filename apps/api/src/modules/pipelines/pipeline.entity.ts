import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, DeleteDateColumn, OneToMany,
} from 'typeorm';
import { PipelineStage } from './pipeline-stage.entity';

@Entity('pipelines')
export class Pipeline {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'location_id' }) locationId: string;
  @Column() name: string;
  @Column({ name: 'is_default', default: false }) isDefault: boolean;
  @OneToMany(() => PipelineStage, (s) => s.pipeline, { cascade: true, eager: false })
  stages: PipelineStage[];
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
  @DeleteDateColumn({ name: 'deleted_at' }) deletedAt: Date;
}
