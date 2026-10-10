import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialPost } from './social-post.entity';
import { SocialService } from './social.service';
import { SocialController } from './social.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SocialPost])],
  controllers: [SocialController],
  providers: [SocialService],
  exports: [SocialService],
})
export class SocialModule {}
