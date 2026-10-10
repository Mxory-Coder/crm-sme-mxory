import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pipeline } from './pipeline.entity';
import { PipelineStage } from './pipeline-stage.entity';

@Injectable()
export class PipelinesService {
  constructor(
    @InjectRepository(Pipeline) private readonly pipelineRepo: Repository<Pipeline>,
    @InjectRepository(PipelineStage) private readonly stageRepo: Repository<PipelineStage>,
  ) {}

  async findAll(locationId: string): Promise<Pipeline[]> {
    return this.pipelineRepo.find({
      where: { locationId, deletedAt: null as any },
      relations: ['stages'],
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string, locationId: string): Promise<Pipeline> {
    const p = await this.pipelineRepo.findOne({
      where: { id, locationId },
      relations: ['stages'],
    });
    if (!p) throw new NotFoundException('Pipeline not found');
    return p;
  }

  async create(locationId: string, dto: { name: string; stages?: { name: string; color?: string }[] }): Promise<Pipeline> {
    const pipeline = await this.pipelineRepo.save(
      this.pipelineRepo.create({ locationId, name: dto.name }),
    );
    if (dto.stages?.length) {
      const stages = dto.stages.map((s, i) =>
        this.stageRepo.create({ pipelineId: pipeline.id, locationId, name: s.name, color: s.color ?? '#6B7280', sortOrder: i }),
      );
      pipeline.stages = await this.stageRepo.save(stages);
    }
    return pipeline;
  }

  async update(id: string, locationId: string, dto: { name?: string }): Promise<Pipeline> {
    const p = await this.findOne(id, locationId);
    if (dto.name) p.name = dto.name;
    return this.pipelineRepo.save(p);
  }

  async remove(id: string, locationId: string): Promise<void> {
    const p = await this.findOne(id, locationId);
    if (p.isDefault) throw new ConflictException('Cannot delete the default pipeline');
    await this.pipelineRepo.softDelete(p.id);
  }

  // ─── Stages ───────────────────────────────────────────────────────────────
  async createStage(pipelineId: string, locationId: string, dto: { name: string; color?: string; sortOrder?: number }): Promise<PipelineStage> {
    await this.findOne(pipelineId, locationId);
    const count = await this.stageRepo.count({ where: { pipelineId } });
    return this.stageRepo.save(
      this.stageRepo.create({ pipelineId, locationId, name: dto.name, color: dto.color ?? '#6B7280', sortOrder: dto.sortOrder ?? count }),
    );
  }

  async updateStage(stageId: string, locationId: string, dto: { name?: string; color?: string; sortOrder?: number }): Promise<PipelineStage> {
    const stage = await this.stageRepo.findOne({ where: { id: stageId, locationId } });
    if (!stage) throw new NotFoundException('Stage not found');
    Object.assign(stage, dto);
    return this.stageRepo.save(stage);
  }

  async removeStage(stageId: string, locationId: string): Promise<void> {
    const stage = await this.stageRepo.findOne({ where: { id: stageId, locationId } });
    if (!stage) throw new NotFoundException('Stage not found');
    await this.stageRepo.delete(stage.id);
  }
}
