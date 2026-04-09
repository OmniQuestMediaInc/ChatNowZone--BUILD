# DIRECTIVE: INFRA-004
**Status:** `[ ] TODO`
**Commit prefix:** `INFRA:`
**Target path:** `services/core-api/src/compliance/reconciliation.service.ts` (CREATE)
**Risk class:** R0
**Gate:** AUDIT-001 + AUDIT-002 both on main. This is the final L0 gate directive.

## Pre-Flight Audit
```bash
git fetch origin && git reset --hard origin/main
git log --oneline -8
# Confirm AUDIT-001 (audit-chain.service.ts) and AUDIT-002 (legal-hold.service.ts) on main
cat services/core-api/src/compliance/audit-chain.service.ts | grep "AUDIT_CHAIN_v1"
# Must return match
cat services/core-api/src/compliance/legal-hold.service.ts | grep "LEGAL_HOLD_v1"
# Must return match
```

## Context
Canonical Corpus v10, Chapter 10 §2.2 + Appendix F.
"Wallet reconciliation confirmed" is an L0 ship-gate requirement.
This service detects drift between computed wallet balances (derived from
ledger replay) and stored wallet states. It does not correct drift — detection
and escalation only. Correction requires human authorization.
bigint is required for all monetary amounts — no floating point.

## Task: Create services/core-api/src/compliance/reconciliation.service.ts

```typescript
// services/core-api/src/compliance/reconciliation.service.ts
// INFRA: INFRA-004 — Ledger reconciliation service
// Canonical Corpus v10, Chapter 10 §2.2 + Appendix F
// Detects drift between computed (ledger replay) and stored wallet balances.
// DETECTION ONLY — no correction logic permitted in this service.
// Correction requires human authorization via COMPLIANCE role + step-up.
import { Injectable, Logger } from '@nestjs/common';
import { NatsService } from '../nats/nats.service';
import { NATS_TOPICS } from '../../../nats/topics.registry';

export interface WalletBalance {
  user_id: string;
  promotional_bonus_cents: bigint;
  membership_allocation_cents: bigint;
  purchased_tokens_cents: bigint;
  computed_at_utc: string;
}

export interface LedgerReplayEntry {
  entry_type: 'CREDIT' | 'DEBIT' | 'REVERSAL';
  bucket: 'PROMOTIONAL' | 'MEMBERSHIP' | 'PURCHASED';
  amount_cents: bigint;
}

export interface ReconciliationResult {
  drift_detected: boolean;
  drift_by_bucket: {
    promotional_bonus_cents: bigint;
    membership_allocation_cents: bigint;
    purchased_tokens_cents: bigint;
  };
  rule_applied_id: string;
}

export interface ReconciliationReport {
  report_id: string;
  user_id: string;
  drift_detected: boolean;
  computed_balance: WalletBalance;
  stored_balance: WalletBalance;
  drift_by_bucket: ReconciliationResult['drift_by_bucket'];
  generated_at_utc: string;
  rule_applied_id: string;
}

@Injectable()
export class ReconciliationService {
  private readonly logger = new Logger(ReconciliationService.name);
  private readonly RULE_ID = 'RECONCILIATION_v1';

  constructor(private readonly nats: NatsService) {}

  computeBalanceFromLedger(
    user_id: string,
    entries: LedgerReplayEntry[],
  ): WalletBalance {
    let promotional_bonus_cents = 0n;
    let membership_allocation_cents = 0n;
    let purchased_tokens_cents = 0n;

    for (const entry of entries) {
      const delta =
        entry.entry_type === 'CREDIT'
          ? entry.amount_cents
          : entry.entry_type === 'DEBIT' || entry.entry_type === 'REVERSAL'
          ? -entry.amount_cents
          : 0n;

      if (entry.bucket === 'PROMOTIONAL') {
        promotional_bonus_cents += delta;
      } else if (entry.bucket === 'MEMBERSHIP') {
        membership_allocation_cents += delta;
      } else if (entry.bucket === 'PURCHASED') {
        purchased_tokens_cents += delta;
      }
    }

    return {
      user_id,
      promotional_bonus_cents,
      membership_allocation_cents,
      purchased_tokens_cents,
      computed_at_utc: new Date().toISOString(),
    };
  }

  detectDrift(
    computed: WalletBalance,
    stored: WalletBalance,
  ): ReconciliationResult {
    const drift_by_bucket = {
      promotional_bonus_cents:
        computed.promotional_bonus_cents - stored.promotional_bonus_cents,
      membership_allocation_cents:
        computed.membership_allocation_cents - stored.membership_allocation_cents,
      purchased_tokens_cents:
        computed.purchased_tokens_cents - stored.purchased_tokens_cents,
    };

    const drift_detected =
      drift_by_bucket.promotional_bonus_cents !== 0n ||
      drift_by_bucket.membership_allocation_cents !== 0n ||
      drift_by_bucket.purchased_tokens_cents !== 0n;

    return {
      drift_detected,
      drift_by_bucket,
      rule_applied_id: this.RULE_ID,
    };
  }

  buildReport(params: {
    report_id: string;
    computed_balance: WalletBalance;
    stored_balance: WalletBalance;
  }): ReconciliationReport {
    const result = this.detectDrift(
      params.computed_balance,
      params.stored_balance,
    );

    const report: ReconciliationReport = {
      report_id: params.report_id,
      user_id: params.computed_balance.user_id,
      drift_detected: result.drift_detected,
      computed_balance: params.computed_balance,
      stored_balance: params.stored_balance,
      drift_by_bucket: result.drift_by_bucket,
      generated_at_utc: new Date().toISOString(),
      rule_applied_id: this.RULE_ID,
    };

    if (result.drift_detected) {
      this.logger.error('ReconciliationService: drift detected', {
        report_id: report.report_id,
        user_id: report.user_id,
        drift_by_bucket: {
          promotional_bonus_cents: result.drift_by_bucket.promotional_bonus_cents.toString(),
          membership_allocation_cents: result.drift_by_bucket.membership_allocation_cents.toString(),
          purchased_tokens_cents: result.drift_by_bucket.purchased_tokens_cents.toString(),
        },
        rule_applied_id: this.RULE_ID,
      });

      this.nats.publish(NATS_TOPICS.RECONCILIATION_DRIFT_DETECTED, {
        report_id: report.report_id,
        user_id: report.user_id,
        drift_by_bucket: {
          promotional_bonus_cents: result.drift_by_bucket.promotional_bonus_cents.toString(),
          membership_allocation_cents: result.drift_by_bucket.membership_allocation_cents.toString(),
          purchased_tokens_cents: result.drift_by_bucket.purchased_tokens_cents.toString(),
        },
        generated_at_utc: report.generated_at_utc,
        rule_applied_id: this.RULE_ID,
      });
    } else {
      this.logger.log('ReconciliationService: no drift detected', {
        report_id: report.report_id,
        user_id: report.user_id,
        rule_applied_id: this.RULE_ID,
      });
    }

    return report;
  }
}
```

## Task 2: Add ReconciliationService to ComplianceModule providers and exports.

## Task 3: Add NATS topic if not present:
```typescript
RECONCILIATION_DRIFT_DETECTED: 'compliance.reconciliation.drift_detected',
```

## Task 4: Commit and push
```bash
npx tsc --noEmit
git add services/core-api/src/compliance/reconciliation.service.ts
git add services/core-api/src/compliance/compliance.module.ts
git add services/nats/topics.registry.ts
git commit -m "INFRA: INFRA-004 — ReconciliationService ledger drift detection + NATS escalation"
git fetch origin && git rebase origin/main && git push origin HEAD:main
```

## Validation Checklist
- [ ] computeBalanceFromLedger([]) returns all-zero bigint balances
- [ ] computeBalanceFromLedger() correctly accumulates CREDIT and DEBIT per bucket
- [ ] REVERSAL treated as negative (same as DEBIT)
- [ ] detectDrift() returns drift_detected: false when all buckets match exactly
- [ ] detectDrift() returns drift_detected: true when any bucket differs by > 0
- [ ] buildReport() fires NATS on drift, silent on clean
- [ ] All monetary values use bigint — no floating point anywhere
- [ ] No correction logic present anywhere in the service
- [ ] npx tsc --noEmit zero new errors

## Report-Back
File: PROGRAM_CONTROL/REPORT_BACK/INFRA-004-RECONCILIATION-SERVICE.md
Required: commit hash, merge confirmation, tsc output, full validation checklist,
explicit confirmation that no correction logic is present.

---
*INFRA-004 — FINAL L0 GATE DIRECTIVE*
*Program Control / OQMI Coding Doctrine v2.0 / Canonical Corpus v10*
