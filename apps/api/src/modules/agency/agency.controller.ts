import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus, Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AgencyBrandingService } from './agency-branding.service';
import { BillingService } from './billing.service';
import { SnapshotsService } from './snapshots.service';
import { ProspectingService } from './prospecting.service';
import { AuditLogService } from './audit-log.service';
import { ReportingService } from './reporting.service';
import { AgencyBranding, SubscriptionPlan, ProspectingLead, SavedReport } from './agency.entities';

@UseGuards(JwtAuthGuard)
@Controller('v1/agency')
export class AgencyController {
  constructor(
    private readonly brandingSvc: AgencyBrandingService,
    private readonly billingSvc: BillingService,
    private readonly snapshotsSvc: SnapshotsService,
    private readonly prospectingSvc: ProspectingService,
    private readonly auditSvc: AuditLogService,
    private readonly reportingSvc: ReportingService,
  ) {}

  // ─── White Label Branding ─────────────────────────────────────────────────

  @Get('branding')
  getBranding(@CurrentUser() user: { agencyId: string }) {
    return this.brandingSvc.findByAgency(user.agencyId);
  }

  @Patch('branding')
  upsertBranding(
    @CurrentUser() user: { agencyId: string },
    @Body() dto: Partial<AgencyBranding>,
  ) {
    return this.brandingSvc.upsert(user.agencyId, dto);
  }

  @Get('theme')
  getTheme(@CurrentUser() user: { agencyId: string }) {
    return this.brandingSvc.getCssVariables(user.agencyId);
  }

  // ─── Billing / Plans ──────────────────────────────────────────────────────

  @Get('plans')
  getPlans(@CurrentUser() user: { agencyId: string }) {
    return this.billingSvc.findPlans(user.agencyId);
  }

  @Post('plans')
  createPlan(
    @CurrentUser() user: { agencyId: string },
    @Body() dto: Partial<SubscriptionPlan>,
  ) {
    return this.billingSvc.createPlan(user.agencyId, dto);
  }

  @Patch('plans/:id')
  updatePlan(
    @CurrentUser() user: { agencyId: string },
    @Param('id') id: string,
    @Body() dto: Partial<SubscriptionPlan>,
  ) {
    return this.billingSvc.updatePlan(user.agencyId, id, dto);
  }

  @Get('locations/:locationId/subscription')
  getSubscription(
    @CurrentUser() _user: { agencyId: string },
    @Param('locationId') locationId: string,
  ) {
    return this.billingSvc.getSubscription(locationId);
  }

  @Get('locations/:locationId/credits')
  getCredits(
    @CurrentUser() _user: { agencyId: string },
    @Param('locationId') locationId: string,
  ) {
    return this.billingSvc.getCreditBalance(locationId);
  }

  @Post('locations/:locationId/credits/add')
  addCredits(
    @CurrentUser() _user: { agencyId: string },
    @Param('locationId') locationId: string,
    @Body() body: { amount: number; reason: string },
  ) {
    return this.billingSvc.addCredits(locationId, body.amount, body.reason);
  }

  // ─── Snapshots ────────────────────────────────────────────────────────────

  @Get('snapshots')
  getSnapshots(@CurrentUser() user: { agencyId: string }) {
    return this.snapshotsSvc.findAll(user.agencyId);
  }

  @Post('snapshots')
  createSnapshot(
    @CurrentUser() user: { agencyId: string; id: string },
    @Body() dto: Partial<any>,
  ) {
    return this.snapshotsSvc.create(user.agencyId, dto, user.id);
  }

  @Patch('snapshots/:id')
  updateSnapshot(
    @CurrentUser() user: { agencyId: string },
    @Param('id') id: string,
    @Body() dto: Partial<any>,
  ) {
    return this.snapshotsSvc.update(user.agencyId, id, dto);
  }

  @Delete('snapshots/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteSnapshot(
    @CurrentUser() user: { agencyId: string },
    @Param('id') id: string,
  ) {
    return this.snapshotsSvc.delete(user.agencyId, id);
  }

  @Post('snapshots/:id/deploy')
  deploySnapshot(
    @CurrentUser() user: { agencyId: string; id: string },
    @Param('id') snapshotId: string,
    @Body() body: { locationId: string },
  ) {
    return this.snapshotsSvc.deploy(user.agencyId, snapshotId, body.locationId, user.id);
  }

  @Get('snapshots/:id/deployments')
  getDeployments(
    @CurrentUser() user: { agencyId: string },
    @Param('id') id: string,
  ) {
    return this.snapshotsSvc.getDeployments(user.agencyId, id);
  }

  // ─── Prospecting ──────────────────────────────────────────────────────────

  @Get('prospecting')
  getProspects(@CurrentUser() user: { agencyId: string }) {
    return this.prospectingSvc.findAll(user.agencyId);
  }

  @Post('prospecting')
  createProspect(
    @CurrentUser() user: { agencyId: string },
    @Body() dto: Partial<ProspectingLead>,
  ) {
    return this.prospectingSvc.create(user.agencyId, dto);
  }

  @Patch('prospecting/:id')
  updateProspect(
    @CurrentUser() user: { agencyId: string },
    @Param('id') id: string,
    @Body() dto: Partial<ProspectingLead>,
  ) {
    return this.prospectingSvc.update(user.agencyId, id, dto);
  }

  @Delete('prospecting/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteProspect(
    @CurrentUser() user: { agencyId: string },
    @Param('id') id: string,
  ) {
    return this.prospectingSvc.delete(user.agencyId, id);
  }

  @Post('prospecting/:id/audit')
  generateAudit(
    @CurrentUser() user: { agencyId: string },
    @Param('id') id: string,
  ) {
    return this.prospectingSvc.aiGenerateAuditReport(user.agencyId, id);
  }

  @Post('prospecting/bulk-import')
  bulkImport(
    @CurrentUser() user: { agencyId: string },
    @Body() body: { leads: Partial<ProspectingLead>[] },
  ) {
    return this.prospectingSvc.bulkImport(user.agencyId, body.leads);
  }

  // ─── Audit Logs ───────────────────────────────────────────────────────────

  @Get('audit-logs')
  getAgencyAuditLogs(
    @CurrentUser() user: { agencyId: string },
    @Query('limit') limit?: string,
  ) {
    return this.auditSvc.findForAgency(user.agencyId, limit ? parseInt(limit, 10) : 100);
  }

  @Get('locations/:locationId/audit-logs')
  getLocationAuditLogs(
    @CurrentUser() _user: { agencyId: string },
    @Param('locationId') locationId: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditSvc.findForLocation(locationId, limit ? parseInt(limit, 10) : 100);
  }

  // ─── Reporting ────────────────────────────────────────────────────────────

  @Get('locations/:locationId/reports/dashboard')
  getDashboard(
    @CurrentUser() _user: { agencyId: string },
    @Param('locationId') locationId: string,
  ) {
    return this.reportingSvc.getDashboardSummary(locationId);
  }

  @Get('locations/:locationId/reports/contacts')
  getContactsReport(
    @CurrentUser() _user: { agencyId: string },
    @Param('locationId') locationId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.reportingSvc.getContactsReport(
      locationId,
      from ? new Date(from) : new Date(Date.now() - 30 * 86400000),
      to ? new Date(to) : new Date(),
    );
  }

  @Get('locations/:locationId/reports/opportunities')
  getOpportunitiesReport(
    @CurrentUser() _user: { agencyId: string },
    @Param('locationId') locationId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.reportingSvc.getOpportunitiesReport(
      locationId,
      from ? new Date(from) : new Date(Date.now() - 30 * 86400000),
      to ? new Date(to) : new Date(),
    );
  }

  @Get('locations/:locationId/reports/conversations')
  getConversationsReport(
    @CurrentUser() _user: { agencyId: string },
    @Param('locationId') locationId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.reportingSvc.getConversationsReport(
      locationId,
      from ? new Date(from) : new Date(Date.now() - 30 * 86400000),
      to ? new Date(to) : new Date(),
    );
  }

  @Get('locations/:locationId/reports/appointments')
  getAppointmentsReport(
    @CurrentUser() _user: { agencyId: string },
    @Param('locationId') locationId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.reportingSvc.getAppointmentsReport(
      locationId,
      from ? new Date(from) : new Date(Date.now() - 30 * 86400000),
      to ? new Date(to) : new Date(),
    );
  }

  @Post('locations/:locationId/reports/ai-narrative')
  aiNarrative(
    @CurrentUser() _user: { agencyId: string },
    @Param('locationId') locationId: string,
  ) {
    return this.reportingSvc.aiNarrativeReport(locationId);
  }

  @Get('locations/:locationId/reports/saved')
  getSavedReports(
    @CurrentUser() _user: { agencyId: string },
    @Param('locationId') locationId: string,
  ) {
    return this.reportingSvc.findAll(locationId);
  }

  @Post('locations/:locationId/reports/saved')
  createSavedReport(
    @CurrentUser() user: { agencyId: string; id: string },
    @Param('locationId') locationId: string,
    @Body() dto: Partial<SavedReport>,
  ) {
    return this.reportingSvc.create(locationId, dto, user.id);
  }
}
