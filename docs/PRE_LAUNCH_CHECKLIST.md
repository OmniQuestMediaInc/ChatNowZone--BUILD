# ChatNow.Zone — Pre-Launch Checklist

> **Owner:** Kevin B. Hartley (CEO, OmniQuest Media Inc.)
> **Authority:** OQMI_GOVERNANCE.md (Canonical Corpus v10), Business Plan §G.6
> **Target:** Alpha Launch Ready — September 2026 / Hard Launch — 2026-10-01
> **Status (snapshot 2026-04-24):** BUILD COMPLETE — gating items below

This checklist is the canonical go/no-go matrix for the ChatNow.Zone alpha
and hard launch windows. Every row must be **CEO-signed** in
`PROGRAM_CONTROL/CLEARANCES/` before the corresponding gate is opened.

---

## 1. Code & Build

- [x] All Payload 1–8 services merged into `main` (Ledger, Recovery, GateGuard, Streaming, CreatorControl, Cyrano, Diamond, Audit)
- [x] Payload 9 deployment readiness landed on `claude/deployment-readiness-fcRNN`
- [x] `services/integration-hub/src/hub.service.ts` v2 wires GateGuard pre-processor + Recovery + Diamond + Room-Heat + Cyrano
- [x] `docker-compose.yml` env-var driven, FT-033 preserved
- [x] `.github/workflows/deploy.yml` build / typecheck / lint / test / Prisma push / SQL schema / stack-health gates
- [ ] `yarn install --frozen-lockfile && yarn prisma:generate && yarn prisma:push && yarn typecheck && yarn lint && yarn test` green on `main` (CI runs at PR)
- [ ] CodeQL + Super-Linter green on the release commit

## 2. Canonical Compliance

- [x] Three-bucket spend order (`LEDGER_SPEND_ORDER`) authoritative — no service bypasses
- [x] Append-only ledger triggers active in `infra/postgres/init-ledger.sql`
- [x] GateGuard pre-processor required on every ledger-touching path (Hub `forwardGuardedLedgerRequest`)
- [x] Immutable audit hash-chain (Payload 6) emits `AUDIT_IMMUTABLE_*` for every guarded event
- [x] RBAC step-up signing secret read from environment (`RBAC_STEP_UP_SIGNING_SECRET`)
- [x] Webhook signing secret read from environment (`WEBHOOK_SIGNING_SECRET`)
- [x] Network isolation — Postgres 5432 / Redis 6379 internal only (FT-033)
- [x] NATS.io fabric — REST polling forbidden for chat / haptic flows
- [x] §12 banned-entity purge (zero matches outside `archive/`)
- [ ] `legal_holds.correlation_id` migration filed (FIZ-scoped, deferred — see OQMI_SYSTEM_STATE §7)

## 3. REDBOOK Rate Cards

- [x] `REDBOOK_RATE_CARDS` constants exact: Tease Regular 150 / 500 / 1k / 5k / 10k bundles
- [x] Tease ShowZone bundles 300 / 1,000
- [x] Diamond floor `0.077–0.120` USD per token
- [x] Recovery: `EXTENSION_FEE_USD = 49`, `RECOVERY_FEE_USD = 79`, expiry 14 days, warning 48 h
- [x] 70/30 expired-token split (creator pool / platform mgmt fee)
- [x] Token Bridge 20% bonus + 1 waiver per 365 days
- [x] 3/5ths Exit — 60% refund + 24h cool-off

## 4. Diamond Tier

- [x] 3-tier volume table (10k–27.5k / 30k–57.5k / 60k+) locked 2026-04-11
- [x] Velocity multipliers 1.0 → 1.15 across 14/30/90/180/366 day horizons
- [x] Diamond payout floor `$0.075/token` for creators, platform floor `$0.077/token`
- [x] Concierge appointment open 11:00 / cutoff 22:30 billing-address TZ
- [x] Recovery handoff to Diamond Concierge wired through Hub `emitDiamondConciergeHandoff`

## 5. Room-Heat & Cyrano

- [x] Deterministic tier computation (`COLD/WARM/HOT/BLAZING`)
- [x] Payout scaling: HOT +5%, BLAZING +10%
- [x] Cyrano latency budget ≤ 350 ms enforced in `services/cyrano/src/cyrano.service.ts`
- [x] 8-category whisper engine + persona memory + session memory store
- [ ] Cyrano Layer 2 (LLM + Prisma memory) — POST-LAUNCH (Wave H)

## 6. Infra & Deployment (Business Plan §G.6 AWS path)

- [x] `docker-compose.yml` validated by `docker compose config --quiet` in CI
- [x] Health check on `api` (`/health`) + db (`pg_isready`) + redis (`redis-cli ping`) + NATS (`/healthz`)
- [ ] Production secrets loaded via AWS Secrets Manager / Parameter Store (NOT in repo)
- [ ] Postgres → RDS Multi-AZ with PITR enabled
- [ ] Redis → ElastiCache cluster mode with TLS
- [ ] NATS → JetStream cluster (3-node minimum) with persistent volume
- [ ] CloudFront + WAF in front of `api`
- [ ] CloudWatch dashboards: ledger throughput, GateGuard latency, Cyrano p95, Room-Heat tier transitions
- [ ] PagerDuty rotations: GuestZone primary, Tech secondary

## 7. Compliance & Legal

- [x] Bill 149 (Ontario) AI disclosure prefix applied to all `CREATOR_AUTO=true` persona output (`OBS.BILL_149_DISCLOSURE_PREFIX`)
- [x] Ontario ESA 2026 scheduling invariants (`GZ_SCHEDULING`)
- [x] Membership lifecycle policy current — `docs/MEMBERSHIP_LIFECYCLE_POLICY.md`
- [ ] Privacy Policy + ToS reviewed by Legal counsel
- [ ] Age-verification (AV check) processor LOI signed
- [ ] FOSTA/SESTA reviewer attestation on file
- [ ] DMCA agent registered

## 8. Launch Sequence (Business Plan reference)

- [ ] Pixel Legacy creator onboarding kit shipped (see `LAUNCH_MANIFEST.md` §1)
- [ ] Mic Drop Reveal Sequence rehearsed end-to-end (see `LAUNCH_MANIFEST.md` §2)
- [ ] First 3,000 creator rate-lock list cohort frozen (see `LAUNCH_MANIFEST.md` §3)
- [ ] GateGuard processor LOI data package delivered (see `LAUNCH_MANIFEST.md` §4)

## 9. CEO Sign-Off (Final Gate)

- [ ] **CEO clearance filed:** `PROGRAM_CONTROL/CLEARANCES/LAUNCH_GATE_2026-10-01.md`
- [ ] Hard launch authorisation signed Kevin B. Hartley

---

**This file is regenerated after each ship-gate. Live ship-gate status lives
in `OQMI_SYSTEM_STATE.md` §4. Do not duplicate authority statements here.**
