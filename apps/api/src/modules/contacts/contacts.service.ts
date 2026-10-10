import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, IsNull } from 'typeorm';
import { Contact } from './contact.entity';
import { AccessTokenPayload } from '@sme/shared';

export interface CreateContactDto {
  locationId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  tags?: string[];
  customFields?: Record<string, unknown>;
  source?: string;
  sourceMeta?: Record<string, unknown>;
  facebookPsid?: string;
  instagramIgsid?: string;
  assignedTo?: string;
}

export interface UpdateContactDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  tags?: string[];
  customFields?: Record<string, unknown>;
  assignedTo?: string;
  dndSettings?: Record<string, boolean>;
}

export interface ContactListFilters {
  search?: string;
  tags?: string[];
  tag?: string;       // single-tag convenience (from query param)
  assignedTo?: string;
  cursor?: string;
  limit?: number;
}

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepo: Repository<Contact>,
  ) {}

  // ─── Dedup + upsert (called by every inbound channel) ────────────────────
  async findOrCreateByIdentifier(dto: CreateContactDto): Promise<Contact> {
    const { locationId } = dto;

    // 1. Try match by email
    if (dto.email) {
      const byEmail = await this.contactRepo.findOne({
        where: { locationId, emailLower: dto.email.toLowerCase(), deletedAt: IsNull() },
      });
      if (byEmail) return this.mergeFields(byEmail, dto);
    }

    // 2. Try match by phone (normalized to digits)
    if (dto.phone) {
      const normalized = dto.phone.replace(/\D/g, '');
      const byPhone = await this.contactRepo.findOne({
        where: { locationId, phoneNormalized: normalized, deletedAt: IsNull() },
      });
      if (byPhone) return this.mergeFields(byPhone, dto);
    }

    // 3. Try match by Facebook PSID
    if (dto.facebookPsid) {
      const byPsid = await this.contactRepo.findOne({
        where: { locationId, facebookPsid: dto.facebookPsid },
      });
      if (byPsid) return this.mergeFields(byPsid, dto);
    }

    // 4. Try match by Instagram IGSID
    if (dto.instagramIgsid) {
      const byIgsid = await this.contactRepo.findOne({
        where: { locationId, instagramIgsid: dto.instagramIgsid },
      });
      if (byIgsid) return this.mergeFields(byIgsid, dto);
    }

    // 5. No match — create new contact
    const contact = this.contactRepo.create({
      locationId,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      emailLower: dto.email?.toLowerCase(),
      phone: dto.phone,
      phoneNormalized: dto.phone?.replace(/\D/g, ''),
      companyName: dto.companyName,
      tags: dto.tags ?? [],
      customFields: dto.customFields ?? {},
      source: dto.source,
      sourceMeta: dto.sourceMeta,
      facebookPsid: dto.facebookPsid,
      instagramIgsid: dto.instagramIgsid,
      assignedTo: dto.assignedTo,
    });
    return this.contactRepo.save(contact);
  }

  async findAll(
    locationId: string,
    filters: ContactListFilters,
    requestingUser: AccessTokenPayload,
  ) {
    const limit = Math.min(filters.limit ?? 25, 100);
    const qb = this.contactRepo
      .createQueryBuilder('c')
      .where('c.location_id = :locationId', { locationId })
      .andWhere('c.deleted_at IS NULL')
      .orderBy('c.created_at', 'DESC')
      .take(limit + 1);

    if (filters.search) {
      qb.andWhere(
        `(c.first_name ILIKE :search OR c.last_name ILIKE :search OR
          c.email ILIKE :search OR c.phone ILIKE :search OR
          c.company_name ILIKE :search)`,
        { search: `%${filters.search}%` },
      );
    }

    const tagFilter = filters.tags ?? (filters.tag ? [filters.tag] : undefined);
    if (tagFilter?.length) {
      qb.andWhere('c.tags && :tags', { tags: tagFilter });
    }

    if (filters.assignedTo) {
      qb.andWhere('c.assigned_to = :assignedTo', { assignedTo: filters.assignedTo });
    }

    if (filters.cursor) {
      qb.andWhere('c.created_at < :cursor', { cursor: new Date(filters.cursor) });
    }

    // Only Assigned Data filter
    this.applyOnlyAssignedFilter(qb, requestingUser, 'c', 'contact');

    const rows = await qb.getMany();
    const hasMore = rows.length > limit;
    const data = hasMore ? rows.slice(0, limit) : rows;
    return {
      data,
      hasMore,
      nextCursor: hasMore ? data[data.length - 1].createdAt.toISOString() : null,
    };
  }

  /** Alias for controllers — throws 404 if not found */
  async findByIdOrFail(id: string, locationId: string): Promise<Contact> {
    return this.findById(id, locationId);
  }

  async findById(id: string, locationId: string): Promise<Contact> {
    const contact = await this.contactRepo.findOne({
      where: { id, locationId, deletedAt: IsNull() },
    });
    if (!contact) throw new NotFoundException('Contact not found');
    return contact;
  }

  async update(
    id: string,
    locationId: string,
    dto: UpdateContactDto,
  ): Promise<Contact> {
    const contact = await this.findById(id, locationId);
    if (dto.email) {
      contact.email = dto.email;
      contact.emailLower = dto.email.toLowerCase();
    }
    if (dto.phone) {
      contact.phone = dto.phone;
      contact.phoneNormalized = dto.phone.replace(/\D/g, '');
    }
    if (dto.firstName !== undefined) contact.firstName = dto.firstName;
    if (dto.lastName !== undefined) contact.lastName = dto.lastName;
    if (dto.companyName !== undefined) contact.companyName = dto.companyName;
    if (dto.tags !== undefined) contact.tags = dto.tags;
    if (dto.customFields !== undefined) {
      contact.customFields = { ...contact.customFields, ...dto.customFields };
    }
    if (dto.assignedTo !== undefined) contact.assignedTo = dto.assignedTo;
    if (dto.dndSettings !== undefined) {
      contact.dndSettings = { ...contact.dndSettings, ...dto.dndSettings };
    }
    return this.contactRepo.save(contact);
  }

  async setCustomField(contactId: string, fieldKey: string, value: unknown): Promise<void> {
    await this.contactRepo.query(
      `UPDATE contacts
       SET custom_fields = custom_fields || jsonb_build_object($1::text, $2::jsonb),
           updated_at = NOW()
       WHERE id = $3`,
      [fieldKey, JSON.stringify(value), contactId],
    );
  }

  async addTag(contactId: string, locationId: string, tag: string): Promise<Contact> {
    const contact = await this.findById(contactId, locationId);
    if (!contact.tags.includes(tag)) {
      contact.tags = [...contact.tags, tag];
      await this.contactRepo.save(contact);
    }
    return contact;
  }

  async removeTag(contactId: string, locationId: string, tag: string): Promise<Contact> {
    const contact = await this.findById(contactId, locationId);
    contact.tags = contact.tags.filter((t) => t !== tag);
    return this.contactRepo.save(contact);
  }

  async softDelete(id: string, locationId: string): Promise<void> {
    const contact = await this.findById(id, locationId);
    await this.contactRepo.softDelete(contact.id);
  }

  // ─── Shared filter helper for "Only Assigned Data" ───────────────────────
  applyOnlyAssignedFilter(
    qb: SelectQueryBuilder<any>,
    user: AccessTokenPayload,
    alias: string,
    entityType: 'contact' | 'opportunity',
  ) {
    if (!user.onlyAssignedData) return;
    qb.andWhere(
      `(${alias}.assigned_to = :__userId OR EXISTS (
        SELECT 1 FROM entity_followers ef
        WHERE ef.entity_type = :__entityType
          AND ef.entity_id = ${alias}.id
          AND ef.user_id = :__userId
      ))`,
      { __userId: user.sub, __entityType: entityType },
    );
  }

  // ─── Merge incoming fields into existing contact (never overwrites) ───────
  private async mergeFields(existing: Contact, incoming: CreateContactDto): Promise<Contact> {
    let changed = false;
    if (!existing.firstName && incoming.firstName) {
      existing.firstName = incoming.firstName;
      changed = true;
    }
    if (!existing.lastName && incoming.lastName) {
      existing.lastName = incoming.lastName;
      changed = true;
    }
    if (!existing.email && incoming.email) {
      existing.email = incoming.email;
      existing.emailLower = incoming.email.toLowerCase();
      changed = true;
    }
    if (!existing.phone && incoming.phone) {
      existing.phone = incoming.phone;
      existing.phoneNormalized = incoming.phone.replace(/\D/g, '');
      changed = true;
    }
    if (!existing.facebookPsid && incoming.facebookPsid) {
      existing.facebookPsid = incoming.facebookPsid;
      changed = true;
    }
    if (!existing.instagramIgsid && incoming.instagramIgsid) {
      existing.instagramIgsid = incoming.instagramIgsid;
      changed = true;
    }
    if (incoming.tags?.length) {
      const merged = [...new Set([...existing.tags, ...incoming.tags])];
      if (merged.length !== existing.tags.length) {
        existing.tags = merged;
        changed = true;
      }
    }
    if (incoming.customFields) {
      existing.customFields = { ...incoming.customFields, ...existing.customFields };
      changed = true;
    }
    if (changed) await this.contactRepo.save(existing);
    return existing;
  }
}
