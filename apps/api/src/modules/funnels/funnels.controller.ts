import {
  Controller, Get, Post, Patch, Delete, Body, Param,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  FunnelsService, CreateFunnelDto, CreateFunnelStepDto, AiFunnelDto,
} from './funnels.service';

@UseGuards(JwtAuthGuard)
@Controller('v1/funnels')
export class FunnelsController {
  constructor(private readonly svc: FunnelsService) {}

  @Get()
  findAll(@CurrentUser() user: { locationId: string }) {
    return this.svc.findAll(user.locationId);
  }

  @Get(':id')
  findById(@CurrentUser() user: { locationId: string }, @Param('id') id: string) {
    return this.svc.findWithSteps(user.locationId, id);
  }

  @Post()
  create(
    @CurrentUser() user: { locationId: string; id: string },
    @Body() dto: CreateFunnelDto,
  ) {
    return this.svc.create(user.locationId, dto, user.id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { locationId: string },
    @Param('id') id: string,
    @Body() dto: Partial<CreateFunnelDto>,
  ) {
    return this.svc.update(user.locationId, id, dto);
  }

  @Post(':id/publish')
  publish(@CurrentUser() user: { locationId: string }, @Param('id') id: string) {
    return this.svc.publish(user.locationId, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@CurrentUser() user: { locationId: string }, @Param('id') id: string) {
    return this.svc.delete(user.locationId, id);
  }

  // ─── Steps ────────────────────────────────────────────────────────────────

  @Post(':id/steps')
  createStep(
    @CurrentUser() user: { locationId: string },
    @Param('id') funnelId: string,
    @Body() dto: CreateFunnelStepDto,
  ) {
    return this.svc.createStep(user.locationId, funnelId, dto);
  }

  @Patch(':id/steps/:stepId')
  updateStep(
    @CurrentUser() user: { locationId: string },
    @Param('stepId') stepId: string,
    @Body() dto: Partial<CreateFunnelStepDto>,
  ) {
    return this.svc.updateStep(user.locationId, stepId, dto);
  }

  @Delete(':id/steps/:stepId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteStep(
    @CurrentUser() user: { locationId: string },
    @Param('stepId') stepId: string,
  ) {
    return this.svc.deleteStep(user.locationId, stepId);
  }

  @Post(':id/steps/reorder')
  reorderSteps(
    @CurrentUser() user: { locationId: string },
    @Param('id') funnelId: string,
    @Body() body: { stepIds: string[] },
  ) {
    return this.svc.reorderSteps(user.locationId, funnelId, body.stepIds);
  }

  // ─── AI Generate ──────────────────────────────────────────────────────────

  @Post('ai-generate')
  aiGenerate(
    @CurrentUser() user: { locationId: string; id: string },
    @Body() dto: AiFunnelDto,
  ) {
    return this.svc.generateWithAi(user.locationId, dto, user.id);
  }
}
