# CLAUDE CODE BACKLOG — ChatNow.Zone
**Authority:** OmniQuest Media Inc. | CEO Kevin B. Hartley
**Backlog Version:** 1.0
**Generated:** 2026-03-29
**Platform Time Standard:** America/Toronto
**Canonical Authority:** OQMI Coding Doctrine v2.0 · Canonical Corpus v10

---

## HOW TO USE THIS FILE

This is the canonical build queue. Each directive is a complete, self-contained
instruction. Execute one directive per session unless explicitly told otherwise.

**Before starting any directive:**
1. Read `OQMI CODING DOCTRINE v2.0` in the root of this repo.
2. Read `.github/copilot-instructions.md`.
3. Confirm the target file(s) exist and match the state described.
4. If a file is missing or differs from the description, `HARD_STOP` and report.

**After completing any directive:**
- Write a report to `PROGRAM_CONTROL/REPORT_BACK/<DIRECTIVE_ID>.md`
- Format: branch + HEAD commit, files changed (git diff --stat), commands run,
  verbatim outputs, result: SUCCESS or HARD_STOP with exact error.
- Mark the directive below as `[DONE]` with commit hash.

**FIZ commits MUST use this format — no exceptions:**
```
FIZ: <short description>
REASON: <why this change is necessary>
IMPACT: <what balances/flows/constants are affected>
CORRELATION_ID: <generate a uuid v4>
```

---

## PRIORITY TIER 1 — FOUNDATION (BLOCKS EVERYTHING ELSE)

These must be completed in order. Later tiers depend on them.

---

### DIRECTIVE: FIZ-001
**Status:** `[ ] TODO`
**Commit prefix:** `FIZ:`
**File:** `services/core-api/src/config/governance.config.ts`
**Risk class:** R0 — all financial constants live here

**What exists:** `GovernanceConfigService` has only `TIMEZONE`, `PAYOUT_RATE_SHOWTHEATER`,
and `PAYOUT_RATE_REGULAR`. `COMMISSION_DEFAULTS` and `StudioFeeType` enum also present.

**Task:** Append the following constant blocks to `governance.config.ts`.
Do NOT modify or remove any existing constants. APPEND ONLY.

```typescript
// ─── DIAMOND TIER PRICING ────────────────────────────────────────────────────
export const DIAMOND_TIER = {
  PAYOUT_RATE_PER_TOKEN: 0.075,          // USD — creator payout floor for Diamond
  PLATFORM_FLOOR_PER_TOKEN: 0.077,       // USD — minimum platform price (wee profit)
  EXCHANGE_COST_DIAMOND_PCT: 0.00,       // Diamond conversion is fee-free
  EXTENSION_FEE_14_DAY_USD: 49.00,       // 14-day token expiry extension
  RECOVERY_FEE_EXPIRED_USD: 79.00,       // Fee to recover already-expired balance
  EXPIRED_CREATOR_POOL_PCT: 0.70,        // % of expired tokens to creator bonus pool
  EXPIRED_PLATFORM_MGMT_PCT: 0.30,       // % retained by OQMI as management fee
  VIP_BASELINE_PER_1000: 0.12,           // Comparison baseline shown in estimator
  VOLUME_TIERS: [
    { min_tokens: 10000,  max_tokens: 27499,  base_rate: 0.095 },
    { min_tokens: 30000,  max_tokens: 57499,  base_rate: 0.088 },
    { min_tokens: 60000,  max_tokens: Infinity, base_rate: 0.082 },
  ],
  VELOCITY_MULTIPLIERS: {
    DAYS_14:  1.00,
    DAYS_30:  1.00,
    DAYS_90:  1.08,
    DAYS_180: 1.12,
    DAYS_366: 1.15,
  },
} as const;

// ─── SHOWTOKEN EXCHANGE COSTS (ShowZone → Regular) ───────────────────────────
export const SHOWTOKEN_EXCHANGE = {
  SILVER_COST_PCT:   0.20,
  GOLD_COST_PCT:     0.15,
  PLATINUM_COST_PCT: 0.10,
  DIAMOND_COST_PCT:  0.00,
  DIAMOND_FLOOR_RATE: 0.065,             // Break-even rate for Diamond conversion
  SETTLEMENT_DAYS_MIN: 3,
  SETTLEMENT_DAYS_MAX: 5,
  // ShowToken guest price must be AT LEAST this multiple above regular token price
  SHOWTOKEN_PRICE_FLOOR_MULTIPLIER: 1.28,
} as const;

// ─── SHOWZONE THEATRE PRICING ─────────────────────────────────────────────────
export const SHOWZONE_PRICING = {
  PASS_BASE_ST_TOKENS:       100,        // Base pass price in ShowTokens
  MIN_SEATS_TO_GO_LIVE:      20,         // Auto-cancel if fewer seats sold at T-1hr
  PAYOUT_RATE_PER_ST:        0.08,       // Creator payout per ShowToken
  ST_PRICE_USD:              0.13,       // ShowToken USD price (for display/estimates)
  PHASE2_CAPACITY_PCT:       0.25,       // Phase 2 Uber Private = 25% of Phase 1 count
  PHASE2_PRICE_MULTIPLIERS: {
    TIER_1: 1.30,                        // +30% over Phase 1 pass
    TIER_2: 1.50,                        // +50%
    TIER_3: 1.80,                        // +80%
  },
  DAY_MULTIPLIERS: {
    MON: 0.85,
    TUE: 0.85,
    WED: 0.95,
    THU: 1.00,
    FRI: 1.20,
    SAT: 1.30,
    SUN: 1.10,
  },
  TIME_MULTIPLIERS: {
    // Hour ranges in America/Toronto (24h)
    AFTERNOON:  { from: 12, to: 17, multiplier: 0.90 },
    PRIME:      { from: 19, to: 23, multiplier: 1.15 },
    LATE_NIGHT: { from: 23, to: 26, multiplier: 1.10 }, // 26 = 02:00 next day
    OFF_PEAK:   { from:  0, to: 12, multiplier: 0.80 },
  },
  CREATOR_TIER_MULTIPLIERS: {
    NEW:         0.85,   // < 50 registered fans
    RISING:      1.00,   // 50–199 fans
    ESTABLISHED: 1.15,   // 200–999 fans
    STAR:        1.35,   // 1000+ fans
  },
  ADVANCE_PURCHASE_MULTIPLIERS: {
    SAME_DAY:      1.00, // 0 days ahead
    ONE_TO_THREE:  0.95, // 1–3 days ahead (early bird)
    FOUR_TO_SEVEN: 0.90, // 4–7 days ahead
    EIGHT_PLUS:    0.85, // 8+ days ahead
  },
} as const;

// ─── BIJOU PLAY.ZONE PRICING ──────────────────────────────────────────────────
export const BIJOU_PRICING = {
  ADMISSION_ST_TOKENS_BASE:  240,        // Base admission in ShowTokens
  CREATOR_SPLIT_PCT:         0.85,       // 85% to performing creator
  OQMI_SPLIT_PCT:            0.15,       // 15% to OmniQuest Media Inc.
  PAYOUT_RATE_PER_ST:        0.09,       // Creator payout per ShowToken (Bijou rate)
  ST_PRICE_USD:              0.13,       // ShowToken USD price
  MIN_SEATS_TO_GO_LIVE:      8,          // Auto-cancel threshold at T-1hr
  MAX_PARTICIPANTS:          24,         // Hard SFU cap (VIPs only; host is +1)
  WRISTBAND_DURATION_HOURS:  72,         // Same as ShowZone wristband
  SHOW_DURATION_MAX_MINS:    60,
  STANDBY_ACCEPT_WINDOW_SEC: 10,         // VIP has 10s to claim an opened seat
  CAMERA_GRACE_PERIOD_SEC:   30,         // Grace before warning screen
  CAMERA_WARNING_PERIOD_SEC: 30,         // Warning countdown before ejection
  MIN_ADVANCE_BOOKING_HOURS: 72,         // Must book 72hrs before show
  MAX_SCHEDULED_AT_ONE_TIME: 10,
  VELOCITY_RULES: {
    MAX_SHOWS_PER_24H:     1,
    CONSECUTIVE_CAP:       3,           // After 3 consecutive shows → 2-day break
    TWO_BACK_TO_BACK_BREAK_DAYS: 1,     // After 2 back-to-back → 1-day break
  },
  DAY_MULTIPLIERS: {                    // Same structure as ShowZone
    MON: 0.90,
    TUE: 0.90,
    WED: 1.00,
    THU: 1.05,
    FRI: 1.20,
    SAT: 1.25,
    SUN: 1.10,
  },
} as const;

// ─── GEO-ADAPTIVE PRICING ─────────────────────────────────────────────────────
export const GEO_PRICING = {
  TIERS: {
    LOW: { multiplier_min: 0.33, multiplier_max: 0.50, display_label: 'LOW' },
    MED: { multiplier_min: 0.60, multiplier_max: 0.80, display_label: 'MED' },
    HIGH: { multiplier: 1.00,                           display_label: 'HIGH' },
  },
  // ISO 3166-1 alpha-2 country codes → tier assignment
  // VERSIONED: any change to this map requires FIZ: commit + governance approval
  COUNTRY_TIER_MAP: {
    // LOW tier — developing economy purchasing power
    CO: 'LOW', UA: 'LOW', MX: 'LOW', PH: 'LOW', ID: 'LOW',
    VN: 'LOW', NG: 'LOW', PK: 'LOW', BD: 'LOW', EG: 'LOW',
    KE: 'LOW', ET: 'LOW', GH: 'LOW', TZ: 'LOW', UZ: 'LOW',
    // MED tier — mid-range purchasing power
    BR: 'MED', AR: 'MED', PL: 'MED', RO: 'MED', TR: 'MED',
    ZA: 'MED', MY: 'MED', TH: 'MED', CL: 'MED', CO_PLUS: 'MED',
    HU: 'MED', RS: 'MED', HR: 'MED', SK: 'MED', BG: 'MED',
    // HIGH tier — all others default to HIGH (full price)
    DEFAULT: 'HIGH',
  },
} as const;

// ─── WRISTBAND MECHANICS (SHARED) ─────────────────────────────────────────────
export const WRISTBAND = {
  SHOWZONE_DURATION_HOURS:  72,
  BIJOU_DURATION_HOURS:     72,
  // Bonus token evaporation distribution
  EVAPORATION_CREATOR_POOL_PCT: 0.70,
  EVAPORATION_PLATFORM_PCT:     0.30,
  // Minimum dwell time for bonus pool eligibility (per creator, per session)
  DWELL_MIN_ELIGIBILITY_SEC: 20,
  // Wristbands are venue-exclusive. A ShowZone wristband cannot admit to Bijou
  // and vice versa. This is enforced at admission gate level.
  VENUE_EXCLUSIVITY: true,
} as const;

// ─── MEMBERSHIP TIERS ─────────────────────────────────────────────────────────
export const MEMBERSHIP = {
  TIERS: ['VIP', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'] as const,
  BUNDLE_TENURE_GATE_WEEKS: 5,           // Limited menu for first 5 weeks
  BUNDLE_CAPS: {
    VIP:      { initial: 1000, expanded: 1000,  risk_quote_above: 0 },
    SILVER:   { initial: 1000, expanded: 5000,  risk_quote_above: 5000 },
    GOLD:     { initial: 1000, expanded: 7500,  risk_quote_above: 7500 },
    PLATINUM: { initial: 1000, expanded: 8000,  risk_quote_above: 8000 },
    DIAMOND:  { initial: 1000, expanded: null,  risk_quote_above: 0 }, // Concierge only
  },
  TOKEN_EXPIRY_DAYS: 45,                 // Standard token window
  TOKEN_EXPIRY_BUFFER_DAYS: 1,           // T+1 logic for America/Toronto boundary
  DURATION_BONUS_TIERS: [
    { paid_months: 3,  bonus_months: 1, loyalty_multiplier: 1.0 },
    { paid_months: 6,  bonus_months: 2, loyalty_multiplier: 1.2 },
    { paid_months: 12, bonus_months: 3, loyalty_multiplier: 1.5 },
  ],
} as const;

// ─── PRIVATE CALL (PrivateCall Feature) ───────────────────────────────────────
export const PRIVATE_CALL = {
  BLOCK_DURATIONS_MINS: [6, 12, 24],
  // Per-minute premium rate must be at least this % above equivalent block rate
  PER_MINUTE_PREMIUM_MIN_PCT: 0.20,
  MIN_ADVANCE_BOOKING_HOURS: 1,          // Platform minimum; creator can set higher
  READY_CONFIRM_WINDOW_MIN_BEFORE: 5,    // Push notification sent 5 mins before
  AUTO_CANCEL_NO_CONFIRM_SEC: 90,        // Cancel if no creator confirmed at T+90s
  CREATOR_NO_SHOW_STRIKE_THRESHOLD: 3,   // Triggers review flag
} as const;

// ─── GAMIFICATION ─────────────────────────────────────────────────────────────
export const GAMIFICATION = {
  TOKEN_TIERS: [25, 45, 60],             // Low / Mid / High token price options
  GAME_TYPES: ['SPIN_WHEEL', 'SLOT_MACHINE', 'DICE'] as const,
  DICE_RANGE: { min: 2, max: 12 },       // Sum of 2d6
  PHASE2_SEAT_CAPACITY_WINDOW: 0.25,     // Phase 2 = 25% of Phase 1 attendee count
} as const;
```

**Validation after change:**
- File must still export `GovernanceConfigService` class unchanged.
- All new exports are `as const` objects or enums — no class mutations.
- Run: `npx tsc --noEmit` — zero errors required.
- Confirm no existing imports of `GovernanceConfigService` break.

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/FIZ-001-GOVERNANCE-CONSTANTS.md`

---

### DIRECTIVE: FIZ-002
**Status:** `[ ] TODO`
**Commit prefix:** `FIZ:`
**File:** `finance/dispute-resolution.service.ts` (REPLACE — current file is a dead Angular stub)
**Risk class:** R0

**What exists:** An `@angular/core` `Injectable` with a no-op `resolveDispute()` that always
resolves `true`. Wrong framework (should be NestJS), wrong logic, no ledger integration.

**Task:** Replace the entire file with the following NestJS implementation.

```typescript
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
```

**Validation:**
- `npx tsc --noEmit` — zero errors.
- Confirm no `@angular/core` import remains anywhere in `finance/` directory.
- File must export `DisputeResolutionService` as a NestJS `@Injectable`.

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/FIZ-002-DISPUTE-RESOLUTION-REPLACE.md`

---

### DIRECTIVE: FIZ-003
**Status:** `[ ] TODO`
**Commit prefix:** `FIZ:`
**File:** `services/core-api/src/finance/ledger.service.ts` (ADDITIVE only — no changes to existing methods)
**Risk class:** R0

**What exists:** `LedgerService` has `recordEntry()`, `handleDisputeReversal()`, `getBalance()`.
`TokenType` enum has `REGULAR` and `SHOW_THEATER`.

**Task:** Add the Three-Bucket Wallet routing layer. APPEND new methods and enum values ONLY.
Do NOT modify `recordEntry()`, `handleDisputeReversal()`, or `getBalance()`.

```typescript
// ADD to TokenType enum (after SHOW_THEATER):
BIJOU = 'BIJOU',

// ADD new WalletBucket enum after the TokenType enum:
export enum WalletBucket {
  PROMOTIONAL_BONUS = 'PROMOTIONAL_BONUS',   // Priority 1 — spend first
  MEMBERSHIP_ALLOCATION = 'MEMBERSHIP',      // Priority 2
  PURCHASED = 'PURCHASED',                   // Priority 3 — spend last
}

// ADD new interface after WalletBucket:
export interface BucketBalance {
  bucket: WalletBucket;
  balance: bigint;
  spendPriority: 1 | 2 | 3;
}

// ADD new method to LedgerService class (append after getBalance):

  /**
   * FIZ-003: Three-Bucket Wallet — deterministic spend-order debit.
   * Spend order: PROMOTIONAL_BONUS (1) → MEMBERSHIP_ALLOCATION (2) → PURCHASED (3).
   * This order is system-enforced and cannot be user-selected.
   * Each bucket debit is a separate append-only ledger entry.
   */
  async debitWallet(data: {
    userId: string;
    amountTokens: bigint;
    tokenType: TokenType;
    referenceId: string;
    reasonCode: string;
    ruleAppliedId?: string;
    metadata?: Record<string, unknown>;
  }): Promise<{ entries: unknown[]; total_debited: bigint }> {
    const SPEND_ORDER: WalletBucket[] = [
      WalletBucket.PROMOTIONAL_BONUS,
      WalletBucket.MEMBERSHIP_ALLOCATION,
      WalletBucket.PURCHASED,
    ];

    let remaining = data.amountTokens;
    const entries: unknown[] = [];

    for (const bucket of SPEND_ORDER) {
      if (remaining <= 0n) break;

      // Derive bucket balance from ledger history
      const bucketBalance = await this.getBucketBalance(data.userId, data.tokenType, bucket);
      if (bucketBalance <= 0n) continue;

      const debitAmount = remaining < bucketBalance ? remaining : bucketBalance;
      remaining -= debitAmount;

      const entry = await this.recordEntry({
        userId: data.userId,
        amount: -debitAmount,
        tokenType: data.tokenType,
        referenceId: `${data.referenceId}:${bucket}`,
        reasonCode: data.reasonCode,
        ruleAppliedId: data.ruleAppliedId ?? 'THREE_BUCKET_DEBIT_v1',
        metadata: {
          ...data.metadata,
          wallet_bucket: bucket,
          spend_priority: SPEND_ORDER.indexOf(bucket) + 1,
        },
      });
      entries.push(entry);
    }

    if (remaining > 0n) {
      throw new Error(
        `INSUFFICIENT_BALANCE: Could not debit ${data.amountTokens} tokens for user ${data.userId}. ` +
        `Shortfall: ${remaining} tokens across all three buckets.`
      );
    }

    return { entries, total_debited: data.amountTokens };
  }

  /**
   * Derives balance for a specific wallet bucket from ledger history.
   * Bucket is stored in entry metadata.wallet_bucket.
   */
  async getBucketBalance(userId: string, tokenType: TokenType, bucket: WalletBucket): Promise<bigint> {
    const result = await this.ledgerRepo
      .createQueryBuilder('ledger')
      .select('SUM(ledger.amount)', 'total')
      .where('ledger.user_id = :userId', { userId })
      .andWhere('ledger.token_type = :tokenType', { tokenType })
      .andWhere("ledger.metadata->>'wallet_bucket' = :bucket", { bucket })
      .getRawOne();

    return BigInt(result?.total || 0);
  }

  /**
   * Returns all three bucket balances for a user in spend-priority order.
   */
  async getAllBucketBalances(userId: string, tokenType: TokenType): Promise<BucketBalance[]> {
    const buckets = [
      { bucket: WalletBucket.PROMOTIONAL_BONUS,   spendPriority: 1 as const },
      { bucket: WalletBucket.MEMBERSHIP_ALLOCATION, spendPriority: 2 as const },
      { bucket: WalletBucket.PURCHASED,           spendPriority: 3 as const },
    ];

    return Promise.all(
      buckets.map(async ({ bucket, spendPriority }) => ({
        bucket,
        balance: await this.getBucketBalance(userId, tokenType, bucket),
        spendPriority,
      }))
    );
  }
```

**Validation:**
- `npx tsc --noEmit` — zero errors.
- Existing `recordEntry()`, `handleDisputeReversal()`, `getBalance()` signatures unchanged.
- New `debitWallet()` method is callable without breaking existing callers.

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/FIZ-003-THREE-BUCKET-WALLET.md`

---

### DIRECTIVE: FIZ-004
**Status:** `[ ] TODO`
**Commit prefix:** `FIZ:`
**File:** `infra/postgres/init-ledger.sql` (ADDITIVE — append new tables after existing content)
**Risk class:** R0

**What exists:** `ledger_entries`, `transactions`, `identity_verification`, `audit_events`,
`referral_links`, `attribution_events`, `notification_consent_store`, `studio_contracts`,
`user_risk_profiles`. All with append-only triggers.

**Task:** Append the following new schema tables to the END of `init-ledger.sql`.
Do NOT modify any existing table definitions or triggers.

```sql
-- =============================================================================
-- TABLE: tip_menu_items
-- PURPOSE: Creator-defined tip menu. Versioned, append-only.
-- All changes create new rows — no UPDATE on price or description columns.
-- MUTATION POLICY: INSERT only for new versions. UPDATE allowed on is_active only.
-- WO: FIZ-004
-- =============================================================================
CREATE TABLE IF NOT EXISTS tip_menu_items (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id          UUID        NOT NULL,
    item_name           VARCHAR(100) NOT NULL,
    description         TEXT,
    base_price_tokens   INTEGER     NOT NULL CHECK (base_price_tokens > 0),
    -- Geo-tier prices (NULL = use multiplier from GovernanceConfigService)
    geo_price_low       INTEGER,
    geo_price_med       INTEGER,
    is_active           BOOLEAN     NOT NULL DEFAULT TRUE,
    version             INTEGER     NOT NULL DEFAULT 1,
    rule_applied_id     VARCHAR(100) NOT NULL DEFAULT 'TIP_MENU_v1',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tip_menu_items_creator_id ON tip_menu_items (creator_id);
CREATE INDEX IF NOT EXISTS idx_tip_menu_items_is_active  ON tip_menu_items (creator_id, is_active);
COMMENT ON TABLE tip_menu_items IS
    'Creator tip menu items. Append-only for new versions. is_active toggle permitted. '
    'Geo prices override multiplier if set. FIZ-004.';

-- =============================================================================
-- TABLE: game_sessions
-- PURPOSE: Immutable record of every gamification play (Wheel/Slots/Dice).
-- Token debit MUST occur before outcome is resolved. Append-only.
-- MUTATION POLICY: INSERT only. No UPDATE or DELETE.
-- WO: FIZ-004
-- =============================================================================
CREATE TABLE IF NOT EXISTS game_sessions (
    session_id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID        NOT NULL,
    creator_id          UUID        NOT NULL,
    game_type           VARCHAR(20) NOT NULL
                            CHECK (game_type IN ('SPIN_WHEEL', 'SLOT_MACHINE', 'DICE')),
    token_tier          INTEGER     NOT NULL CHECK (token_tier IN (25, 45, 60)),
    tokens_paid         INTEGER     NOT NULL CHECK (tokens_paid > 0),
    ledger_entry_id     UUID,       -- FK to ledger_entries.id (set after debit)
    outcome             JSONB,      -- {die_values: [3,4], total: 7} or {segment: 'PRIZE_A'}
    prize_awarded       TEXT,
    prize_table_version VARCHAR(50) NOT NULL,
    idempotency_key     VARCHAR(200) NOT NULL UNIQUE,
    rule_applied_id     VARCHAR(100) NOT NULL DEFAULT 'GAMIFICATION_v1',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id    ON game_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_creator_id ON game_sessions (creator_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_game_type  ON game_sessions (game_type);
COMMENT ON TABLE game_sessions IS
    'Immutable gamification play log. Token debit precedes outcome. Append-only. FIZ-004.';

CREATE OR REPLACE FUNCTION game_sessions_block_mutation()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'game_sessions is append-only: % is not permitted (session_id=%).', TG_OP, OLD.session_id;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_game_sessions_block_mutation
BEFORE UPDATE OR DELETE ON game_sessions
FOR EACH ROW EXECUTE FUNCTION game_sessions_block_mutation();

-- =============================================================================
-- TABLE: prize_tables
-- PURPOSE: Creator-configured prize tables for gamification. Versioned.
-- MUTATION POLICY: INSERT only. Deactivation via new row with is_active=false.
-- WO: FIZ-004
-- =============================================================================
CREATE TABLE IF NOT EXISTS prize_tables (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id          UUID        NOT NULL,
    game_type           VARCHAR(20) NOT NULL
                            CHECK (game_type IN ('SPIN_WHEEL', 'SLOT_MACHINE', 'DICE')),
    token_tier          INTEGER     NOT NULL CHECK (token_tier IN (25, 45, 60)),
    prize_slot          VARCHAR(20) NOT NULL, -- e.g. '7' for dice, 'SEG_A' for wheel
    prize_description   TEXT        NOT NULL,
    is_active           BOOLEAN     NOT NULL DEFAULT TRUE,
    version             VARCHAR(50) NOT NULL,
    rule_applied_id     VARCHAR(100) NOT NULL DEFAULT 'PRIZE_TABLE_v1',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_prize_tables_creator_game ON prize_tables (creator_id, game_type, token_tier, is_active);
COMMENT ON TABLE prize_tables IS 'Creator prize tables for gamification. Versioned, append-only. FIZ-004.';

-- =============================================================================
-- TABLE: call_bookings
-- PURPOSE: PrivateCall booking records. Append-only.
-- MUTATION POLICY: INSERT only. Status transitions via new events table.
-- WO: FIZ-004
-- =============================================================================
CREATE TABLE IF NOT EXISTS call_bookings (
    booking_id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id              UUID        NOT NULL,
    vip_user_id             UUID        NOT NULL,
    scheduled_at_utc        TIMESTAMPTZ NOT NULL,
    block_type              VARCHAR(20) NOT NULL
                                CHECK (block_type IN ('MINI_6', 'STANDARD_12', 'PREMIUM_24', 'PER_MINUTE')),
    block_duration_mins     INTEGER     NOT NULL CHECK (block_duration_mins > 0),
    price_usd               NUMERIC(10,2) NOT NULL CHECK (price_usd > 0),
    status                  VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED'
                                CHECK (status IN ('SCHEDULED','CONFIRMED','ACTIVE','COMPLETED',
                                                   'CANCELLED_VIP','CANCELLED_CREATOR','NO_SHOW_VIP','NO_SHOW_CREATOR')),
    reschedule_fee_usd      NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    ledger_entry_id         UUID,
    idempotency_key         VARCHAR(200) NOT NULL UNIQUE,
    rule_applied_id         VARCHAR(100) NOT NULL DEFAULT 'PRIVATE_CALL_v1',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_call_bookings_creator_id  ON call_bookings (creator_id);
CREATE INDEX IF NOT EXISTS idx_call_bookings_vip_user_id ON call_bookings (vip_user_id);
CREATE INDEX IF NOT EXISTS idx_call_bookings_scheduled   ON call_bookings (scheduled_at_utc);
COMMENT ON TABLE call_bookings IS 'PrivateCall booking records. Append-only. FIZ-004.';

-- =============================================================================
-- TABLE: call_sessions
-- PURPOSE: Immutable real-time session log for PrivateCalls.
--          Login/ready/start/end timestamps are the evidence of attendance.
-- MUTATION POLICY: INSERT only. No UPDATE or DELETE — ever.
-- WO: FIZ-004
-- =============================================================================
CREATE TABLE IF NOT EXISTS call_sessions (
    session_id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id              UUID        NOT NULL REFERENCES call_bookings(booking_id),
    creator_login_at        TIMESTAMPTZ,
    vip_login_at            TIMESTAMPTZ,
    creator_ready_at        TIMESTAMPTZ,
    vip_ready_at            TIMESTAMPTZ,
    call_start_at           TIMESTAMPTZ,
    call_end_at             TIMESTAMPTZ,
    actual_duration_secs    INTEGER,
    creator_no_show         BOOLEAN     NOT NULL DEFAULT FALSE,
    vip_no_show             BOOLEAN     NOT NULL DEFAULT FALSE,
    voip_session_id         VARCHAR(200),
    rule_applied_id         VARCHAR(100) NOT NULL DEFAULT 'PRIVATE_CALL_v1',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_call_sessions_booking_id ON call_sessions (booking_id);
COMMENT ON TABLE call_sessions IS
    'Immutable PrivateCall session log. Login/ready timestamps are attendance evidence. '
    'No UPDATE or DELETE permitted. FIZ-004.';

CREATE OR REPLACE FUNCTION call_sessions_block_mutation()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'call_sessions is immutable: % is not permitted (session_id=%).', TG_OP, OLD.session_id;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_call_sessions_block_mutation
BEFORE UPDATE OR DELETE ON call_sessions
FOR EACH ROW EXECUTE FUNCTION call_sessions_block_mutation();

-- =============================================================================
-- TABLE: voucher_vault
-- PURPOSE: GWP (Gift With Purchase) offer catalog. is_permanent enforced.
-- MUTATION POLICY: INSERT only. No DELETE. is_active toggle on UPDATE permitted.
-- WO: FIZ-004
-- =============================================================================
CREATE TABLE IF NOT EXISTS voucher_vault (
    voucher_id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_name          VARCHAR(100) NOT NULL,
    description         TEXT,
    eligible_tiers      TEXT[]      NOT NULL,   -- e.g. ['GOLD','PLATINUM','DIAMOND']
    trigger_type        VARCHAR(50) NOT NULL DEFAULT 'LOGIN',
    token_value         INTEGER,                -- Bonus tokens if applicable
    is_permanent        BOOLEAN     NOT NULL DEFAULT TRUE,   -- is_permanent=true enforced
    is_active           BOOLEAN     NOT NULL DEFAULT TRUE,
    rule_applied_id     VARCHAR(100) NOT NULL DEFAULT 'GWP_VAULT_v1',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE voucher_vault IS
    'GWP offer catalog. is_permanent=true: entries are never deleted. '
    'Deactivation via is_active=false only. FIZ-004.';

CREATE OR REPLACE FUNCTION voucher_vault_block_delete()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'voucher_vault is permanent: DELETE is not permitted (voucher_id=%).', OLD.voucher_id;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_voucher_vault_block_delete
BEFORE DELETE ON voucher_vault
FOR EACH ROW EXECUTE FUNCTION voucher_vault_block_delete();
```

**Validation:**
- All new tables created without error.
- All new DELETE block triggers fire correctly (test with a manual DELETE — confirm exception).
- Existing tables unmodified (diff confirms no changes above the append point).

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/FIZ-004-SCHEMA-NEW-TABLES.md`

---

## PRIORITY TIER 2 — VENUE & ENGAGEMENT SERVICES

Do not start Tier 2 until all Tier 1 directives are marked `[DONE]`.

---

### DIRECTIVE: BIJOU-001
**Status:** `[ ] TODO`
**Commit prefix:** `BIJOU:`
**Target path:** `services/bijou/src/` (create directory if absent)
**Risk class:** R1

**Task:** Create `services/bijou/src/pass-pricing.service.ts` — the composite multiplier
engine for both Bijou and ShowZone pass pricing.

This service reads all multiplier constants from `GovernanceConfigService` / the new
`BIJOU_PRICING` and `SHOWZONE_PRICING` objects added in FIZ-001. It must NOT hardcode
any numeric values — all constants come from the config.

```typescript
// services/bijou/src/pass-pricing.service.ts
import { Injectable } from '@nestjs/common';
import { BIJOU_PRICING, SHOWZONE_PRICING, GEO_PRICING } from
  '../../../services/core-api/src/config/governance.config';

export type VenueType = 'SHOWZONE' | 'BIJOU';
export type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
export type CreatorTier = 'NEW' | 'RISING' | 'ESTABLISHED' | 'STAR';
export type AdvanceWindow = 'SAME_DAY' | 'ONE_TO_THREE' | 'FOUR_TO_SEVEN' | 'EIGHT_PLUS';
export type GeoTier = 'LOW' | 'MED' | 'HIGH';

export interface PassPriceInput {
  venue: VenueType;
  day_of_week: DayOfWeek;
  show_start_hour_toronto: number;  // 0–23 in America/Toronto
  creator_tier: CreatorTier;        // ShowZone only; ignored for Bijou
  days_until_show: number;
  vip_geo_tier: GeoTier;
}

export interface PassPriceResult {
  base_tokens: number;
  day_multiplier: number;
  time_multiplier: number;
  creator_tier_multiplier: number;
  advance_multiplier: number;
  geo_multiplier: number;
  composite_multiplier: number;
  final_tokens: number;             // Rounded to nearest 10
  final_usd_estimate: number;
  multiplier_breakdown: Record<string, number>;
}

@Injectable()
export class PassPricingService {

  computePassPrice(input: PassPriceInput): PassPriceResult {
    const config = input.venue === 'BIJOU' ? BIJOU_PRICING : SHOWZONE_PRICING;

    const base = config.ADMISSION_ST_TOKENS_BASE ?? (SHOWZONE_PRICING as typeof SHOWZONE_PRICING).PASS_BASE_ST_TOKENS;
    const day_multiplier = config.DAY_MULTIPLIERS[input.day_of_week];
    const time_multiplier = this.resolveTimeMultiplier(input.show_start_hour_toronto, input.venue);
    const creator_tier_multiplier = input.venue === 'SHOWZONE'
      ? SHOWZONE_PRICING.CREATOR_TIER_MULTIPLIERS[input.creator_tier]
      : 1.00; // Bijou has no creator-tier multiplier
    const advance_multiplier = input.venue === 'SHOWZONE'
      ? this.resolveAdvanceMultiplier(input.days_until_show)
      : 1.00; // Bijou advance window not currently multiplied
    const geo_multiplier = this.resolveGeoMultiplier(input.vip_geo_tier);

    const composite = day_multiplier * time_multiplier * creator_tier_multiplier * advance_multiplier;
    // Geo multiplier is display-layer only — does not change creator payout calculation
    const final_tokens_raw = base * composite;
    const final_tokens = Math.round(final_tokens_raw / 10) * 10;
    const st_price_usd = (config as typeof BIJOU_PRICING).ST_PRICE_USD ?? SHOWZONE_PRICING.ST_PRICE_USD;
    const final_usd_estimate = final_tokens * st_price_usd;

    return {
      base_tokens: base,
      day_multiplier,
      time_multiplier,
      creator_tier_multiplier,
      advance_multiplier,
      geo_multiplier,
      composite_multiplier: parseFloat(composite.toFixed(4)),
      final_tokens,
      final_usd_estimate: parseFloat(final_usd_estimate.toFixed(2)),
      multiplier_breakdown: {
        day:          day_multiplier,
        time:         time_multiplier,
        creator_tier: creator_tier_multiplier,
        advance:      advance_multiplier,
        geo_display:  geo_multiplier,
        composite,
      },
    };
  }

  private resolveTimeMultiplier(hour: number, venue: VenueType): number {
    if (venue === 'BIJOU') return 1.00; // Bijou does not apply time-of-day multiplier
    const t = SHOWZONE_PRICING.TIME_MULTIPLIERS;
    if (hour >= t.PRIME.from && hour < t.PRIME.to) return t.PRIME.multiplier;
    if (hour >= t.LATE_NIGHT.from || hour < (t.LATE_NIGHT.to - 24)) return t.LATE_NIGHT.multiplier;
    if (hour >= t.AFTERNOON.from && hour < t.AFTERNOON.to) return t.AFTERNOON.multiplier;
    return t.OFF_PEAK.multiplier;
  }

  private resolveAdvanceMultiplier(days_until_show: number): number {
    const a = SHOWZONE_PRICING.ADVANCE_PURCHASE_MULTIPLIERS;
    if (days_until_show === 0) return a.SAME_DAY;
    if (days_until_show <= 3)  return a.ONE_TO_THREE;
    if (days_until_show <= 7)  return a.FOUR_TO_SEVEN;
    return a.EIGHT_PLUS;
  }

  private resolveGeoMultiplier(tier: GeoTier): number {
    // Geo multiplier is a DISPLAY layer only — used for chat token display translation.
    // It does NOT affect the ledger debit amount or creator payout.
    const t = GEO_PRICING.TIERS;
    if (tier === 'LOW') return t.LOW.multiplier_min;
    if (tier === 'MED') return t.MED.multiplier_min;
    return 1.00;
  }
}
```

Also create `services/bijou/src/min-seat-gate.service.ts`:

```typescript
// services/bijou/src/min-seat-gate.service.ts
// Handles T-1hr auto-cancel gate for both ShowZone and Bijou.
import { Injectable, Logger } from '@nestjs/common';
import { BIJOU_PRICING, SHOWZONE_PRICING } from
  '../../../services/core-api/src/config/governance.config';

export type VenueType = 'SHOWZONE' | 'BIJOU';

export interface SeatGateResult {
  gate_passed: boolean;
  seats_sold: number;
  minimum_required: number;
  venue: VenueType;
  action: 'PROCEED' | 'AUTO_CANCEL';
  reason_code: string;
}

@Injectable()
export class MinSeatGateService {
  private readonly logger = new Logger(MinSeatGateService.name);

  evaluate(params: {
    venue: VenueType;
    show_id: string;
    seats_sold: number;
    creator_override_minimum?: number;
  }): SeatGateResult {
    const platform_minimum = params.venue === 'BIJOU'
      ? BIJOU_PRICING.MIN_SEATS_TO_GO_LIVE
      : SHOWZONE_PRICING.MIN_SEATS_TO_GO_LIVE;

    // Creator may set a HIGHER minimum but not lower than platform floor
    const minimum_required = params.creator_override_minimum
      ? Math.max(params.creator_override_minimum, platform_minimum)
      : platform_minimum;

    const gate_passed = params.seats_sold >= minimum_required;

    this.logger.log('MinSeatGateService: gate evaluated', {
      show_id: params.show_id,
      venue: params.venue,
      seats_sold: params.seats_sold,
      minimum_required,
      gate_passed,
    });

    return {
      gate_passed,
      seats_sold: params.seats_sold,
      minimum_required,
      venue: params.venue,
      action: gate_passed ? 'PROCEED' : 'AUTO_CANCEL',
      reason_code: gate_passed
        ? 'MIN_SEAT_GATE_PASSED'
        : `MIN_SEAT_GATE_FAILED: ${params.seats_sold}/${minimum_required} seats sold at T-1hr`,
    };
  }
}
```

**Validation:**
- `npx tsc --noEmit` — zero errors.
- `PassPricingService.computePassPrice()` returns correct `final_tokens` for:
  - Bijou, Saturday, base 240: should be `240 * 1.25 = 300` → rounded to 300.
  - ShowZone, Friday, Prime time, Star creator, Same day, base 100: `100 * 1.20 * 1.15 * 1.35 * 1.00 = 186.3` → rounded to 190.
- No hardcoded numeric constants in either service.

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/BIJOU-001-PASS-PRICING-SERVICE.md`

---

### DIRECTIVE: GOV-001
**Status:** `[ ] TODO`
**Commit prefix:** `GOV:`
**Target path:** `services/core-api/src/geo/geo-pricing.service.ts` (create directory if absent)
**Risk class:** R1

**Task:** Create the GeoPricingService. Resolves VIP country code → geo tier.
Provides chat-stream token display translation. Logs every resolution to audit_events.

```typescript
// services/core-api/src/geo/geo-pricing.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { GEO_PRICING } from '../config/governance.config';

export type GeoTier = 'LOW' | 'MED' | 'HIGH';

export interface GeoResolution {
  country_code: string;
  tier: GeoTier;
  multiplier: number;
  display_tokens: number;     // Token amount shown in chat for this VIP
  base_tokens: number;        // Creator's set price (HIGH tier = 1.0x)
  rule_applied_id: string;
}

export interface ChatTipEvent {
  vip_display_name: string;
  action_name: string;
  display_tokens: number;
  geo_tier: GeoTier;
  creator_payout_tokens: number;
  raw_tokens_paid: number;
}

@Injectable()
export class GeoPricingService {
  private readonly logger = new Logger(GeoPricingService.name);
  private readonly RULE_ID = 'GEO_PRICING_v1';

  resolveGeoTier(country_code: string): GeoTier {
    const map = GEO_PRICING.COUNTRY_TIER_MAP as Record<string, string>;
    const tier = map[country_code.toUpperCase()] ?? map['DEFAULT'];
    return (tier as GeoTier) ?? 'HIGH';
  }

  applyTierMultiplier(base_token_price: number, tier: GeoTier): number {
    const tiers = GEO_PRICING.TIERS;
    let multiplier: number;
    if (tier === 'LOW')  multiplier = tiers.LOW.multiplier_min;
    else if (tier === 'MED') multiplier = tiers.MED.multiplier_min;
    else multiplier = 1.00;

    // Never return less than 1 token — floor at 1
    return Math.max(1, Math.round(base_token_price * multiplier));
  }

  resolveForVip(params: {
    country_code: string;
    base_token_price: number; // Creator's HIGH-tier set price
    action_name: string;
    vip_display_name: string;
    creator_payout_tokens: number;
  }): GeoResolution {
    const tier = this.resolveGeoTier(params.country_code);
    const display_tokens = this.applyTierMultiplier(params.base_token_price, tier);
    const tiers = GEO_PRICING.TIERS;
    const multiplier = tier === 'LOW' ? tiers.LOW.multiplier_min
      : tier === 'MED' ? tiers.MED.multiplier_min : 1.00;

    this.logger.log('GeoPricingService: resolved geo tier', {
      country_code: params.country_code,
      tier,
      base_token_price: params.base_token_price,
      display_tokens,
      rule_applied_id: this.RULE_ID,
    });

    return {
      country_code: params.country_code,
      tier,
      multiplier,
      display_tokens,
      base_tokens: params.base_token_price,
      rule_applied_id: this.RULE_ID,
    };
  }

  /**
   * Builds the NATS chat stream event payload for a geo-priced tip.
   * The display_tokens value is what appears in chat — not the raw ledger amount.
   * Creator payout is always based on base_tokens (HIGH tier 1.0x price).
   */
  buildChatTipEvent(params: {
    vip_display_name: string;
    country_code: string;
    action_name: string;
    base_token_price: number;
    creator_payout_tokens: number;
  }): ChatTipEvent {
    const resolution = this.resolveForVip({
      country_code: params.country_code,
      base_token_price: params.base_token_price,
      action_name: params.action_name,
      vip_display_name: params.vip_display_name,
      creator_payout_tokens: params.creator_payout_tokens,
    });

    return {
      vip_display_name: params.vip_display_name,
      action_name: params.action_name,
      display_tokens: resolution.display_tokens,
      geo_tier: resolution.tier,
      creator_payout_tokens: params.creator_payout_tokens,
      raw_tokens_paid: params.base_token_price,
    };
  }
}
```

**Validation:**
- `npx tsc --noEmit` — zero errors.
- `resolveGeoTier('CO')` returns `'LOW'`.
- `resolveGeoTier('CA')` returns `'HIGH'` (default).
- `resolveGeoTier('BR')` returns `'MED'`.
- `applyTierMultiplier(75, 'LOW')` returns `25` (75 * 0.33 = ~24.75 → rounds to 25).
- `applyTierMultiplier(75, 'MED')` returns `45` (75 * 0.60 = 45).
- `applyTierMultiplier(75, 'HIGH')` returns `75`.

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/GOV-001-GEO-PRICING-SERVICE.md`

---

## PRIORITY TIER 3 — ANALYTICS, CREATOR TOOLS & GAMIFICATION

Do not start Tier 3 until Tier 2 directives are complete.

---

### DIRECTIVE: HZ-001
**Status:** `[ ] TODO`
**Commit prefix:** `HZ:`
**Target path:** `services/core-api/src/analytics/heat-score.service.ts`
**Risk class:** R2

**Task:** Create `HeatScoreService` — the six-input behavioral HSV (Health Signal Variable)
engine for the HotZone / My Zone Manager™ creator dashboard.

Corpus constraint (Ch.5 §6.2): permitted inputs are tipping events, session duration,
dwell time, entry source type, chat count (NOT message content). The HSV must be:
- Non-gating (cannot block access or affect payout)
- Non-punitive
- Advisory only
- Logged with advisory-nature disclaimer in audit_events

```typescript
// services/core-api/src/analytics/heat-score.service.ts
import { Injectable, Logger } from '@nestjs/common';

export type HeatBand = 'COLD' | 'COOL' | 'WARM' | 'HOT' | 'RED_ZONE';

export interface HeatScoreInput {
  creator_id: string;
  session_spend_tokens: number;       // HIGH weight
  chat_message_count: number;         // MEDIUM weight (count only, not content)
  avg_dwell_time_secs: number;        // MEDIUM weight
  room_churn_rate_pct: number;        // MEDIUM weight (negative — high churn = lower score)
  avg_attendee_token_balance: number; // MEDIUM weight
  profile_ctr_pct: number;            // LOW weight
}

export interface HeatScoreResult {
  creator_id: string;
  raw_score: number;          // 0–100
  heat_band: HeatBand;
  computed_at_utc: string;
  advisory_disclaimer: string;
  inputs_used: string[];      // Logged for auditability — no content, just metric names
}

const WEIGHTS = {
  session_spend:   0.35,
  chat_volume:     0.20,
  dwell_time:      0.20,
  churn_rate:     -0.15,   // Negative: high churn reduces score
  token_balance:   0.07,
  profile_ctr:     0.03,
} as const;

const DISCLAIMER = 'HSV is an advisory performance signal only. It does not determine ' +
  'eligibility, affect payout percentage, influence moderation decisions, or gate access. ' +
  'Canonical Corpus v10 Ch.5 §6.';

@Injectable()
export class HeatScoreService {
  private readonly logger = new Logger(HeatScoreService.name);

  compute(input: HeatScoreInput): HeatScoreResult {
    // Normalize each input to 0–100 range before weighting
    const spend_norm    = Math.min(input.session_spend_tokens / 500 * 100, 100);
    const chat_norm     = Math.min(input.chat_message_count / 100 * 100, 100);
    const dwell_norm    = Math.min(input.avg_dwell_time_secs / 3600 * 100, 100);
    const churn_norm    = Math.min(input.room_churn_rate_pct, 100);
    const balance_norm  = Math.min(input.avg_attendee_token_balance / 500 * 100, 100);
    const ctr_norm      = Math.min(input.profile_ctr_pct, 100);

    const raw_score = Math.max(0, Math.min(100, Math.round(
      spend_norm   * WEIGHTS.session_spend +
      chat_norm    * WEIGHTS.chat_volume +
      dwell_norm   * WEIGHTS.dwell_time +
      churn_norm   * WEIGHTS.churn_rate +   // Negative weight applied
      balance_norm * WEIGHTS.token_balance +
      ctr_norm     * WEIGHTS.profile_ctr
    )));

    const heat_band: HeatBand =
      raw_score >= 85 ? 'RED_ZONE' :
      raw_score >= 65 ? 'HOT' :
      raw_score >= 45 ? 'WARM' :
      raw_score >= 25 ? 'COOL' : 'COLD';

    this.logger.log('HeatScoreService: HSV computed', {
      creator_id: input.creator_id,
      raw_score,
      heat_band,
      advisory: true,
      rule_applied_id: 'HEAT_SCORE_v1',
    });

    return {
      creator_id: input.creator_id,
      raw_score,
      heat_band,
      computed_at_utc: new Date().toISOString(),
      advisory_disclaimer: DISCLAIMER,
      inputs_used: ['session_spend_tokens', 'chat_message_count', 'avg_dwell_time_secs',
                    'room_churn_rate_pct', 'avg_attendee_token_balance', 'profile_ctr_pct'],
    };
  }
}
```

**Validation:**
- `npx tsc --noEmit` — zero errors.
- HSV output includes `advisory_disclaimer` field — mandatory per Corpus.
- `compute()` with all-zero inputs returns `raw_score: 0`, `heat_band: 'COLD'`.
- `compute()` with `session_spend_tokens: 500` and all others zero returns score ~35.
- No message content fields in `HeatScoreInput` — confirm struct has none.

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/HZ-001-HEAT-SCORE-SERVICE.md`

---

### DIRECTIVE: GM-001
**Status:** `[ ] TODO`
**Commit prefix:** `BIJOU:`
**Target path:** `services/core-api/src/games/game-engine.service.ts`
**Risk class:** R1

**Task:** Create the `GameEngineService` — covers Spin Wheel, Slot Machine, and Dice.
Uses `crypto.randomInt()` — NEVER `Math.random()`. Token debit via `LedgerService`
MUST occur before outcome is revealed. Idempotency enforced via `game_sessions.idempotency_key`.

```typescript
// services/core-api/src/games/game-engine.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { randomInt } from 'crypto';
import { GAMIFICATION } from '../config/governance.config';

export type GameType = 'SPIN_WHEEL' | 'SLOT_MACHINE' | 'DICE';

export interface GameOutcome {
  session_id: string;
  game_type: GameType;
  token_tier: number;
  outcome_data: {
    // DICE: { die1: number, die2: number, total: number }
    // SPIN_WHEEL: { segment_index: number }
    // SLOT_MACHINE: { reel1: number, reel2: number, reel3: number }
    [key: string]: number;
  };
  prize_slot: string;   // Maps to prize_tables.prize_slot
  resolved_at_utc: string;
  rule_applied_id: string;
}

@Injectable()
export class GameEngineService {
  private readonly logger = new Logger(GameEngineService.name);
  private readonly RULE_ID = 'GAMIFICATION_v1';

  /**
   * STEP 1: Validate the play request.
   * Called BEFORE token debit. Returns the idempotency key to use.
   * Caller must then debit tokens via LedgerService, THEN call resolveOutcome().
   */
  initiatePlay(params: {
    user_id: string;
    creator_id: string;
    game_type: GameType;
    token_tier: number;
  }): { idempotency_key: string; valid: boolean; error?: string } {
    if (!GAMIFICATION.GAME_TYPES.includes(params.game_type as any)) {
      return { idempotency_key: '', valid: false, error: `Invalid game_type: ${params.game_type}` };
    }
    if (!GAMIFICATION.TOKEN_TIERS.includes(params.token_tier as any)) {
      return { idempotency_key: '', valid: false,
        error: `Invalid token_tier: ${params.token_tier}. Must be one of ${GAMIFICATION.TOKEN_TIERS.join(', ')}` };
    }
    // Idempotency key is time-bucketed to 5-minute windows to prevent replay while
    // allowing legitimate retries after network failure
    const window = Math.floor(Date.now() / 300000);
    const idempotency_key =
      `GAME:${params.user_id}:${params.creator_id}:${params.game_type}:${params.token_tier}:${window}`;
    return { idempotency_key, valid: true };
  }

  /**
   * STEP 2: Resolve the outcome. Called AFTER confirmed token debit.
   * Uses crypto.randomInt() — never Math.random().
   * Result is deterministic from the RNG — no post-hoc manipulation possible.
   */
  resolveOutcome(params: {
    session_id: string;
    game_type: GameType;
    token_tier: number;
    prize_table: Array<{ prize_slot: string; prize_description: string }>;
  }): GameOutcome {
    let outcome_data: Record<string, number>;
    let prize_slot: string;

    switch (params.game_type) {
      case 'DICE': {
        const die1 = randomInt(1, 7); // 1–6 inclusive
        const die2 = randomInt(1, 7);
        const total = die1 + die2;
        outcome_data = { die1, die2, total };
        // Prize slot = the rolled total (2–12). Look up in prize table.
        prize_slot = String(total);
        break;
      }
      case 'SPIN_WHEEL': {
        const segment_index = randomInt(0, params.prize_table.length);
        outcome_data = { segment_index };
        prize_slot = params.prize_table[segment_index]?.prize_slot ?? '0';
        break;
      }
      case 'SLOT_MACHINE': {
        const reel1 = randomInt(0, params.prize_table.length);
        const reel2 = randomInt(0, params.prize_table.length);
        const reel3 = randomInt(0, params.prize_table.length);
        outcome_data = { reel1, reel2, reel3 };
        // Three-of-a-kind = top prize; two-of-a-kind = mid prize; else = consolation
        if (reel1 === reel2 && reel2 === reel3) {
          prize_slot = 'THREE_OF_A_KIND';
        } else if (reel1 === reel2 || reel2 === reel3 || reel1 === reel3) {
          prize_slot = 'TWO_OF_A_KIND';
        } else {
          prize_slot = 'NO_MATCH';
        }
        break;
      }
    }

    this.logger.log('GameEngineService: outcome resolved', {
      session_id: params.session_id,
      game_type: params.game_type,
      token_tier: params.token_tier,
      prize_slot,
      rule_applied_id: this.RULE_ID,
    });

    return {
      session_id: params.session_id,
      game_type: params.game_type,
      token_tier: params.token_tier,
      outcome_data,
      prize_slot,
      resolved_at_utc: new Date().toISOString(),
      rule_applied_id: this.RULE_ID,
    };
  }
}
```

**Validation:**
- `npx tsc --noEmit` — zero errors.
- `resolveOutcome()` for DICE always returns `die1 + die2 === total`.
- `die1` and `die2` always between 1–6 inclusive.
- No `Math.random()` anywhere in this file — grep confirms.
- `initiatePlay()` rejects token_tier = 30 (not in [25, 45, 60]).

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/GM-001-GAME-ENGINE-SERVICE.md`

---

## PRIORITY TIER 4 — WORM EXPORT, ZONE-GPT PROPOSAL, SOVEREIGN CAC

These are compliance infrastructure items. Do not start until Tier 3 is complete
unless instructed otherwise by Program Control.

---

### DIRECTIVE: GOV-002
**Status:** `[ ] TODO`
**Commit prefix:** `GOV:`
**Target path:** `services/core-api/src/compliance/worm-export.service.ts`
**Risk class:** R0

**Task:** Create the WORM audit snapshot export service.
Must produce a hash-sealed, ordered export of `audit_events` for a given date range.
Output written to deterministic path. Integrity verification function included.
(Implementation spec to be generated by Program Control on request — mark this item
`NEEDS_SPEC` and issue a HARD_STOP if reached without a spec.)

**Status note:** `[ ] NEEDS_SPEC — do not implement until full spec issued by Program Control`

---

### DIRECTIVE: GOV-003
**Status:** `[ ] TODO`
**Commit prefix:** `GOV:`
**Target path:** `services/zone-gpt/src/proposal.service.ts`
**Risk class:** R1

**Task:** Create the ZONE-GPT Proposal Object service.
Per Corpus Ch.8 §6: every AI proposal must carry proposal_id, proposal_type,
reference_object_id, rationale, canonical_basis, suggested_action, confidence_score,
timestamp. Humans must ACCEPT / REJECT / MODIFY. Decision must be logged.
(Implementation spec to be generated on request.)

**Status note:** `[ ] NEEDS_SPEC — do not implement until full spec issued by Program Control`

---

### DIRECTIVE: GOV-004
**Status:** `[ ] TODO`
**Commit prefix:** `GOV:`
**Target path:** `services/core-api/src/compliance/sovereign-cac.middleware.ts`
**Risk class:** R0

**Task:** Sovereign CaC jurisdiction middleware. Implements Bill S-210 age gating
and Bill 149 (ON) AI disclosure requirement. Jurisdiction-configurable per Corpus
Appendix J. Country-to-restriction map versioned in GovernanceConfigService.
(Implementation spec to be generated on request.)

**Status note:** `[ ] NEEDS_SPEC — do not implement until full spec issued by Program Control`

---

## STANDING INVARIANTS (apply to every directive)

These rules are non-negotiable. Violation = HARD_STOP.

1. **No UPDATE or DELETE on ledger_entries, audit_events, game_sessions, call_sessions,
   voucher_vault** — ever. Correction = new offsetting entry.

2. **All FIZ-scoped commits require the full four-line format.** Missing any of
   `REASON:`, `IMPACT:`, `CORRELATION_ID:` = reject and restart.

3. **No hardcoded financial constants.** Every number comes from
   `governance.config.ts`. If a constant is missing, add it there first (FIZ:
   commit), then use it.

4. **`crypto.randomInt()` only for all game outcomes.** `Math.random()` is prohibited.

5. **No `@angular/core` imports** in any file under `finance/`, `services/core-api/`,
   or `services/bijou/`. Framework is NestJS throughout.

6. **`npx tsc --noEmit` must pass with zero errors** before any commit is made.

7. **Every new service file must include a `Logger` instance** with the class name
   and log the key decision points (resolution, debit, outcome) at `log` or `warn`
   level as appropriate.

8. **Report-back files are mandatory.** A directive is not complete until its
   `PROGRAM_CONTROL/REPORT_BACK/<ID>.md` exists with SUCCESS confirmed.

---

*End of CLAUDE_CODE_BACKLOG.md — Version 1.0*
*Next version to be issued by Program Control (Claude Chat session) after Tier 1 completion.*
*All changes to this file require human authorization from Kevin B. Hartley / Program Control.*
