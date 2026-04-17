# REPORT-BACK — MEMB-002

**Directive:** THREAD11-DIRECTIVE-SERIES-001.md — Directive 3 (MEMB-002)
**Agent:** CLAUDE_CODE
**Scope:** FIZ-scoped — MembershipSubscription model + MembershipService
**Branch:** `claude/thread11-directive-series-Zw1Y0`
**Result:** SUCCESS

---

## Summary

Delivered durable membership tier persistence and lifecycle service.
Replaced the MEMB-001 `DAY_PASS` stub in `ZoneAccessService.resolveUserTier`
with `MembershipService.getActiveTier()` so server-side zone enforcement
now resolves against a real per-user record.

---

## Files Created

- `services/core-api/src/membership/membership.service.ts`
- `services/core-api/src/membership/membership.module.ts`
- `PROGRAM_CONTROL/REPORT_BACK/MEMB-002-REPORT-BACK.md` (this file)

## Files Modified

- `prisma/schema.prisma`
  - Added `MembershipTier` enum: `DAY_PASS | ANNUAL | OMNIPASS_PLUS | DIAMOND`
  - Added `MembershipStatus` enum: `ACTIVE | CANCELLED | EXPIRED | GRACE`
  - Added `MembershipBillingInterval` enum: `MONTHLY | QUARTERLY | SEMI_ANNUAL | ANNUAL`
  - Added `MembershipSubscription` model with `@@map("membership_subscriptions")`
    and `@@index([user_id, status])`
  - Added nullable `active_user_marker String? @unique @db.Uuid` shadow field
    to enforce "one ACTIVE subscription per user" at the DB level via Prisma
    schema-only means. MembershipService maintains the marker on every state
    change (set on create, cleared on expire).
- `services/core-api/src/config/governance.config.ts`
  - Added `MEMBERSHIP.DURATION_BONUS` block per ADR-003 exactly as specified:
    `QUARTERLY {3,1} / SEMI_ANNUAL {6,2} / ANNUAL {12,3}`. `MONTHLY`
    intentionally absent — no bonus on monthly billing.
  - No existing constants modified.
- `services/nats/topics.registry.ts`
  - Registered three topics:
    - `MEMBERSHIP_SUBSCRIPTION_CREATED → membership.subscription.created`
    - `MEMBERSHIP_SUBSCRIPTION_CANCELLED → membership.subscription.cancelled`
    - `MEMBERSHIP_SUBSCRIPTION_EXPIRED → membership.subscription.expired`
- `services/core-api/src/zone-access/zone-access.service.ts`
  - Replaced DAY_PASS stub in `resolveUserTier` with
    `membershipService.getActiveTier(userId)`.
  - `MembershipService` injected; no other logic altered.
  - Unused `ZONE_ACCESS_TIERS` import removed.
- `services/core-api/src/zone-access/zone-access.module.ts`
  - Imports `MembershipModule` for DI resolution of `MembershipService`.
- `services/core-api/src/app.module.ts`
  - `MembershipModule` registered before `ZoneAccessModule`.

## Files Confirmed Unchanged

- `services/core-api/src/governance/governance.config.ts` (platform
  governance config — directive targets `src/config/`, not `src/governance/`).
- `services/core-api/src/prisma.service.ts`
- `services/core-api/src/nats/nats.service.ts`
- All existing Prisma models (additive schema only).
- All existing NATS topics (additive only).

---

## GovernanceConfig constants used / added

**Added:**
- `MEMBERSHIP.DURATION_BONUS.QUARTERLY`
- `MEMBERSHIP.DURATION_BONUS.SEMI_ANNUAL`
- `MEMBERSHIP.DURATION_BONUS.ANNUAL`

**Read by MembershipService.createSubscription:**
- `MEMBERSHIP.DURATION_BONUS[billingInterval]`

No hardcoded tier or interval values in service code — enums and
`MEMBERSHIP.DURATION_BONUS` only.

## NATS topic constants used

All references use `NATS_TOPICS.*`:
- `NATS_TOPICS.MEMBERSHIP_SUBSCRIPTION_CREATED`
- `NATS_TOPICS.MEMBERSHIP_SUBSCRIPTION_CANCELLED`
- `NATS_TOPICS.MEMBERSHIP_SUBSCRIPTION_EXPIRED`

No raw subject strings in publish calls.

## Prisma schema diff summary

```
+ enum MembershipTier            { DAY_PASS, ANNUAL, OMNIPASS_PLUS, DIAMOND }
+ enum MembershipStatus          { ACTIVE, CANCELLED, EXPIRED, GRACE }
+ enum MembershipBillingInterval { MONTHLY, QUARTERLY, SEMI_ANNUAL, ANNUAL }
+ model MembershipSubscription (13 fields + timestamps)
    id, user_id, tier, status, billing_interval,
    commitment_months, bonus_months,
    current_period_start, current_period_end, cancelled_at,
    active_user_marker (nullable unique — one-ACTIVE-per-user enforcement),
    organization_id, tenant_id,
    created_at, updated_at
    @@index([user_id, status])
    @@map("membership_subscriptions")
```

`yarn prisma:generate` succeeded (Prisma Client v6.19.3) — schema only,
no migration generated, per directive.

---

## Invariant checklist

| # | Invariant | Result |
|---|-----------|--------|
| 1 | Append-only ledger not touched — `MembershipSubscription` is a lifecycle model, not a ledger | OK |
| 2 | One ACTIVE subscription per user enforced at DB level | OK (via `active_user_marker @unique` + service-maintained) |
| 3 | No hardcoded tier/interval values — GovernanceConfig + enums only | OK |
| 4 | organization_id + tenant_id on all Prisma writes | OK (every `create` includes both; `cancel`/`expire` preserve existing values) |
| 5 | Logger on every MembershipService method | OK (getActiveTier, createSubscription, cancelSubscription, expireSubscription) |
| 6 | rule_applied_id on every state change / NATS payload | OK (`MEMB-002_MEMBERSHIP_v1`) |
| 7 | `npx tsc --noEmit` zero new errors | OK — `yarn typecheck` and `yarn typecheck:api` both pass clean |
| 8 | NATS_TOPICS.* constants only | OK |
| 9 | Multi-tenant mandate | OK |

### Baseline comparison

`yarn typecheck` — 0 errors before, 0 errors after.
`yarn typecheck:api` — 0 errors before, 0 errors after.
(Pre-existing `baseUrl` deprecation warning in tsconfig only; not an error.)

---

## RETIRED-term flag (per DOMAIN_GLOSSARY.md rule)

The directive explicitly uses the `DAY_PASS` tier value, which the domain
glossary marks `RETIRED: day_pass | Retired concept — remove all references`.
MEMB-001 (PR #248, merged) already committed `DAY_PASS` as the stub tier
and in `ZONE_MAP`. This report-back carries that designation forward
unchanged so the series remains internally consistent. CEO/architect
authority required if `DAY_PASS` is to be renamed or removed.

---

## Deviations

- **Branch:** used `claude/thread11-directive-series-Zw1Y0` per agent
  session mandate (harness-specified) instead of the `fiz/memb-002` name
  suggested in the directive body. All commits target this single branch
  throughout the thread.
- **QUEUE → DONE move:** the directive file is the multi-directive
  `THREAD11-DIRECTIVE-SERIES-001.md` containing eight directives. Leaving
  it in `QUEUE/` until all eight Claude Code directives complete; this
  report-back file is the completion marker for Directive 3.

---

## git diff --stat

```
 prisma/schema.prisma                                  | 47 +++++++++++++++++++
 services/core-api/src/app.module.ts                   |  2 +
 services/core-api/src/config/governance.config.ts     |  8 ++++
 services/core-api/src/membership/membership.module.ts | 10 ++++
 services/core-api/src/membership/membership.service.ts | 226 ++++++++++++++++
 services/core-api/src/zone-access/zone-access.module.ts |  3 ++
 services/core-api/src/zone-access/zone-access.service.ts | 17 ++---
 services/nats/topics.registry.ts                      |  5 +++
```

---

## Result

**SUCCESS** — MembershipSubscription model, MembershipService lifecycle,
DURATION_BONUS constants, and three NATS topics all in place.
ZoneAccessService.resolveUserTier now delegates to
MembershipService.getActiveTier. Zero new tsc errors. Ready for PR.
