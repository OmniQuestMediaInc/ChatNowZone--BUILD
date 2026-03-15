// WO: WO-036-KYC-VAULT-PUBLISH-GATE
import { Module } from '@nestjs/common';
import { SafetyService } from './safety.service';

/**
 * WO-036-KYC-VAULT-PUBLISH-GATE: Safety Module
 * Provides the deterministic publish gate and vault access audit service.
 */
@Module({
  providers: [SafetyService],
  exports: [SafetyService],
})
export class SafetyModule {}
