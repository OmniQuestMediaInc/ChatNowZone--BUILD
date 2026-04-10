# CLAUDE CODE BACKLOG v6 — ChatNow.Zone

**Authority:** OmniQuest Media Inc. | CEO Kevin B. Hartley
**Backlog Version:** 6.1
**Supersedes:** v6.0 (pre-DFSP spec)
**Platform Time Standard:** America/Toronto
**Canonical Authority:** OQMI Coding Doctrine v2.0 · Canonical Corpus v10
**DFSP Authority:** Diamond Financial Security Platform Engineering Spec v1.0 + v1.1 + v1.1a
**Theme:** Payment Processor Integration + DFSP Full Implementation

---

## RATIONALE

L0 compliance is locked (Tier 6). Compliance hardening and DFSP foundation are complete (v5).
V6 closes the gap between a compliant platform and a revenue-generating one.
DFSP foundation (PV-001) laid the schema and core services. V6 wires the external
integrations: processor, email/SMS delivery, PDF generation, and the remaining
DFSP modules (3–14, 16, 17).

Sequence logic:
- PROC-001 (webhook hardening) is prerequisite for all live transaction volume
- DFSP-001 (OTP + account hold) is prerequisite for contract issuance
- DFSP-002 (dynamic pricing) is prerequisite for contract generation
- PROC-002 (full Diamond contract lifecycle — DFSP Module 8) follows
- DFSP-003 (expedited access) follows contract generation
- PROC-003 (token hold/freeze — DFSP Module 10) runs in parallel
- DFSP-004 (voice sample infrastructure) runs in parallel
- DFSP-005 (post-purchase monitoring jobs) runs after token holds
- PROC-004 (payout scheduling) follows monitoring
- DFSP-006 (dispute package assembler) requires contracts + voice samples
- PROC-005 (chargeback recovery — DFSP Modules 11 capture + 19) follows
- DFSP-007 (treasury override) is independent, low urgency
- DFSP-008 (executive consultation routing) is independent, low urgency
- PROC-004 follows DFSP-005 (payout needs monitoring to be live)

---

## TIER 8 — PAYMENT PROCESSOR + DFSP FULL IMPLEMENTATION

**Gate: All v5 code directives complete. GOV-FINTRAC + GOV-AGCO legal opinions
in hand before any directive in this tier goes to Claude Code.**

> **EXCEPTION — 2026-04-10:** PROC-001 is CEO-AUTHORIZED-STAGED-2026-04-10.
> PROC-001 is scoped to webhook infrastructure only — no ledger writes, no balance
> columns, no transaction execution. DFSP-001 onward still requires GOV-FINTRAC +
> GOV-AGCO legal opinions before execution.

---

### DIRECTIVE: PROC-001

**Status:** `[ ] TODO`
**Commit prefix:** `FIZ:`
**Target path:** `services/core-api/src/payments/webhook-hardening.service.ts` (CREATE)
**Risk class:** R0 (FIZ-prefix — four-line commit format required)
**Gate:** CEO-AUTHORIZED-STAGED-2026-04-10 (scoped to webhook infrastructure only — no ledger writes, no balance columns, no transaction execution).

**Context:**
FIZ-003 LedgerService has basic webhook signature validation. Gap: no replay
attack prevention, no idempotency stress testing, no multi-processor normalization.
Processors in scope: Stripe, CCBill, Epoch.

**Scope:**
- `WebhookHardeningService` — multi-processor webhook normalization layer
- Signature validation per processor (HMAC-SHA256 for Stripe, CCBill proprietary,
  Epoch callback validation)
- Replay attack prevention: 5-minute timestamp window + nonce store (append-only)
- Idempotency: event_id deduplication before any ledger write
- Dead letter queue hook for failed webhooks (advisory — human review required)
- NATS event on every validation failure with processor_id + failure_reason
- rule_applied_id on every output

**FIZ commit format required.**

**Validation:**
- [ ] Stripe HMAC-SHA256 validates correctly
- [ ] Replay rejected when timestamp drift > 5 minutes
- [ ] Duplicate event_id rejected before ledger write
- [ ] NATS published on every validation failure
- [ ] npx tsc --noEmit zero new errors

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/PROC-001-WEBHOOK-HARDENING.md`

---

### DIRECTIVE: DFSP-001

**Status:** `[ ] TODO`
**Commit prefix:** `FIZ:`
**Target path:** `services/core-api/src/dfsp/` (CREATE two services)
**Risk class:** R0 (FIZ-prefix — four-line commit format required)
**Gate:** PROC-001 on main.
**DFSP Modules:** 3 (Platform-Native OTP) + 4 (Account Recovery Hold)

**Context:**
Module 3 replaces third-party 2FA with platform-owned dual-channel OTP for
Diamond/VIP authentication. Module 4 auto-triggers a 48-hour security hold
when contact-information swap attacks are detected during a high-value transaction.
These two are tightly coupled — Module 4 fires on Module 3 failure threshold.

**Scope — PlatformOtpService (Module 3):**
- 7-character alphanumeric OTP (A-Z, 0-9, excluding O/0/I/1/L)
- Format rendered: XXXXXX-Y (hyphen for readability; stored as 7-char without hyphen)
- Generation: `crypto.randomBytes()` — NOT Math.random()
- Delivery channels: email_primary (stub — email provider is v6 infra),
  email_secondary, sms_secondary
- TTL: 15 minutes (from GovernanceConfig.DFSP_OTP_TTL_SECONDS)
- Single use. Invalidated on: success, TTL expiry, 5 failed attempts
- Code stored as bcrypt hash — never plaintext
- Persists to otp_events table (schema already in place from PV-001)
- NATS events: OTP_ISSUED, OTP_VERIFIED, OTP_FAILED, OTP_EXPIRED

**Scope — AccountRecoveryHoldService (Module 4):**
- Trigger conditions: contact-info change attempt, 5 consecutive OTP failures, agent flag
- Hold duration: 48 hours (from GovernanceConfig.DFSP_ACCOUNT_RECOVERY_HOLD_HOURS)
- During hold: all purchases BLOCKED, all gifting BLOCKED, all withdrawals BLOCKED,
  login PERMITTED (read-only), settings changes BLOCKED
- Active transaction on trigger: CANCELLED
- Persists to account_holds table (schema from PV-001)
- NATS events: ACCOUNT_HOLD_APPLIED, ACCOUNT_HOLD_RELEASED
- Release requirements: identity re-verification + hold duration elapsed + agent sign-off
- CEO approval required to shorten hold below 48 hours

**FIZ commit format required.**

**Validation:**
- [ ] OTP is 7-char alphanumeric excluding O/0/I/1/L
- [ ] OTP stored as bcrypt hash (no plaintext)
- [ ] OTP invalidated after 5 failed attempts
- [ ] AccountRecoveryHold triggers on 5 OTP failures
- [ ] Hold blocks purchases while active
- [ ] Hold duration reads from GovernanceConfig
- [ ] NATS published on every OTP and hold event
- [ ] npx tsc --noEmit zero new errors

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/DFSP-001-OTP-ACCOUNT-HOLD.md`

---

### DIRECTIVE: DFSP-002

**Status:** `[ ] TODO`
**Commit prefix:** `FIZ:`
**Target path:** `services/core-api/src/dfsp/dynamic-pricing.service.ts` (CREATE)
**Risk class:** R0 (FIZ-prefix — four-line commit format required)
**Gate:** DFSP-001 on main.
**DFSP Module:** 7 (Dynamic Pricing Engine)

**Context:**
Diamond pricing is quoted, not published. The pricing engine calculates the binding
token rate for a contract given volume, payment method, risk tier, lifespan, and
demand factor. All lookup tables in DB — no business logic hardcoded.

**Scope:**
- `DynamicPricingService`
- Volume discount table: DB-backed, never hardcoded
- Payment method factors: wire/e-transfer 1.00, bitcoin 1.03, credit card 1.07–1.12
  (by card type), prepaid card = REJECT
- Risk premium: per tier (GREEN = 0, AMBER = +x, RED = +y — from config table)
- Lifespan surcharge: applies only for < 60 days; long lifespan NOT penalized (LOCKED)
- Business demand factor: ops-adjustable, default 1.0, loaded from config
- Expedited Access pricing: Platinum rate for advance tranche, Diamond for remainder
- Quote validity: 24 hours default, 48 hours at agent override (from GovernanceConfig)
- All lookup table changes: logged to audit_log with before/after values
- Two-person authorization required for config changes (agent + supervisor)
- Prepaid card rejection returns PAYMENT_METHOD_NOT_ACCEPTED error
- rule_applied_id on every output

**FIZ commit format required.**

**Validation:**
- [ ] Prepaid card returns PAYMENT_METHOD_NOT_ACCEPTED
- [ ] Long lifespan (>= 60 days) applies zero surcharge
- [ ] Sub-30-day lifespan applies correct surcharge
- [ ] Credit card type detection applies correct factor
- [ ] Demand factor 1.0 is default (config-readable)
- [ ] Quote expiry respects GovernanceConfig
- [ ] npx tsc --noEmit zero new errors

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/DFSP-002-DYNAMIC-PRICING.md`

---

### DIRECTIVE: PROC-002

**Status:** `[ ] TODO`
**Commit prefix:** `FIZ:`
**Target path:** `services/core-api/src/dfsp/diamond-contract.service.ts` (CREATE)
**Risk class:** R0 (FIZ-prefix — four-line commit format required)
**Gate:** DFSP-002 on main.
**DFSP Modules:** 6 (Quote Configurator) + 8 (Contract Generation & Lifecycle)

**Context:**
Full Diamond contract lifecycle — from quote session to signed contract to
payment initiation to token release/freeze. Contract reference format:
CNZ-YYYY-XXXXXXXX. One payment method per contract — locked at acceptance.
Payment method change after acceptance = new contract, new auth cycle.

**Scope — QuoteConfiguratorService (Module 6):**
- Inputs: token_qty (10k–100k, step 1k), lifespan (30/60/90/180/366 days),
  payment method, account tier
- Output: indicative rate RANGE (min/max) — never a single precise price at this stage
- Requote feature: pre-populates from last completed Diamond contract
- Agent handoff: generates agent_intake_packet with risk score + flags + configurator inputs
- 100K+ threshold: no rate generated; routes to Module 17 (executive consultation)
- Persists to quote_sessions table (schema from PV-001)

**Scope — DiamondContractService (Module 8):**
- Contract generation trigger: OTP verified (DFSP-001) + agent confirmation
- Contract content: all required fields per DFSP Spec Module 8 (human-readable ref,
  guest name, token qty, lifespan, exact expiry date, contracted rate, total price,
  payment method, expedited access terms if applicable, no-refund clause full text,
  CARF amount, integrity hold amount, governing law, offer expiry timestamp)
- Contract statuses: draft → issued → viewed → accepted → payment_initiated →
  payment_cleared | payment_failed → tokens_released | tokens_frozen
- PDF generation: produces signed immutable PDF (PDF/A format) — use pdfkit or equivalent
- Delivery: unique time-limited URL (expires with contract offer) sent to guest email
- Digital acceptance: records timestamp, IP, browser fingerprint, session token hash
- Acceptance generates signed immutable acceptance receipt
- Persists to diamond_contracts table (schema from PV-001)
- Contract log is append-only — no DELETE, no UPDATE except status transitions
- NATS events: CONTRACT_GENERATED, CONTRACT_VIEWED, CONTRACT_ACCEPTED,
  PAYMENT_INITIATED, TOKENS_RELEASED, TOKENS_FROZEN
- rule_applied_id on every output

**FIZ commit format required.**

**Validation:**
- [ ] Contract ref format is CNZ-YYYY-XXXXXXXX
- [ ] Rate does not activate before signed acceptance
- [ ] Payment method locked at acceptance
- [ ] Payment method change triggers new contract creation
- [ ] 100K+ routes to executive consultation, not configurator
- [ ] PDF generated and stored at contract issuance
- [ ] Contract log is append-only
- [ ] NATS published on every status transition
- [ ] npx tsc --noEmit zero new errors

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/PROC-002-DIAMOND-CONTRACT.md`

---

### DIRECTIVE: DFSP-003

**Status:** `[ ] TODO`
**Commit prefix:** `FIZ:`
**Target path:** `services/core-api/src/dfsp/expedited-access.service.ts` (CREATE)
**Risk class:** R0 (FIZ-prefix — four-line commit format required)
**Gate:** PROC-002 on main.
**DFSP Module:** 9 (Expedited Access)

**Context:**
Expedited Access (formerly Courtesy Advance) allows releasing an advance token
tranche at Platinum rate before full payment clears, for eligible GREEN-tier
accounts with 2+ prior zero-friction Diamond contracts.

**Scope:**
- `ExpeditedAccessService`
- Eligibility: 2+ prior Diamond contracts with status tokens_released, zero friction
  history, current risk tier = GREEN, agent approval, supervisor approval if
  advance_qty > 5,000 OR > 20% of total_qty
- On approval: release advance_qty tokens, apply Platinum rate, set remainder held
- Payment failure: freeze advance tokens immediately, suspend purchase/gifting, notify
- Persists to expedited_access_events table (schema from PV-001)
- NATS events: EXPEDITED_ACCESS_APPROVED, EXPEDITED_ACCESS_TOKENS_RELEASED,
  EXPEDITED_ACCESS_TOKENS_FROZEN
- rule_applied_id on every output

**FIZ commit format required.**

**Validation:**
- [ ] Eligibility rejects if prior contract count < 2
- [ ] Eligibility rejects if risk tier != GREEN (unless supervisor approval)
- [ ] Supervisor approval required when advance_qty > 5000
- [ ] Payment failure freezes tokens immediately
- [ ] NATS published on approve, release, freeze
- [ ] npx tsc --noEmit zero new errors

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/DFSP-003-EXPEDITED-ACCESS.md`

---

### DIRECTIVE: PROC-003

**Status:** `[ ] TODO`
**Commit prefix:** `FIZ:`
**Target path:** `services/core-api/src/payments/token-hold.service.ts` (CREATE)
**Risk class:** R0 (FIZ-prefix — four-line commit format required)
**Gate:** PROC-001 on main.
**Parallel-safe with:** PROC-002, DFSP-003 (disjoint paths)
**DFSP Module:** 10 (Token Hold / Freeze System)

**Context:**
Implements the full token balance state machine from DFSP Module 10.
States: active | held | frozen | expired | revoked.
Partial freeze supported (freeze subset of tokens, balance splitting required).

**Scope:**
- `TokenHoldService`
- State machine: issued → held → active (payment cleared) | frozen (failure/fraud)
- Partial freeze: supports freezing subset of a balance (balance splitting on freeze)
- Hold windows from GovernanceConfig (CC: 3–5 days, Bitcoin/e-transfer: 24 hours)
- Release trigger: scheduled job on hold_release_utc crossing
- Compliance team notified within 1 hour of any Diamond account freeze
- Revocation requires CEO approval for Diamond tier
- Persists to token_balances table (schema from PV-001)
- NATS events: TOKEN_HOLD_APPLIED, TOKEN_HOLD_RELEASED, TOKEN_BALANCE_FROZEN,
  TOKEN_BALANCE_UNFROZEN, TOKEN_BALANCE_EXPIRED, TOKEN_BALANCE_REVOKED
- rule_applied_id on every output

**FIZ commit format required.**

**Validation:**
- [ ] CC hold window reads from GovernanceConfig
- [ ] Bitcoin/e-transfer hold window reads from GovernanceConfig
- [ ] Tokens in HELD state blocked from disbursement
- [ ] Partial freeze creates balance split record
- [ ] Revocation requires CEO approval flag
- [ ] NATS published on every state transition
- [ ] npx tsc --noEmit zero new errors

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/PROC-003-TOKEN-HOLD.md`

---

### DIRECTIVE: DFSP-004

**Status:** `[ ] TODO`
**Commit prefix:** `FIZ:`
**Target path:** `services/core-api/src/dfsp/voice-sample.service.ts` (CREATE)
**Risk class:** R0 (FIZ-prefix — four-line commit format required)
**Gate:** PROC-001 on main.
**Parallel-safe with:** PROC-002, PROC-003 (disjoint paths)
**DFSP Module:** 5 (Voice Sample Collection & Disclosure)

**Context:**
Collects and manages call audio sample metadata for future voiceprint identity
verification. Vendor integration deferred to Phase 2 — this directive builds
the infrastructure and consent management.

**Scope:**
- `VoiceSampleService`
- Consent management: YES/NO per call, timestamped, stored on call record
- If consent refused: transaction CANNOT proceed, refusal logged to risk profile
- File reference stored as encrypted path — never expose directly
- Auto-generates internal account note after 2nd and 3rd samples collected
- Retention: lesser of 7 years or resolution of related dispute
- Disposal: mandatory and logged to retention_disposal_log
- Persists to voice_samples table (schema from PV-001)
- NATS events: VOICE_SAMPLE_CONSENT_GRANTED, VOICE_SAMPLE_CONSENT_REFUSED,
  VOICE_SAMPLE_RECORDED, VOICE_SAMPLE_DISPOSED
- rule_applied_id on every output

**FIZ commit format required.**

**Validation:**
- [ ] Transaction blocked when consent refused
- [ ] Refusal logged to account risk profile
- [ ] File reference stored as encrypted path (not raw)
- [ ] Account note generated after 2nd and 3rd samples
- [ ] Retention until calculated correctly
- [ ] npx tsc --noEmit zero new errors

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/DFSP-004-VOICE-SAMPLE.md`

---

### DIRECTIVE: DFSP-005

**Status:** `[ ] TODO`
**Commit prefix:** `FIZ:`
**Target path:** `services/core-api/src/dfsp/monitoring/` (CREATE — multiple files)
**Risk class:** R1
**Gate:** PROC-003 on main.
**DFSP Modules:** 12 (Post-Purchase Monitoring) + 13 (Model-Side Flagging)

**Context:**
Five background monitoring jobs run on schedules to detect fraud patterns
post-purchase. Model-side flagging triggers compliance review on creator accounts
when concentrated Diamond-tier spend is detected.

**Scope — MonitoringJobsService (Module 12):**
- Job 1 VELOCITY_CHECK: every 6 hours — multiple Diamond purchases, shared payment
  methods across accounts, structuring patterns (85–99% of threshold)
- Job 2 FLUSH_CHECK: every 1 hour — single gift ≥ 5,000 tokens in 24h,
  total gifts > 10% of active Diamond balance in 24h, 50% spend in 10 days
- Job 3 TIP_CORRELATION_CHECK: daily — non-menu-correlated tips + no session +
  payout requested within 120 min
- Job 4 GEOGRAPHIC_DRIFT_CHECK: daily — > 80% logins outside billing country for
  90+ consecutive days, VPN on Diamond transaction
- Job 5 STRUCTURING_SCAN: nightly cross-account — threshold avoidance patterns
- All thresholds configurable from GovernanceConfig — never hardcoded
- Persists to monitoring_flags table (schema from PV-001)
- NATS events: MONITORING_FLAG_RAISED, MONITORING_FLAG_RESOLVED

**Scope — ModelSideFlaggingService (Module 13):**
- Triggers: single Diamond guest sends ≥ 5,000 tokens to model in 24h,
  flush flag targets this model, 3+ distinct Diamond guests send tokens in 24h,
  model requests payout within 120 min of non-correlated tip
- Sets enhanced_monitoring state on model account (internal flag, no guest impact)
- Compliance review queued within 24 hours
- Persists to model_flags table (schema from PV-001)
- NATS events: MODEL_FLAG_RAISED, MODEL_MONITORING_STATE_CHANGED

**FIZ commit format required.**

**Validation:**
- [ ] VELOCITY_CHECK fires every 6 hours
- [ ] FLUSH_CHECK gift threshold reads from GovernanceConfig
- [ ] Structuring pattern detection covers 85–99% of threshold
- [ ] ModelSideFlag triggers on 5000+ token gift from single Diamond guest
- [ ] Enhanced monitoring state does not affect guest-facing behaviour
- [ ] NATS published on flag raise and resolve
- [ ] npx tsc --noEmit zero new errors

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/DFSP-005-MONITORING-JOBS.md`

---

### DIRECTIVE: DFSP-006

**Status:** `[ ] TODO`
**Commit prefix:** `FIZ:`
**Target path:** `services/core-api/src/dfsp/dispute-package.service.ts` (CREATE)
**Risk class:** R0 (FIZ-prefix — four-line commit format required)
**Gate:** PROC-002 + DFSP-004 on main.
**DFSP Module:** 14 (Dispute Package Assembler)

**Context:**
Auto-assembles all transaction evidence into a standardized dispute response
package on chargeback notification. SLA: package available within 15 minutes
of payment clearance (pre-built, not assembled on demand).

**Scope:**
- `DisputePackageService`
- Pre-build trigger: fires at payment_cleared status on every Diamond contract
- Package contents: contract PDF, acceptance record, OTP event, call recording
  reference, agent notes, risk assessment, IP geolocation at acceptance,
  device fingerprint, integrity hold capture event, no-refund acknowledgment extract,
  account history summary
- Output: PDF bundle (dispute_package_CNZ-XXXXXXXX.pdf) + JSON manifest
- Delivery: NATS event to chargeback response inbox; auto-attached to dispute record
- SLA enforcement: package ready before any dispute is filed (pre-built on clearance)
- rule_applied_id on every output

**FIZ commit format required.**

**Validation:**
- [ ] Package pre-built within 15 minutes of payment_cleared
- [ ] Package includes all 12 required components
- [ ] JSON manifest generated alongside PDF
- [ ] NATS published on package build complete
- [ ] npx tsc --noEmit zero new errors

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/DFSP-006-DISPUTE-PACKAGE.md`

---

### DIRECTIVE: PROC-004

**Status:** `[ ] TODO`
**Commit prefix:** `FIZ:`
**Target path:** `services/core-api/src/payments/payout-scheduling.service.ts` (CREATE)
**Risk class:** R0 (FIZ-prefix — four-line commit format required)
**Gate:** DFSP-005 + PROC-003 on main.

**Context:**
Creator earnings accumulate in the Three-Bucket Wallet. Payout scheduling
converts eligible earnings into disbursement records on a hemisphere-based
schedule, then produces a My Bookkeeper export for accounting reconciliation.

**Scope:**
- `PayoutSchedulingService`
- Hemisphere-based schedule: North America / Europe windows from GovernanceConfig
- Eligibility: TokenHoldService.isReleased() required before inclusion
- FairPay floor: $0.065/token regular, $0.08/token VIP/ShowZone (GovernanceConfig)
- My Bookkeeper export: CSV per pay period
- Disbursement log is append-only
- NATS events: PAYOUT_SCHEDULED, PAYOUT_COMPLETED, PAYOUT_FAILED
- rule_applied_id on every output

**FIZ commit format required.**

**Validation:**
- [ ] Held tokens excluded from payout calculation
- [ ] FairPay floor enforced per GovernanceConfig
- [ ] My Bookkeeper export produces valid CSV
- [ ] NATS published on schedule, complete, fail
- [ ] npx tsc --noEmit zero new errors

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/PROC-004-PAYOUT-SCHEDULING.md`

---

### DIRECTIVE: PROC-005

**Status:** `[ ] TODO`
**Commit prefix:** `FIZ:`
**Target path:** `services/core-api/src/payments/chargeback.service.ts` (CREATE)
**Risk class:** R0 (FIZ-prefix — four-line commit format required)
**Gate:** DFSP-006 + PROC-004 on main.
**DFSP Modules:** 11 (integrity hold capture) + 19 (Chargeback Fee Recovery)

**Context:**
End-to-end chargeback wiring: processor event → integrity hold capture → ledger
reversal → token freeze → creator clawback → risk flag → collections queue if
hold insufficient. CARF (Chargeback Administration and Recovery Fee) is
contractually established; recovery is mandatory.

**Scope:**
- `ChargebackService`
- Integrity hold capture on chargeback webhook receipt (calls IntegrityHoldService)
- Automated ledger reversal (REVERSAL entry, append-only)
- Token freeze: TokenHoldService.freeze()
- Creator clawback within clawback window (GovernanceConfig)
- Collections queue: if hold < CARF amount, outstanding amount goes to
  collections_queue table (schema from PV-001)
  - 30-day non-payment → account suspended
  - 60-day non-payment → external collections referral
- Risk flag: increment account risk score, notify COMPLIANCE
- CARF_AMOUNT stored as separate field on contract record (may diverge from hold over time)
- NATS events: CHARGEBACK_RECEIVED, INTEGRITY_HOLD_CAPTURED (via IntegrityHoldService),
  LEDGER_REVERSED, CLAWBACK_APPLIED, RISK_FLAG_RAISED, COLLECTIONS_QUEUED
- All operations append-only
- rule_applied_id on every output

**FIZ commit format required.**

**Validation:**
- [ ] Integrity hold captured immediately on chargeback webhook
- [ ] Ledger reversal is append-only REVERSAL entry
- [ ] Creator clawback only within window (GovernanceConfig)
- [ ] Collections queue record created when hold < CARF
- [ ] Account suspended at 30 days non-payment
- [ ] NATS published on every step
- [ ] npx tsc --noEmit zero new errors

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/PROC-005-CHARGEBACK.md`

---

### DIRECTIVE: DFSP-007

**Status:** `[ ] TODO`
**Commit prefix:** `FIZ:`
**Target path:** `services/core-api/src/dfsp/treasury-override.service.ts` (CREATE)
**Risk class:** R0 (FIZ-prefix — four-line commit format required)
**Gate:** PROC-002 on main. Independent — parallel-safe with PROC-003 through PROC-005.
**DFSP Module:** 16 (Treasury Override — Exceptional Payment Plans)

**Context:**
Exceptional multi-installment payment plans. NOT a standard product. Admin-only.
Requires full six-party approval chain: CEO + CFO + Director of Compliance +
Director of Finance + Legal counsel + requesting agent (initiates, does not approve).
Sequential approval — any rejection closes the request for 90 days.

**Scope:**
- `TreasuryOverrideService`
- Approval workflow: sequential, 48-hour window per approver
- Any rejection: request closed, 90-day lockout for same account
- On approval: tokens held in escrow until all installments clear
- Missed payment: remaining tokens frozen, full outstanding accelerated
- Approval chain logged immutably (TreasuryOverride record, append-only)
- Separate legal instrument required (reference stored, not generated here)
- Persists to treasury_overrides table (schema from PV-001)
- NATS events: TREASURY_OVERRIDE_REQUESTED, TREASURY_OVERRIDE_APPROVED,
  TREASURY_OVERRIDE_REJECTED, TREASURY_OVERRIDE_DEFAULTED
- rule_applied_id on every output

**FIZ commit format required.**

**Validation:**
- [ ] Standard product UI has no access to Treasury Override workflow
- [ ] Rejection closes request and sets 90-day lockout
- [ ] Sequential approval chain enforced (not parallel)
- [ ] Tokens remain in escrow until all installments clear
- [ ] NATS published on request, approve, reject, default
- [ ] npx tsc --noEmit zero new errors

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/DFSP-007-TREASURY-OVERRIDE.md`

---

### DIRECTIVE: DFSP-008

**Status:** `[ ] TODO`
**Commit prefix:** `FIZ:`
**Target path:** `services/core-api/src/dfsp/executive-consultation.service.ts` (CREATE)
**Risk class:** R1
**Gate:** PROC-002 on main. Independent — parallel-safe.
**DFSP Module:** 17 (Executive Visual Call Booking — 100K+ Threshold)

**Context:**
Routes purchases above 100,000 tokens to a bespoke executive consultation via
mandatory video call. Audio-only is not an accepted fallback. Visual channel
enforcement is absolute.

**Scope:**
- `ExecutiveConsultationService`
- Trigger: configurator reaches 100K ceiling + guest confirms "need more"
- Guest intake: desired qty (free-form), 3 preferred date/time options, language
- Routes to Diamond Executive Sales Lead queue
- Visual channel MANDATORY — if guest declines video, call does not proceed,
  refusal event logged to account risk profile
- Recording: same consent + storage requirements as VoiceSampleService (DFSP-004)
- Persists to executive_consultations table (schema from PV-001)
- NATS events: EXECUTIVE_CONSULTATION_REQUESTED, EXECUTIVE_CONSULTATION_SCHEDULED,
  EXECUTIVE_CONSULTATION_COMPLETED, EXECUTIVE_CONSULTATION_VIDEO_REFUSED
- rule_applied_id on every output

**FIZ commit format required.**

**Validation:**
- [ ] Video refusal logs to account risk profile
- [ ] Video refusal prevents consultation from proceeding
- [ ] Desired qty stored as free-form text (no rate calculated)
- [ ] Recording consent same as VoiceSampleService
- [ ] NATS published on request, schedule, complete, refusal
- [ ] npx tsc --noEmit zero new errors

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/DFSP-008-EXECUTIVE-CONSULTATION.md`

---

## STANDING INVARIANTS (unchanged)

Same as v5. All 15 invariants apply.
FIZ-prefix is required for all directives in this tier (four-line commit format).

---

## EXECUTION ORDER

```
PROC-001 ──────────────────────────────────────────────────────────────┐
                                                                        │
DFSP-001 (OTP + AccountHold) ──────────────────────────────────────┐   │
                                                                    │   │
DFSP-002 (Dynamic Pricing) ──────────────────────────────────────┐ │   │
                                                                  │ │   │
PROC-002 (Diamond Contract) ─────────────────────────────────┐   │ │   │
                                                             ↓   │ │   │
DFSP-003 (Expedited Access) ─────────────────────────┐       │   │ │   │
                                                     │       │   │ │   │
PROC-003 (Token Hold) ────────────────────────┐      │       │   │ │   │
DFSP-004 (Voice Sample) ─────────────────┐    │      │       │   │ │   │
                                         │    │      │       │   │ │   │
DFSP-005 (Monitoring + Model Flags) ─────┼────┘      │       │   │ │   │
                                         │           │       │   │ │   │
DFSP-006 (Dispute Package) ──────────────┘           │       │   │ │   │
                                                     ↓       │   │ │   │
PROC-004 (Payout Scheduling) ────────────────────────┘       │   │ │   │
                                                     ↓       │   │ │   │
PROC-005 (Chargeback) ───────────────────────────────────────┘   │ │   │
                                                                  │ │   │
DFSP-007 (Treasury Override) ────────────────────────────────────┘ │   │
DFSP-008 (Executive Consultation) ─────────────────────────────────┘   │
                                                                        │
All depend on PROC-001 (webhook hardening) ────────────────────────────┘
```

---

*End of CLAUDE_CODE_BACKLOG_v6.md — Version 6.1*
*Next version issued after Tier 8 completion.*
*All changes require human authorization from Kevin B. Hartley / Program Control.*
