import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToMany,
} from 'typeorm';
import { Appointment } from './appointment.entity';

@Entity('calendars')
export class Calendar {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'location_id' }) locationId: string;
  @Column() name: string;
  @Column({ nullable: true, type: 'varchar' }) description: string | null;
  @Column({ default: 'event' }) type: string;
  @Column({ default: 'Africa/Johannesburg' }) timezone: string;
  @Column() slug: string;
  @Column({ type: 'jsonb', default: {} }) availability: Record<string, unknown>;
  @Column({ type: 'jsonb', default: {} }) settings: Record<string, unknown>;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @OneToMany(() => Appointment, (a) => a.calendar) appointments: Appointment[];
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
