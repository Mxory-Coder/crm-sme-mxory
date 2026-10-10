import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { Document } from './document.entity';
import { DocumentSignature } from './document-signature.entity';

export interface CreateDocumentDto {
  title: string;
  type?: string;
  contactId?: string;
  opportunityId?: string;
  bodyJson?: Record<string, unknown>;
  mergeFields?: Record<string, unknown>;
  expiresAt?: string;
}

export interface SignDocumentDto {
  signerName: string;
  signerEmail: string;
  signaturePngBase64: string;
  ipAddress: string;
  userAgent: string;
}

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document) private readonly docRepo: Repository<Document>,
    @InjectRepository(DocumentSignature) private readonly sigRepo: Repository<DocumentSignature>,
  ) {}

  async findAll(locationId: string, contactId?: string): Promise<Document[]> {
    const where: Record<string, unknown> = { locationId };
    if (contactId) where['contactId'] = contactId;
    return this.docRepo.find({ where: where as any, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string, locationId: string): Promise<Document> {
    const doc = await this.docRepo.findOne({ where: { id, locationId } });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async create(locationId: string, dto: CreateDocumentDto): Promise<Document> {
    return this.docRepo.save(
      this.docRepo.create({
        locationId,
        title: dto.title,
        type: dto.type ?? 'PROPOSAL',
        contactId: dto.contactId ?? null,
        opportunityId: dto.opportunityId ?? null,
        bodyJson: dto.bodyJson ?? {},
        mergeFields: dto.mergeFields ?? {},
        status: 'DRAFT',
        viewCount: 0,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      }),
    );
  }

  async update(id: string, locationId: string, dto: Partial<CreateDocumentDto>): Promise<Document> {
    const doc = await this.findOne(id, locationId);
    if (doc.status === 'SIGNED') throw new BadRequestException('Cannot edit a signed document');
    if (dto.bodyJson) doc.bodyJson = dto.bodyJson;
    if (dto.title) doc.title = dto.title;
    if (dto.mergeFields) doc.mergeFields = dto.mergeFields;
    if (dto.expiresAt) doc.expiresAt = new Date(dto.expiresAt);
    return this.docRepo.save(doc);
  }

  async send(id: string, locationId: string): Promise<Document> {
    const doc = await this.findOne(id, locationId);
    if (doc.status === 'SIGNED') throw new BadRequestException('Document already signed');
    doc.status = 'SENT';
    doc.sentAt = new Date();
    return this.docRepo.save(doc);
  }

  async trackView(id: string, locationId: string): Promise<void> {
    const doc = await this.findOne(id, locationId);
    const now = new Date();
    doc.viewCount = (doc.viewCount ?? 0) + 1;
    if (!doc.firstViewedAt) doc.firstViewedAt = now;
    if (doc.status === 'SENT') doc.status = 'VIEWED';
    await this.docRepo.save(doc);
  }

  async sign(id: string, locationId: string, dto: SignDocumentDto): Promise<DocumentSignature> {
    const doc = await this.findOne(id, locationId);

    if (doc.status === 'SIGNED') throw new BadRequestException('Document already signed');
    if (doc.status === 'EXPIRED') throw new BadRequestException('Document has expired');
    if (doc.expiresAt && doc.expiresAt < new Date())
      throw new BadRequestException('Document has expired');

    // Generate SHA-256 hash of the document body as legal proof
    const documentHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(doc.bodyJson))
      .digest('hex');

    const certificateId = crypto.randomUUID();

    // Decode base64 signature and store key (in production, save to MinIO)
    const signaturePngKey = `signatures/${locationId}/${id}/${certificateId}.png`;

    const sig = await this.sigRepo.save(
      this.sigRepo.create({
        documentId: id,
        signerName: dto.signerName,
        signerEmail: dto.signerEmail,
        ipAddress: dto.ipAddress,
        userAgent: dto.userAgent,
        signaturePngKey,
        documentHash,
        certificateId,
        signedAt: new Date(),
      }),
    );

    await this.docRepo.update(id, { status: 'SIGNED', signedAt: new Date() });

    return sig;
  }

  async getSignatures(id: string, locationId: string): Promise<DocumentSignature[]> {
    await this.findOne(id, locationId);
    return this.sigRepo.find({ where: { documentId: id }, order: { signedAt: 'DESC' } });
  }

  async remove(id: string, locationId: string): Promise<void> {
    const doc = await this.findOne(id, locationId);
    if (doc.status === 'SIGNED') throw new BadRequestException('Cannot delete a signed document');
    await this.docRepo.delete(id);
  }
}
