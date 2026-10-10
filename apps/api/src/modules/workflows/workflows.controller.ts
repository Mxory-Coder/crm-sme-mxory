import {
  Controller, Get, Post, Patch, Delete, Body, Param, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AccessTokenPayload } from '@sme/shared';
import { WorkflowAiBuilderService } from './workflow-ai-builder.service';

@UseGuards(JwtAuthGuard)
@Controller('v1/workflows')
export class WorkflowsController {
  constructor(private readonly workflowBuilder: WorkflowAiBuilderService) {}

  @Get()
  findAll(@CurrentUser() user: AccessTokenPayload) {
    return this.workflowBuilder.findAll(user.locationId!);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AccessTokenPayload) {
    return this.workflowBuilder.findOne(id, user.locationId!);
  }

  @Post('ai-generate')
  aiGenerate(
    @Body() body: { prompt: string; save?: boolean },
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.workflowBuilder.generate(user.locationId!, body.prompt, user.sub, body.save ?? true);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: { name?: string; nodes?: unknown[]; edges?: unknown[]; status?: string },
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.workflowBuilder.update(id, user.locationId!, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AccessTokenPayload) {
    return this.workflowBuilder.remove(id, user.locationId!);
  }
}
