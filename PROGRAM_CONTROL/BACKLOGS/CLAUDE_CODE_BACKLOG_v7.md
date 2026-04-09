# CLAUDE CODE BACKLOG v7 — ChatNow.Zone

**Authority:** OmniQuest Media Inc. | CEO Kevin B. Hartley
**Backlog Version:** 7.0
**Supersedes:** v6 (Tier 8 complete)
**Platform Time Standard:** America/Toronto
**Canonical Authority:** OQMI Coding Doctrine v2.0 · Canonical Corpus v10
**Theme:** Creator and Guest-Facing Product Experience

---

## RATIONALE

Compliance is locked (v5). Money moves reliably (v6). V7 is the experience layer —
the product features that creators and guests interact with directly.
The ledger is reconciled, the processor is hardened, the payout schedule is live.
Now we build the surfaces that make those systems legible and valuable to users.

Sequence logic:
- ShowZone Phase 2 extends the room lifecycle established in Tier 6
- ZoneGPT agent hardening makes the AI layer production-grade
- Creator dashboard makes earnings and tooling self-service
- GuestZone CS tooling reduces manual support burden
- Notification automation closes the retention loop

---

## TIER 9 — CREATOR + GUEST-FACING PRODUCT

Gate: All v6 directives complete.

---

### DIRECTIVE: SHOWZONE-002

**Status:** `[ ] TODO`
**Commit prefix:** `SHOWZONE:`
**Target path:** `services/core-api/src/show-zone/` (MODIFY)
**Risk class:** R1
**Gate:** v6 complete.

**Context:**
ShowZone Phase 1 (SHOWZONE-001) implemented the room lifecycle state machine:
room creation, active session, phase triggers, room close. Phase 2 extends
this with the full revenue mechanics: tiered seat pricing (BIJOU-001 baseline),
Phase 2 rate escalation trigger, show end payout calculation, and
multi-performer room support.

**Scope:**
- Phase 2 trigger: auto-escalate token rate at SHOWZONE_PHASE2_TRIGGER event
  (threshold from GovernanceConfig — $0.09/token floor)
- Multi-performer room: support co-host performer_ids on ShowZone room record
- Show end payout: calculate per-performer split at SHOWZONE_SHOW_ENDED
  based on declared split ratios (equal split default)
- Seat pricing tiers: MinSeatGateService (BIJOU-001) integration with
  dynamic seat count enforcement
- NATS events: showzone.phase2.activated, showzone.payout.calculated,
  showzone.split.applied
- All payout calculations read rates from GovernanceConfig
- rule_applied_id on every output

**Validation:**
- [ ] Phase 2 rate activates at correct GovernanceConfig threshold
- [ ] Multi-performer split calculates correctly (equal default)
- [ ] Payout calculation fires at SHOWZONE_SHOW_ENDED
- [ ] NATS published on phase2 activate, payout calculate, split apply
- [ ] npx tsc --noEmit zero new errors

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/SHOWZONE-002-PHASE2.md`

---

### DIRECTIVE: GPT-001

**Status:** `[ ] TODO`
**Commit prefix:** `GPT:`
**Target path:** `services/core-api/src/zone-gpt/` (MODIFY)
**Risk class:** R1
**Gate:** v6 complete.
**Parallel-safe with:** SHOWZONE-002 (disjoint paths)

**Context:**
ZoneGPT ProposalService (GOV-003) handles ACCEPT/REJECT/MODIFY governance
proposals. V7 extends ZoneGPT into a segmented agent architecture:
three distinct agents with isolated context, separate system prompts,
and scoped data access. AI is advisory only in all cases.

**Agents:**
- **Strategy Agent:** platform growth, creator acquisition, pricing strategy.
  Read access: GovernanceConfig, HeatScore, GeoPricing. No financial execution.
- **Compliance Agent:** regulatory posture, incident triage guidance, hold
  recommendations. Read access: AuditChain, LegalHold, IncidentService.
  Output flagged ADVISORY — no enforcement execution.
- **Accounting Agent:** earnings summaries, payout reconciliation queries,
  My Bookkeeper export triggers. Read access: ReconciliationService,
  PayoutSchedulingService. No ledger writes.

**Scope:**
- Agent router: routes query to correct agent by intent classification
- Each agent has isolated system prompt + scoped tool access list
- RAG hardening: retrieval grounded in platform doctrine documents
  (Canonical Corpus, GovernanceConfig) — no hallucinated constants
- All agent outputs tagged with: agent_id, query_id, advisory_flag: true,
  rule_applied_id
- NATS event on agent invocation (for audit trail)

**Validation:**
- [ ] Strategy Agent cannot access LegalHold or AuditChain data
- [ ] Compliance Agent output always carries advisory_flag: true
- [ ] Accounting Agent cannot trigger ledger writes
- [ ] All outputs carry rule_applied_id
- [ ] NATS published on every agent invocation
- [ ] npx tsc --noEmit zero new errors

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/GPT-001-AGENT-SEGMENTATION.md`

---

### DIRECTIVE: DASH-001

**Status:** `[ ] TODO`
**Commit prefix:** `DASH:`
**Target path:** `services/core-api/src/creator/dashboard.service.ts` (CREATE)
**Risk class:** R1
**Gate:** PROC-004 (payout scheduling) on main.

**Context:**
Creators currently have no self-service view of earnings, payout status,
or rate card configuration. DASH-001 provides the data layer for the
creator dashboard UI. My Bookkeeper export (PROC-004) is the accounting
output — DASH-001 makes it human-readable and self-service.

**Scope:**
- `CreatorDashboardService`
- Earnings summary: current period, prior period, lifetime (read from ledger)
- Payout status: next scheduled disbursement, hold release dates, history
- Rate card view: current rates, Diamond tier status, Phase 2 threshold progress
- My Bookkeeper export trigger: creator-initiated CSV download for their
  own earnings records
- HeatScore display: current score + trend (advisory, from HeatScoreService)
- All reads are non-mutating — no ledger writes from dashboard
- rule_applied_id on every output

**Validation:**
- [ ] Earnings summary reads from ledger (no hardcoded values)
- [ ] Payout status reflects TokenHoldService state
- [ ] Rate card reads from GovernanceConfig
- [ ] My Bookkeeper export produces valid CSV for creator's own records
- [ ] No ledger writes from any dashboard method
- [ ] npx tsc --noEmit zero new errors

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/DASH-001-CREATOR-DASHBOARD.md`

---

### DIRECTIVE: CS-001

**Status:** `[ ] TODO`
**Commit prefix:** `CS:`
**Target path:** `services/core-api/src/cs/guest-zone.service.ts` (CREATE)
**Risk class:** R1
**Gate:** DASH-001 on main.

**Context:**
GuestZone CS tooling — unified recovery dashboard for the support team.
Three tabs: Diamond, VIP, ShowZone. Each surfaces account state, transaction
history, hold status, incident history, and available recovery actions.
Reduces manual support burden and enforces RBAC on recovery actions.

**Scope:**
- `GuestZoneService`
- Account state query: wallet balance, hold status, KYC status, incident history
- Diamond tab: contract status, rate tier, high-value transaction log
- VIP tab: membership allocation, ShowZone access history, payout history
- ShowZone tab: room history, phase trigger log, performer split records
- Recovery actions (RBAC-gated):
  - MODERATOR: flag account, suspend stream
  - COMPLIANCE: apply/lift hold, override KYC block
  - ADMIN: manual ledger adjustment (append-only ADJUSTMENT entry)
- All recovery actions require step-up authentication
- Full audit trail on every recovery action
- rule_applied_id on every output

**Validation:**
- [ ] Diamond tab reads contract status from DiamondContractService
- [ ] Recovery actions blocked without correct RBAC role
- [ ] All recovery actions require step-up
- [ ] Ledger adjustment is append-only ADJUSTMENT entry
- [ ] Full audit trail on every action
- [ ] npx tsc --noEmit zero new errors

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/CS-001-GUESTZONE-CS.md`

---

### DIRECTIVE: NOTIFY-001

**Status:** `[ ] TODO`
**Commit prefix:** `NOTIFY:`
**Target path:** `services/core-api/src/notifications/notification.service.ts` (CREATE)
**Risk class:** R1
**Gate:** CS-001 on main.

**Context:**
Notification consent and communication automation. Two critical automations
from the Canonical Corpus:
1. 48-hour expiry warning: notify creator when KYC or membership is expiring
2. Day 46 Last Call: notify creator on Day 46 of 48-day billing cycle
   that last chance to reach FairPay threshold is approaching
All notifications require prior consent (opt-in). No notification sent
without explicit consent record.

**Scope:**
- `NotificationService`
- Consent store: creator_id, notification_type, opted_in, consented_at_utc
- Template registry: typed templates for each notification type
  (KYC_EXPIRY_48H, MEMBERSHIP_EXPIRY_48H, DAY_46_LAST_CALL, PAYOUT_SCHEDULED,
  PAYOUT_COMPLETED, HOLD_RELEASED)
- Trigger hooks:
  - KYC expiry: fires when kyc_expiry_date is within 48 hours
  - Day 46: fires on Day 46 of billing cycle (read billing_start from
    creator record)
- Delivery abstraction: email / in-app / push (channel from creator preference)
- Consent gate: every send checks consent record — no send without opt-in
- NATS event on every notification send and consent change
- rule_applied_id on every output

**Validation:**
- [ ] Notification blocked without consent record
- [ ] KYC_EXPIRY_48H fires at correct window
- [ ] DAY_46_LAST_CALL fires on Day 46 (not Day 47, not Day 45)
- [ ] Template registry covers all notification types
- [ ] NATS published on every send and consent change
- [ ] npx tsc --noEmit zero new errors

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/NOTIFY-001-NOTIFICATION-SERVICE.md`

---

## STANDING INVARIANTS (unchanged)

Same as v5 and v6. All 15 invariants apply.

---

*End of CLAUDE_CODE_BACKLOG_v7.md — Version 7.0*
*Next version issued after Tier 9 completion.*
*All changes require human authorization from Kevin B. Hartley / Program Control.*
