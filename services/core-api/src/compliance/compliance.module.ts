// services/core-api/src/compliance/compliance.module.ts
import { Module } from '@nestjs/common';
import { WormExportService } from './worm-export.service';
import { AuditChainService } from './audit-chain.service';

@Module({
import { LegalHoldService } from './legal-hold.service';

@Module({
  providers: [WormExportService, LegalHoldService],
  exports: [WormExportService, LegalHoldService],
import { AuditChainService } from './audit-chain.service';

@Module({
  providers: [WormExportService, AuditChainService],
  exports: [WormExportService, AuditChainService],
})
export class ComplianceModule {}
