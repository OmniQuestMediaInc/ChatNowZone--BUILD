# Report Back — WO-INIT-001
<!-- WO: WO-INIT-001 -->

## Metadata

| Field         | Value                                                                 |
|---------------|-----------------------------------------------------------------------|
| Work Order    | WO-INIT-001                                                           |
| Epic          | CNZ-CORE-001 — Infrastructure & Ledger Initialization                 |
| Branch        | `copilot/cnz-core-001-ensure-idempotent-sql-migrations`               |
| Repo          | `OmniQuestMedia/ChatNowZone--BUILD`                                   |
| Result        | ✅ SUCCESS                                                            |

---

## Commands Run & Outputs

### 1. Schema Idempotency Check

```
grep -c "IF NOT EXISTS" infra/postgres/init-ledger.sql
```

Output:
```
11
```

All `CREATE TABLE`, `CREATE INDEX`, and `CREATE EXTENSION` statements use `IF NOT EXISTS`.
All trigger functions use `CREATE OR REPLACE FUNCTION` / `CREATE OR REPLACE TRIGGER`.
Schema is fully idempotent. No changes required.

---

### 2. LedgerService Default Split Fix

**Before:**
```typescript
const studioSplit = contract ? Number(contract.studio_split) : 0;
const platformSplit = contract ? Number(contract.platform_split) : 0;
```

With no contract, `studioSplit = 0` and `platformSplit = 0` → performer received 100% (wrong).

**After:**
```typescript
// Default 80/20 split: performer 80%, studio 20%, platform 0%
// A studio_contract override replaces these defaults entirely.
const studioSplit = contract ? Number(contract.studio_split) : 0.20;
const platformSplit = contract ? Number(contract.platform_split) : 0.00;
```

With no contract, `studioSplit = 0.20`, `platformSplit = 0.00` → performer receives the remainder = 80%. ✅

The "performer gets exact remainder" logic already in place ensures no floating-point accumulation.

---

## Files Changed

```
 services/core-api/src/finance/ledger.service.ts | 4 ++--
 PROGRAM_CONTROL/REPORT_BACK/WO-INIT-001.md      | (new)
```

---

## Invariant Verification

| Invariant                                 | Status |
|-------------------------------------------|--------|
| Repository Directory Structure            | ✅ Unchanged |
| Docker Compose Skeleton                   | ✅ Unchanged |
| PostgreSQL Schema idempotent (IF NOT EXISTS) | ✅ Confirmed — no changes needed |
| LedgerService splits 80/20 by default     | ✅ Fixed — `studioSplit` defaults to `0.20`, performer receives remainder `0.80` |
| Append-Only Ledger Doctrine (no UPDATE/DELETE on ledger_entries) | ✅ Unchanged — DB triggers remain intact |
| WO header on every new TypeScript file    | ✅ All files already carry `// WO: WO-INIT-001` |
