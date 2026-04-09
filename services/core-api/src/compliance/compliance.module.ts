// services/core-api/src/compliance/compliance.module.ts
import { Module } from '@nestjs/common';
import { WormExportService } from './worm-export.service';
import { AuditChainService } from './audit-chain.service';
import { LegalHoldService } from './legal-hold.service';

@Module({
  providers: [WormExportService, AuditChainService, LegalHoldService],
  exports: [WormExportService, AuditChainService, LegalHoldService],
})
export class ComplianceModule {}
