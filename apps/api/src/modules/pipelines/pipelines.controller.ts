import {
  Controller, Get, Post, Patch, Delete, Body, Param, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AccessTokenPayload } from '@sme/shared';
import { PipelinesService } from './pipelines.service';

@UseGuards(JwtAuthGuard)
@Controller('v1/pipelines')
export class PipelinesController {
  constructor(private readonly pipelinesService: PipelinesService) {}

  @Get()
  findAll(@CurrentUser() user: AccessTokenPayload) {
    return this.pipelinesService.findAll(user.locationId!);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AccessTokenPayload) {
    return this.pipelinesService.findOne(id, user.locationId!);
  }

  @Post()
  create(
    @Body() body: { name: string; stages?: { name: string; color?: string }[] },
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.pipelinesService.create(user.locationId!, body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: { name?: string },
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.pipelinesService.update(id, user.locationId!, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AccessTokenPayload) {
    return this.pipelinesService.remove(id, user.locationId!);
  }

  // ─── Stages ───────────────────────────────────────────────────────────────
  @Post(':id/stages')
  createStage(
    @Param('id') pipelineId: string,
    @Body() body: { name: string; color?: string; sortOrder?: number },
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.pipelinesService.createStage(pipelineId, user.locationId!, body);
  }

  @Patch(':id/stages/:stageId')
  updateStage(
    @Param('stageId') stageId: string,
    @Body() body: { name?: string; color?: string; sortOrder?: number },
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.pipelinesService.updateStage(stageId, user.locationId!, body);
  }

  @Delete(':id/stages/:stageId')
  removeStage(
    @Param('stageId') stageId: string,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.pipelinesService.removeStage(stageId, user.locationId!);
  }
}
