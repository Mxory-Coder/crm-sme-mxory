import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Location } from '../locations/location.entity';
import { User } from '../users/user.entity';

@Entity('agencies')
export class Agency {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ name: 'owner_email', length: 255 })
  ownerEmail: string;

  @Column({ type: 'jsonb', default: {} })
  branding: Record<string, unknown>;
  // {
  //   platformName, logoUrl, faviconUrl, primaryColor,
  //   customDomain, supportEmail, supportPhone,
  //   mobileAppName, mobileAppIcon, hideGHLBranding,
  //   customLoginBackground
  // }

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Location, (l) => l.agency)
  locations: Location[];

  @OneToMany(() => User, (u) => u.agency)
  users: User[];
}
