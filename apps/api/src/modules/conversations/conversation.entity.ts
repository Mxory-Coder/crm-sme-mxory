import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { Location } from '../locations/location.entity';
import { Contact } from '../contacts/contact.entity';
import { User } from '../users/user.entity';
import { ChannelType, ConversationStatus } from '@sme/shared';

@Entity('conversations')
@Index(['locationId', 'lastMessageAt'])
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'location_id' })
  locationId: string;

  @ManyToOne(() => Location, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'location_id' })
  location: Location;

  @Column({ name: 'contact_id' })
  contactId: string;

  @ManyToOne(() => Contact, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contact_id' })
  contact: Contact;

  @Column({ type: 'text' })
  type: ChannelType;

  @Column({ type: 'text', default: 'open' })
  status: ConversationStatus;

  @Column({ name: 'assigned_to', nullable: true })
  assignedTo: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigned_to' })
  assignedUser: User;

  @Column({ name: 'last_message_at', nullable: true })
  lastMessageAt: Date;

  @Column({ name: 'last_message_body', nullable: true, type: 'text' })
  lastMessageBody: string;

  @Column({ name: 'last_message_type', nullable: true, type: 'text' })
  lastMessageType: ChannelType;

  @Column({ name: 'unread_count', default: 0 })
  unreadCount: number;

  // ─── AI mode per conversation ─────────────────────────────────────────────
  @Column({ name: 'ai_mode', type: 'text', default: 'ON' })
  aiMode: 'ON' | 'PAUSED' | 'OFF';

  @Column({ name: 'ai_paused_reason', nullable: true, type: 'text' })
  aiPausedReason: string;

  @Column({ name: 'ai_paused_at', nullable: true })
  aiPausedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date;
}
