// services/core-api/src/compliance/compliance.module.ts
import { Module } from '@nestjs/common';
import { WormExportService } from './worm-export.service';
import { AuditChainService } from './audit-chain.service';
import { LegalHoldService } from './legal-hold.service';
import { GeoFencingService } from './geo-fencing.service';

@Module({
  providers: [WormExportService, AuditChainService, LegalHoldService, GeoFencingService],
  exports: [WormExportService, AuditChainService, LegalHoldService, GeoFencingService],
})
export class ComplianceModule {}
