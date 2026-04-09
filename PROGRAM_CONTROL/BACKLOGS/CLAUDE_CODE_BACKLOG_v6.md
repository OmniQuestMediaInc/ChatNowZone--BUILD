# CLAUDE CODE BACKLOG v6 — ChatNow.Zone

**Authority:** OmniQuest Media Inc. | CEO Kevin B. Hartley
**Backlog Version:** 6.0
**Supersedes:** v5 (Tier 7 complete)
**Platform Time Standard:** America/Toronto
**Canonical Authority:** OQMI Coding Doctrine v2.0 · Canonical Corpus v10
**Theme:** Payment Processor Integration + Diamond Tier Mechanics

---

## RATIONALE

L0 compliance is locked (Tier 6). Compliance hardening is complete (v5).
The critical path to revenue is live payment processing. V6 closes the gap
between a compliant platform and a revenue-generating one.

Sequence logic:
- Processor webhooks must be hardened before any live transaction volume
- Diamond tier contracts must be automated before high-value accounts onboard
- Token holds must be enforced before chargebacks become a liability
- Payout scheduling must be live before creator earnings accumulate
- Chargeback automation completes the end-to-end money loop

---

## TIER 8 — PAYMENT PROCESSOR + DIAMOND TIER

Gate: All v5 code directives complete. GOV-FINTRAC + GOV-AGCO legal opinions
in hand before any directive in this tier goes to Claude Code.

---

### DIRECTIVE: PROC-001

**Status:** `[ ] TODO`
**Commit prefix:** `FIZ:`
**Target path:** `services/core-api/src/payments/webhook-hardening.service.ts` (CREATE)
**Risk class:** R0 (FIZ-prefix — four-line commit format required)
**Gate:** v5 complete. GOV-FINTRAC + GOV-AGCO opinions confirmed.

**Context:**
FIZ-003 LedgerService has basic webhook signature validation in place.
Gap: no replay attack prevention, no idempotency stress testing, no
multi-processor normalization layer. Processors: Stripe, CCBill, Epoch.
Each has different signature schemes and event shapes.

**Scope:**
- `WebhookHardeningService` — multi-processor webhook normalization
- Signature validation per processor (HMAC-SHA256 for Stripe,
  CCBill proprietary hash, Epoch callback validation)
- Replay attack prevention: timestamp window enforcement (5-minute max drift)
  + nonce store (Redis-backed or DB-backed, append-only)
- Idempotency: event_id deduplication before ledger write
- NATS event on validation failure with processor_id + failure_reason
- Dead letter queue hook for failed webhooks (advisory — human review required)
- rule_applied_id on every output

**FIZ commit format required.**

**Validation:**
- [ ] Stripe HMAC-SHA256 signature validates correctly
- [ ] CCBill hash validates correctly
- [ ] Replay attack rejected when timestamp drift > 5 minutes
- [ ] Duplicate event_id rejected before ledger write
- [ ] NATS published on every validation failure
- [ ] npx tsc --noEmit zero new errors

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/PROC-001-WEBHOOK-HARDENING.md`

---

### DIRECTIVE: PROC-002

**Status:** `[ ] TODO`
**Commit prefix:** `FIZ:`
**Target path:** `services/core-api/src/payments/diamond-contract.service.ts` (CREATE)
**Risk class:** R0 (FIZ-prefix — four-line commit format required)
**Gate:** PROC-001 on main.

**Context:**
Diamond tier accounts (volume + velocity threshold) require a signed
Digital High-Volume Liquidity Agreement before elevated token rates activate.
Currently manual. Must be automated: threshold detection → contract generation
→ signing workflow → rate activation.

**Scope:**
- `DiamondContractService`
- Diamond threshold detection (volume + velocity from GovernanceConfig)
- Contract generation: produces agreement record with account_id, tier,
  rates, effective_date, expiry_date
- Signing workflow: tracks unsigned → signed → active states
- Rate activation: only after signed confirmation received
- NATS events: contract_generated, contract_signed, rate_activated
- Append-only contract log — no UPDATE or DELETE
- step-up required for rate activation (COMPLIANCE role)
- rule_applied_id on every output

**FIZ commit format required.**

**Validation:**
- [ ] Contract not generated below Diamond threshold
- [ ] Rate does not activate before signed confirmation
- [ ] Contract log is append-only
- [ ] NATS published on generate, sign, activate
- [ ] step-up required for rate activation
- [ ] npx tsc --noEmit zero new errors

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/PROC-002-DIAMOND-CONTRACT.md`

---

### DIRECTIVE: PROC-003

**Status:** `[ ] TODO`
**Commit prefix:** `FIZ:`
**Target path:** `services/core-api/src/payments/token-hold.service.ts` (CREATE)
**Risk class:** R0 (FIZ-prefix — four-line commit format required)
**Gate:** PROC-001 on main.
**Parallel-safe with:** PROC-002 (disjoint paths)

**Context:**
Token purchases require a hold period before tokens are released to the
creator earnings pool. Currently manual. Hold windows:
- Credit card: 3–5 business days (chargeback risk window)
- Bitcoin / e-transfer: 24 hours (confirmation window)
Hold must be enforced in the Three-Bucket Wallet (FIZ-003) before
any creator disbursement eligibility is calculated.

**Scope:**
- `TokenHoldService`
- Hold windows read from GovernanceConfig (never hardcoded)
- Hold record: payment_id, payment_method, hold_start_utc, hold_release_utc,
  status (HELD / RELEASED / REVERSED)
- Release trigger: automated on hold_release_utc crossing (scheduler hook)
- NATS events: hold_applied, hold_released, hold_reversed
- Append-only hold log
- Integration point with Three-Bucket Wallet: tokens not eligible for
  disbursement until hold status is RELEASED
- rule_applied_id on every output

**FIZ commit format required.**

**Validation:**
- [ ] CC hold window reads from GovernanceConfig
- [ ] Bitcoin/e-transfer hold window reads from GovernanceConfig
- [ ] Tokens blocked from disbursement while status is HELD
- [ ] NATS published on apply, release, reverse
- [ ] Hold log is append-only
- [ ] npx tsc --noEmit zero new errors

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/PROC-003-TOKEN-HOLD.md`

---

### DIRECTIVE: PROC-004

**Status:** `[ ] TODO`
**Commit prefix:** `FIZ:`
**Target path:** `services/core-api/src/payments/payout-scheduling.service.ts` (CREATE)
**Risk class:** R0 (FIZ-prefix — four-line commit format required)
**Gate:** PROC-003 on main.

**Context:**
Creator earnings accumulate in the Three-Bucket Wallet. Payout scheduling
converts eligible earnings into disbursement records on a hemisphere-based
schedule, then produces a My Bookkeeper export for accounting reconciliation.
Currently no automated scheduling exists.

**Scope:**
- `PayoutSchedulingService`
- Hemisphere-based schedule: North America / Europe windows from GovernanceConfig
- Eligibility check: TokenHoldService.isReleased() before inclusion
- Disbursement record: creator_id, amount_cents, currency, scheduled_for_utc,
  status (SCHEDULED / PROCESSING / COMPLETED / FAILED), payout_method
- My Bookkeeper export: CSV-format disbursement report per pay period
  (creator_id, amount, currency, period_start, period_end, payout_method)
- NATS events: payout_scheduled, payout_completed, payout_failed
- Append-only disbursement log — no UPDATE or DELETE except status transitions
  (SCHEDULED → PROCESSING → COMPLETED/FAILED only)
- FairPay floor enforcement: minimum $0.065/token (regular),
  $0.08/token (VIP/ShowZone) — read from GovernanceConfig
- rule_applied_id on every output

**FIZ commit format required.**

**Validation:**
- [ ] Held tokens excluded from payout calculation
- [ ] FairPay floor enforced per GovernanceConfig
- [ ] My Bookkeeper export produces valid CSV
- [ ] Disbursement log is append-only
- [ ] NATS published on schedule, complete, fail
- [ ] npx tsc --noEmit zero new errors

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/PROC-004-PAYOUT-SCHEDULING.md`

---

### DIRECTIVE: PROC-005

**Status:** `[ ] TODO`
**Commit prefix:** `FIZ:`
**Target path:** `services/core-api/src/payments/chargeback.service.ts` (CREATE)
**Risk class:** R0 (FIZ-prefix — four-line commit format required)
**Gate:** PROC-004 on main.

**Context:**
Chargeback handling is partially built (FIZ-003 ledger reversal exists).
Gap: no end-to-end wiring from processor chargeback event → ledger reversal
→ token hold reversal → creator clawback → risk flag. Currently requires
manual intervention at each step.

**Scope:**
- `ChargebackService`
- Processor chargeback event ingestion (via WebhookHardeningService)
- Automated ledger reversal (REVERSAL entry, append-only)
- Token hold reversal: TokenHoldService.reverse()
- Creator clawback: reverse disbursed earnings if within clawback window
  (window duration from GovernanceConfig)
- Risk flag: increment account risk score, notify COMPLIANCE via NATS
- Dispute window tracking: processor dispute deadline from GovernanceConfig
- NATS events: chargeback_received, ledger_reversed, clawback_applied,
  risk_flag_raised
- All operations append-only — no DELETE on ledger or hold records
- rule_applied_id on every output

**FIZ commit format required.**

**Validation:**
- [ ] Ledger reversal is append-only REVERSAL entry
- [ ] Token hold reversed on chargeback
- [ ] Creator clawback only within window (reads GovernanceConfig)
- [ ] Risk flag fires NATS event
- [ ] NATS published on every step
- [ ] npx tsc --noEmit zero new errors

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/PROC-005-CHARGEBACK.md`

---

## STANDING INVARIANTS (unchanged)

Same as v5. All 15 invariants apply.
FIZ-prefix is required for all directives in this tier.

---

*End of CLAUDE_CODE_BACKLOG_v6.md — Version 6.0*
*Next version issued after Tier 8 completion.*
*All changes require human authorization from Kevin B. Hartley / Program Control.*
