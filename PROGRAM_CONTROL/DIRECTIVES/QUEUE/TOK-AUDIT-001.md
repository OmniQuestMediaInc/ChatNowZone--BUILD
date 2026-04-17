# DIRECTIVE: TOK-AUDIT-001

**Directive ID:** TOK-AUDIT-001
**Agent:** CLAUDE_CODE
**Parallel-safe:** YES
**Touches:** PROGRAM_CONTROL/REPORT_BACK/TOK-AUDIT-001-REPORT-BACK.md (CREATE)
**Mode:** DROID
**FIZ:** NO
**Commit prefix:** CHORE:
**Risk class:** R0
**Status:** QUEUED
**Gate:** NONE

---

## Objective

Perform a full codebase audit of all retired token types to produce a structured
inventory of every file, symbol, column, and import that must be removed or
migrated before TOK-RETIRE-001 can execute safely.

Retired token types in scope:
- **SZT / ShowZoneTokens** — show_token_balance, szt_*, ShowToken, ShowZoneToken,
  allotment job, conversion engine
- **Venue Scarcity Tokens** — venue_scarcity_*, scarcity SKU, scarcity pricing
  catalogue, inventory-gating logic
- **Wristband Token billing tier** — wristband_token_*, token economy layer only
  (wristband as a physical access identifier is RETAINED — audit the billing
  layer exclusively)
- **Standard-to-ShowToken conversion** — conversion engine, conversion UI,
  any conversion rate constant
- **Dual-balance wallet** — any wallet model or UI that displays two token
  balances simultaneously (standard + show)

**No code changes in this directive.** This is a read-only discovery pass.
Output is a structured report-back that gates TOK-RETIRE-001.

---

## Pre-flight Reads (MANDATORY)

Before running any search commands, read:

1. `docs/REQUIREMENTS_MASTER.md` — SECTION 1 (TOK-001 through TOK-010)
2. `docs/DOMAIN_GLOSSARY.md` — confirm correct terminology for each retired concept
3. `prisma/schema.prisma` — full file
4. `services/core-api/src/governance/governance.config.ts`
5. `services/core-api/src/config/governance.config.ts`
6. `services/nats/topics.registry.ts`

---

## Audit Tasks

### A. Prisma Schema Scan
Search `prisma/schema.prisma` for any column or model containing:
`show_token_balance`, `szt_`, `venue_scarcity_`, `wristband_token_`,
`standard_token_balance`, `ShowToken`, `ShowZone`, `dual_balance`

For each hit: record model name, field name, and line number.

### B. TypeScript / Service Scan
Search all `.ts` files under `services/` for:
- Imports or references to any retired token type by name
- Any conversion engine file or function (`convertToShow`, `convertSZT`,
  `allotSZT`, `ShowTokenAllotmentJob`, or similar)
- Any wallet service method that returns two token balances

For each hit: record file path, line number, symbol name, and usage type
(import / function / class / constant / comment).

### C. GovernanceConfig Scan
Confirm that `services/core-api/src/governance/governance.config.ts` and
`services/core-api/src/config/governance.config.ts` contain **no**
SZT-, scarcity-, or wristband-token-economy constants.
Record any found.

### D. NATS Topics Scan
Search `services/nats/topics.registry.ts` for any topic referencing
`szt`, `show_token`, `scarcity`, `wristband_token`, or `conversion`.
Record any found.

### E. UI / Frontend Scan
Search all non-`node_modules` files for string literals or component names
referencing `ShowZoneToken`, `SZT`, `show token`, `dual balance`, `wristband token`
(case-insensitive). Record file path, line number, and literal.

---

## Report-Back Requirements

Create: `PROGRAM_CONTROL/REPORT_BACK/TOK-AUDIT-001-REPORT-BACK.md`

The report-back must contain the following sections, filled with **exact
command outputs** — no synthesis, no summarization:

```
## Branch + HEAD

## Commands Run

## A. Prisma Schema Hits
(table: model | field | line — or "NONE FOUND")

## B. TypeScript / Service Hits
(table: file | line | symbol | usage-type — or "NONE FOUND")

## C. GovernanceConfig Hits
(table: file | constant | line — or "NONE FOUND")

## D. NATS Topics Hits
(table: key | topic-string | line — or "NONE FOUND")

## E. UI / Frontend Hits
(table: file | line | literal — or "NONE FOUND")

## Summary — Retirement Scope
- Total files requiring changes: N
- Total Prisma fields to remove or rename: N
- FIZ-scoped changes required: YES / NO
- Prerequisite migrations required: YES / NO
- Recommended TOK-RETIRE-001 sub-phasing: (list phases if scope warrants splitting)

## Result
SUCCESS or HARD_STOP with reason
```

---

## Definition of Done

- [ ] All five audit sections (A–E) completed with verbatim command output
- [ ] Report-back created at `PROGRAM_CONTROL/REPORT_BACK/TOK-AUDIT-001-REPORT-BACK.md`
- [ ] REQUIREMENTS_MASTER.md updated: TOK-001 through TOK-005 Directive column → TOK-AUDIT-001
- [ ] Directive moved to `PROGRAM_CONTROL/DIRECTIVES/DONE/TOK-AUDIT-001.md`
- [ ] No source code modified
