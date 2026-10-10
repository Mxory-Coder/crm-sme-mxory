import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Community, CommunityPost, CommunityPostComment } from './community.entities';
import { CommunitiesService } from './communities.service';
import { CommunitiesController } from './communities.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Community, CommunityPost, CommunityPostComment])],
  controllers: [CommunitiesController],
  providers: [CommunitiesService],
  exports: [CommunitiesService],
})
export class CommunitiesModule {}
