// FIZ: PROC-001 — Payments Module
import { Module } from '@nestjs/common';
import { WebhookHardeningService } from './webhook-hardening.service';
import { GovernanceConfigService } from '../config/governance.config';

@Module({
  providers: [WebhookHardeningService, GovernanceConfigService],
  exports: [WebhookHardeningService],
})
export class PaymentsModule {}
