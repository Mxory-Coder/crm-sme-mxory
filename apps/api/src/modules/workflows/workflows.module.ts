import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowDefinition } from './workflow-definition.entity';
import { WorkflowAiBuilderService } from './workflow-ai-builder.service';
import { WorkflowsController } from './workflows.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WorkflowDefinition])],
  controllers: [WorkflowsController],
  providers: [WorkflowAiBuilderService],
  exports: [WorkflowAiBuilderService],
})
export class WorkflowsModule {}
