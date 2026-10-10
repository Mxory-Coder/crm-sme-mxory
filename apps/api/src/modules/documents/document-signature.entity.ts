import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

@Entity('document_signatures')
export class DocumentSignature {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'document_id' }) documentId: string;
  @Column({ name: 'signer_name' }) signerName: string;
  @Column({ name: 'signer_email' }) signerEmail: string;
  @Column({ name: 'ip_address' }) ipAddress: string;
  @Column({ name: 'user_agent' }) userAgent: string;
  @Column({ name: 'signature_png_key' }) signaturePngKey: string;
  @Column({ name: 'document_hash' }) documentHash: string;
  @Column({ name: 'certificate_id', unique: true }) certificateId: string;
  @CreateDateColumn({ name: 'signed_at' }) signedAt: Date;
}
