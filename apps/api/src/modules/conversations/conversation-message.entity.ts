import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Conversation } from './conversation.entity';
import { Contact } from '../contacts/contact.entity';
import { User } from '../users/user.entity';
import { ChannelType, MessageDirection, MessageStatus } from '@sme/shared';

export type MessageType =
  | 'TEXT'
  | 'AUDIO'
  | 'VIDEO'
  | 'IMAGE'
  | 'DOCUMENT'
  | 'CALL'
  | 'VOICEMAIL'
  | 'ACTIVITY'
  | 'INTERNAL_COMMENT';

@Entity('conversation_messages')
@Index(['conversationId', 'createdAt'])
export class ConversationMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'conversation_id' })
  conversationId: string;

  @ManyToOne(() => Conversation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @Column({ name: 'contact_id', nullable: true })
  contactId: string;

  @ManyToOne(() => Contact, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'contact_id' })
  contact: Contact;

  @Column({ name: 'location_id' })
  locationId: string; // denormalized for RLS — avoids join on every query

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text' })
  direction: MessageDirection;

  @Column({ type: 'text' })
  channel: ChannelType;

  @Column({ type: 'text', nullable: true })
  body: string;

  @Column({ name: 'message_type', type: 'text', default: 'TEXT' })
  messageType: MessageType;

  @Column({ type: 'jsonb', default: [] })
  attachments: Array<{ url: string; mimeType: string; name?: string }>;

  @Column({ name: 'external_id', nullable: true })
  externalId: string; // Twilio SID, Meta message_id, SendGrid message_id

  @Column({ type: 'text', default: 'SENT' })
  status: MessageStatus;

  @Column({ name: 'ai_generated', default: false })
  aiGenerated: boolean;

  @Column({ name: 'sent_at', nullable: true })
  sentAt: Date;

  @Column({ name: 'delivered_at', nullable: true })
  deliveredAt: Date;

  @Column({ name: 'read_at', nullable: true })
  readAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
