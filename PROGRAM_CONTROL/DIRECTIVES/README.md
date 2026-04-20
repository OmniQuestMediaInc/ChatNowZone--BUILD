# PROGRAM CONTROL — DIRECTIVES WORKFLOW

This directory is the autonomous task pickup system for all agents
(GitHub Copilot, Droid, Claude Code) operating on this repo.

## Folder Lifecycle

A directive flows through these folders in order:

  QUEUE        → directive is ready to be picked up by its target agent
  IN_PROGRESS  → directive has been picked up; agent is actively working
  DONE         → directive complete; report-back filed in REPORT_BACK/
  BLOCKED      → directive cannot proceed; reason in front-matter

## Agent Pickup Protocol

Every agent session must, on start, perform these steps:

1. Scan PROGRAM_CONTROL/DIRECTIVES/QUEUE/ for any .md file whose
   front-matter TARGET field matches the agent's identity.
2. Sort matching directives by filename (which embeds CORRELATION_ID
   ordering — oldest thread number, lowest sequence number first).
3. Take the oldest directive. Move it from QUEUE/ to IN_PROGRESS/
   in a single commit.
4. Execute the directive per its scope.
5. File report-back at the path specified in the directive's
   REPORT_BACK_PATH front-matter field.
6. Move the directive from IN_PROGRESS/ to DONE/ in a single commit.
7. Repeat from step 1 until QUEUE/ contains no matching directives.

If a directive cannot be executed (blocked by sandbox, missing
dependency, etc.), move it from IN_PROGRESS/ to BLOCKED/ and append
a "## BLOCKED REASON" section to the directive file explaining what
blocks it and what operator action would unblock it.

## CEO-Gated Directives

Directives with front-matter `CEO_GATE: yes` must NOT auto-pickup.
CEO will personally move CEO-gated directives from QUEUE/ to a
special intermediate state by changing the STATUS front-matter field
from `queued-ceo-review` to `queued`. Agents only pick up directives
where STATUS is exactly `queued`.

## Directive Naming Convention

Filenames follow this pattern:

  THREAD<NN>-<DOMAIN>-<SEQ>-<short-slug>.md

Examples:
  THREAD16-AUDIT-002-followup-checks.md
  THREAD17-MEMB-001-tier-rename.md
  THREAD17-GGS-003-prototype-corrections.md

DOMAIN values follow the standard set: AUDIT, BOOTSTRAP, CLEANUP,
MEMB, FIZ, GOV, INFRA, GGS (GateGuard), CYR (Cyrano), CCZ, FC, OPS,
DISC, BUILDD, PROTO.

## Front-Matter Schema

Every directive .md file begins with this YAML-like header:

  ---
  TARGET: <copilot|droid|claude-code>
  CORRELATION_ID: <THREAD##-DOMAIN-###>
  CEO_GATE: <yes|no>
  STATUS: <queued|queued-ceo-review|in-progress|done|blocked>
  REPORT_BACK_PATH: PROGRAM_CONTROL/REPORT_BACK/<filename>.md
  CREATED: <ISO-8601 UTC>
  AUTHOR: <name>
  ---

The body of the directive follows the front-matter and uses the
TEMPLATE.md structure.

## Authority and Drift Prevention

This workflow is governance-layer infrastructure. Any change to
this README, to TEMPLATE.md, or to the folder structure itself
requires a CEO-gated directive of its own (CEO_GATE: yes). Agents
must not modify these files via in-flight directive scope.
