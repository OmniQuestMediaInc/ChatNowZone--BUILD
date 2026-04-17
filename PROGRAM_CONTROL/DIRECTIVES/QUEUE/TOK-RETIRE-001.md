# DIRECTIVE: TOK-RETIRE-001

**Directive ID:** TOK-RETIRE-001
**Agent:** CLAUDE_CODE
**Parallel-safe:** NO
**Touches:** prisma/schema.prisma, services/ (multiple — see audit inventory),
  infra/postgres/init-ledger.sql (if applicable per audit)
**Mode:** DROID
**FIZ:** YES
**Commit prefix:** FIZ: (for balance/migration commits) + CHORE: (for dead-code removal)
**Risk class:** R2
**Status:** QUEUED
**Gate:** TOK-AUDIT-001 report-back filed and result = SUCCESS

---

## Objective

Remove all retired token types from the codebase as identified by TOK-AUDIT-001.

Retired types in scope (requirements TOK-001 through TOK-005):

| Req | Retired System | FIZ |
|-----|----------------|-----|
| TOK-001 | ShowZoneTokens (SZT) — schema, wallet, conversion engine, allotment job | YES |
| TOK-002 | Venue Scarcity Token — SKU, pricing catalogue, inventory-gating, wallet refs | NO |
| TOK-003 | Wristband Token billing tier — bundle ladder, wallet, payout engine, UI | NO |
| TOK-004 | Standard-to-ShowToken conversion engine and conversion UI | NO |
| TOK-005 | Dual-balance wallet UI — rework to single CZT balance display | NO |

> FYI: Wristband as a physical access identifier is **RETAINED**. Only the
> wristband token economy / billing tier layer is removed.

---

## Pre-flight Reads (MANDATORY — do not skip)

Before writing a single line of code:

1. `PROGRAM_CONTROL/REPORT_BACK/TOK-AUDIT-001-REPORT-BACK.md` — **read in full**.
   If this file does not exist or shows `HARD_STOP`: do NOT proceed. HARD_STOP.
2. `docs/REQUIREMENTS_MASTER.md` — SECTION 1 (TOK-001 through TOK-005 and TOK-010)
3. `docs/DOMAIN_GLOSSARY.md` — confirm all CZT, SZT, Wallet, token-origin terminology
4. `prisma/schema.prisma` — full file
5. `services/core-api/src/governance/governance.config.ts`
6. `services/core-api/src/config/governance.config.ts`
7. `services/nats/topics.registry.ts`
8. Every file listed in the TOK-AUDIT-001 report-back audit sections A–E

---

## Execution Plan

Follow the phasing defined in the TOK-AUDIT-001 report-back "Recommended sub-phasing"
section. If no sub-phasing was recommended, use the default phases below.

### Phase 1 — SZT Balance Migration (FIZ-scoped)

> This phase requires a separate FIZ-prefixed commit.

If the TOK-AUDIT-001 report-back identifies any `show_token_balance` or `szt_*`
columns that contain non-zero data rows, a data migration is required before
schema removal:

1. Write an idempotent migration script (SQL or Prisma migration) that:
   - Reads each wallet row with a non-null `show_token_balance`
   - Applies the CEO-confirmed SZT→CZT conversion rate
   - Creates a `LedgerEntry` offset row with:
     - `entry_type: 'SZT_MIGRATION'`
     - `reason_code: 'TOK-001-SZT-TO-CZT-MIGRATION'`
     - `correlation_id: 'TOK-RETIRE-001-<run-date>'`
   - Sets `show_token_balance` to 0 (do not DELETE the column yet)
   - Is idempotent: re-running produces no duplicate entries
2. Run migration in a transaction. Log row count before and after.
3. File migration output in the report-back.

> **CLARIFY gate:** If the SZT→CZT conversion rate is not defined in
> GovernanceConfig or approved by CEO before this directive executes,
> HARD_STOP and open a blocking issue: "CLARIFY: SZT→CZT migration rate
> not defined — CEO sign-off required before TOK-RETIRE-001 Phase 1."

### Phase 2 — Dead-Code Removal (non-FIZ)

Remove all code identified in TOK-AUDIT-001 audit sections B–E that references:
- Venue Scarcity Token logic (TOK-002)
- Wristband token billing tier (TOK-003 — billing layer only)
- Standard-to-ShowToken conversion engine and conversion UI (TOK-004)

Rules:
- Remove functions, classes, and imports that are exclusively used by retired logic.
- Do NOT remove shared utilities that serve non-retired code.
- Do NOT rename any domain concept unless the DOMAIN_GLOSSARY.md explicitly
  directs the rename.
- Add a `// RETIRED: TOK-RETIRE-001 <symbol>` comment on the line of any
  remaining stub or interface that will be cleaned up in a later migration.

### Phase 3 — Prisma Schema Cleanup

Remove or rename Prisma fields identified in TOK-AUDIT-001 section A:
- Remove: `show_token_balance`, `szt_*`, `venue_scarcity_*`, `wristband_token_*`
- Rename: `standard_token_balance` → `czt_balance` (if present)

> This phase requires a Prisma migration. Create the migration file.
> Confirm `infra/postgres/init-ledger.sql` is updated to match if it
> defines these columns directly.
>
> All schema invariants apply: every table must retain `correlation_id`
> and `reason_code` fields.

### Phase 4 — Wallet UI to Single CZT Balance (TOK-005)

Rework the wallet display component(s) identified in TOK-AUDIT-001 section E
from a dual-balance view (standard + show) to a single `czt_balance` display.

Rules:
- Do NOT redesign the wallet UI — only remove the second balance display.
- Keep all non-SZT wallet features intact.
- Update any labels, copy, or constants that reference "Show Tokens" or "SZT".

---

## Commit Format

### FIZ commit (Phase 1 — SZT migration):
```
FIZ: TOK-RETIRE-001 Phase 1 — SZT→CZT balance migration
REASON: TOK-001 requires migrating all show_token_balance records to CZT equivalent
before schema column removal; append-only ledger offset rows created
IMPACT: LedgerEntry rows added (type SZT_MIGRATION); show_token_balance zeroed;
no other balance columns modified; no service logic changed in this commit
CORRELATION_ID: TOK-RETIRE-001-<run-date>
GATE: TOK-AUDIT-001 SUCCESS
```

### Non-FIZ commits (Phases 2–4):
```
CHORE: TOK-RETIRE-001 Phase 2 — remove SZT/scarcity/wristband dead code
CHORE: TOK-RETIRE-001 Phase 3 — Prisma schema cleanup (remove retired token columns)
CHORE: TOK-RETIRE-001 Phase 4 — wallet UI to single CZT balance display
```

---

## Invariant Checklist (all 15 must be confirmed in report-back)

1. No UPDATE on balance columns — Phase 1 uses offset LedgerEntry rows only
2. Every new table/migration includes `correlation_id` and `reason_code`
3. Postgres/Redis never on public interfaces — unchanged
4. No secrets logged or committed
5. All chat/haptic events remain via NATS — unchanged
6. No refactoring of non-retired code
7. No renaming of domain concepts without DOMAIN_GLOSSARY.md authority
8. `npx tsc --noEmit` zero NEW errors
9. No hardcoded financial constants — GovernanceConfig only
10. Multi-tenant mandate: organization_id + tenant_id on all new Prisma writes
11. Wristband as physical access identifier RETAINED — only billing tier removed
12. No deletion of LedgerEntry or Transaction rows
13. SZT migration is idempotent
14. CLARIFY gate triggered if SZT→CZT rate is undefined
15. No existing tests removed or edited unless they exclusively test retired code

---

## Report-Back Requirements

Create: `PROGRAM_CONTROL/REPORT_BACK/TOK-RETIRE-001-REPORT-BACK.md`

Must include:
- Branch + HEAD commit hash
- Files created (list)
- Files modified (list with summary of changes per phase)
- Files confirmed unchanged
- Phase 1: migration row counts (before / after)
- Phase 3: Prisma migration file name and diff summary
- All 15 invariants: confirmed or flagged with explanation
- Multi-tenant mandate: confirmed
- `npx tsc --noEmit` result with baseline comparison
- Any CLARIFY gates triggered
- `git diff --stat` output
- Result: SUCCESS or HARD_STOP with exact error

---

## Definition of Done

- [ ] Phase 1: SZT balance migration executed (or NOT_APPLICABLE if zero SZT balances found)
- [ ] Phase 2: all dead-code references to retired token types removed
- [ ] Phase 3: Prisma schema columns removed / renamed; migration created
- [ ] Phase 4: wallet UI updated to single CZT balance display
- [ ] `npx tsc --noEmit` zero new errors
- [ ] All 15 invariants confirmed
- [ ] Report-back filed at `PROGRAM_CONTROL/REPORT_BACK/TOK-RETIRE-001-REPORT-BACK.md`
- [ ] `docs/REQUIREMENTS_MASTER.md` updated: TOK-001 through TOK-005 Status → DONE, Directive → TOK-RETIRE-001
- [ ] Directive moved to `PROGRAM_CONTROL/DIRECTIVES/DONE/TOK-RETIRE-001.md`
