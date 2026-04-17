# DIRECTIVE: TOK-AUDIT-001
# Add token_origin to TokenBalance — CZT Origin Tagging

**Directive ID:** TOK-AUDIT-001
**Agent:** CLAUDE_CODE
**Parallel-safe:** YES
**Touches:** prisma/schema.prisma, services/core-api/src/finance/types/ledger.types.ts
**Mode:** DROID
**FIZ:** YES
**Commit prefix:** FIZ:
**Risk class:** R1
**Status:** DONE
**Gate:** NONE — additive only, no removals

---

## Objective

Add token_origin (PURCHASED / GIFTED) to the TokenBalance Prisma model
and add a TokenOrigin enum to ledger.types.ts. Additive only — no
existing columns removed, no existing logic changed.

---

## Scope

### Files Modified
- `prisma/schema.prisma`
- `services/core-api/src/finance/types/ledger.types.ts`

### Files Created
- `prisma/migrations/20260417000000_add_token_origin_to_token_balances/migration.sql`

---

## Definition of Done

- [x] `token_origin String? @default("PURCHASED")` added to TokenBalance model
- [x] Prisma migration created, named `add_token_origin_to_token_balances`
- [x] `TokenOrigin` enum exported from ledger.types.ts
- [x] No other files modified
- [x] `npx tsc --noEmit` clean (zero new errors vs baseline)
- [x] Report-back filed to `PROGRAM_CONTROL/REPORT_BACK/TOK-AUDIT-001.md`
- [x] `docs/REQUIREMENTS_MASTER.md` TOK-006 updated to DONE
- [x] Directive recorded at `PROGRAM_CONTROL/DIRECTIVES/DONE/TOK-AUDIT-001.md`
