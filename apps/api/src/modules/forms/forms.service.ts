import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Form, FormSubmission, FormField } from './form.entity';
import { ContactsService } from '../contacts/contacts.service';

export interface CreateFormDto {
  name: string;
  description?: string;
  fields?: FormField[];
  settings?: Record<string, unknown>;
  style?: Record<string, unknown>;
}

export interface SubmitFormDto {
  data: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  pageUrl?: string;
}

@Injectable()
export class FormsService {
  constructor(
    @InjectRepository(Form) private readonly formRepo: Repository<Form>,
    @InjectRepository(FormSubmission) private readonly subRepo: Repository<FormSubmission>,
    private readonly contactsService: ContactsService,
  ) {}

  // ─── Forms CRUD ───────────────────────────────────────────────────────────

  async findAll(locationId: string): Promise<Form[]> {
    return this.formRepo.find({ where: { locationId }, order: { createdAt: 'DESC' } });
  }

  async findById(locationId: string, id: string): Promise<Form> {
    const form = await this.formRepo.findOne({ where: { id, locationId } });
    if (!form) throw new NotFoundException('Form not found');
    return form;
  }

  async create(locationId: string, dto: CreateFormDto, userId: string): Promise<Form> {
    const form = this.formRepo.create({
      locationId,
      name: dto.name,
      description: dto.description ?? null,
      fields: dto.fields ?? [],
      settings: dto.settings ?? {},
      style: dto.style ?? {},
      status: 'DRAFT',
      createdBy: userId,
    });
    return this.formRepo.save(form);
  }

  async update(locationId: string, id: string, dto: Partial<CreateFormDto>): Promise<Form> {
    const form = await this.findById(locationId, id);
    Object.assign(form, dto);
    return this.formRepo.save(form);
  }

  async publish(locationId: string, id: string): Promise<Form> {
    const form = await this.findById(locationId, id);
    form.status = 'PUBLISHED';
    return this.formRepo.save(form);
  }

  async delete(locationId: string, id: string): Promise<void> {
    const form = await this.findById(locationId, id);
    await this.formRepo.remove(form);
  }

  // ─── Submissions ──────────────────────────────────────────────────────────

  async submit(locationId: string, formId: string, dto: SubmitFormDto): Promise<FormSubmission> {
    const form = await this.formRepo.findOne({ where: { id: formId, locationId, status: 'PUBLISHED' } });
    if (!form) throw new NotFoundException('Form not found or not published');

    // Extract standard contact fields from submission
    const standardFields: Record<string, string | undefined> = {};
    const customFields: Record<string, unknown> = {};

    for (const field of form.fields) {
      const value = dto.data[field.id];
      if (value === undefined) continue;

      if (field.standardField) {
        standardFields[field.standardField] = String(value);
      } else if (field.customFieldKey) {
        customFields[field.customFieldKey] = value;
      }
    }

    // Upsert contact
    let contactId: string | null = null;
    if (standardFields['email'] || standardFields['phone']) {
      const contact = await this.contactsService.findOrCreateByIdentifier({
        locationId,
        firstName: standardFields['first_name'],
        lastName: standardFields['last_name'],
        email: standardFields['email'],
        phone: standardFields['phone'],
        companyName: standardFields['company'],
        source: 'FORM',
        customFields: Object.keys(customFields).length > 0 ? customFields : undefined,
      });
      contactId = contact.id;
    }

    const submission = this.subRepo.create({
      formId,
      locationId,
      contactId,
      data: dto.data,
      ipAddress: dto.ipAddress ?? null,
      userAgent: dto.userAgent ?? null,
      pageUrl: dto.pageUrl ?? null,
    });

    const saved = await this.subRepo.save(submission);

    // Increment counter
    await this.formRepo.increment({ id: formId }, 'submissions', 1);

    return saved;
  }

  async findSubmissions(locationId: string, formId: string): Promise<FormSubmission[]> {
    await this.findById(locationId, formId);
    return this.subRepo.find({
      where: { formId, locationId },
      order: { createdAt: 'DESC' },
    });
  }
}
