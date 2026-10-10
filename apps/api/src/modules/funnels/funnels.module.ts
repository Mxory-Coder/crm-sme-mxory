import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Funnel, FunnelStep } from './funnel.entity';
import { FunnelsService } from './funnels.service';
import { FunnelsController } from './funnels.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Funnel, FunnelStep])],
  controllers: [FunnelsController],
  providers: [FunnelsService],
  exports: [FunnelsService],
})
export class FunnelsModule {}
