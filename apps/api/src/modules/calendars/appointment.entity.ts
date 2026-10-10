import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Calendar } from './calendar.entity';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'calendar_id' }) calendarId: string;
  @ManyToOne(() => Calendar, (c) => c.appointments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'calendar_id' }) calendar: Calendar;
  @Column({ name: 'location_id' }) locationId: string;
  @Column({ name: 'contact_id', nullable: true, type: 'varchar' }) contactId: string | null;
  @Column({ name: 'assigned_to', nullable: true, type: 'varchar' }) assignedTo: string | null;
  @Column() title: string;
  @Column({ nullable: true, type: 'varchar' }) description: string | null;
  @Column({ name: 'starts_at' }) startsAt: Date;
  @Column({ name: 'ends_at' }) endsAt: Date;
  @Column({ default: 'confirmed' }) status: string;
  @Column({ name: 'meeting_link', nullable: true, type: 'varchar' }) meetingLink: string | null;
  @Column({ name: 'location_notes', nullable: true, type: 'varchar' }) locationNotes: string | null;
  @Column({ nullable: true, type: 'varchar' }) notes: string | null;
  @Column({ name: 'custom_fields', type: 'jsonb', default: {} }) customFields: Record<string, unknown>;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
