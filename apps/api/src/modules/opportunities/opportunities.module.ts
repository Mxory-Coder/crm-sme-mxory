import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { Opportunity } from './opportunity.entity';
import { OpportunityContact } from './opportunity-contact.entity';
import { OpportunityNote } from './opportunity-note.entity';
import { OpportunityStageHistory } from './opportunity-stage-history.entity';
import { OpportunitiesService, OPPORTUNITY_AI_QUEUE } from './opportunities.service';
import { OpportunitiesController } from './opportunities.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Opportunity, OpportunityContact, OpportunityNote, OpportunityStageHistory]),
    BullModule.registerQueue({ name: OPPORTUNITY_AI_QUEUE }),
  ],
  controllers: [OpportunitiesController],
  providers: [OpportunitiesService],
  exports: [OpportunitiesService],
})
export class OpportunitiesModule {}
