// services/core-api/src/compliance/compliance.module.ts
import { Module } from '@nestjs/common';
import { WormExportService } from './worm-export.service';
import { LegalHoldService } from './legal-hold.service';

@Module({
  providers: [WormExportService, LegalHoldService],
  exports: [WormExportService, LegalHoldService],
})
export class ComplianceModule {}
