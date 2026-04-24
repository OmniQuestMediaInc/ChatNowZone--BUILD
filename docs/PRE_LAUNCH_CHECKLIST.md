# ChatNow.Zone — Pre-Launch Checklist

**Authority:** Kevin B. Hartley (CEO) — OmniQuest Media Inc.
**Target launch:** September 2026 (hard deadline: 2026-10-01)
**Governance:** `PROGRAM_CONTROL/DIRECTIVES/QUEUE/OQMI_GOVERNANCE.md` (Canonical Corpus v10)
**Status at 2026-04-24:** Alpha-build scaffold complete (Payloads 1–6 landed). Items marked `[ ]` require directive authoring + execution before launch clearance.

---

## Gate 1 — Financial Integrity Zone (FIZ)

- [x] Three-Bucket Wallet (`LedgerService.debitWallet` + `ThreeBucketSpendGuardMiddleware`)
- [x] Append-only ledger triggers (`infra/postgres/init-ledger.sql`)
- [x] `correlation_id` + `reason_code` on all financial tables
- [ ] `legal_holds.correlation_id` — schema migration pending (remediation item per OQMI_SYSTEM_STATE.md §5.2)
- [x] Webhook hardening (`WebhookHardeningService` — PROC-001 ✓)
- [x] DFSP Integrity Hold + OTP + Voice Sample (PV-001 + DFSP-001 ✓)
- [ ] RedBook rate cards wired to live payout calculator (NEEDS_DIRECTIVE)
- [ ] FairPay + NOWPayouts engine fully connected (D006 NEEDS_DIRECTIVE)
- [ ] GateGuard processor LOI signed + integration confirmed (LOI stub in LAUNCH_MANIFEST)
- [ ] First 3,000 creator rate-lock table populated + locked in DB
- [ ] Pixel Legacy creator payout rate confirmed (RedBook §3 floor) and seeded

---

## Gate 2 — GateGuard Sentinel (GGS)

- [x] GateGuard middleware scaffold (`services/core-api/src/gateguard/`) ✓
- [x] Welfare Guardian Scorer (`welfare-guardian.scorer.ts`) ✓
- [x] GateGuard NATS topics registered ✓
- [ ] AV verification token issuance live (GGS-AV module — NEEDS_DIRECTIVE)
- [ ] Federated lookup to processor LOI endpoint (NEEDS_DIRECTIVE)
- [ ] GateGuard pre-process enforced on every transaction path (integration test required)
- [ ] GGS → Immutable Audit emission verified end-to-end

---

## Gate 3 — Compliance + Audit

- [x] Immutable Audit hash-chain service (PAYLOAD-6 ✓)
- [x] WORM export service (GOV-002 ✓)
- [x] Legal Hold service (AUDIT-002 ✓)
- [x] Canonical Compliance Checklist (`docs/CANONICAL_COMPLIANCE_CHECKLIST.md`) ✓
- [x] Audit Certification v1 (`docs/AUDIT_CERTIFICATION_V1.md`) ✓
- [x] Sovereign CaC Middleware (GOV-004 ✓)
- [ ] NCII Takedown Log process confirmed live
- [ ] GDPR / CCPA consent-store integration tested
- [ ] 90-day WORM export cycle confirmed in staging
- [ ] CEO-signed audit clearance on file (`PROGRAM_CONTROL/CLEARANCES/`)

---

## Gate 4 — Creator Tooling

- [x] Room-Heat Engine (tier computation + NATS emission) ✓
- [x] CreatorControl.Zone broadcast + session copilots ✓
- [x] Cyrano Layer 1 whisper engine (8 categories, 800 ms SLO) ✓
- [x] Integration Hub high-heat monetization flow ✓
- [ ] Cyrano Layer 2 — LLM + Prisma memory (NEEDS_DIRECTIVE)
- [ ] Room-Heat persistence to DB (NEEDS_DIRECTIVE)
- [ ] Creator payout scaling factor live from Room-Heat tier
- [ ] Creator dashboard (Black-Glass Interface) — front-end implementation (G101+ NEEDS_DIRECTIVE)
- [ ] CreatorControl.Zone — front-end single-pane implementation (NEEDS_DIRECTIVE)
- [ ] Mic Drop Reveal Sequence implemented and tested

---

## Gate 5 — Platform Services

- [x] Bijou Play.Zone session lifecycle (BJ-001 → BJ-004 ✓)
- [x] ShowZone theatre room session (SHOWZONE-001 ✓)
- [x] OBS Bridge + Chat Aggregator (OBS-001 ✓)
- [x] GZ Scheduling Module (GZ-SCHEDULE-001 ✓)
- [x] Membership lifecycle (MEMB-001 → MEMB-003 ✓)
- [x] Zone-GPT proposal service (GOV-003 ✓)
- [x] KYC Publish Gate (KYC-001 ✓)
- [x] Step-Up Auth (AUTH-001 + AUTH-002 ✓)
- [x] Geo-Pricing + Geo-Fencing (GEO-001 + GOV-001 ✓)
- [x] Reconciliation service (INFRA-004 ✓)
- [ ] Risk Engine (D002 NEEDS_DIRECTIVE)
- [ ] OBS Broadcast Kernel (D004 NEEDS_DIRECTIVE)
- [ ] Streaming SFU (mediasoup — SCAFFOLD; Dockerfile + service required)
- [ ] HeartZone biometric integration (HZ-001 wired end-to-end)
- [ ] Rewards API fully tested (rewards-api scaffold present)
- [ ] Diamond Concierge live outreach flow tested

---

## Gate 6 — Infrastructure & DevOps

- [x] Docker Compose with all service env vars (PAYLOAD-9 ✓)
- [x] CI pipeline (`ci.yml` — schema + structure validation) ✓
- [x] Deploy pipeline (`.github/workflows/deploy.yml` — PAYLOAD-9 ✓)
- [x] Postgres + Redis internal-only network (FT-033 ✓)
- [x] NATS JetStream fabric ✓
- [x] No secrets in repo (PASS per OQMI_SYSTEM_STATE.md §5.5) ✓
- [ ] AWS ECS Fargate task definitions authored
- [ ] RDS Aurora Postgres cluster provisioned (prod)
- [ ] ElastiCache Redis cluster provisioned (prod)
- [ ] ECR image repository created + image published
- [ ] ALB + Route 53 DNS pointed to chatnow.zone
- [ ] SSL certificate (ACM) issued for chatnow.zone
- [ ] CloudWatch alarms for API error rate, DB connections, NATS lag
- [ ] Streaming SFU EC2 instances provisioned (c6i.xlarge × N)

---

## Gate 7 — Security

- [x] RBAC guard (`RolesGuard` + `JwtAuthGuard`) ✓
- [x] CodeQL scanning workflow ✓
- [x] Super-linter workflow ✓
- [ ] Penetration test scheduled (pre-launch, external)
- [ ] OWASP Top 10 self-assessment completed
- [ ] Rate limiting on all public endpoints confirmed
- [ ] DDoS protection (AWS Shield Standard minimum)
- [ ] API key rotation procedure documented

---

## Gate 8 — QA & Performance

- [ ] Integration test suite passing (≥ 80% coverage on finance paths)
- [ ] Load test: 10,000 concurrent viewers (target per Business Plan G.6)
- [ ] Room-Heat performance baseline: < 50 ms per tier computation
- [ ] NATS message latency baseline: < 10 ms P95
- [ ] Cyrano latency SLO: < 800 ms P95 (per `CYRANO_LATENCY_SLO_MS`)
- [ ] Stripe webhook replay test (idempotency confirmed)

---

## Gate 9 — Launch Comms & Onboarding

- [x] Pixel Legacy creator onboarding flow defined (LAUNCH_MANIFEST ✓)
- [x] First 3,000 creator rate-lock defined (LAUNCH_MANIFEST ✓)
- [x] Mic Drop Reveal Sequence readiness defined (LAUNCH_MANIFEST ✓)
- [ ] Creator onboarding emails drafted + SendGrid templates live
- [ ] Terms of Service and Privacy Policy reviewed by counsel
- [ ] App Store / Play Store listings prepared (if applicable)
- [ ] Beta invite system live (first 3,000 creator wave)
- [ ] CEO launch announcement content prepared

---

## CEO Sign-Off Required (GOV gate — § 8 OQMI_GOVERNANCE.md)

All items below must have CEO-signed clearance in `PROGRAM_CONTROL/CLEARANCES/`
before production deploy is permitted:

- [ ] `PRODUCTION_DEPLOY_CLEARANCE.md` — final go/no-go signed by Kevin B. Hartley
- [ ] `GGS_LOI_CLEARANCE.md` — GateGuard processor LOI finalized
- [ ] `LAUNCH_RATE_LOCK_CLEARANCE.md` — first-3,000 rate-lock table frozen
- [ ] `COMPLIANCE_AUDIT_CLEARANCE.md` — audit certification sign-off
