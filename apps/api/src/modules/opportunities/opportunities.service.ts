import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Opportunity } from './opportunity.entity';
import { OpportunityContact } from './opportunity-contact.entity';
import { OpportunityNote } from './opportunity-note.entity';
import { OpportunityStageHistory } from './opportunity-stage-history.entity';
import { AccessTokenPayload } from '@sme/shared';

export const OPPORTUNITY_AI_QUEUE = 'opportunity-ai';

export interface CreateOpportunityDto {
  name: string;
  pipelineId: string;
  pipelineStageId: string;
  primaryContactId?: string;
  monetaryValue?: number;
  currency?: string;
  assignedTo?: string;
  closeDate?: string;
  customFields?: Record<string, unknown>;
}

export interface UpdateOpportunityDto {
  name?: string;
  pipelineStageId?: string;
  monetaryValue?: number;
  currency?: string;
  status?: string;
  assignedTo?: string;
  closeDate?: string;
  customFields?: Record<string, unknown>;
}

@Injectable()
export class OpportunitiesService {
  constructor(
    @InjectRepository(Opportunity) private readonly oppRepo: Repository<Opportunity>,
    @InjectRepository(OpportunityContact) private readonly ocRepo: Repository<OpportunityContact>,
    @InjectRepository(OpportunityNote) private readonly noteRepo: Repository<OpportunityNote>,
    @InjectRepository(OpportunityStageHistory) private readonly historyRepo: Repository<OpportunityStageHistory>,
    @InjectQueue(OPPORTUNITY_AI_QUEUE) private readonly aiQueue: Queue,
  ) {}

  // ─── List by pipeline (kanban) ────────────────────────────────────────────
  async findByPipeline(
    locationId: string,
    pipelineId: string,
    requestingUser: AccessTokenPayload,
  ): Promise<Opportunity[]> {
    const qb = this.oppRepo
      .createQueryBuilder('opp')
      .where('opp.location_id = :locationId', { locationId })
      .andWhere('opp.pipeline_id = :pipelineId', { pipelineId })
      .andWhere('opp.deleted_at IS NULL')
      .orderBy('opp.updated_at', 'DESC');

    if (requestingUser.onlyAssignedData) {
      qb.andWhere(
        `(opp.assigned_to = :userId OR EXISTS (
          SELECT 1 FROM entity_followers ef
          WHERE ef.entity_type = 'opportunity' AND ef.entity_id = opp.id AND ef.user_id = :userId
        ))`,
        { userId: requestingUser.sub },
      );
    }
    return qb.getMany();
  }

  async findOne(id: string, locationId: string): Promise<Opportunity> {
    const opp = await this.oppRepo.findOne({ where: { id, locationId, deletedAt: IsNull() } });
    if (!opp) throw new NotFoundException('Opportunity not found');
    return opp;
  }

  async create(locationId: string, dto: CreateOpportunityDto): Promise<Opportunity> {
    const opp = await this.oppRepo.save(
      this.oppRepo.create({
        locationId,
        name: dto.name,
        pipelineId: dto.pipelineId,
        pipelineStageId: dto.pipelineStageId,
        primaryContactId: dto.primaryContactId ?? null,
        monetaryValue: dto.monetaryValue ?? 0,
        currency: dto.currency ?? 'ZAR',
        assignedTo: dto.assignedTo ?? null,
        closeDate: dto.closeDate ? new Date(dto.closeDate) : null,
        customFields: dto.customFields ?? {},
        lastStageChangedAt: new Date(),
        lastActivityAt: new Date(),
      }),
    );

    // Link primary contact in junction table
    if (dto.primaryContactId) {
      await this.ocRepo.save(
        this.ocRepo.create({
          opportunityId: opp.id,
          contactId: dto.primaryContactId,
          locationId,
          isPrimary: true,
          role: 'Primary',
        }),
      );
    }

    // Enqueue AI scoring
    await this.aiQueue.add('score', { opportunityId: opp.id, locationId }, { delay: 2000 });

    return opp;
  }

  async update(id: string, locationId: string, dto: UpdateOpportunityDto, actorId: string): Promise<Opportunity> {
    const opp = await this.findOne(id, locationId);
    const stageChanged = dto.pipelineStageId && dto.pipelineStageId !== opp.pipelineStageId;

    if (stageChanged) {
      // Log history
      const prev = await this.historyRepo.findOne({
        where: { opportunityId: id },
        order: { changedAt: 'DESC' },
      });
      const timeInStageMs = prev
        ? Date.now() - new Date(prev.changedAt).getTime()
        : null;

      await this.historyRepo.save(
        this.historyRepo.create({
          opportunityId: id,
          locationId,
          fromStageId: opp.pipelineStageId,
          toStageId: dto.pipelineStageId!,
          changedBy: actorId,
          timeInStageMs: timeInStageMs?.toString() ?? null,
        }),
      );
      opp.lastStageChangedAt = new Date();
    }

    Object.assign(opp, {
      ...(dto.name && { name: dto.name }),
      ...(dto.pipelineStageId && { pipelineStageId: dto.pipelineStageId }),
      ...(dto.monetaryValue !== undefined && { monetaryValue: dto.monetaryValue }),
      ...(dto.currency && { currency: dto.currency }),
      ...(dto.status && { status: dto.status }),
      ...(dto.assignedTo !== undefined && { assignedTo: dto.assignedTo }),
      ...(dto.closeDate && { closeDate: new Date(dto.closeDate) }),
      ...(dto.customFields && { customFields: { ...opp.customFields, ...dto.customFields } }),
      lastActivityAt: new Date(),
    });

    const saved = await this.oppRepo.save(opp);

    // Re-score on stage change or value change
    if (stageChanged || dto.monetaryValue !== undefined) {
      await this.aiQueue.add('score', { opportunityId: id, locationId }, { delay: 1000 });
    }

    return saved;
  }

  async remove(id: string, locationId: string): Promise<void> {
    await this.findOne(id, locationId);
    await this.oppRepo.softDelete(id);
  }

  // ─── Contacts on a deal ───────────────────────────────────────────────────
  async getContacts(opportunityId: string, locationId: string) {
    await this.findOne(opportunityId, locationId);
    return this.ocRepo.find({ where: { opportunityId } });
  }

  async addContact(opportunityId: string, locationId: string, contactId: string, role?: string): Promise<OpportunityContact> {
    const count = await this.ocRepo.count({ where: { opportunityId } });
    if (count >= 10) throw new BadRequestException('Maximum 10 contacts per opportunity');
    return this.ocRepo.save(
      this.ocRepo.create({ opportunityId, contactId, locationId, role: role ?? null, isPrimary: false }),
    );
  }

  async removeContact(opportunityId: string, locationId: string, contactId: string): Promise<void> {
    const oc = await this.ocRepo.findOne({ where: { opportunityId, contactId } });
    if (!oc) throw new NotFoundException('Contact not linked to this opportunity');
    if (oc.isPrimary) throw new BadRequestException('Cannot remove the primary contact');
    await this.ocRepo.delete(oc.id);
  }

  // ─── Notes ────────────────────────────────────────────────────────────────
  async getNotes(opportunityId: string, locationId: string): Promise<OpportunityNote[]> {
    await this.findOne(opportunityId, locationId);
    return this.noteRepo.find({ where: { opportunityId }, order: { createdAt: 'DESC' } });
  }

  async addNote(opportunityId: string, locationId: string, body: string, userId: string): Promise<OpportunityNote> {
    await this.findOne(opportunityId, locationId);
    return this.noteRepo.save(
      this.noteRepo.create({ opportunityId, locationId, userId, body }),
    );
  }

  // ─── Stage history ────────────────────────────────────────────────────────
  async getStageHistory(opportunityId: string, locationId: string): Promise<OpportunityStageHistory[]> {
    await this.findOne(opportunityId, locationId);
    return this.historyRepo.find({ where: { opportunityId }, order: { changedAt: 'DESC' } });
  }
}
