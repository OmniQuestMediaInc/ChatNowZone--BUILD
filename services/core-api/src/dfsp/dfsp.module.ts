// services/core-api/src/dfsp/dfsp.module.ts
// FIZ: PV-001 — DFSP Foundation Layer
// Diamond Financial Security Platform™ — OmniQuest Media Inc.
import { Module } from '@nestjs/common';
import { PurchaseHoursGateService } from './purchase-hours-gate.service';
import { RiskScoringService } from './risk-scoring.service';
import { IntegrityHoldService } from './integrity-hold.service';
import { CheckoutConfirmationService } from './checkout-confirmation.service';

@Module({
  providers: [
    PurchaseHoursGateService,
    RiskScoringService,
    IntegrityHoldService,
    CheckoutConfirmationService,
  ],
  exports: [
    PurchaseHoursGateService,
    RiskScoringService,
    IntegrityHoldService,
    CheckoutConfirmationService,
  ],
})
export class DfspModule {}
