import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Snapshot, SnapshotDeployment } from './agency.entities';

@Injectable()
export class SnapshotsService {
  private readonly logger = new Logger(SnapshotsService.name);

  constructor(
    @InjectRepository(Snapshot) private readonly snapshotRepo: Repository<Snapshot>,
    @InjectRepository(SnapshotDeployment) private readonly deployRepo: Repository<SnapshotDeployment>,
  ) {}

  async findAll(agencyId: string): Promise<Snapshot[]> {
    return this.snapshotRepo.find({
      where: [{ agencyId }, { isPublic: true }],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(agencyId: string, id: string): Promise<Snapshot> {
    const snap = await this.snapshotRepo.findOne({ where: { id, agencyId } });
    if (!snap) throw new NotFoundException('Snapshot not found');
    return snap;
  }

  async create(agencyId: string, dto: Partial<Snapshot>, userId: string): Promise<Snapshot> {
    return this.snapshotRepo.save(
      this.snapshotRepo.create({ ...dto, agencyId, createdBy: userId }),
    );
  }

  async update(agencyId: string, id: string, dto: Partial<Snapshot>): Promise<Snapshot> {
    const snap = await this.findById(agencyId, id);
    Object.assign(snap, dto);
    return this.snapshotRepo.save(snap);
  }

  async delete(agencyId: string, id: string): Promise<void> {
    await this.findById(agencyId, id);
    await this.snapshotRepo.delete({ id, agencyId });
  }

  async deploy(agencyId: string, snapshotId: string, locationId: string, userId: string): Promise<SnapshotDeployment> {
    const snap = await this.findById(agencyId, snapshotId);

    const deployment = await this.deployRepo.save(
      this.deployRepo.create({
        snapshotId,
        locationId,
        status: 'running',
        deployedBy: userId,
      }),
    );

    // Async deployment — in production this would be a BullMQ job
    // For now we mark completed immediately with a simulation
    setImmediate(async () => {
      try {
        // In production: deep-clone all payload entities into the target location
        // using a pre-generated IdMap to remap UUIDs
        this.logger.log(`Deploying snapshot ${snapshotId} to location ${locationId}`);

        await this.deployRepo.update(deployment.id, {
          status: 'completed',
          completedAt: new Date(),
        });
      } catch (err) {
        await this.deployRepo.update(deployment.id, {
          status: 'failed',
          errorMessage: String(err),
          completedAt: new Date(),
        });
      }
    });

    return deployment;
  }

  async getDeployments(agencyId: string, snapshotId: string): Promise<SnapshotDeployment[]> {
    await this.findById(agencyId, snapshotId);
    return this.deployRepo.find({
      where: { snapshotId },
      order: { startedAt: 'DESC' },
    });
  }
}
