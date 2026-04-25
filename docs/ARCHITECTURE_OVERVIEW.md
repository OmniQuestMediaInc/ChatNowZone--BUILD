# ChatNow.Zone — Architecture Overview

> **Status:** BUILD COMPLETE (Payload 9, 2026-04-24)
> **Authority:** OQMI_GOVERNANCE.md (Canonical Corpus v10)
> **Audience:** Engineering, Compliance, Investor Diligence

This document is the canonical map of the ChatNow.Zone runtime. It
records the boundaries between Payloads 1–8, the cross-Payload
contracts enforced by the Integration Hub, and the deploy topology.

---

## 1. Runtime Topology

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Public Edge (HTTPS)                           │
│                       CloudFront + WAF (planned)                       │
└──────────────────┬─────────────────────────────────────────────────────┘
                   │
              ┌────▼─────┐    REST + SSE     ┌─────────────────────────┐
              │   api    │──────────────────▶│  Web / Native Clients   │
              │ (Nest)   │                   └─────────────────────────┘
              └────┬─────┘
                   │  internal-only (FT-033)
   ┌───────────────┼────────────────┬─────────────────────────────┐
   ▼               ▼                ▼                             ▼
┌─────┐       ┌──────────┐    ┌──────────┐                 ┌──────────┐
│ db  │       │  redis   │    │   nats   │                 │ external │
│ pg16│       │  v7      │    │ JetStream│                 │ webhooks │
└─────┘       └──────────┘    └──────────┘                 └──────────┘
```

The `api` container is the composite runtime: every Payload module
mounts as a NestJS module inside it (see `services/core-api/src/app.module.ts`).
Horizontal split per service is documented in Business Plan §G.6 and is
gated by environment feature flags (`*_ENABLED` env vars in `docker-compose.yml`).

## 2. Payload Map

| # | Payload | Code Location | Public Contract |
| - | --- | --- | --- |
| 1 | Canonical Financial Ledger + Three-Bucket Wallet + REDBOOK Rate Cards | `services/ledger/`, `services/core-api/src/finance/` | `LedgerService.debitWallet`, `ThreeBucketSpendGuardMiddleware` |
| 2 | REDBOOK Customer-Service Recovery + Diamond Concierge | `services/diamond-concierge/`, `services/recovery/` | `RecoveryService`, `DiamondService`, `admin-recovery.controller.ts` |
| 3 | GateGuard Sentinel Pre-Processor + Welfare Guardian Score | `services/core-api/src/gateguard/` | `GateGuardMiddleware`, `WelfareGuardianScorer` |
| 4 | OBS Streaming Bridge + Room-Heat Engine | `services/obs-bridge/`, `services/creator-control/src/room-heat.engine.ts`, `services/showzone/`, `services/bijou/` | NATS `OBS_*`, `ROOM_HEAT_*` |
| 5 | CreatorControl.Zone + Cyrano Layer 1 + Integration Hub | `services/creator-control/`, `services/cyrano/`, `services/integration-hub/` | `IntegrationHubService` |
| 6 | Immutable Audit Architecture (hash-chain + WORM export) | `services/core-api/src/audit/` | `AUDIT_IMMUTABLE_*` topics, `audit_events` append-only table |
| 7 | RBAC Step-Up + Compliance Lockdown | `services/core-api/src/auth/`, `services/core-api/src/compliance/` | `STEP_UP_CHALLENGE_*` topics, `LegalHold` model |
| 8 | (Reserved — covered by Payloads 1–7 cross-cutting work) | — | — |
| 9 | Deployment Readiness + Launch Prep | `.github/workflows/deploy.yml`, `docker-compose.yml`, `docs/PRE_LAUNCH_CHECKLIST.md`, `PROGRAM_CONTROL/LAUNCH_MANIFEST.md` | This document |

## 3. Cross-Payload Invariants (enforced)

1. **GateGuard pre-processor on every ledger touch.** `IntegrationHubService.forwardGuardedLedgerRequest` is the only authorised path. HARD_DECLINE / HUMAN_ESCALATE blocks the forward; COOLDOWN forwards but is audited.
2. **Three-bucket spend order is authoritative.** `LEDGER_SPEND_ORDER = ['purchased','membership','bonus']` is consumed by both `LedgerService.debitWallet` and `ThreeBucketSpendGuardMiddleware`. Defence-in-depth.
3. **Append-only finance.** `infra/postgres/init-ledger.sql` triggers block `UPDATE`/`DELETE` on `ledger_entries`, `audit_events`, `referral_links`, `attribution_events`, `notification_consent_store`, `game_sessions`, `call_sessions`, `voucher_vault`, `content_suppression_queue`. `identity_verification` DELETE-blocked.
4. **`correlation_id` + `reason_code` on every financial / audit write.** Verified per Prisma model in OQMI_SYSTEM_STATE §5.2.
5. **Immutable audit emission.** Every guarded event publishes `AUDIT_IMMUTABLE_*`. Hash-chain integrity verified via `AUDIT_CHAIN_VERIFIED` and failures via `AUDIT_CHAIN_INTEGRITY_FAILURE`.
6. **Network isolation (FT-033).** Postgres and Redis are internal-only on the `backend` Docker network.
7. **NATS for chat + haptic.** REST polling forbidden. Topic registry at `services/nats/topics.registry.ts` is the only source of subjects.
8. **No secrets in tree.** All credentials are read from environment. Compose declares `${VAR:?required}` for the four mandatory secrets (`DB_PASSWORD`, `REDIS_PASSWORD`, `WEBHOOK_SIGNING_SECRET`, `RBAC_STEP_UP_SIGNING_SECRET`).
9. **REDBOOK + RECOVERY_ENGINE constants are read-only.** Inlined values are forbidden — read from `services/core-api/src/config/governance.config.ts`.
10. **§12 banned-entity purge.** Zero references outside `archive/`.

## 4. Cross-Service Wiring (Integration Hub)

```
                     ┌────────────────────────┐
                     │    GateGuard (P3)      │
                     │ welfare_guardian_score │
                     └───────────┬────────────┘
                                 │  GateGuardEvaluation
                                 ▼
┌─────────────────┐    ┌──────────────────────────┐    ┌─────────────────┐
│  Caller (any)   │───▶│  IntegrationHubService   │───▶│   Ledger (P1)   │
│  e.g. Tip svc   │    │ forwardGuardedLedgerReq  │    │  debitWallet    │
└─────────────────┘    └────────┬─────────────────┘    └─────────────────┘
                                │
                ┌───────────────┼───────────────┐
                ▼               ▼               ▼
       AUDIT_IMMUTABLE_     GATEGUARD_      LEDGER_SPEND_
       GATEGUARD            DECISION_*      ORDER (returned)

                     ┌────────────────────────┐
                     │  Recovery Engine (P2)  │
                     │  expiry tick / lapse   │
                     └───────────┬────────────┘
                                 │
                                 ▼
                     ┌────────────────────────┐
                     │ IntegrationHubService  │
                     │ emitRecoveryExpiryWarn │
                     │ emitDiamondConcierge   │
                     └────┬─────────────┬─────┘
                          ▼             ▼
                AUDIT_IMMUTABLE_   HUB_DIAMOND_
                RECOVERY           CONCIERGE_HANDOFF

                     ┌────────────────────────┐
                     │  Room-Heat Engine (P4) │
                     │  RoomHeatSample        │
                     └───────────┬────────────┘
                                 │
                                 ▼
                     ┌────────────────────────┐
                     │ IntegrationHubService  │
                     │ processHighHeatSession │
                     └────┬─────────────┬─────┘
                          ▼             ▼
                 Cyrano (P5)      HUB_HIGH_HEAT_MONETIZATION
                 evaluate()       HUB_PAYOUT_SCALING_APPLIED
                 ≤ 350 ms SLO
```

## 5. Deployment Pipeline

`.github/workflows/deploy.yml` runs four jobs:

1. **build** — frozen install, Prisma generate + push, typecheck, lint, jest
2. **validate-schema** — applies `infra/postgres/init-ledger.sql` against a live Postgres 16
3. **stack-health** — `docker compose config --quiet` validates the compose file with all required env vars bound
4. **readiness-gate** — final summary status (workflow_dispatch only, blocks production promotion)

## 6. Production Topology (planned — Business Plan §G.6)

| Layer | Service | AWS target |
| --- | --- | --- |
| Edge | CloudFront + WAF | us-east-1 |
| Compute | `api` (Fargate) | multi-AZ |
| Database | Postgres 16 | RDS Multi-AZ + PITR |
| Cache | Redis 7 | ElastiCache cluster mode + TLS |
| Event fabric | NATS JetStream | EC2 cluster (3-node) + EBS |
| Object store (recordings, audit WORM) | S3 | Object Lock COMPLIANCE mode |
| Secrets | Secrets Manager + Parameter Store | per-environment |
| Observability | CloudWatch + PagerDuty | dashboards in `infra/observability/` |

## 7. Where to Look Next

- Domain glossary → `docs/DOMAIN_GLOSSARY.md`
- Requirements master → `docs/REQUIREMENTS_MASTER.md`
- Membership policy → `docs/MEMBERSHIP_LIFECYCLE_POLICY.md`
- Canonical compliance checklist → `docs/CANONICAL_COMPLIANCE_CHECKLIST.md`
- Launch manifest → `PROGRAM_CONTROL/LAUNCH_MANIFEST.md`
- Pre-launch checklist → `docs/PRE_LAUNCH_CHECKLIST.md`
- Governance doctrine → `PROGRAM_CONTROL/DIRECTIVES/QUEUE/OQMI_GOVERNANCE.md`
