// services/bijou/src/bijou.module.ts
// BIJOU: BJ-002 — register BijouSchedulerService.
import { Module } from '@nestjs/common';
import { BijouSessionService } from './bijou-session.service';
import { PassPricingService } from './pass-pricing.service';
import { MinSeatGateService } from './min-seat-gate.service';
import { BijouSchedulerService } from './bijou-scheduler.service';

@Module({
  providers: [
    BijouSessionService,
    PassPricingService,
    MinSeatGateService,
    BijouSchedulerService,
  ],
  exports: [
    BijouSessionService,
    PassPricingService,
    MinSeatGateService,
    BijouSchedulerService,
  ],
})
export class BijouModule {}
