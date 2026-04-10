# CLAUDE CODE BACKLOG v7 — ChatNow.Zone

**Authority:** OmniQuest Media Inc. | CEO Kevin B. Hartley
**Backlog Version:** 7.1
**Supersedes:** v7.0 (pre-DFSP Module 18)
**Platform Time Standard:** America/Toronto
**Canonical Authority:** OQMI Coding Doctrine v2.0 · Canonical Corpus v10
**DFSP Authority:** Diamond Financial Security Platform Engineering Spec v1.0 + v1.1 + v1.1a
**Theme:** Creator and Guest-Facing Product Experience + DFSP Agent Dashboard

---

## RATIONALE

Compliance is locked (v5). Money moves reliably (v6). V7 is the experience layer —
the product features that creators, guests, and Diamond Concierge agents interact
with directly. The DFSP Agent Dashboard (Module 18) belongs here alongside creator
and guest-facing surfaces — they share the real-time, websocket-connected nature of
operational tooling.

---

## TIER 9 — CREATOR + GUEST-FACING PRODUCT + DFSP AGENT DASHBOARD

**Gate: All v6 directives complete.**

---

### DIRECTIVE: SHOWZONE-002

**Status:** `[ ] TODO`
**Commit prefix:** `SHOWZONE:`
**Target path:** `services/core-api/src/show-zone/` (MODIFY)
**Risk class:** R1
**Gate:** v6 complete.

**Context:**
ShowZone Phase 1 (SHOWZONE-001) implemented the room lifecycle state machine.
Phase 2 extends with full revenue mechanics: tiered seat pricing, Phase 2 rate
escalation trigger, show end payout calculation, and multi-performer room support.

**Scope:**
- Phase 2 trigger: auto-escalate token rate at SHOWZONE_PHASE2_TRIGGER
  (threshold from GovernanceConfig — $0.09/token floor)
- Multi-performer room: co-host performer_ids on ShowZone room record
- Show end payout: per-performer split at SHOWZONE_SHOW_ENDED (equal split default)
- Seat pricing tiers: MinSeatGateService (BIJOU-001) integration
- NATS events: showzone.phase2.activated, showzone.payout.calculated, showzone.split.applied
- All rates from GovernanceConfig
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
**Parallel-safe with:** SHOWZONE-002

**Context:**
ZoneGPT ProposalService (GOV-003) handles governance proposals. V7 extends ZoneGPT
into a segmented three-agent architecture with isolated context and scoped data access.
AI is advisory only in all cases.

**Agents:**
- Strategy Agent: platform growth, creator acquisition, pricing strategy
- Compliance Agent: regulatory posture, incident triage — ADVISORY only, no enforcement
- Accounting Agent: earnings summaries, payout reconciliation — no ledger writes

**Scope:**
- Agent router: intent classification → correct agent
- Each agent: isolated system prompt + scoped tool access list
- RAG hardening: grounded in Canonical Corpus + GovernanceConfig
- All outputs: agent_id, query_id, advisory_flag: true, rule_applied_id
- NATS event on every agent invocation

**Validation:**
- [ ] Strategy Agent cannot access LegalHold or AuditChain
- [ ] Compliance Agent output always carries advisory_flag: true
- [ ] Accounting Agent cannot trigger ledger writes
- [ ] NATS published on every agent invocation
- [ ] npx tsc --noEmit zero new errors

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/GPT-001-AGENT-SEGMENTATION.md`

---

### DIRECTIVE: DFSP-009

**Status:** `[ ] TODO`
**Commit prefix:** `FIZ:`
**Target path:** `services/core-api/src/dfsp/agent-dashboard.service.ts` (CREATE)
**Risk class:** R1
**Gate:** PROC-002 + DFSP-005 + DFSP-006 on main.
**Parallel-safe with:** SHOWZONE-002, GPT-001
**DFSP Module:** 18 (Agent Dashboard)

**Context:**
Unified real-time interface for Diamond Concierge agents and supervisors to manage
all DFSP workflows. Websocket-connected. Role-based access: concierge_agent,
supervisor, compliance, executive.

**Scope:**
- `AgentDashboardService`
- Dashboard data modules (all real-time):
  A. Intake Queue: incoming configurator handoffs, sorted by risk tier (RED first)
  B. Active Contracts: status board for all non-terminal contracts
  C. Monitoring Flags: open flags by type/severity/assignment
  D. Account Hold Management: active holds, time remaining, release queue
  E. Dispute Package Status: open chargebacks, package build status, response deadlines
  F. Voice Sample Tracker: sample count per account (0/1/2/3)
  G. Executive Consultation Queue: incoming 100K+ requests, scheduling board
- Role-based access:
  - concierge_agent: intake queue, OTP verification, contract issuance, call notes, flag review
  - supervisor: all above + Expedited Access approval, account hold management, flag escalation
  - compliance: flags, model flags, dispute packages, structuring reports
  - executive: all above + Treasury Override approval
- Each intake queue item: account summary, risk flags, configurator inputs,
  expedited access eligibility, required action checklist
- NATS subscriptions: real-time updates from all DFSP NATS events
- rule_applied_id on every output

**FIZ commit format required.**

**Validation:**
- [ ] Intake queue sorted by risk tier (RED first, then AMBER, then GREEN)
- [ ] concierge_agent cannot access Treasury Override approval
- [ ] compliance role can see dispute packages and structuring reports
- [ ] Dashboard data updates in real-time via NATS subscription
- [ ] NATS subscriptions do not trigger writes (read-only aggregation)
- [ ] npx tsc --noEmit zero new errors

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/DFSP-009-AGENT-DASHBOARD.md`

---

### DIRECTIVE: DASH-001

**Status:** `[ ] TODO`
**Commit prefix:** `DASH:`
**Target path:** `services/core-api/src/creator/dashboard.service.ts` (CREATE)
**Risk class:** R1
**Gate:** PROC-004 on main.

**Context:**
Creator self-service dashboard data layer. Earnings, payout status, rate card,
My Bookkeeper export trigger, HeatScore. No ledger writes from any dashboard method.

**Scope:**
- `CreatorDashboardService`
- Earnings summary: current/prior/lifetime from ledger (read-only)
- Payout status: next scheduled, hold release dates, history
- Rate card: current rates, Diamond tier status, Phase 2 threshold progress
- My Bookkeeper export: creator-initiated CSV download for their own records
- HeatScore: current + trend (advisory, from HeatScoreService)
- All reads non-mutating
- rule_applied_id on every output

**Validation:**
- [ ] Earnings reads from ledger (no hardcoded values)
- [ ] Payout status reflects TokenHoldService state
- [ ] Rate card reads from GovernanceConfig
- [ ] No ledger writes from any dashboard method
- [ ] npx tsc --noEmit zero new errors

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/DASH-001-CREATOR-DASHBOARD.md`

---

### DIRECTIVE: CS-001

**Status:** `[ ] TODO`
**Commit prefix:** `CS:`
**Target path:** `services/core-api/src/cs/guest-zone.service.ts` (CREATE)
**Risk class:** R1
**Gate:** DASH-001 + DFSP-009 on main.

**Context:**
GuestZone CS tooling — unified recovery dashboard for the support team.
Three tabs: Diamond, VIP, ShowZone. RBAC on all recovery actions.
All recovery actions require step-up authentication.

**Scope:**
- `GuestZoneService`
- Account state: wallet balance, hold status, KYC status, incident history
- Diamond tab: contract status, rate tier, high-value transaction log
- VIP tab: membership allocation, ShowZone access history, payout history
- ShowZone tab: room history, phase trigger log, performer split records
- Recovery actions (RBAC-gated, all require step-up):
  - MODERATOR: flag account, suspend stream
  - COMPLIANCE: apply/lift hold, override KYC block
  - ADMIN: manual ledger adjustment (append-only ADJUSTMENT entry)
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
Notification consent and communication automation. All notifications require
prior explicit opt-in. No notification sent without consent record.

**Scope:**
- `NotificationService`
- Consent store: creator_id, notification_type, opted_in, consented_at_utc
- Template registry: KYC_EXPIRY_48H, MEMBERSHIP_EXPIRY_48H, DAY_46_LAST_CALL,
  PAYOUT_SCHEDULED, PAYOUT_COMPLETED, HOLD_RELEASED
- Trigger hooks: KYC expiry 48h, Day 46 of billing cycle (exact — not 45, not 47)
- Delivery abstraction: email / in-app / push (from creator preference)
- Consent gate: every send checks consent record — no send without opt-in
- NATS event on every send and consent change
- rule_applied_id on every output

**Validation:**
- [ ] Notification blocked without consent record
- [ ] KYC_EXPIRY_48H fires at correct window
- [ ] DAY_46_LAST_CALL fires on Day 46 (not 45, not 47)
- [ ] Template registry covers all notification types
- [ ] NATS published on every send and consent change
- [ ] npx tsc --noEmit zero new errors

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/NOTIFY-001-NOTIFICATION-SERVICE.md`

---

## STANDING INVARIANTS (unchanged)

Same as v5 and v6. All 15 invariants apply.

---

## EXECUTION ORDER
SHOWZONE-002 ──┐
GPT-001 ───────┤  (parallel — disjoint paths)
DFSP-009 ──────┘
│
DASH-001
│
CS-001
│
NOTIFY-001

---

*End of CLAUDE_CODE_BACKLOG_v7.md — Version 7.1*
*Next version issued after Tier 9 completion.*
*All changes require human authorization from Kevin B. Hartley / Program Control.*
