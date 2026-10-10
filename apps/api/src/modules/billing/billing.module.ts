import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionPlan } from './subscription-plan.entity';
import { LocationSubscription } from './location-subscription.entity';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SubscriptionPlan, LocationSubscription])],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
