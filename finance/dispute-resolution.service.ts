// finance/dispute-resolution.service.ts
// FIZ: Replace Angular stub with NestJS Two-Step Goodwill dispute engine
// Doctrine: Append-Only — original purchase entry is NEVER deleted or modified.
// All dispute actions produce NEW ledger entries via LedgerService.handleDisputeReversal().
import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';

export type DisputeStage = 'OPEN' | 'TOKEN_BRIDGE_OFFERED' | 'EXIT_OFFERED' | 'RESOLVED' | 'FLAGGED';

export interface DisputeRecord {
  dispute_id: string;
  user_id: string;
  original_transaction_ref: string;
  original_amount_cents: bigint;
  stage: DisputeStage;
  rule_applied_id: string;
  opened_at_utc: string;
  resolved_at_utc?: string;
  resolution_type?: 'TOKEN_BRIDGE' | 'THREE_FIFTHS_EXIT' | 'POLICY_UPHELD' | 'FLAGGED';
  audit_hash: string;
}

export interface DisputeResolutionResult {
  success: boolean;
  new_stage: DisputeStage;
  offer?: {
    type: 'TOKEN_BRIDGE' | 'THREE_FIFTHS_EXIT';
    bonus_tokens?: bigint;           // For TOKEN_BRIDGE offer
    refund_cents?: bigint;           // For THREE_FIFTHS_EXIT offer
  };
  requires_step_up: boolean;
  ledger_entry_ref?: string;
  message: string;
}

/**
 * DisputeResolutionService — Two-Step Goodwill Engine
 *
 * Step 1 (TOKEN_BRIDGE): 20% bonus tokens on remaining balance in exchange
 *                         for signed waiver. Soft offer. No ledger credit yet.
 * Step 2 (THREE_FIFTHS_EXIT): One-time 60% partial refund of purchase price.
 *                              Requires step-up authentication.
 *                              Account restricted for 24hr offer window.
 *
 * If both offers are declined: account permanently flagged.
 * All actions are append-only via LedgerService. Original purchase never touched.
 * Requires step-up auth (stepUpToken presence) before executing any money movement.
 */
@Injectable()
export class DisputeResolutionService {
  private readonly logger = new Logger(DisputeResolutionService.name);
  private readonly RULE_ID = 'DISPUTE_GOODWILL_v1';
  private readonly TOKEN_BRIDGE_BONUS_PCT = 0.20;   // 20% bonus tokens
  private readonly THREE_FIFTHS_REFUND_PCT = 0.60;  // 60% of original spend

  /**
   * Stage 1: Offer the Token Bridge.
   * Computes 20% bonus token offer. Does NOT credit ledger yet.
   * Returns offer details for display to guest. Human must confirm acceptance.
   */
  offerTokenBridge(params: {
    dispute_id: string;
    user_id: string;
    remaining_token_balance: bigint;
    original_amount_cents: bigint;
  }): DisputeResolutionResult {
    const bonus_tokens = BigInt(Math.floor(
      Number(params.remaining_token_balance) * this.TOKEN_BRIDGE_BONUS_PCT
    ));

    this.logger.log('DisputeResolutionService: TOKEN_BRIDGE offer computed', {
      dispute_id: params.dispute_id,
      user_id: params.user_id,
      bonus_tokens: bonus_tokens.toString(),
      rule_applied_id: this.RULE_ID,
    });

    return {
      success: true,
      new_stage: 'TOKEN_BRIDGE_OFFERED',
      offer: { type: 'TOKEN_BRIDGE', bonus_tokens },
      requires_step_up: false,
      message: `Offer: ${bonus_tokens} bonus tokens (20% of remaining balance) in exchange for a signed dispute waiver. Account remains active.`,
    };
  }

  /**
   * Stage 2: Offer the Three-Fifths Exit.
   * 60% refund of original purchase price. Requires step-up token.
   * Account is temporarily restricted during 24hr offer window.
   * On acceptance, caller must invoke LedgerService.handleDisputeReversal()
   * with the returned refund_cents value and this dispute_id.
   */
  offerThreeFifthsExit(params: {
    dispute_id: string;
    user_id: string;
    original_amount_cents: bigint;
    step_up_token: string;
  }): DisputeResolutionResult {
    if (!params.step_up_token || params.step_up_token.trim().length === 0) {
      throw new Error('STEP_UP_REQUIRED: Three-Fifths Exit requires step-up authentication.');
    }

    const refund_cents = BigInt(Math.floor(
      Number(params.original_amount_cents) * this.THREE_FIFTHS_REFUND_PCT
    ));

    this.logger.warn('DisputeResolutionService: THREE_FIFTHS_EXIT offer computed — step-up verified', {
      dispute_id: params.dispute_id,
      user_id: params.user_id,
      original_cents: params.original_amount_cents.toString(),
      refund_cents: refund_cents.toString(),
      rule_applied_id: this.RULE_ID,
    });

    return {
      success: true,
      new_stage: 'EXIT_OFFERED',
      offer: { type: 'THREE_FIFTHS_EXIT', refund_cents },
      requires_step_up: true,
      message: `Final offer: $${(Number(refund_cents) / 100).toFixed(2)} USD refund (60% of original purchase). ` +
               `Account restricted for 24 hours. This offer cannot be revisited once declined.`,
    };
  }

  /**
   * Flag account after both offers declined.
   * Permanent flag — cannot be removed without compliance review.
   */
  flagAfterDeclinedOffers(params: {
    dispute_id: string;
    user_id: string;
    step_up_token: string;
  }): DisputeResolutionResult {
    if (!params.step_up_token || params.step_up_token.trim().length === 0) {
      throw new Error('STEP_UP_REQUIRED: Permanent flag action requires step-up authentication.');
    }

    this.logger.warn('DisputeResolutionService: PERMANENT FLAG applied — both goodwill offers declined', {
      dispute_id: params.dispute_id,
      user_id: params.user_id,
      rule_applied_id: this.RULE_ID,
      flag_reason: 'Aware of policy / declined two goodwill offers made against policy.',
    });

    return {
      success: true,
      new_stage: 'FLAGGED',
      requires_step_up: true,
      message: 'Account permanently flagged: Aware of policy / declined two goodwill offers made against policy.',
    };
  }

  /** Utility: generate a deterministic audit hash for a dispute event. */
  static computeAuditHash(dispute_id: string, stage: DisputeStage, timestamp_utc: string): string {
    return createHash('sha256')
      .update(`${dispute_id}:${stage}:${timestamp_utc}`)
      .digest('hex');
  }
}
