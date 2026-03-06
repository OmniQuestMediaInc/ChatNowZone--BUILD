# WO: INSTALL PAYROLL SPLITTER LOGIC

## Branch
`copilot/implement-payroll-split-logic`

## HEAD
`3db1b0f` (pre-commit; final HEAD updated after push)

## Files Changed
```
services/core-api/src/db.ts                        |  8 ++++++++
services/core-api/src/finance/ledger.service.ts    | 45 ++++++++++++++++++++++++++++++++++++++++++++++
services/core-api/src/finance/ledger.module.ts     |  9 +++++++++
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
| Deterministic Logic | ✅ Pure function: same inputs → same outputs; `Math.round` for reproducible cent values |
| Atomic Write | ✅ Wrapped in `db.$transaction([...])` |
| No Secrets / PII | ✅ No credentials or PII logged |

## Result
✅ SUCCESS
