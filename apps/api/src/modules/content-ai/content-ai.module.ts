import { Module } from '@nestjs/common';
import { ContentAiService } from './content-ai.service';
import { ContentAiController } from './content-ai.controller';

@Module({
  controllers: [ContentAiController],
  providers: [ContentAiService],
  exports: [ContentAiService],
})
export class ContentAiModule {}
