# REPORT-BACK: TOK-AUDIT-001

**Directive ID:** TOK-AUDIT-001
**Agent:** CLAUDE_CODE
**Mode:** DROID
**Result:** SUCCESS

---

## Branch and HEAD
- Branch: `claude/tok-audit-001-rate7k`
- HEAD: filled by commit step (see git log after merge)

---

## Files Modified
- `prisma/schema.prisma` — Added `token_origin String? @default("PURCHASED")` to `TokenBalance` model (one new nullable field, positioned after `tenant_id`, before `@@map`).
- `services/core-api/src/finance/types/ledger.types.ts` — Appended `TokenOrigin` enum (`PURCHASED`, `GIFTED`) to end of file. `WalletBucket` enum unchanged.
- `docs/REQUIREMENTS_MASTER.md` — TOK-006 status: `NEEDS_DIRECTIVE` → `DONE`; directive column set to `TOK-AUDIT-001`.

## Files Created
- `prisma/migrations/20260417000000_add_token_origin_to_token_balances/migration.sql`
- `PROGRAM_CONTROL/DIRECTIVES/DONE/TOK-AUDIT-001.md`
- `PROGRAM_CONTROL/REPORT_BACK/TOK-AUDIT-001.md`

## Files Confirmed Unchanged
- `services/core-api/src/finance/ledger.service.ts`
- `services/core-api/src/config/governance.config.ts`
- `services/core-api/src/governance/governance.config.ts`
- `services/nats/topics.registry.ts` (absent; not touched)

---

## Prisma Migration

**File:** `prisma/migrations/20260417000000_add_token_origin_to_token_balances/migration.sql`

**SQL:**
```sql
ALTER TABLE "token_balances"
  ADD COLUMN IF NOT EXISTS "token_origin" VARCHAR DEFAULT 'PURCHASED';
```

Idempotent (`IF NOT EXISTS`), nullable, defaulted to `'PURCHASED'` — no data migration required.

FYI: `npx prisma migrate dev` was not executed (no live Postgres in this environment). Migration file was authored to match the exact SQL specified in the directive and matches the existing migration folder convention (timestamp-prefixed directory with `migration.sql`).

---

## TokenBalance model after change

```
model TokenBalance {
  id                  String   @id @default(uuid())
  account_id          String
  contract_id         String?
  quantity            Int
  state               String
  state_changed_at    DateTime @default(now())
  state_changed_by    String?
  state_change_reason String?
  issued_at           DateTime @default(now())
  lifespan_days       Int
  expires_at          DateTime
  frozen_reason       String?
  compliance_review_id String?
  organization_id     String
  tenant_id           String
  token_origin        String?  @default("PURCHASED")

  @@map("token_balances")
}
```

---

## TokenOrigin enum (ledger.types.ts)

```ts
export enum TokenOrigin {
  PURCHASED = 'PURCHASED',
  GIFTED    = 'GIFTED',
}
```

---

## GovernanceConfig / NATS / Prisma

- GovernanceConfig constants used: NONE
- NATS topic constants used: NONE
- Prisma schema: CHANGED (one additive, nullable column on `TokenBalance`)

## Invariants

- [x] 1. Append-only — additive schema change; no existing columns removed
- [x] 2. FIZ four-line commit format applied
- [x] 3. No hardcoded constants — `TokenOrigin` enum values will be read from the enum; string-literal DB default is acceptable per directive
- [N/A] 4. crypto.randomInt()
- [x] 5. No `@angular/core` imports
- [x] 6. `npx tsc --noEmit` — zero new errors vs baseline (baseline shows only pre-existing `tsconfig.json(12,5) TS5101 baseUrl deprecation`)
- [N/A] 7. Logger — no service logic changed
- [x] 8. Report-back filed
- [N/A] 9. NATS
- [N/A] 10. AI advisory
- [N/A] 11. Step-up auth
- [N/A] 12. RBAC
- [N/A] 13. SHA-256
- [N/A] 14. Timestamps in America/Toronto
- [N/A] 15. `rule_applied_id`

**Multi-tenant mandate:** `organization_id` + `tenant_id` already present on `TokenBalance` — confirmed unchanged.

---

## npx tsc --noEmit

Baseline (main @ edc56e2):
```
tsconfig.json(12,5): error TS5101: Option 'baseUrl' is deprecated ...
```

Post-change:
```
tsconfig.json(12,5): error TS5101: Option 'baseUrl' is deprecated ...
```

**Zero new errors.** Pre-existing `tsconfig.json` deprecation is out of directive scope.

---

## git diff --stat

```
 PROGRAM_CONTROL/DIRECTIVES/DONE/TOK-AUDIT-001.md   | 45 ++++++++++++++++++++++
 PROGRAM_CONTROL/REPORT_BACK/TOK-AUDIT-001.md       |  new
 docs/REQUIREMENTS_MASTER.md                        |  2 +-
 prisma/migrations/20260417000000_add_token_origin_to_token_balances/migration.sql | 8 ++++
 prisma/schema.prisma                               |  1 +
 services/core-api/src/finance/types/ledger.types.ts| 12 ++++++
```

---

## Result: SUCCESS
