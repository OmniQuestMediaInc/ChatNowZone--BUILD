// WO: WO-037, WO-038
import { Module } from '@nestjs/common';
import { ReferralRewardService } from './referral-reward.service';
import { GuardedNotificationService } from './guarded-notification.service';
import { GovernanceConfigService } from '../config/governance.config';

/**
 * GrowthModule — Phase 3 Growth Primitives
 * Provides:
 *   - ReferralRewardService (WO-037: Creator-Led Attribution Engine)
 *   - GuardedNotificationService (WO-038: Consent-Aware Notification Service)
 */
@Module({
  providers: [
    ReferralRewardService,
    GuardedNotificationService,
    GovernanceConfigService,
  ],
  exports: [ReferralRewardService, GuardedNotificationService],
})
export class GrowthModule {}
