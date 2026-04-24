# PROGRAM_CONTROL — LAUNCH MANIFEST

**Document ID:** LAUNCH_MANIFEST
**Authority:** Kevin B. Hartley, CEO — OmniQuest Media Inc. (OQMInc™)
**Created:** 2026-04-24 (Payload 9 — Deployment Readiness)
**Governance:** `PROGRAM_CONTROL/DIRECTIVES/QUEUE/OQMI_GOVERNANCE.md` (Canonical Corpus v10)
**Target Launch:** September 2026 (hard deadline: 2026-10-01)

> This manifest documents the key launch-sequence decisions, onboarding flows,
> rate locks, and processor integration stubs required for ChatNow.Zone Alpha
> Launch. Items marked `[ ]` require CEO sign-off or directive execution before
> go/no-go clearance is granted.

---

## 1. Pixel Legacy Creator Onboarding Flow

### 1.1 What is Pixel Legacy?

Pixel Legacy is the founding-creator cohort of ChatNow.Zone — the first
creators onboarded before public launch. These creators receive:
- Rate-locked RedBook earnings floor for life (see §3)
- `welcome_credit_active = true` in the DB (50 promotional tokens on sign-up)
- Priority listing in the Zone directory at launch
- Access to Mic Drop Reveal Sequence (see §2)
- Dedicated Diamond Concierge white-glove onboarding support

### 1.2 Onboarding Steps (Creator Journey)

```
Step 1 — Invite
  Creator receives personalised invite link (unique referral token)
  System: referral_links table (correlation_id tracked)

Step 2 — Account creation
  Creator registers via /auth/register
  KYC flag set: kyc_status = PENDING

Step 3 — KYC / Publish Gate
  Creator submits AV verification documents
  GateGuard AV check triggered (GATEGUARD_AV_CHECK_REQUESTED)
  On pass → kyc_status = VERIFIED, PUBLISH_GATE_APPROVED emitted

Step 4 — Rate lock confirmation
  System checks creator is within first-3,000 cohort
  pixel_legacy_rate_lock table entry created (see §3)
  Creator notified: "Your lifetime rate is locked at [RedBook floor]"

Step 5 — First broadcast
  Creator sets up OBS → receives RTMP ingest key (OBS-001)
  Room-Heat Engine begins monitoring on first stream
  CreatorControl.Zone copilots activated

Step 6 — Welcome credits
  50 promotional tokens credited (PROMOTIONAL_TOKENS bucket)
  AUDIT_IMMUTABLE_PURCHASE emitted for traceability
  welcome_credit_active = false after first use
```

### 1.3 Status

- [x] Referral link tracking (`referral_links` table + `attribution_events`) ✓
- [x] KYC Publish Gate service (KYC-001 ✓)
- [x] GateGuard AV check topics registered (NATS registry ✓)
- [x] Welcome credit logic (`welcome_credit_active` column in schema) ✓
- [ ] Invite link generation endpoint (NEEDS_DIRECTIVE)
- [ ] First-3,000 cohort detection middleware (NEEDS_DIRECTIVE — see §3)
- [ ] Creator notification emails (SendGrid templates — NEEDS_DIRECTIVE)
- [ ] OBS RTMP key provisioning endpoint (NEEDS_DIRECTIVE)

---

## 2. Mic Drop Reveal Sequence

### 2.1 Overview

The Mic Drop Reveal Sequence is the platform's launch event mechanic.
A creator "drops" content visibility progressively — teasing guests with
gated reveals that unlock at spend thresholds or time gates:

```
Phase 1 — Teaser (free, low-res preview visible to all)
Phase 2 — Unlock (requires token spend threshold met in room)
Phase 3 — Reveal (full content unlocked; Room-Heat → HOT/BLAZING)
```

### 2.2 Mechanic Spec

- Room-Heat tier must reach HOT or BLAZING to trigger Phase 2
- Token threshold set by creator via CreatorControl.Zone panel
- Integration Hub fires `HUB_HIGH_HEAT_MONETIZATION` at Phase 2 trigger
- ShowZone `SHOWZONE_PHASE2_TRIGGER` topic fires on reveal
- Cyrano suggestion emitted for high-heat monetisation push at Phase 3
- All phases emit `AUDIT_IMMUTABLE_SPEND` on guest token deduction

### 2.3 Status

- [x] Room-Heat Engine tier computation (COLD/WARM/HOT/BLAZING) ✓
- [x] ShowZone Phase 2 trigger topic registered ✓
- [x] Integration Hub high-heat monetisation flow ✓
- [x] Cyrano suggestion at HOT/BLAZING tier ✓
- [ ] Creator-facing threshold configuration UI (NEEDS_DIRECTIVE — Black-Glass)
- [ ] Phase reveal animation + guest UX (NEEDS_DIRECTIVE — front-end)
- [ ] Phase 1→2→3 state machine persisted to DB (room_sessions table enhancement)
- [ ] End-to-end integration test for full reveal sequence

---

## 3. First 3,000 Creator Rate Lock

### 3.1 Rate Lock Policy

Per the Business Plan and RRR CEO Decisions (`docs/RRR_CEO_DECISIONS_FINAL_2026-04-17.md`):

- The first 3,000 creators to complete KYC onboarding receive a
  **lifetime rate lock** at the RedBook earnings floor.
- Rate lock is frozen at onboarding timestamp; no future RedBook
  rate card revision may reduce their payout below this floor.
- Rate lock is stored in `pixel_legacy` schema with `rate_state = LOCKED`.
- `go_no_go_decision = APPROVED` is written atomically with the rate lock.

### 3.2 Rate Lock Data Schema (required fields)

```sql
-- Required columns on pixel_legacy table (NEEDS schema migration):
creator_id          UUID NOT NULL
locked_rate_usd     NUMERIC(10,6) NOT NULL  -- per token, USD
rate_state          VARCHAR(16) NOT NULL DEFAULT 'LOCKED'
go_no_go_decision   VARCHAR(16) NOT NULL DEFAULT 'APPROVED'
locked_at_utc       TIMESTAMPTZ NOT NULL DEFAULT now()
cohort_sequence_no  INT NOT NULL            -- 1..3000
welcome_credit_active BOOLEAN NOT NULL DEFAULT true
correlation_id      VARCHAR(64) NOT NULL
reason_code         VARCHAR(64) NOT NULL DEFAULT 'PIXEL_LEGACY_RATE_LOCK'
```

> **FIZ Note:** All writes to this table require REASON, IMPACT, and
> CORRELATION_ID in the commit message per OQMI Coding Doctrine v2.0.

### 3.3 Rate Floor (per RedBook §3)

| Creator Tier | Rate Floor (per token, USD) |
|---|---|
| Standard | $0.006 |
| Diamond | $0.012 (DIAMOND_FLOOR_PER_TOKEN_MIN from governance.config.ts) |

First-3,000 rate lock applies the creator's tier floor at the time of
onboarding. Diamond creators locked at $0.012/token minimum.

### 3.4 Status

- [x] `rate_state`, `go_no_go_decision`, `welcome_credit_active` referenced in governance.config.ts ✓
- [x] `REDBOOK_RATE_CARDS.DIAMOND_FLOOR_PER_TOKEN_MIN` constant present ✓
- [ ] `pixel_legacy` table schema migration (FIZ-scoped directive required)
- [ ] Cohort counter service (detect position 1–3000 at KYC approval)
- [ ] Rate lock write + atomic `go_no_go_decision = APPROVED` transaction
- [ ] CEO clearance: `PROGRAM_CONTROL/CLEARANCES/LAUNCH_RATE_LOCK_CLEARANCE.md`

---

## 4. GateGuard Processor LOI Data Package Stub

### 4.1 Purpose

GateGuard Sentinel requires a Letter of Intent (LOI) from the platform's
payment processor partner before going live. This LOI data package stub
documents what must be prepared and submitted.

### 4.2 LOI Package Contents (required for processor sign-off)

| Item | Status |
|---|---|
| Platform name + business entity | OmniQuest Media Inc. — ChatNow.Zone |
| CEO authorised signatory | Kevin B. Hartley |
| Business model description | Live creator monetisation — token-based |
| Estimated monthly GMV (12-month projection) | Per Business Plan financial model |
| AV verification flow description | GateGuard AV module (services/core-api/src/gateguard/) |
| Chargeback prevention mechanism | DFSP Integrity Hold + OTP + Welfare Guardian Scorer |
| Geo-block / restricted regions list | GeoFencing service (GOV-001) |
| Compliance certifications | NCII policy, GDPR/CCPA, legal hold capability |
| Technical integration spec | Webhook hardening (PROC-001), idempotency guarantee |
| Processor ID assigned | `GATEGUARD_LOI_PROCESSOR_ID` (env var — set at signing) |

### 4.3 Status

- [x] GateGuard welfare scoring + AV check architecture scaffolded ✓
- [x] DFSP Integrity Hold + OTP + Voice Sample active ✓
- [x] Webhook hardening (PROC-001) + idempotency ✓
- [x] Geo-block enforcement (GOV-001) ✓
- [ ] Legal review of AV compliance framework
- [ ] Processor LOI drafted + submitted
- [ ] `GATEGUARD_LOI_PROCESSOR_ID` received + set in secrets manager
- [ ] CEO clearance: `PROGRAM_CONTROL/CLEARANCES/GGS_LOI_CLEARANCE.md`
- [ ] Integration test: GateGuard federated lookup to processor endpoint live

---

## 5. Launch Go / No-Go Decision Gate

Final launch decision authority: **Kevin B. Hartley, CEO**.

All 9 gates in `docs/PRE_LAUNCH_CHECKLIST.md` must be green.
The following clearances must be present in `PROGRAM_CONTROL/CLEARANCES/`:

| Clearance File | Condition |
|---|---|
| `PRODUCTION_DEPLOY_CLEARANCE.md` | All pre-launch gates green; CEO signs off |
| `GGS_LOI_CLEARANCE.md` | Processor LOI signed and `GATEGUARD_LOI_PROCESSOR_ID` set |
| `LAUNCH_RATE_LOCK_CLEARANCE.md` | First-3,000 pixel_legacy table seeded and frozen |
| `COMPLIANCE_AUDIT_CLEARANCE.md` | Audit certification + WORM export confirmed |

**No agent may write or clear these files. CEO sign-off only.**

---

## HANDOFF

**What was built (Payload 9):**
- `docker-compose.yml` expanded with all module env vars + streaming SFU scaffold
- `.github/workflows/deploy.yml` created (install → migrate → build → health check)
- `docs/PRE_LAUNCH_CHECKLIST.md` created (9 gates, full launch criteria)
- `docs/ARCHITECTURE_OVERVIEW.md` created (system map + invariants + AWS topology)
- `PROGRAM_CONTROL/LAUNCH_MANIFEST.md` created (this file — Pixel Legacy, Mic Drop, Rate Lock, LOI stub)
- `OQMI_SYSTEM_STATE.md` updated with BUILD COMPLETE banner

**What is intentionally left incomplete (NEEDS_DIRECTIVE):**
- Cyrano Layer 2 (LLM + Prisma memory)
- Room-Heat DB persistence
- `pixel_legacy` table migration (FIZ-scoped)
- OBS Broadcast Kernel (D004)
- Risk Engine (D002)
- Streaming SFU Dockerfile + mediasoup service
- Black-Glass / CreatorControl front-end (G101+)
- AWS ECS task definitions + ECR image publish

**Next agent's first task:**
Author a FIZ-scoped directive to create the `pixel_legacy` schema migration
(`correlation_id`, `reason_code`, `cohort_sequence_no`, `go_no_go_decision`,
`rate_state`, `welcome_credit_active`) and the cohort-counter service that
writes rate locks atomically at KYC approval event (position 1–3000).
