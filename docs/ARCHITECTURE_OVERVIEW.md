# ChatNow.Zone — Architecture Overview

**Authority:** OmniQuest Media Inc. (OQMInc™) — Kevin B. Hartley, CEO
**Canonical Corpus:** v10 — `PROGRAM_CONTROL/DIRECTIVES/QUEUE/OQMI_GOVERNANCE.md`
**Snapshot date:** 2026-04-24 (Payload 9 — Deployment Readiness)

---

## 1. Platform Summary

ChatNow.Zone is a **live-creator monetisation platform** built as a
TypeScript + NestJS + Prisma monorepo deployed on AWS. Creators stream
live; guests purchase token packs and spend them on tips, paid chat,
private sessions, and theatre seats. Every financial interaction flows
through a deterministic, append-only ledger enforced at the database
trigger level.

---

## 2. High-Level Service Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ChatNow.Zone Platform                        │
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐  │
│  │  Black-Glass │    │ Creator      │    │  Guest / Fan UI      │  │
│  │  Dashboard   │    │ Control.Zone │    │  (web + mobile)      │  │
│  └──────┬───────┘    └──────┬───────┘    └──────────┬───────────┘  │
│         │                  │                        │              │
│  ══════════════════════ API Gateway (REST + WS) ══════════════════  │
│                                                                     │
│  ┌─────────────────────── Core API (NestJS Monolith) ────────────┐  │
│  │                                                               │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐  │  │
│  │  │  GateGuard  │  │   Ledger /   │  │  Three-Bucket       │  │  │
│  │  │  Sentinel   │  │   Finance    │  │  Wallet Guard        │  │  │
│  │  │  (B.5)      │  │   (FIZ)      │  │  (Middleware)        │  │  │
│  │  └──────┬──────┘  └──────┬───────┘  └──────────┬──────────┘  │  │
│  │         │                │                     │             │  │
│  │  ┌──────▼──────────────────────────────────────▼──────────┐  │  │
│  │  │              Immutable Audit Chain                      │  │  │
│  │  │  (hash-chain + NATS emission + WORM export)             │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │                                                               │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐  │  │
│  │  │  Bijou      │  │  ShowZone    │  │  GZ Scheduling      │  │  │
│  │  │  Play.Zone  │  │  Theatre     │  │  Module             │  │  │
│  │  └─────────────┘  └──────────────┘  └─────────────────────┘  │  │
│  │                                                               │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐  │  │
│  │  │  Membership │  │  KYC/Publish │  │  DFSP Diamond       │  │  │
│  │  │  Lifecycle  │  │  Gate        │  │  Financial Security  │  │  │
│  │  └─────────────┘  └──────────────┘  └─────────────────────┘  │  │
│  │                                                               │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐  │  │
│  │  │  Risk Engine│  │  Geo/Pricing │  │  Auth + Step-Up     │  │  │
│  │  │  (D002)     │  │  (multi-CCY) │  │  + RBAC             │  │  │
│  │  └─────────────┘  └──────────────┘  └─────────────────────┘  │  │
│  │                                                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────────── Creator Services ─────────────────────┐  │
│  │                                                               │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐  │  │
│  │  │  Room-Heat  │  │ CreatorControl│  │  Cyrano Whisper    │  │  │
│  │  │  Engine     │  │  .Zone        │  │  Layer (B.3.5)     │  │  │
│  │  │  (B.4)      │  │  (B.3)        │  │  < 800 ms SLO      │  │  │
│  │  └──────┬──────┘  └──────┬───────┘  └──────────┬──────────┘  │  │
│  │         └────────────────┴─────────────────────┘             │  │
│  │                          │                                    │  │
│  │              ┌───────────▼───────────┐                       │  │
│  │              │  Integration Hub      │                       │  │
│  │              │  (cross-service wire) │                       │  │
│  │              └───────────────────────┘                       │  │
│  │                                                               │  │
│  │  ┌─────────────┐  ┌──────────────┐                           │  │
│  │  │  Recovery   │  │  Diamond     │                           │  │
│  │  │  Engine     │  │  Concierge   │                           │  │
│  │  └─────────────┘  └──────────────┘                           │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────────── Infrastructure ───────────────────────┐  │
│  │                                                               │  │
│  │  NATS JetStream ─── Postgres 16 (FT-033) ─── Redis 7         │  │
│  │  (all real-time events)  (internal only)   (sessions/cache)  │  │
│  │                                                               │  │
│  │  OBS Bridge  ───  Streaming SFU (mediasoup) ─── HeartZone    │  │
│  │  (multi-platform)  (SCAFFOLD — EC2 c6i.xlarge)   (biometrics)│  │
│  │                                                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Financial Integrity Zone (FIZ) Invariants

All financial flows obey these invariants — enforced at Postgres trigger level
and checked by `ThreeBucketSpendGuardMiddleware` on every transaction:

| Invariant | Enforcement |
|---|---|
| Append-only ledger | Postgres triggers on `ledger_entries`, `transactions`, `audit_events` |
| Three-bucket spend order | `LEDGER_SPEND_ORDER` from `governance.config.ts` |
| `correlation_id` + `reason_code` | Required on every financial/audit write |
| GateGuard pre-process | Every transaction routed through GateGuard before ledger write |
| Audit emission | Every ledger write emits `AUDIT_IMMUTABLE_*` NATS topic |
| WORM export | 90-day cycle to S3 immutable storage |

**Three-Bucket Spend Order (canonical):**
```
PROMOTIONAL_TOKENS → EARNED_TOKENS → PURCHASED_TOKENS
```

---

## 4. NATS Topic Architecture

All real-time events flow through NATS JetStream (`nats:4222` internal).
REST polling is prohibited for chat and haptic events (Latency Invariant).

Topic namespaces:
- `geo.*` — geo-pricing and geo-blocking
- `game.*` — gamification outcomes
- `bijou.*` — Bijou Play.Zone session lifecycle
- `showzone.*` — ShowZone theatre lifecycle
- `chat.*` — chat ingestion and broadcast (staggered)
- `hz.*` — HeartZone BPM + haptic triggers
- `risk.*` — risk flags and containment
- `auth.*` — step-up challenges
- `kyc.*` — publish gate decisions
- `audit.*` / `worm.*` — immutable audit chain + WORM export
- `compliance.*` — legal hold, reconciliation drift
- `fiz.*` / `payments.*` — webhook and financial events
- `dfsp.*` — Diamond Financial Security Platform
- `gz.schedule.*` — GuestZone scheduling
- `zone.*` / `membership.*` — zone access + membership lifecycle
- `gateguard.*` — GateGuard Sentinel decisions
- `room.heat.*` — Room-Heat tier engine
- `creator_control.*` — CreatorControl.Zone suggestions
- `cyrano.*` — Cyrano whisper engine
- `hub.*` — Integration Hub cross-service handoffs
- `obs.*` / `persona.*` — OBS bridge + persona engine

Full registry: `services/nats/topics.registry.ts`

---

## 5. Data Layer

**Database:** Postgres 16 (production: AWS RDS Aurora PostgreSQL)

Key schema files:
- `infra/postgres/init-ledger.sql` — raw SQL triggers + initial tables
- `prisma/schema.prisma` — Prisma ORM models (canonical source of truth)
- `prisma/migrations/` — migration history

**Redis 7** (production: AWS ElastiCache Redis Cluster):
- Session storage (`express-session`)
- Rate limiting counters
- NATS idempotency cache

---

## 6. Auth Architecture

- JWT access token (15 min default) + refresh token (7 days)
- Step-Up Auth: additional OTP challenge for high-value operations
- RBAC: `RolesGuard` + `@Roles()` decorator on all controller routes
- KYC Publish Gate: creator must pass AV check before first broadcast

---

## 7. Creator Monetisation Stack (Business Plan B.3–B.5)

```
Guest tip / spend
      │
      ▼
ThreeBucketSpendGuardMiddleware
      │
      ▼
GateGuard Sentinel pre-process
  (welfare score + AV check + federated lookup)
      │
      ├─ APPROVED ──► LedgerService.debitWallet (append-only)
      │                     │
      │               AUDIT_IMMUTABLE_SPEND emitted ──► Audit Chain
      │
      └─ DECLINED ──► GATEGUARD_DECISION_HARD_DECLINE emitted
                            │
                       Human escalation path
```

**Payout flow:**
- Creator earns at RedBook floor rate (per-token, USD)
- Room-Heat tier adds scaling bump (0% COLD/WARM, +5% HOT, +10% BLAZING)
- Cyrano suggestion at HOT/BLAZING tier → monetisation push
- Integration Hub emits `HUB_PAYOUT_SCALING_APPLIED` for next statement cycle

---

## 8. AWS Production Topology (Business Plan G.6)

| Component | AWS Service | Notes |
|---|---|---|
| Core API | ECS Fargate | Auto-scales to 10k concurrent |
| Database | RDS Aurora PostgreSQL 16 | Multi-AZ, encrypted at rest |
| Cache | ElastiCache Redis 7 | Cluster mode |
| Message fabric | NATS on ECS Fargate | JetStream enabled |
| Streaming SFU | EC2 c6i.xlarge | 500 viewers/instance; mediasoup |
| Static assets | S3 + CloudFront CDN | |
| WORM audit export | S3 Glacier Instant Retrieval | Immutable bucket policy |
| Secrets | AWS Secrets Manager | Rotated 90-day cycle |
| Container registry | Amazon ECR | Image signing via Sigstore |
| DNS | Route 53 | `chatnow.zone` |
| TLS | ACM | Wildcard cert |
| Observability | CloudWatch + X-Ray | NATS lag + API error alarms |

---

## 9. Key Governance Files

| File | Purpose |
|---|---|
| `PROGRAM_CONTROL/DIRECTIVES/QUEUE/OQMI_GOVERNANCE.md` | Canonical governance invariants |
| `PROGRAM_CONTROL/DIRECTIVES/QUEUE/OQMI_SYSTEM_STATE.md` | Coding doctrine v2.0 |
| `docs/DOMAIN_GLOSSARY.md` | Naming authority (commit prefixes + terms) |
| `docs/REQUIREMENTS_MASTER.md` | Live requirements backlog |
| `docs/PRE_LAUNCH_CHECKLIST.md` | Launch gate checklist |
| `PROGRAM_CONTROL/LAUNCH_MANIFEST.md` | Pixel Legacy onboarding + rate lock |
| `docs/CANONICAL_COMPLIANCE_CHECKLIST.md` | Compliance self-assessment |
| `docs/AUDIT_CERTIFICATION_V1.md` | Immutable audit certification |
| `OQMI_SYSTEM_STATE.md` | Periodic snapshot of ship-gate + invariant audit status |
