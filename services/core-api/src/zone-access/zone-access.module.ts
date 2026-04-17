// FIZ: MEMB-001 — ZoneAccessModule
// Provides ZoneAccessService and ZoneAccessGuard to the application.
import { Module } from '@nestjs/common';
import { ZoneAccessService } from './zone-access.service';
import { ZoneAccessGuard } from './zone-access.guard';

@Module({
  providers: [ZoneAccessService, ZoneAccessGuard],
  exports: [ZoneAccessService, ZoneAccessGuard],
})
export class ZoneAccessModule {}
