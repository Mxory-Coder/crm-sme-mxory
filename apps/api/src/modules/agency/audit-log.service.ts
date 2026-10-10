import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './agency.entities';

export interface AuditLogDto {
  agencyId?: string;
  locationId?: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog) private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async record(dto: AuditLogDto): Promise<void> {
    await this.auditRepo.save(this.auditRepo.create(dto));
  }

  async findForAgency(agencyId: string, limit = 100): Promise<AuditLog[]> {
    return this.auditRepo.find({
      where: { agencyId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findForLocation(locationId: string, limit = 100): Promise<AuditLog[]> {
    return this.auditRepo.find({
      where: { locationId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findForUser(userId: string, limit = 50): Promise<AuditLog[]> {
    return this.auditRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findForResource(resource: string, resourceId: string): Promise<AuditLog[]> {
    return this.auditRepo.find({
      where: { resource, resourceId },
      order: { createdAt: 'DESC' },
    });
  }
}
