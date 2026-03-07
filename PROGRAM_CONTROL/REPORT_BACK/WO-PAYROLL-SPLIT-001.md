# WO: INSTALL PAYROLL SPLITTER LOGIC

## Branch
`copilot/implement-payroll-split-logic`

## HEAD
`e495baa`

## Files Changed
```
services/core-api/src/db.ts                        |  8 ++++++++
services/core-api/src/finance/ledger.service.ts    | 45 ++++++++++++++++++++++++++++++++++++++++++++++
services/core-api/src/finance/ledger.module.ts     |  9 +++++++++
```

## Commands Run + Verbatim Outputs

```
$ git log --oneline -3
e495baa Merge branch 'main' into copilot/implement-payroll-split-logic
3f6bd94 feat: install payroll splitter logic (LedgerService, LedgerModule, db singleton)
395feb0 feat(risk-engine): install RegionSignalService — Trusted Region Signal (R2)

$ git diff --stat HEAD~1 HEAD
 PROGRAM_CONTROL/REPORT_BACK/WO-PAYROLL-SPLIT-001.md |  42 ++++++++++++++
 services/core-api/src/db.ts                         |   8 +++
 services/core-api/src/finance/ledger.module.ts      |   9 +++
 services/core-api/src/finance/ledger.service.ts     |  46 +++++++++++++++
 4 files changed, 105 insertions(+)
```

## Changes Applied

### `services/core-api/src/db.ts`
Prisma singleton client — reuse the same `PrismaClient` instance across the process to prevent connection pool exhaustion.

### `services/core-api/src/finance/ledger.service.ts`
Installed exactly per droid command payload:
- `@Injectable()` NestJS decorator applied
- `REGULAR_PAYOUT_RATE = 0.065` and `VIP_PAYOUT_RATE = 0.080` rate constants
- `processSplitTransaction` method: resolves studio contract, calculates split using `Math.round` to prevent floating-point cent errors, writes atomic `$transaction` INSERT to `ledger_entries`
- Imports `db` from already-initialized Prisma singleton

### `services/core-api/src/finance/ledger.module.ts`
NestJS `LedgerModule` wrapping `LedgerService` as provider and export.

## Doctrine Compliance

| Invariant | Status |
|---|---|
| Append-Only Ledger | ✅ `db.$transaction([db.ledger_entries.create(...)])` — INSERT only, no UPDATE/DELETE |
| Deterministic Logic | ✅ Split calculation is deterministic: same inputs → same outputs; `Math.round` for reproducible cent values |
| Atomic Write | ✅ Wrapped in `db.$transaction([...])` |
| No Secrets / PII | ✅ No credentials or PII logged |

## Result
✅ SUCCESS
