import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('workflow_definitions')
export class WorkflowDefinition {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'location_id' }) locationId: string;
  @Column() name: string;
  @Column({ type: 'text', nullable: true }) description: string | null;
  @Column({ default: 'DRAFT' }) status: string;
  @Column({ name: 'trigger_type', default: 'MANUAL' }) triggerType: string;
  @Column({ name: 'trigger_config', type: 'jsonb', default: {} }) triggerConfig: Record<string, unknown>;
  @Column({ type: 'jsonb', default: [] }) nodes: unknown[];
  @Column({ type: 'jsonb', default: [] }) edges: unknown[];
  @Column({ name: 'ai_generated', default: false }) aiGenerated: boolean;
  @Column({ name: 'ai_prompt', type: 'text', nullable: true }) aiPrompt: string | null;
  @Column({ default: 1 }) version: number;
  @Column({ name: 'created_by', nullable: true, type: 'varchar' }) createdBy: string | null;
  @Column({ name: 'published_at', nullable: true, type: 'timestamp' }) publishedAt: Date | null;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
