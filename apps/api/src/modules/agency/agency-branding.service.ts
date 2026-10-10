import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgencyBranding } from './agency.entities';

@Injectable()
export class AgencyBrandingService {
  constructor(
    @InjectRepository(AgencyBranding)
    private readonly brandingRepo: Repository<AgencyBranding>,
  ) {}

  async findByAgency(agencyId: string): Promise<AgencyBranding | null> {
    return this.brandingRepo.findOne({ where: { agencyId } });
  }

  async findByDomain(domain: string): Promise<AgencyBranding | null> {
    return this.brandingRepo.findOne({ where: { customDomain: domain } });
  }

  async upsert(agencyId: string, dto: Partial<AgencyBranding>): Promise<AgencyBranding> {
    let branding = await this.brandingRepo.findOne({ where: { agencyId } });
    if (branding) {
      Object.assign(branding, dto);
      return this.brandingRepo.save(branding);
    }
    return this.brandingRepo.save(this.brandingRepo.create({ ...dto, agencyId }));
  }

  async getCssVariables(agencyId: string): Promise<Record<string, string>> {
    const branding = await this.brandingRepo.findOne({ where: { agencyId } });
    if (!branding) {
      return {
        '--color-primary': '#009B87',
        '--color-accent': '#39B54A',
        '--platform-name': 'SME Connect',
      };
    }
    return {
      '--color-primary': branding.primaryColor,
      '--color-accent': branding.accentColor,
      '--platform-name': branding.platformName,
    };
  }
}
