import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { User } from '../users/user.entity';
import { Agency } from '../agencies/agency.entity';
import { TokenFamily, RevokedToken } from './token-family.entity';
import {
  AccessTokenPayload,
  encodePermissions,
  getEffectivePermissions,
} from '@sme/shared';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Agency) private agencyRepo: Repository<Agency>,
    @InjectRepository(TokenFamily) private familyRepo: Repository<TokenFamily>,
    @InjectRepository(RevokedToken) private revokedRepo: Repository<RevokedToken>,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  // ─── Register a new agency (creates owner user) ───────────────────────────
  async register(dto: {
    agencyName: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    const existing = await this.agencyRepo.findOne({
      where: { ownerEmail: dto.email.toLowerCase() },
    });
    if (existing) throw new ConflictException('Email already registered');

    const agency = this.agencyRepo.create({
      name: dto.agencyName,
      ownerEmail: dto.email.toLowerCase(),
    });
    await this.agencyRepo.save(agency);

    const hash = await bcrypt.hash(dto.password, 12);
    const user = this.userRepo.create({
      agencyId: agency.id,
      email: dto.email,
      emailLower: dto.email.toLowerCase(),
      passwordHash: hash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      userType: 'AGENCY_OWNER',
      systemRole: 'ADMIN',
      isOwner: true,
      featurePermissions: {},
    });
    await this.userRepo.save(user);

    return this.issueTokenPair(user, null);
  }

  // ─── Login ────────────────────────────────────────────────────────────────
  async login(email: string, password: string) {
    const user = await this.userRepo.findOne({
      where: { emailLower: email.toLowerCase(), deletedAt: null as any },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    await this.userRepo.update(user.id, { lastLoginAt: new Date() });

    return this.issueTokenPair(user, user.primaryLocationId ?? null);
  }

  // ─── Refresh token rotation ───────────────────────────────────────────────
  async refresh(refreshToken: string) {
    let payload: AccessTokenPayload;
    try {
      payload = this.jwtService.verify<AccessTokenPayload>(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const family = await this.familyRepo.findOne({ where: { id: payload.tokenFamily } });
    if (!family || family.revoked) {
      // Reuse detected or family revoked — invalidate everything
      if (family) {
        await this.familyRepo.update(family.id, {
          revoked: true,
          revokedReason: 'REUSE_DETECTED',
        });
      }
      throw new ForbiddenException('Token reuse detected. Please log in again.');
    }

    if (payload.familyVersion !== family.currentVersion) {
      await this.familyRepo.update(family.id, {
        revoked: true,
        revokedReason: 'REUSE_DETECTED',
      });
      throw new ForbiddenException('Token reuse detected. Please log in again.');
    }

    const user = await this.userRepo.findOne({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException('User not found');

    // Rotate: increment version
    await this.familyRepo.update(family.id, {
      currentVersion: family.currentVersion + 1,
      lastUsedAt: new Date(),
    });

    return this.issueTokenPair(user, payload.locationId, family.id, family.currentVersion + 1);
  }

  // ─── Revoke all token families for a user (logout) ───────────────────────
  async revokeAll(userId: string) {
    await this.familyRepo.update(
      { userId, revoked: false },
      { revoked: true, revokedReason: 'LOGOUT' },
    );
  }

  // ─── Build and sign both tokens ───────────────────────────────────────────
  private async issueTokenPair(
    user: User,
    locationId: string | null,
    existingFamilyId?: string,
    familyVersion = 1,
  ) {
    const effectivePerms = getEffectivePermissions(user.userType, user.featurePermissions ?? {});
    const { mask1, mask2 } = encodePermissions(effectivePerms);

    let familyId = existingFamilyId;
    if (!familyId) {
      const family = this.familyRepo.create({ userId: user.id });
      await this.familyRepo.save(family);
      familyId = family.id;
    }

    const basePayload: Omit<AccessTokenPayload, 'exp' | 'iat'> = {
      sub: user.id,
      jti: crypto.randomUUID(),
      agencyId: user.agencyId,
      locationId,
      userType: user.userType,
      systemRole: user.systemRole,
      isOwner: user.isOwner,
      onlyAssignedData: user.onlyAssignedData,
      scopeMask1: mask1.toString(),
      scopeMask2: mask2.toString(),
      tokenFamily: familyId,
      familyVersion,
    };

    const accessToken = this.jwtService.sign(basePayload as any, {
      secret: this.config.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: (this.config.get<string>('JWT_ACCESS_EXPIRY') ?? '15m') as any,
    });

    const refreshToken = this.jwtService.sign(basePayload as any, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: (this.config.get<string>('JWT_REFRESH_EXPIRY') ?? '30d') as any,
    });

    return { accessToken, refreshToken, user: this.sanitizeUser(user) };
  }

  private sanitizeUser(user: User) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, totpSecret, ...safe } = user as any;
    return safe;
  }
}
