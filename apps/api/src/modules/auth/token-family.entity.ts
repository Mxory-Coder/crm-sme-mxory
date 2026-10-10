import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('token_families')
export class TokenFamily {
  @PrimaryGeneratedColumn('uuid')
  id: string; // == tokenFamily UUID in JWT

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ name: 'current_version', default: 1 })
  currentVersion: number;

  @Column({ default: false })
  revoked: boolean;

  @Column({ name: 'revoked_reason', nullable: true })
  revokedReason: string;

  @Column({ name: 'last_used_at', nullable: true })
  lastUsedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('revoked_tokens')
export class RevokedToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  jti: string;

  @Column({ name: 'revoked_at' })
  revokedAt: Date;

  @Column({ name: 'expires_at' })
  expiresAt: Date; // used to clean up old rows via cron
}
