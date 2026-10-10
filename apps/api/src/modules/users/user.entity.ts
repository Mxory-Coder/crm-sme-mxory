import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Agency } from '../agencies/agency.entity';
import { Location } from '../locations/location.entity';
import { UserType, SystemRole, FeaturePermissions } from '@sme/shared';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'agency_id' })
  agencyId: string;

  @ManyToOne(() => Agency, (a) => a.users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agency_id' })
  agency: Agency;

  @Column({ length: 255 })
  email: string;

  @Column({ name: 'email_lower', length: 255 })
  emailLower: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'first_name', nullable: true, length: 100 })
  firstName: string;

  @Column({ name: 'last_name', nullable: true, length: 100 })
  lastName: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string;

  @Column({ nullable: true, length: 50 })
  phone: string;

  @Column({ name: 'user_type', type: 'text' })
  userType: UserType;

  @Column({ name: 'system_role', type: 'text', default: 'USER' })
  systemRole: SystemRole;

  @Column({ name: 'primary_location_id', nullable: true })
  primaryLocationId: string;

  @ManyToOne(() => Location, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'primary_location_id' })
  primaryLocation: Location;

  @Column({ name: 'only_assigned_data', default: false })
  onlyAssignedData: boolean;

  @Column({ name: 'feature_permissions', type: 'jsonb', default: {} })
  featurePermissions: Partial<FeaturePermissions>;

  @Column({ name: 'is_owner', default: false })
  isOwner: boolean;

  @Column({ name: 'totp_secret', nullable: true })
  totpSecret: string;

  @Column({ name: 'totp_enabled', default: false })
  totpEnabled: boolean;

  @Column({ name: 'last_login_at', nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date;
}
