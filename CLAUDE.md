# Claude Code — Project Instructions

## Source of Truth
- **Sovereign Kernel:** `Sovereign_Kernel.md.pdf` (repo root)
- **Coding Doctrine:** `OQMI_SYSTEM_STATE.md` (OQMI CODING DOCTRINE v2.0)
- **Agent Instructions:** `.github/copilot-instructions.md` (Program Control — always read before executing tasks)
- **Domain Glossary:** `docs/DOMAIN_GLOSSARY.md` (naming authority)

## Core Principles
Append-Only. Deterministic. Idempotent.

## Commit Discipline
Every commit must be atomic, descriptive, and prefixed by service scope:
FIZ: | NATS: | OBS: | HZ: | BIJOU: | CRM: | INFRA: | UI: | GOV: | CHORE:

FIZ-scoped commits require REASON:, IMPACT:, and CORRELATION_ID: fields.

## Package Manager
Use Yarn. Do not introduce npm or pnpm.

## Invariant Rules
- No refactoring unless explicitly instructed
- Append-only finance — no UPDATE on balance columns, offsets only
- Every table must include correlation_id and reason_code
- Postgres (5432) and Redis (6379) never on public interfaces
- All chat and haptic events via NATS.io, no REST polling
- Never log secrets, tokens, credentials, or PII

## Agent Handoff
Leave a ## HANDOFF block stating what was built, what was left incomplete, and the next agent's first task. Never modify another agent's completed work without human authorization.
