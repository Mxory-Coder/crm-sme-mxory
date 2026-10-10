import {
  Controller, Get, Post, Patch, Delete, Body, Param, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AccessTokenPayload } from '@sme/shared';
import { AgentsService, CreateAgentDto } from './agents.service';

@UseGuards(JwtAuthGuard)
@Controller('v1/agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get()
  findAll(@CurrentUser() user: AccessTokenPayload) {
    return this.agentsService.findAll(user.locationId!);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AccessTokenPayload) {
    return this.agentsService.findOne(id, user.locationId!);
  }

  @Post()
  create(@Body() body: CreateAgentDto, @CurrentUser() user: AccessTokenPayload) {
    return this.agentsService.create(user.locationId!, body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<CreateAgentDto>,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.agentsService.update(id, user.locationId!, body);
  }

  @Patch(':id/mode')
  setMode(
    @Param('id') id: string,
    @Body() body: { mode: 'OFF' | 'SUGGESTIVE' | 'AUTOPILOT' },
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.agentsService.setMode(id, user.locationId!, body.mode);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AccessTokenPayload) {
    return this.agentsService.remove(id, user.locationId!);
  }

  @Post(':id/test')
  test(
    @Param('id') id: string,
    @Body() body: { message: string },
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.agentsService.test(id, user.locationId!, body.message);
  }

  @Post('auto-build')
  autoBuild(
    @Body() body: { answers: Record<string, unknown> },
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.agentsService.autoBuild(user.locationId!, body.answers);
  }
}
