// services/bijou/src/bijou.module.ts
import { Module } from '@nestjs/common';
import { BijouSessionService } from './bijou-session.service';
import { PassPricingService } from './pass-pricing.service';
import { MinSeatGateService } from './min-seat-gate.service';

@Module({
  providers: [BijouSessionService, PassPricingService, MinSeatGateService],
  exports: [BijouSessionService, PassPricingService, MinSeatGateService],
})
export class BijouModule {}
