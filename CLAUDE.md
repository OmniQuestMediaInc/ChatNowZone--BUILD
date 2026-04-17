# Claude Code — Project Instructions

## Source of Truth
- **Sovereign Kernel:** Sovereign_Kernel.md.pdf (repo root)
- **Coding Doctrine:** OQMI_SYSTEM_STATE.md (OQMI CODING DOCTRINE v2.0)
- **Agent Instructions:** .github/copilot-instructions.md (Program Control — always read before executing tasks)
- **Domain Glossary:** docs/DOMAIN_GLOSSARY.md (naming authority — check before naming any domain concept)
- **Requirements Master:** docs/REQUIREMENTS_MASTER.md (live build state — check before selecting next task)
- **Tech Debt Delta:** docs/TECH_DEBT_DELTA_2026-04-16.md (canonical requirements source)

## Core Principles
Append-Only. Deterministic. Idempotent.

## Commit Discipline
Every commit must be atomic, descriptive, and prefixed by service scope:
FIZ: | NATS: | OBS: | HZ: | BIJOU: | CRM: | INFRA: | UI: | GOV: | CHORE: | GGS: | GGS-AV: | CYR:

FIZ-scoped commits require REASON:, IMPACT:, and CORRELATION_ID: fields.
GGS: commits that touch ledger, payout, balance, or escrow require dual prefix: FIZ: + GGS:

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
Leave a ## HANDOFF block stating what was built, what was left incomplete,
and the next agent's first task. Never modify another agent's completed
work without human authorization.

---

## Autonomous Directive Protocol (DROID MODE)

When operating autonomously, Claude Code follows this protocol exactly.
DROID MODE applies at all times — execute directives as written,
no synthesis, no creative deviation.

### Step 1 — Sync
Run: git fetch origin && git reset --hard origin/main
Never act on cached or stale repo state.

### Step 2 — Find next task
Read docs/REQUIREMENTS_MASTER.md.
Find the first row where:
  - Status = QUEUED
  - A directive file exists at PROGRAM_CONTROL/DIRECTIVES/QUEUE/[ID].md
  - The **Agent:** field in that directive file = CLAUDE_CODE
  - No corresponding file exists in PROGRAM_CONTROL/DIRECTIVES/IN_PROGRESS/
  - No open PR exists referencing this directive ID

If no eligible directive exists: stop. Output a brief summary of what
was checked. Do not invent work.

### Step 3 — Conflict check
Read the **Touches:** field from the selected directive.
Check all other directives in QUEUE and IN_PROGRESS for overlapping
file paths.
If overlap found:
  - Do NOT proceed.
  - Output: CONFLICT DETECTED: [ID-A] x [ID-B] — [filepath]
  - Stop. Human resolution required.

### Step 4 — Pre-flight reads (MANDATORY — do not skip)
Before writing a single line of code, read ALL of the following:
  1. The full directive file from PROGRAM_CONTROL/DIRECTIVES/QUEUE/[ID].md
  2. docs/DOMAIN_GLOSSARY.md — confirm all terms used in the directive
  3. docs/REQUIREMENTS_MASTER.md — confirm requirement status
  4. services/core-api/src/governance/governance.config.ts — confirm
     any constants the directive references actually exist
  5. prisma/schema.prisma — confirm any Prisma models referenced exist
  6. services/nats/topics.registry.ts — confirm any NATS topics exist
  7. Any other files listed in the directive's "Files to Confirm Unchanged"
     section

Do not begin implementation until all pre-flight reads are complete.

### Step 5 — Move to IN_PROGRESS
Move the directive file:
  FROM: PROGRAM_CONTROL/DIRECTIVES/QUEUE/[ID].md
  TO:   PROGRAM_CONTROL/DIRECTIVES/IN_PROGRESS/[ID].md
Commit: CHORE: [ID] QUEUE → IN_PROGRESS
Push to a new branch: claude/[id-lowercase]-[random-suffix]

### Step 6 — Execute
Execute the directive exactly as written.
DROID MODE — no synthesis, no creative deviation, no refactoring
of existing logic unless the directive explicitly instructs it.
Follow all 15 invariants (listed in every directive's checklist).
Multi-tenant mandate: organization_id + tenant_id on all Prisma writes.

### Step 7 — TypeScript check
Run: npx tsc --noEmit
Establish a baseline first (git stash, run tsc, git stash pop).
Zero NEW errors are acceptable. Pre-existing errors in tsconfig.json
or unrelated files are acceptable if present on baseline.
If new errors are introduced: fix them before proceeding.
If errors cannot be fixed within the directive scope: HARD_STOP.

### Step 8 — File report-back
Create: PROGRAM_CONTROL/REPORT_BACK/[ID]-REPORT-BACK.md
(or the exact path specified in the directive's Report-Back Requirements)

Must include:
  - Branch and HEAD commit hash
  - Files created (list)
  - Files modified (list with summary of changes)
  - Files confirmed unchanged (list)
  - All GovernanceConfig constants used (confirm from source, not memory)
  - All NATS topic constants used (confirm from registry)
  - Prisma schema confirmed unchanged (or changes described if directive requires)
  - All 15 invariants: confirmed or flagged with explanation
  - Multi-tenant mandate: confirmed
  - npx tsc --noEmit result with baseline comparison
  - Any deviations from directive with explanation
  - git diff --stat output
  - Result: SUCCESS or HARD_STOP with exact error

### Step 9 — Update REQUIREMENTS_MASTER
Open docs/REQUIREMENTS_MASTER.md.
Find the row matching this directive's requirement ID(s).
Update the Status field: QUEUED or NEEDS_DIRECTIVE → DONE.
If the directive retired code: update relevant row Status to RETIRED.

### Step 10 — Move to DONE
Move the directive file:
  FROM: PROGRAM_CONTROL/DIRECTIVES/IN_PROGRESS/[ID].md
  TO:   PROGRAM_CONTROL/DIRECTIVES/DONE/[ID].md

Commit all changes together in one commit:
  - Report-back file
  - REQUIREMENTS_MASTER.md status updates
  - Directive file move (IN_PROGRESS → DONE)
  - Any source code changes not already committed

Commit message format (non-FIZ):
  CHORE: [ID] complete — report-back filed, directive moved to DONE

Commit message format (FIZ-scoped):
  FIZ: [ID] — [description]
  REASON: [why]
  IMPACT: [what changed]
  CORRELATION_ID: [ID]-[date]
  GATE: [clearance reference]

### Step 11 — Open PR
Open a PR targeting main.
Title: [PREFIX]: [ID] — [short description]
Body: paste the full report-back content
Labels: claude-code-task, ready-for-review
FIZ-scoped directives: also add label fiz-review-required

FYI: GitHub Copilot coding agent will not open a PR unless explicitly
instructed. For Claude Code, always include the PR open step explicitly
in your session — do not assume it happens automatically.

---

## HARD_STOP Conditions

Stop immediately and output a clear HARD_STOP message if:
  - Directive file is missing required fields (Agent/Parallel-safe/Touches)
  - A GovernanceConfig constant the directive references does not exist
    AND the directive does not say to add it
  - A Prisma model the directive references does not exist in schema.prisma
    AND the directive does not say to create it
  - npx tsc --noEmit produces NEW errors that cannot be fixed within scope
  - Any FIZ-scoped change is missing REASON/IMPACT/CORRELATION_ID
  - A CLARIFY tag is present in the directive — CEO decision required
  - The directive asks Claude Code to clear a GOV gate — only CEO can do this
  - The directive asks Claude Code to modify another agent's completed work
    without an explicit human instruction in the directive body

---

## What Claude Code Must NEVER Do Autonomously
  - Modify another agent's completed work without explicit directive instruction
  - Clear a GOV gate (PROGRAM_CONTROL/CLEARANCES/ — CEO-signed only)
  - Merge its own PR (auto-merge handles this via CI)
  - Author new directives (directive authoring is Claude Chat's role)
  - Make CEO-level decisions when a CLARIFY tag is present
  - Use string literals for NATS topics (always use NATS_TOPICS.* constants)
  - Hardcode financial constants (always read from GovernanceConfig)
  - Create Prisma migrations unless the directive explicitly authorizes it

---

## Commit Format Quick Reference

Non-FIZ:
  [PREFIX]: [ID] — [short description]

FIZ-scoped (required format — all four lines mandatory):
  FIZ: [ID] — [description]
  REASON: [why this change is necessary]
  IMPACT: [what balances/flows/files are affected]
  CORRELATION_ID: [uuid or ID-date]
  GATE: [GOV gate clearance reference or N/A]

---

## Key File Paths

  Directive queue:     PROGRAM_CONTROL/DIRECTIVES/QUEUE/
  Directive progress:  PROGRAM_CONTROL/DIRECTIVES/IN_PROGRESS/
  Directive done:      PROGRAM_CONTROL/DIRECTIVES/DONE/
  Report-backs:        PROGRAM_CONTROL/REPORT_BACK/
  GOV gates:           PROGRAM_CONTROL/GOV-GATE-TRACKER.md
  Clearances:          PROGRAM_CONTROL/CLEARANCES/
  Requirements:        docs/REQUIREMENTS_MASTER.md
  Glossary:            docs/DOMAIN_GLOSSARY.md
  Tech Debt Delta:     docs/TECH_DEBT_DELTA_2026-04-16.md
  DFSP governance:     services/core-api/src/governance/governance.config.ts
  Platform governance: services/core-api/src/config/governance.config.ts
  NATS registry:       services/nats/topics.registry.ts
  Prisma schema:       prisma/schema.prisma
  AppModule:           services/core-api/src/app.module.ts
  Coding doctrine:     OQMI_SYSTEM_STATE.md
  Copilot rules:       .github/copilot-instructions.md
