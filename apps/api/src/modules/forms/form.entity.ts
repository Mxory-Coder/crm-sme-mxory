import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Location } from '../locations/location.entity';

export interface FormField {
  id: string;
  type: 'TEXT' | 'EMAIL' | 'PHONE' | 'TEXTAREA' | 'SELECT' | 'CHECKBOX' | 'RADIO' | 'FILE' | 'HIDDEN';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: { label: string; value: string }[];
  customFieldKey?: string;
  standardField?: 'first_name' | 'last_name' | 'email' | 'phone' | 'company';
  sortOrder: number;
}

@Entity('forms')
export class Form {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'location_id' })
  locationId: string;

  @ManyToOne(() => Location, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'location_id' })
  location: Location;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'jsonb', default: [] })
  fields: FormField[];

  @Column({ type: 'jsonb', default: {} })
  settings: {
    redirectUrl?: string;
    thankYouMessage?: string;
    sendEmailTo?: string[];
    notifyOnSubmit?: boolean;
    honeypot?: boolean;
    workflowId?: string;
  };

  @Column({ type: 'jsonb', default: {} })
  style: Record<string, unknown>;

  @Column({ type: 'text', default: 'DRAFT' })
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

  @Column({ default: 0 })
  submissions: number;

  @Column({ name: 'created_by', nullable: true, type: 'varchar' })
  createdBy: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('form_submissions')
export class FormSubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'form_id' })
  formId: string;

  @ManyToOne(() => Form, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'form_id' })
  form: Form;

  @Column({ name: 'location_id' })
  locationId: string;

  @Column({ name: 'contact_id', nullable: true, type: 'varchar' })
  contactId: string | null;

  @Column({ type: 'jsonb', default: {} })
  data: Record<string, unknown>;

  @Column({ name: 'ip_address', nullable: true, type: 'varchar' })
  ipAddress: string | null;

  @Column({ name: 'user_agent', nullable: true, type: 'varchar' })
  userAgent: string | null;

  @Column({ name: 'page_url', nullable: true, type: 'varchar' })
  pageUrl: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
