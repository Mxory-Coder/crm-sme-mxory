import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AccessTokenPayload } from '@sme/shared';
import { OpportunitiesService, CreateOpportunityDto, UpdateOpportunityDto } from './opportunities.service';

@UseGuards(JwtAuthGuard)
@Controller('v1/opportunities')
export class OpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  @Get()
  findByPipeline(
    @Query('pipelineId') pipelineId: string,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.opportunitiesService.findByPipeline(user.locationId!, pipelineId, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AccessTokenPayload) {
    return this.opportunitiesService.findOne(id, user.locationId!);
  }

  @Post()
  create(@Body() body: CreateOpportunityDto, @CurrentUser() user: AccessTokenPayload) {
    return this.opportunitiesService.create(user.locationId!, body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateOpportunityDto,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.opportunitiesService.update(id, user.locationId!, body, user.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AccessTokenPayload) {
    return this.opportunitiesService.remove(id, user.locationId!);
  }

  // ─── Contacts on deal ─────────────────────────────────────────────────────
  @Get(':id/contacts')
  getContacts(@Param('id') id: string, @CurrentUser() user: AccessTokenPayload) {
    return this.opportunitiesService.getContacts(id, user.locationId!);
  }

  @Post(':id/contacts')
  addContact(
    @Param('id') id: string,
    @Body() body: { contactId: string; role?: string },
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.opportunitiesService.addContact(id, user.locationId!, body.contactId, body.role);
  }

  @Delete(':id/contacts/:contactId')
  removeContact(
    @Param('id') id: string,
    @Param('contactId') contactId: string,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.opportunitiesService.removeContact(id, user.locationId!, contactId);
  }

  // ─── Notes ────────────────────────────────────────────────────────────────
  @Get(':id/notes')
  getNotes(@Param('id') id: string, @CurrentUser() user: AccessTokenPayload) {
    return this.opportunitiesService.getNotes(id, user.locationId!);
  }

  @Post(':id/notes')
  addNote(
    @Param('id') id: string,
    @Body() body: { body: string },
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.opportunitiesService.addNote(id, user.locationId!, body.body, user.sub);
  }

  // ─── Stage history ────────────────────────────────────────────────────────
  @Get(':id/stage-history')
  getStageHistory(@Param('id') id: string, @CurrentUser() user: AccessTokenPayload) {
    return this.opportunitiesService.getStageHistory(id, user.locationId!);
  }
}
