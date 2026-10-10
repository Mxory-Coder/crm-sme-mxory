import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Conversation } from './conversation.entity';

@Entity('conversation_ai_drafts')
export class ConversationAiDraft {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'conversation_id' })
  conversationId: string;

  @ManyToOne(() => Conversation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @Column({ name: 'message_id', nullable: true, type: 'varchar' })
  messageId: string | null;

  @Column({ name: 'location_id' })
  locationId: string;

  @Column({ type: 'text' })
  body: string;

  @Column({
    type: 'text',
    default: 'pending',
    // pending | sent | edited_and_sent | dismissed
  })
  status: string;

  @Column({ name: 'model_used', nullable: true, type: 'varchar' })
  modelUsed: string | null;

  @Column({ type: 'decimal', precision: 4, scale: 3, nullable: true })
  confidence: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
