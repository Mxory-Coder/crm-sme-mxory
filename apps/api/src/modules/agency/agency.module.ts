import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AgencyBranding, SubscriptionPlan, LocationSubscription, SmsCreditLedger,
  Snapshot, SnapshotDeployment, ProspectingLead, AuditLog, SavedReport,
  AgencyWalletTransaction,
} from './agency.entities';
import { AgencyBrandingService } from './agency-branding.service';
import { BillingService } from './billing.service';
import { SnapshotsService } from './snapshots.service';
import { ProspectingService } from './prospecting.service';
import { AuditLogService } from './audit-log.service';
import { ReportingService } from './reporting.service';
import { AgencyController } from './agency.controller';

@Module({
  imports: [TypeOrmModule.forFeature([
    AgencyBranding, SubscriptionPlan, LocationSubscription, SmsCreditLedger,
    Snapshot, SnapshotDeployment, ProspectingLead, AuditLog, SavedReport,
    AgencyWalletTransaction,
  ])],
  controllers: [AgencyController],
  providers: [
    AgencyBrandingService, BillingService, SnapshotsService,
    ProspectingService, AuditLogService, ReportingService,
  ],
  exports: [AgencyBrandingService, BillingService, AuditLogService, ReportingService],
})
export class AgencyLayerModule {}
