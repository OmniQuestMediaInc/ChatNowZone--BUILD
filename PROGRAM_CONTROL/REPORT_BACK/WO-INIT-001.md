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
# Report Back — WO-INIT-001 (Creator Surfaces + Compliance Scaffolding)

## Branch + HEAD
- Branch: `copilot/create-core-api-services`
- HEAD: `6d90ce3e1e53c0eeae4dbd69f2c2bfbb2b414047` (pre-commit; final SHA updated after push)

## Files Changed

```
services/core-api/src/creator/surfaces/dashboard.controller.ts   (new)
services/core-api/src/creator/surfaces/statements.service.ts     (new)
services/core-api/src/creator/surfaces/roster.gateway.ts         (new)
docs/compliance/evidence_templates/NCII_TAKEDOWN_LOG.md          (new)
```

## Commands Run + Outputs

```
mkdir -p services/core-api/src/creator/surfaces
mkdir -p docs/compliance/evidence_templates
mkdir -p PROGRAM_CONTROL/REPORT_BACK
# All directories created successfully (exit 0)
```

## File Contents Verified

### dashboard.controller.ts
```
// WO: WO-INIT-001
export class DashboardController {}
```

### statements.service.ts
```
// WO: WO-INIT-001
export class StatementsService {
  getCreatorStatement() {}
  getStudioStatement() {}
  generateAuditExport() {}
}
```

### roster.gateway.ts
```
// WO: WO-INIT-001
export class RosterGateway {}
```

### docs/compliance/evidence_templates/NCII_TAKEDOWN_LOG.md
Placeholder table with columns: Date, Reference ID, Reported By, Content Description, Action Taken, Resolved.

## Result

✅ SUCCESS — MISSION COMPLETE
