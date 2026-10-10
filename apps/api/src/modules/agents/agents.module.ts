import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiAgent } from './ai-agent.entity';
import { AgentsService } from './agents.service';
import { AgentsController } from './agents.controller';
import { KnowledgeBaseModule } from '../knowledge-base/knowledge-base.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AiAgent]),
    KnowledgeBaseModule,
  ],
  controllers: [AgentsController],
  providers: [AgentsService],
  exports: [AgentsService],
})
export class AgentsModule {}
