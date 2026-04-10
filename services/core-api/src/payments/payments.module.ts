// FIZ: PROC-001 — Payments Module
import { Module } from '@nestjs/common';
import { WebhookHardeningService } from './webhook-hardening.service';

@Module({
  providers: [WebhookHardeningService],
  exports: [WebhookHardeningService],
})
export class PaymentsModule {}
