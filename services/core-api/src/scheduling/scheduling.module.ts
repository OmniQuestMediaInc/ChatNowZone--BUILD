// services/core-api/src/scheduling/scheduling.module.ts
// GZ-SCHEDULE: NestJS module for the GuestZone scheduling system.
// Waterfall shifts, ZoneBot lottery, compliance guard, coverage validation.
import { Module } from '@nestjs/common';
import { SchedulingService } from './scheduling.service';
import { ZoneBotService } from './zonebot.service';
import { ShiftCoverageService } from './shift-coverage.service';
import { ComplianceGuardService } from './compliance-guard.service';

@Module({
  providers: [
    ComplianceGuardService,
    ShiftCoverageService,
    ZoneBotService,
    SchedulingService,
  ],
  exports: [
    ComplianceGuardService,
    ShiftCoverageService,
    ZoneBotService,
    SchedulingService,
  ],
})
export class SchedulingModule {}
