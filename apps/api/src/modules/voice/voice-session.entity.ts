import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

@Entity('voice_sessions')
export class VoiceSession {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'location_id' }) locationId: string;
  @Column({ name: 'call_sid', unique: true }) callSid: string;
  @Column({ name: 'contact_id', nullable: true, type: 'varchar' }) contactId: string | null;
  @Column({ name: 'from_number' }) fromNumber: string;
  @Column({ name: 'to_number' }) toNumber: string;
  @Column({ default: 'inbound' }) direction: string;
  @Column({ default: 'active' }) status: string;
  @Column({ type: 'jsonb', default: [] }) transcript: unknown[];
  @Column({ name: 'duration_sec', nullable: true, type: 'float' }) durationSec: number | null;
  @Column({ name: 'ended_at', nullable: true, type: 'timestamp' }) endedAt: Date | null;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
