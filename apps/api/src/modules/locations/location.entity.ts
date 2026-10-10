import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Agency } from '../agencies/agency.entity';

@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'agency_id' })
  agencyId: string;

  @ManyToOne(() => Agency, (a) => a.locations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agency_id' })
  agency: Agency;

  @Column({ length: 255 })
  name: string;

  @Column({ nullable: true, length: 50 })
  phone: string;

  @Column({ nullable: true, length: 500 })
  website: string;

  @Column({ nullable: true, length: 255 })
  email: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true, length: 100 })
  city: string;

  @Column({ nullable: true, length: 100 })
  country: string;

  @Column({ nullable: true, length: 50 })
  timezone: string;

  @Column({ type: 'jsonb', default: {} })
  settings: Record<string, unknown>;
  // {
  //   missedCallTextBackEnabled, missedCallTemplate,
  //   routeToAssignedUser, defaultHandoffUserId,
  //   aiEnabled, aiMode, defaultCalendarId
  // }

  @Column({ type: 'jsonb', default: {} })
  metaConfig: Record<string, unknown>;
  // { pageId, pageAccessToken (encrypted), igUserId, igAccessToken, pixelId, leadAdsForms[] }

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
