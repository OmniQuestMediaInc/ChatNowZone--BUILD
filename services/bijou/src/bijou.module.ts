// services/bijou/src/bijou.module.ts
// BIJOU: BJ-002 — register BijouSchedulerService.
// BIJOU: BJ-003 — register BijouAdmissionService.
import { Module } from '@nestjs/common';
import { BijouSessionService } from './bijou-session.service';
import { PassPricingService } from './pass-pricing.service';
import { MinSeatGateService } from './min-seat-gate.service';
import { BijouSchedulerService } from './bijou-scheduler.service';
import { BijouAdmissionService } from './bijou-admission.service';

@Module({
  providers: [
    BijouSessionService,
    PassPricingService,
    MinSeatGateService,
    BijouSchedulerService,
    BijouAdmissionService,
  ],
  exports: [
    BijouSessionService,
    PassPricingService,
    MinSeatGateService,
    BijouSchedulerService,
    BijouAdmissionService,
  ],
})
export class BijouModule {}
