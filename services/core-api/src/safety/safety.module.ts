// WO: WO-036-KYC-VAULT-PUBLISH-GATE
// KYC: KYC-001 — added PublishGateService
import { Module } from '@nestjs/common';
import { SafetyService } from './safety.service';
import { PublishGateService } from './publish-gate.service';

/**
 * WO-036-KYC-VAULT-PUBLISH-GATE: Safety Module
 * Provides the deterministic publish gate and vault access audit service.
 */
@Module({
  providers: [SafetyService, PublishGateService],
  exports: [SafetyService, PublishGateService],
})
export class SafetyModule {}
