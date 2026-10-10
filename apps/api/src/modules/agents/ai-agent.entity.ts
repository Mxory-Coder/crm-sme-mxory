import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('ai_agents')
export class AiAgent {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'location_id' }) locationId: string;
  @Column() name: string;
  @Column({ name: 'system_prompt', type: 'text' }) systemPrompt: string;
  @Column({ type: 'text', default: 'Hi! How can I help you today?' }) greeting: string;
  @Column({ default: 'SUGGESTIVE' }) mode: string; // OFF | SUGGESTIVE | AUTOPILOT
  @Column({ type: 'text', array: true, default: [] }) channels: string[];
  @Column({ name: 'calendar_id', nullable: true, type: 'varchar' }) calendarId: string | null;
  @Column({ name: 'human_handoff_triggers', type: 'text', array: true, default: [] }) humanHandoffTriggers: string[];
  @Column({ name: 'booking_intent_phrases', type: 'text', array: true, default: [] }) bookingIntentPhrases: string[];
  @Column({ name: 'out_of_hours_message', type: 'text', nullable: true }) outOfHoursMessage: string | null;
  @Column({ name: 'tone_profile', type: 'jsonb', default: {} }) toneProfile: Record<string, unknown>;
  @Column({ name: 'response_delay_ms', default: 5000 }) responseDelayMs: number;
  @Column({ name: 'max_messages_per_conv', default: 20 }) maxMessagesPerConv: number;
  @Column({ name: 'is_auto_built', default: false }) isAutoBuilt: boolean;
  @Column({ name: 'created_by', default: 'MANUAL' }) createdBy: string;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
