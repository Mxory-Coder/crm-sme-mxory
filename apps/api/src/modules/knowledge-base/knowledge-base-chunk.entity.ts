import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

@Entity('knowledge_base_chunks')
export class KnowledgeBaseChunk {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'location_id' }) locationId: string;
  @Column({ name: 'agent_id', nullable: true, type: 'varchar' }) agentId: string | null;
  @Column({ type: 'text' }) content: string;

  // pgvector — stored as float4[] in TypeORM, queried via raw SQL
  @Column({ name: 'embedding', type: 'float4', array: true, nullable: true, select: false })
  embedding: number[] | null;

  @Column({ name: 'source_type', default: 'MANUAL' }) sourceType: string;
  @Column({ default: 'general' }) category: string;
  @Column({ type: 'smallint', default: 3 }) priority: number;
  @Column({ name: 'source_url', nullable: true, type: 'varchar' }) sourceUrl: string | null;
  @Column({ name: 'source_filename', nullable: true, type: 'varchar' }) sourceFilename: string | null;
  @Column({ type: 'jsonb', default: {} }) metadata: Record<string, unknown>;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
