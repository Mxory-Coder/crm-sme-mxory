import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailCampaign } from './email-campaign.entity';
import { EmailTemplate } from './email-template.entity';
import { EmailMarketingService } from './email-marketing.service';
import { EmailMarketingController } from './email-marketing.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EmailCampaign, EmailTemplate])],
  controllers: [EmailMarketingController],
  providers: [EmailMarketingService],
  exports: [EmailMarketingService],
})
export class EmailMarketingModule {}
