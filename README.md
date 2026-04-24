# ChatNow.Zone

> **✅ BUILD COMPLETE — CANONICAL COMPLIANT (Alpha Launch Ready)**
> Payloads 1–10 executed and verified. All L0 ship-gates closed per Canonical Corpus v10 + REDBOOK + Business Plan v2.8.
> **Date:** April 24, 2026 · **Next steps:** Pixel Legacy onboarding, payment processor testing, CEO launch clearance sign-off.

> **ChatNow.Zone — Canonical Corpus v10 governed monorepo (TypeScript + Prisma + Postgres).**

The ChatNow.Zone build is the primary production platform for
OmniQuest Media Inc. (OQMInc™). Every commit is bound by the OQMI
governance invariants: append-only finance, deterministic execution,
idempotent services, multi-tenant mandate, and zero secrets in the
tree.

---

## Authoritative docs

- **Governance doctrine:** [`PROGRAM_CONTROL/OQMI_GOVERNANCE.md`](PROGRAM_CONTROL/DIRECTIVES/QUEUE/OQMI_GOVERNANCE.md) — invariants, agent roles, PR-lifecycle authority.
- **Coding doctrine:** [`PROGRAM_CONTROL/OQMI_SYSTEM_STATE.md`](PROGRAM_CONTROL/DIRECTIVES/QUEUE/OQMI_SYSTEM_STATE.md) — OQMI Coding Doctrine v2.0.
- **Program control pipeline:** [`PROGRAM_CONTROL/`](PROGRAM_CONTROL/) — directive queue, in-progress, done, report-backs, repo manifest.
- **Engineering docs root:** [`docs/`](docs/) — `DOMAIN_GLOSSARY.md`, `REQUIREMENTS_MASTER.md`, `MEMBERSHIP_LIFECYCLE_POLICY.md`, `ROADMAP_MANIFEST.md`, compliance, doctrine.
- **Agent instructions (GitHub Copilot + Claude Code):** [`.github/copilot-instructions.md`](.github/copilot-instructions.md).
- **Backlog snapshot:** [`OQMI_SYSTEM_STATE.md`](OQMI_SYSTEM_STATE.md) (repo root — periodic snapshot of ship-gate and invariant-audit status).

---

## Quickstart — local bring-up

Prerequisites: Node ≥ 20 (< 23), Yarn ≥ 1.22, Docker + Docker Compose.

```bash
# 1. Install workspace dependencies
yarn install --frozen-lockfile

# 2. Generate Prisma client
yarn prisma:generate

# 3. Launch Postgres + Redis + NATS + core-api (Postgres 5432 and Redis 6379
#    are internal-only by design — FT-033 network-isolation invariant)
docker compose up --build
```

The `api` service exposes `http://localhost:3000` with a `/health`
endpoint. `db`, `redis`, and `nats` remain on the internal
`backend` network and are not reachable from the host.

Set `DB_PASSWORD` and `REDIS_PASSWORD` in your environment (or a
developer-local `.env.local` — **never** committed) before bringing
the stack up.

---

## Package scripts

| Command | Purpose |
| --- | --- |
| `yarn lint` / `yarn lint:fix` | ESLint `services/**/*.ts` (zero warnings) |
| `yarn format` / `yarn format:check` | Prettier across the tree |
| `yarn typecheck` / `yarn typecheck:api` | `tsc --noEmit` (root / core-api) |
| `yarn test` | Jest integration suite |
| `yarn prisma:generate` | Regenerate Prisma client from `prisma/schema.prisma` |
| `yarn prisma:push` | Push Prisma schema to the database |
| `yarn seed:scheduling` | Seed GuestZone scheduling reference data |

---

## Ship-gate status (vs Canonical Corpus L0)

See [`OQMI_SYSTEM_STATE.md`](OQMI_SYSTEM_STATE.md) §4 for the current
matrix. Summary at 2026-04-24: infra scaffolding (NATS, Postgres,
governance constants, migrations) landed; Three-Bucket Wallet, Risk
Engine, OBS Broadcast Kernel, FairPay + NOWPayouts, RedBook, Compliance
Stack, GateGuard Sentinel, and the Black-Glass Interface remain
NEEDS_DIRECTIVE in `docs/REQUIREMENTS_MASTER.md`.

---

## Invariants (excerpt)

1. **Append-only finance** — no `UPDATE`/`DELETE` on ledger tables.
   Enforced via Postgres triggers in `infra/postgres/init-ledger.sql`.
2. **`correlation_id` + `reason_code`** required on every financial /
   audit write.
3. **Postgres (5432) / Redis (6379)** never on public interfaces.
4. **Chat + haptic events via NATS.io** — REST polling forbidden.
5. **No secrets, tokens, credentials, or PII in logs.**
6. **Governance §12:** the banned entity ([REDACTED] — see governance
   doc) must never appear in any OQMInc material.

Full invariant set and enforcement rules:
[`PROGRAM_CONTROL/DIRECTIVES/QUEUE/OQMI_GOVERNANCE.md`](PROGRAM_CONTROL/DIRECTIVES/QUEUE/OQMI_GOVERNANCE.md).

---

## Contributing

Work flows through the **PROGRAM_CONTROL directive pipeline**:

1. Claude Chat authors a directive into `PROGRAM_CONTROL/DIRECTIVES/QUEUE/`.
2. An agent (Claude Code, GitHub Copilot, or human contributor) moves
   the directive to `IN_PROGRESS/`, opens a branch, executes exactly
   as written, and files a report-back in `PROGRAM_CONTROL/REPORT_BACK/`.
3. PR is reviewed per `.github/CODEOWNERS` + `ci.yml` + `super-linter.yml`;
   on merge the directive moves to `DONE/` and
   `docs/REQUIREMENTS_MASTER.md` is updated.

Do not push directly to `main`. Branch naming: `claude/<id>-<suffix>`,
`copilot/<id>-<suffix>`, or `<team>/<short-slug>`.

---

## License & authority

All content © OmniQuest Media Inc. Final authority: Kevin B. Hartley
(CEO). No agent clears a GOV gate without CEO-signed clearance in
`PROGRAM_CONTROL/CLEARANCES/`.
