// services/core-api/src/compliance/compliance.module.ts
import { Module } from '@nestjs/common';
import { WormExportService } from './worm-export.service';

@Module({
  providers: [WormExportService],
  exports: [WormExportService],
})
export class ComplianceModule {}
