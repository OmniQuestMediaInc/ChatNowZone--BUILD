# CLAUDE CODE BACKLOG v3 — ChatNow.Zone
**Authority:** OmniQuest Media Inc. | CEO Kevin B. Hartley
**Backlog Version:** 3.0
**Generated:** 2026-03-29
**Supersedes:** CLAUDE_CODE_BACKLOG_v2.md (Tiers 1–4 complete)
**Platform Time Standard:** America/Toronto
**Canonical Authority:** OQMI Coding Doctrine v2.0 · Canonical Corpus v10

---

## COMPLETED — TIERS 1–4

| Directive | Description | Status |
|-----------|-------------|--------|
| FIZ-001 | GovernanceConfig constants | ✅ |
| FIZ-002 | Dispute resolution (NestJS) | ✅ |
| FIZ-003 | Three-Bucket Wallet | ✅ |
| FIZ-004 | Schema — 6 new tables | ✅ |
| BIJOU-001 | PassPricingService + MinSeatGateService | ✅ |
| GOV-001 | GeoPricingService | ✅ |
| GM-001 | GameEngineService | ✅ |
| GM-002 | GamesModule wiring | ✅ |
| HZ-001 | HeatScoreService | ✅ |
| NATS-001 | NATS fabric scaffold | ✅ |
| GOV-002 | WormExportService | ✅ |
| GOV-003 | ZONE-GPT ProposalService | ✅ |
| GOV-004 | SovereignCaCMiddleware | ✅ |
| INFRA-001 | NestJS scaffold + tsconfig | ✅ |
| INFRA-002/003 | TypeScript fixes | ✅ |

---

## HOW TO USE THIS FILE

Same rules as v1 and v2. One directive per session unless told otherwise.
Read `OQMI CODING DOCTRINE v2.0` and `.github/copilot-instructions.md` first.
FIZ commits require the four-line format. Report-back is mandatory.

**FIZ commit format:**
```
FIZ: <short description>
REASON: <why this change is necessary>
IMPACT: <what balances/flows/constants are affected>
CORRELATION_ID: <generate a uuid v4>
```

---

## TIER 5A — HOUSEKEEPING (RUN FIRST, IN ORDER)

Two directives that fix gaps left by the merge sweep before v3 proper begins.
These must complete before any other v3 directive.

---

### DIRECTIVE: HOUSE-001
**Status:** `[ ] TODO`
**Commit prefix:** `CHORE:`
**File:** `services/core-api/src/app.module.ts` (MODIFY)
**Risk class:** R2

**Context:** The current `AppModule` on main is missing three module registrations
and one import that were dropped during merge consolidation:
- `NatsModule` — built by NATS-001, must be first import (global module)
- `GamesModule` — built by GM-002, wires the games controller
- `ZoneGptModule` — built by GOV-003, provides ProposalService
- `SovereignCaCMiddleware` import statement — the `configure()` method
  references it but the import is absent, causing a runtime crash

**Task:** Replace `services/core-api/src/app.module.ts` with the following
complete, correct version. Do NOT add anything beyond what is listed — no
new modules, no new logic.

```typescript
// services/core-api/src/app.module.ts
// CHORE: HOUSE-001 — restore missing module registrations dropped in merge
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { CreatorModule } from './creator/creator.module';
import { SafetyModule } from './safety/safety.module';
import { GrowthModule } from './growth/growth.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ComplianceModule } from './compliance/compliance.module';
import { NatsModule } from './nats/nats.module';
import { GamesModule } from './games/games.module';
import { SovereignCaCMiddleware } from './compliance/sovereign-cac.middleware';
import { ZoneGptModule } from '../../zone-gpt/src/zone-gpt.module';

@Module({
  imports: [
    NatsModule,        // FIRST — global module, must be registered before all others
    CreatorModule,
    SafetyModule,
    GrowthModule,
    AnalyticsModule,
    ComplianceModule,
    GamesModule,
    ZoneGptModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(SovereignCaCMiddleware)
      .forRoutes('*');
  }
}
```

**Validation:**
- `NatsModule` is first in the imports array
- `SovereignCaCMiddleware` import statement is present
- `ZoneGptModule` import path is correct (`../../zone-gpt/src/zone-gpt.module`)
- `GamesModule` present in imports
- `npx tsc --noEmit` introduces zero new errors

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/HOUSE-001-APPMODULE-RESTORE.md`

---

### DIRECTIVE: HOUSE-002
**Status:** `[ ] TODO`
**Commit prefix:** `INFRA:`
**File:** `.github/workflows/notify.yml` (CREATE)
**Risk class:** R2

**Context:** The notify workflow (INFRA-002) was built and committed at `1516b37`
but never reached main. This directive creates it directly.

**Task:** Create `.github/workflows/notify.yml` with the following content exactly:

```yaml
# INFRA: Program Control notification — fires when report-back files land on main
name: Program Control Notify

on:
  push:
    branches: [main]
    paths:
      - 'PROGRAM_CONTROL/REPORT_BACK/**'

permissions:
  contents: read

jobs:
  notify:
    name: Notify Program Control
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 2

      - name: Detect new report-back files
        id: detect
        run: |
          NEW_FILES=$(git diff --name-only HEAD~1 HEAD -- 'PROGRAM_CONTROL/REPORT_BACK/*.md' | tr '\n' ', ')
          echo "new_files=$NEW_FILES" >> $GITHUB_OUTPUT
          echo "commit_sha=${GITHUB_SHA::8}" >> $GITHUB_OUTPUT
          echo "commit_msg=$(git log -1 --pretty=%s)" >> $GITHUB_OUTPUT

      - name: Post to webhook
        if: steps.detect.outputs.new_files != ''
        env:
          NOTIFY_WEBHOOK: ${{ secrets.PROGRAM_CONTROL_WEBHOOK }}
        run: |
          if [ -z "$NOTIFY_WEBHOOK" ]; then
            echo "PROGRAM_CONTROL_WEBHOOK secret not set — skipping notification"
            exit 0
          fi
          curl -s -X POST "$NOTIFY_WEBHOOK" \
            -H "Content-Type: application/json" \
            -d "{
              \"text\": \"ChatNow.Zone BUILD — Report-back landed on main\",
              \"attachments\": [{
                \"color\": \"good\",
                \"fields\": [
                  {\"title\": \"Commit\", \"value\": \"${{ steps.detect.outputs.commit_sha }}\", \"short\": true},
                  {\"title\": \"Files\", \"value\": \"${{ steps.detect.outputs.new_files }}\", \"short\": false},
                  {\"title\": \"Message\", \"value\": \"${{ steps.detect.outputs.commit_msg }}\", \"short\": false}
                ]
              }]
            }"
```

**Validation:**
- File exists at `.github/workflows/notify.yml`
- `paths:` filter targets `PROGRAM_CONTROL/REPORT_BACK/**`
- Webhook step exits `0` gracefully when secret is absent

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/HOUSE-002-NOTIFY-WORKFLOW.md`

---

## TIER 5B — PRISMA SCHEMA WIRING

This is the most important tier in v3. Every service currently uses
`Record<string, unknown>` TypeORM workarounds or the raw Prisma singleton
from `db.ts`. This tier generates typed Prisma models from the existing
SQL schema and replaces the untyped patterns.

Do not start Tier 5B until HOUSE-001 and HOUSE-002 are merged.

---

### DIRECTIVE: PRISMA-001
**Status:** `[ ] TODO`
**Commit prefix:** `FIZ:`
**Files:** `prisma/schema.prisma` (CREATE), `services/core-api/src/prisma.service.ts` (MODIFY — register as global provider)
**Risk class:** R0

**Context:** The repo has a `PrismaService` that extends `PrismaClient` but no
`prisma/schema.prisma` exists. Without the schema, `prisma generate` cannot
produce typed models, and all database access remains untyped. This directive
creates the Prisma schema that mirrors the existing SQL tables in
`infra/postgres/init-ledger.sql` — all 15 tables.

**Task 1: Create `prisma/schema.prisma`**

```prisma
// prisma/schema.prisma
// PRISMA-001: Prisma schema mirroring infra/postgres/init-ledger.sql
// All 15 tables. Append-only tables documented with @@map and comments.
// DO NOT add relations that don't exist in the SQL — match schema exactly.

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ── Append-only: no update/delete permitted (enforced by DB triggers) ──────

model LedgerEntry {
  id                    String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  transaction_ref       String   @unique @db.VarChar(100)
  idempotency_key       String   @unique @db.VarChar(200)
  parent_entry_id       String?  @db.Uuid
  user_id               String   @db.Uuid
  studio_id             String?  @db.Uuid
  performer_id          String?  @db.Uuid
  contract_id           String?  @db.Uuid
  entry_type            String   @db.VarChar(50)
  status                String   @default("PENDING") @db.VarChar(20)
  gross_amount_cents    BigInt
  fee_amount_cents      BigInt   @default(0)
  net_amount_cents      BigInt
  currency              String   @default("USD") @db.Char(3)
  studio_amount_cents   BigInt   @default(0)
  performer_amount_cents BigInt  @default(0)
  platform_amount_cents BigInt   @default(0)
  gateway               String?  @db.VarChar(50)
  gateway_txn_id        String?  @db.VarChar(200)
  gateway_response      Json?
  description           String?
  metadata              Json?
  created_at            DateTime @default(now()) @db.Timestamptz

  @@map("ledger_entries")
}

model Transaction {
  id               String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  transaction_ref  String   @unique @db.VarChar(100)
  idempotency_key  String   @unique @db.VarChar(200)
  user_id          String   @db.Uuid
  performer_id     String?  @db.Uuid
  studio_id        String?  @db.Uuid
  transaction_type String   @db.VarChar(50)
  status           String   @default("PENDING") @db.VarChar(20)
  gross_amount_cents BigInt
  currency         String   @default("USD") @db.Char(3)
  metadata         Json?
  created_at       DateTime @default(now()) @db.Timestamptz
  updated_at       DateTime @default(now()) @db.Timestamptz

  @@map("transactions")
}

model AuditEvent {
  event_id           String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  event_type         String   @db.VarChar(50)
  actor_id           String   @db.Uuid
  performer_id       String?  @db.Uuid
  purpose_code       String?  @db.VarChar(100)
  device_fingerprint String?  @db.VarChar(255)
  outcome            String?  @db.VarChar(50)
  reason_code        String?  @db.VarChar(100)
  template_id        String?  @db.VarChar(100)
  consent_basis_id   String?  @db.VarChar(100)
  metadata           Json?
  created_at         DateTime @default(now()) @db.Timestamptz

  @@map("audit_events")
}

model IdentityVerification {
  verification_id              String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  performer_id                 String    @db.Uuid
  document_hash                String    @db.Char(64)
  dob                          DateTime  @db.Date
  status                       String    @default("PENDING") @db.VarChar(20)
  expiry_date                  DateTime? @db.Timestamptz
  liveness_pass                Boolean   @default(false)
  expiry_override_actor_id     String?   @db.Uuid
  expiry_override_reason_code  String?   @db.VarChar(100)
  expiry_override_at           DateTime? @db.Timestamptz
  created_at                   DateTime  @default(now()) @db.Timestamptz
  updated_at                   DateTime  @default(now()) @db.Timestamptz

  @@map("identity_verification")
}

model UserRiskProfile {
  id                  String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id             String    @unique @db.Uuid
  risk_score          Decimal   @default(0.00) @db.Decimal(5, 2)
  risk_tier           String    @default("UNRATED") @db.VarChar(20)
  total_charged_back  Decimal   @default(0.00) @db.Decimal(12, 2)
  total_disputed      Decimal   @default(0.00) @db.Decimal(12, 2)
  total_approved      Decimal   @default(0.00) @db.Decimal(12, 2)
  chargeback_ratio    Decimal   @default(0.0000) @db.Decimal(5, 4)
  daily_spend_limit   Decimal   @default(500.00) @db.Decimal(12, 2)
  monthly_spend_limit Decimal   @default(5000.00) @db.Decimal(12, 2)
  created_at          DateTime  @default(now()) @db.Timestamptz
  updated_at          DateTime  @default(now()) @db.Timestamptz
  last_evaluated_at   DateTime? @db.Timestamptz

  @@map("user_risk_profiles")
}

model StudioContract {
  id                         String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  studio_id                  String    @db.Uuid
  performer_id               String    @db.Uuid
  contract_ref               String    @unique @db.VarChar(100)
  effective_date             DateTime  @db.Date
  expiry_date                DateTime? @db.Date
  status                     String    @default("ACTIVE") @db.VarChar(20)
  studio_split               Decimal   @db.Decimal(5, 4)
  performer_split            Decimal   @db.Decimal(5, 4)
  platform_split             Decimal   @default(0.0000) @db.Decimal(5, 4)
  performer_floor_per_minute Decimal?  @db.Decimal(8, 4)
  created_at                 DateTime  @default(now()) @db.Timestamptz
  updated_at                 DateTime  @default(now()) @db.Timestamptz
  created_by                 String    @db.Uuid

  @@map("studio_contracts")
}

model ReferralLink {
  id                       String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  creator_id               String   @db.Uuid
  campaign_id              String   @db.Uuid
  attribution_window_days  Int
  link_slug                String   @unique @db.VarChar(100)
  device_fingerprint       String?  @db.VarChar(255)
  payment_instrument_hash  String?  @db.VarChar(64)
  is_active                Boolean  @default(true)
  metadata                 Json?
  created_at               DateTime @default(now()) @db.Timestamptz

  @@map("referral_links")
}

model AttributionEvent {
  id                      String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  referral_link_id        String   @db.Uuid
  creator_id              String   @db.Uuid
  campaign_id             String   @db.Uuid
  attributed_user_id      String   @db.Uuid
  event_type              String   @db.VarChar(50)
  device_fingerprint      String?  @db.VarChar(255)
  payment_instrument_hash String?  @db.VarChar(64)
  ledger_entry_id         String?  @db.Uuid
  rule_applied_id         String?  @db.VarChar(100)
  platform_time           DateTime @default(now()) @db.Timestamptz
  metadata                Json?
  created_at              DateTime @default(now()) @db.Timestamptz

  @@map("attribution_events")
}

model NotificationConsentStore {
  id                       String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id                  String   @db.Uuid
  channel                  String   @db.VarChar(20)
  is_opted_in              Boolean  @default(false)
  jurisdiction_rule_version String  @db.VarChar(50)
  created_at               DateTime @default(now()) @db.Timestamptz
  updated_at               DateTime @default(now()) @db.Timestamptz

  @@unique([user_id, channel])
  @@map("notification_consent_store")
}

model TipMenuItem {
  id                String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  creator_id        String   @db.Uuid
  item_name         String   @db.VarChar(100)
  description       String?
  base_price_tokens Int
  geo_price_low     Int?
  geo_price_med     Int?
  is_active         Boolean  @default(true)
  version           Int      @default(1)
  rule_applied_id   String   @default("TIP_MENU_v1") @db.VarChar(100)
  created_at        DateTime @default(now()) @db.Timestamptz

  @@map("tip_menu_items")
}

model GameSession {
  session_id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id             String   @db.Uuid
  creator_id          String   @db.Uuid
  game_type           String   @db.VarChar(20)
  token_tier          Int
  tokens_paid         Int
  ledger_entry_id     String?  @db.Uuid
  outcome             Json?
  prize_awarded       String?
  prize_table_version String   @db.VarChar(50)
  idempotency_key     String   @unique @db.VarChar(200)
  rule_applied_id     String   @default("GAMIFICATION_v1") @db.VarChar(100)
  created_at          DateTime @default(now()) @db.Timestamptz

  @@map("game_sessions")
}

model PrizeTable {
  id                String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  creator_id        String   @db.Uuid
  game_type         String   @db.VarChar(20)
  token_tier        Int
  prize_slot        String   @db.VarChar(20)
  prize_description String
  is_active         Boolean  @default(true)
  version           String   @db.VarChar(50)
  rule_applied_id   String   @default("PRIZE_TABLE_v1") @db.VarChar(100)
  created_at        DateTime @default(now()) @db.Timestamptz

  @@map("prize_tables")
}

model CallBooking {
  booking_id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  creator_id         String   @db.Uuid
  vip_user_id        String   @db.Uuid
  scheduled_at_utc   DateTime @db.Timestamptz
  block_type         String   @db.VarChar(20)
  block_duration_mins Int
  price_usd          Decimal  @db.Decimal(10, 2)
  status             String   @default("SCHEDULED") @db.VarChar(20)
  reschedule_fee_usd Decimal  @default(0.00) @db.Decimal(10, 2)
  ledger_entry_id    String?  @db.Uuid
  idempotency_key    String   @unique @db.VarChar(200)
  rule_applied_id    String   @default("PRIVATE_CALL_v1") @db.VarChar(100)
  created_at         DateTime @default(now()) @db.Timestamptz

  @@map("call_bookings")
}

model CallSession {
  session_id          String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  booking_id          String    @db.Uuid
  creator_login_at    DateTime? @db.Timestamptz
  vip_login_at        DateTime? @db.Timestamptz
  creator_ready_at    DateTime? @db.Timestamptz
  vip_ready_at        DateTime? @db.Timestamptz
  call_start_at       DateTime? @db.Timestamptz
  call_end_at         DateTime? @db.Timestamptz
  actual_duration_secs Int?
  creator_no_show     Boolean   @default(false)
  vip_no_show         Boolean   @default(false)
  voip_session_id     String?   @db.VarChar(200)
  rule_applied_id     String    @default("PRIVATE_CALL_v1") @db.VarChar(100)
  created_at          DateTime  @default(now()) @db.Timestamptz

  @@map("call_sessions")
}

model VoucherVault {
  voucher_id      String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  offer_name      String   @db.VarChar(100)
  description     String?
  eligible_tiers  String[]
  trigger_type    String   @default("LOGIN") @db.VarChar(50)
  token_value     Int?
  is_permanent    Boolean  @default(true)
  is_active       Boolean  @default(true)
  rule_applied_id String   @default("GWP_VAULT_v1") @db.VarChar(100)
  created_at      DateTime @default(now()) @db.Timestamptz

  @@map("voucher_vault")
}
```

**Task 2: Add `prisma generate` script to `package.json`**

Add to the `scripts` block:
```json
"prisma:generate": "prisma generate",
"prisma:push": "prisma db push --skip-generate"
```

**Task 3: Run `npx prisma generate`**

Run this command and confirm the client generates successfully. Output should
show `Generated Prisma Client` with all 15 models listed.

**Task 4: Modify `services/core-api/src/prisma.service.ts`**

Register `PrismaService` as a global provider by adding a `PrismaModule`:

Create `services/core-api/src/prisma.module.ts`:
```typescript
// services/core-api/src/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

Add `PrismaModule` as the SECOND import in `AppModule` (after `NatsModule`).

**Validation:**
- `prisma/schema.prisma` exists with 15 models
- `npx prisma generate` completes with zero errors
- All 15 model names appear in generate output
- `PrismaModule` is `@Global()` decorated
- `PrismaModule` is second in `AppModule` imports (after `NatsModule`)
- `npx tsc --noEmit` introduces zero new errors

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/PRISMA-001-SCHEMA-GENERATION.md`

---

### DIRECTIVE: PRISMA-002
**Status:** `[ ] TODO`
**Commit prefix:** `FIZ:`
**Files:** `services/core-api/src/safety/provisional-suppression.service.ts` (MODIFY)
**Risk class:** R0

**Context:** `ProvisionalSuppressionService` uses an in-memory `Map` for
suppression records. The file itself contains a `WARNING` comment stating
this must be replaced before go-live. With PrismaService now available
globally (after PRISMA-001), this directive migrates to DB-backed storage.

**Task:** Replace the in-memory `Map` in `provisional-suppression.service.ts`
with `PrismaService` calls. The `content_suppression_queue` table must be
added to `infra/postgres/init-ledger.sql` (ADDITIVE) and to
`prisma/schema.prisma` (ADDITIVE).

**Schema addition to `infra/postgres/init-ledger.sql` (append at end):**

```sql
-- =============================================================================
-- TABLE: content_suppression_queue
-- PURPOSE: DB-backed provisional suppression store (replaces in-memory Map).
-- MUTATION POLICY: INSERT for new records. UPDATE allowed on status only.
--                  DELETE prohibited.
-- WO: PRISMA-002
-- =============================================================================
CREATE TABLE IF NOT EXISTS content_suppression_queue (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id          VARCHAR(200) NOT NULL,
    case_id             VARCHAR(200) NOT NULL,
    rule_applied_id     VARCHAR(100) NOT NULL,
    status              VARCHAR(20)  NOT NULL DEFAULT 'PROVISIONAL'
                            CHECK (status IN ('PROVISIONAL', 'FINALIZED', 'LIFTED')),
    content_hash        CHAR(64),
    suppressed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finalized_at        TIMESTAMPTZ,
    lifted_at           TIMESTAMPTZ,
    lifted_by           UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_suppression_queue_content_id
    ON content_suppression_queue (content_id);
CREATE INDEX IF NOT EXISTS idx_suppression_queue_case_id
    ON content_suppression_queue (case_id);
CREATE INDEX IF NOT EXISTS idx_suppression_queue_status
    ON content_suppression_queue (status);

CREATE OR REPLACE FUNCTION content_suppression_queue_block_delete()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION
        'content_suppression_queue is append-only: DELETE is not permitted (id=%).', OLD.id;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_content_suppression_queue_block_delete
BEFORE DELETE ON content_suppression_queue
FOR EACH ROW EXECUTE FUNCTION content_suppression_queue_block_delete();
```

**Prisma model addition to `prisma/schema.prisma` (append at end):**

```prisma
model ContentSuppressionQueue {
  id              String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  content_id      String    @db.VarChar(200)
  case_id         String    @db.VarChar(200)
  rule_applied_id String    @db.VarChar(100)
  status          String    @default("PROVISIONAL") @db.VarChar(20)
  content_hash    String?   @db.Char(64)
  suppressed_at   DateTime  @default(now()) @db.Timestamptz
  finalized_at    DateTime? @db.Timestamptz
  lifted_at       DateTime? @db.Timestamptz
  lifted_by       String?   @db.Uuid
  created_at      DateTime  @default(now()) @db.Timestamptz

  @@map("content_suppression_queue")
}
```

**Service migration:** In `provisional-suppression.service.ts`:
- Add `PrismaService` as a constructor dependency
- Replace `provisionalSuppressions.set()` calls with `prisma.contentSuppressionQueue.create()`
- Replace `provisionalSuppressions.get()` calls with `prisma.contentSuppressionQueue.findFirst()`
- Replace status updates with `prisma.contentSuppressionQueue.update()` on `status` only
- Remove the `const provisionalSuppressions = new Map<...>()` declaration
- Remove the `WARNING` comment

**Validation:**
- No `Map<` declarations remain in the file
- `WARNING` comment removed
- `PrismaService` injected via constructor
- `npx prisma generate` succeeds with 16 models (15 + new one)
- `npx tsc --noEmit` zero new errors

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/PRISMA-002-SUPPRESSION-DB-MIGRATION.md`

---

## TIER 5C — SHOWZONE ROOM LIFECYCLE

Do not start until PRISMA-001 is complete.

---

### DIRECTIVE: SHOWZONE-001
**Status:** `[ ] TODO`
**Commit prefix:** `BIJOU:`
**Target path:** `services/showzone/src/` (CREATE directory)
**Risk class:** R1

**Context:** The ShowZone Theatre has pass pricing, min-seat gate, and NATS
topics — but no room lifecycle state machine. This directive creates the
core session service that manages the deterministic lifecycle from scheduling
through to reconciliation.

**Task 1: Create `services/showzone/src/room-session.service.ts`**

```typescript
// services/showzone/src/room-session.service.ts
// BIJOU: SHOWZONE-001 — ShowZone room lifecycle state machine
// Lifecycle: DRAFT → SCHEDULED → COUNTDOWN → LIVE_PHASE_1 → LIVE_PHASE_2 → ENDED
// All transitions are logged. Invalid transitions throw and are never silent.
import { Injectable, Logger } from '@nestjs/common';
import { NatsService } from '../../core-api/src/nats/nats.service';
import { NATS_TOPICS } from '../../nats/topics.registry';
import { SHOWZONE_PRICING, GOVERNANCE_TIMEZONE } from
  '../../core-api/src/config/governance.config';

export type RoomStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'COUNTDOWN'
  | 'LIVE_PHASE_1'
  | 'LIVE_PHASE_2'
  | 'ENDED'
  | 'CANCELLED';

export interface RoomSession {
  session_id: string;
  creator_id: string;
  venue: 'SHOWZONE';
  status: RoomStatus;
  scheduled_at_utc: string;
  phase2_enabled: boolean;
  phase2_capacity: number;
  pass_price_st: number;
  phase2_price_st: number;
  seats_sold: number;
  min_seats: number;
  countdown_started_at_utc?: string;
  live_started_at_utc?: string;
  phase2_started_at_utc?: string;
  ended_at_utc?: string;
  cancellation_reason?: string;
  rule_applied_id: string;
}

// Valid state transitions — any transition not listed here is prohibited
const VALID_TRANSITIONS: Record<RoomStatus, RoomStatus[]> = {
  DRAFT:        ['SCHEDULED', 'CANCELLED'],
  SCHEDULED:    ['COUNTDOWN', 'CANCELLED'],
  COUNTDOWN:    ['LIVE_PHASE_1', 'CANCELLED'],
  LIVE_PHASE_1: ['LIVE_PHASE_2', 'ENDED'],
  LIVE_PHASE_2: ['ENDED'],
  ENDED:        [],
  CANCELLED:    [],
};

@Injectable()
export class RoomSessionService {
  private readonly logger = new Logger(RoomSessionService.name);
  private readonly RULE_ID = 'SHOWZONE_LIFECYCLE_v1';

  constructor(private readonly nats: NatsService) {}

  /**
   * Transitions a session to a new status.
   * Validates the transition is permitted before applying.
   * Publishes NATS event for every transition.
   * Throws on invalid transition — no silent state corruption.
   */
  transition(
    session: RoomSession,
    to: RoomStatus,
    reason?: string,
  ): RoomSession {
    const allowed = VALID_TRANSITIONS[session.status];
    if (!allowed.includes(to)) {
      const msg =
        `INVALID_TRANSITION: ${session.status} → ${to} is not permitted ` +
        `for session ${session.session_id}. ` +
        `Allowed: [${allowed.join(', ')}]`;
      this.logger.error(msg, undefined, { session_id: session.session_id });
      throw new Error(msg);
    }

    const now = new Date().toISOString();
    const updated: RoomSession = { ...session, status: to };

    // Stamp the appropriate timestamp for this transition
    if (to === 'COUNTDOWN')    updated.countdown_started_at_utc = now;
    if (to === 'LIVE_PHASE_1') updated.live_started_at_utc = now;
    if (to === 'LIVE_PHASE_2') updated.phase2_started_at_utc = now;
    if (to === 'ENDED')        updated.ended_at_utc = now;
    if (to === 'CANCELLED')    updated.cancellation_reason = reason ?? 'NO_REASON_PROVIDED';

    this.logger.log('RoomSessionService: status transition', {
      session_id: session.session_id,
      from: session.status,
      to,
      reason: reason ?? null,
      rule_applied_id: this.RULE_ID,
    });

    // Publish transition event to NATS fabric
    const topic = to === 'ENDED' ? NATS_TOPICS.SHOWZONE_SHOW_ENDED
      : to === 'LIVE_PHASE_2'   ? NATS_TOPICS.SHOWZONE_PHASE2_TRIGGER
      : null;

    if (topic) {
      this.nats.publish(topic, {
        session_id: session.session_id,
        creator_id: session.creator_id,
        status: to,
        timestamp_utc: now,
        rule_applied_id: this.RULE_ID,
      });
    }

    return updated;
  }

  /**
   * Evaluates the T-1 hour auto-cancel gate.
   * Returns the session unchanged if gate passes.
   * Returns a CANCELLED session if seats_sold < min_seats.
   * Caller is responsible for persisting the result and issuing refunds.
   */
  evaluateMinSeatGate(session: RoomSession): {
    session: RoomSession;
    cancelled: boolean;
    reason_code: string;
  } {
    if (session.seats_sold >= session.min_seats) {
      return { session, cancelled: false, reason_code: 'MIN_SEAT_GATE_PASSED' };
    }

    const cancelled = this.transition(
      session,
      'CANCELLED',
      `MIN_SEAT_GATE_FAILED: ${session.seats_sold}/${session.min_seats} seats at T-1hr`,
    );

    this.logger.warn('RoomSessionService: auto-cancel triggered at T-1hr gate', {
      session_id: session.session_id,
      seats_sold: session.seats_sold,
      min_seats: session.min_seats,
      rule_applied_id: this.RULE_ID,
    });

    return {
      session: cancelled,
      cancelled: true,
      reason_code: `MIN_SEAT_GATE_FAILED: ${session.seats_sold}/${session.min_seats}`,
    };
  }

  /**
   * Builds a reconciliation snapshot on session end.
   * Returns the financial summary for ledger posting.
   * Caller posts to LedgerService — this method computes only.
   */
  buildReconciliationSnapshot(session: RoomSession): {
    session_id: string;
    creator_id: string;
    gross_st: number;
    creator_pool_st: number;
    platform_pool_st: number;
    phase2_gross_st: number;
    payout_rate_usd: number;
    rule_applied_id: string;
  } {
    const admissionGross = session.pass_price_st * session.seats_sold;
    const creatorPool = Math.round(admissionGross * 0.85);
    const platformPool = admissionGross - creatorPool;

    // Phase 2 is calculated separately — seats = 25% of Phase 1 capacity
    const phase2Seats = session.phase2_enabled
      ? Math.min(Math.round(session.seats_sold * SHOWZONE_PRICING.PHASE2_CAPACITY_PCT), session.seats_sold)
      : 0;
    const phase2Gross = session.phase2_enabled
      ? session.phase2_price_st * phase2Seats
      : 0;

    return {
      session_id: session.session_id,
      creator_id: session.creator_id,
      gross_st: admissionGross,
      creator_pool_st: creatorPool,
      platform_pool_st: platformPool,
      phase2_gross_st: phase2Gross,
      payout_rate_usd: SHOWZONE_PRICING.PAYOUT_RATE_PER_ST,
      rule_applied_id: this.RULE_ID,
    };
  }
}
```

**Task 2: Create `services/showzone/src/showzone.module.ts`**

```typescript
// services/showzone/src/showzone.module.ts
import { Module } from '@nestjs/common';
import { RoomSessionService } from './room-session.service';

@Module({
  providers: [RoomSessionService],
  exports: [RoomSessionService],
})
export class ShowZoneModule {}
```

**Task 3: Add `ShowZoneModule` to `AppModule` imports.**

**Validation:**
- All 7 status values present in `RoomStatus` type
- `VALID_TRANSITIONS` map covers all 7 statuses
- `transition()` throws on `DRAFT → LIVE_PHASE_1` (invalid)
- `transition()` succeeds on `DRAFT → SCHEDULED` (valid)
- `evaluateMinSeatGate()` returns `cancelled: true` when seats_sold < min_seats
- NATS publish called on `ENDED` and `LIVE_PHASE_2` transitions
- `npx tsc --noEmit` zero new errors

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/SHOWZONE-001-ROOM-SESSION-SERVICE.md`

---

## TIER 5D — BIJOU SESSION SERVICE

Do not start until SHOWZONE-001 is complete (shares patterns).

---

### DIRECTIVE: BIJOU-002
**Status:** `[ ] TODO`
**Commit prefix:** `BIJOU:`
**Target path:** `services/bijou/src/bijou-session.service.ts` (CREATE)
**Risk class:** R1

**Context:** Bijou Play.Zone has admission pricing and min-seat gate but no
session lifecycle, camera enforcement, standby queue, or dwell integration.
This directive creates the full Bijou session engine.

**Task 1: Create `services/bijou/src/bijou-session.service.ts`**

```typescript
// services/bijou/src/bijou-session.service.ts
// BIJOU: BIJOU-002 — Bijou Play.Zone session service
// Handles: camera enforcement, standby queue, dwell ticks, ejection, reconciliation.
import { Injectable, Logger } from '@nestjs/common';
import { NatsService } from '../../core-api/src/nats/nats.service';
import { NATS_TOPICS } from '../../nats/topics.registry';
import { BIJOU_PRICING } from '../../core-api/src/config/governance.config';

export interface BijouParticipant {
  user_id: string;
  seat_number: number;
  is_host: boolean;
  camera_active: boolean;
  entered_at_utc: string;
  camera_grace_expires_at_utc?: string;
  camera_warning_expires_at_utc?: string;
  total_dwell_secs: number;
  last_dwell_tick_utc?: string;
}

export interface StandbyEntry {
  user_id: string;
  queued_at_utc: string;
  notified_at_utc?: string;
  accept_expires_at_utc?: string;
}

export interface BijouSession {
  session_id: string;
  show_id: string;
  creator_id: string;
  max_participants: number;         // Always BIJOU_PRICING.MAX_PARTICIPANTS (24)
  participants: BijouParticipant[];
  standby_queue: StandbyEntry[];
  started_at_utc: string;
  ended_at_utc?: string;
  rule_applied_id: string;
}

@Injectable()
export class BijouSessionService {
  private readonly logger = new Logger(BijouSessionService.name);
  private readonly RULE_ID = 'BIJOU_SESSION_v1';

  constructor(private readonly nats: NatsService) {}

  /**
   * Admits a VIP to a Bijou theatre room.
   * Enforces hard cap of MAX_PARTICIPANTS (24 VIPs + host).
   * Starts the camera grace period timer on entry.
   */
  admitParticipant(
    session: BijouSession,
    user_id: string,
    is_host: boolean,
  ): BijouSession {
    const vipCount = session.participants.filter(p => !p.is_host).length;
    if (!is_host && vipCount >= BIJOU_PRICING.MAX_PARTICIPANTS) {
      throw new Error(
        `SEAT_CAPACITY_FULL: Bijou session ${session.session_id} is at capacity ` +
        `(${BIJOU_PRICING.MAX_PARTICIPANTS} VIPs).`
      );
    }

    const now = new Date();
    const graceExpiry = new Date(
      now.getTime() + BIJOU_PRICING.CAMERA_GRACE_PERIOD_SEC * 1000
    );

    const participant: BijouParticipant = {
      user_id,
      seat_number: session.participants.length + 1,
      is_host,
      camera_active: false,
      entered_at_utc: now.toISOString(),
      camera_grace_expires_at_utc: graceExpiry.toISOString(),
      total_dwell_secs: 0,
    };

    this.logger.log('BijouSessionService: participant admitted', {
      session_id: session.session_id,
      user_id,
      is_host,
      seat_number: participant.seat_number,
      rule_applied_id: this.RULE_ID,
    });

    return {
      ...session,
      participants: [...session.participants, participant],
    };
  }

  /**
   * Evaluates camera compliance for a participant.
   * Returns action: NONE | WARN | EJECT
   * Caller is responsible for executing the ejection if returned.
   */
  evaluateCameraCompliance(
    session: BijouSession,
    user_id: string,
  ): { action: 'NONE' | 'WARN' | 'EJECT'; participant: BijouParticipant } {
    const participant = session.participants.find(p => p.user_id === user_id);
    if (!participant) throw new Error(`PARTICIPANT_NOT_FOUND: ${user_id}`);
    if (participant.camera_active) return { action: 'NONE', participant };

    const now = new Date();
    const graceExpiry = participant.camera_grace_expires_at_utc
      ? new Date(participant.camera_grace_expires_at_utc) : null;
    const warningExpiry = participant.camera_warning_expires_at_utc
      ? new Date(participant.camera_warning_expires_at_utc) : null;

    // Still within grace period
    if (graceExpiry && now < graceExpiry) return { action: 'NONE', participant };

    // Grace expired — issue warning if not already warned
    if (!participant.camera_warning_expires_at_utc) {
      const warnExpiry = new Date(
        now.getTime() + BIJOU_PRICING.CAMERA_WARNING_PERIOD_SEC * 1000
      );
      this.nats.publish(NATS_TOPICS.BIJOU_CAMERA_VIOLATION, {
        session_id: session.session_id,
        user_id,
        action: 'WARN',
        warn_expires_at_utc: warnExpiry.toISOString(),
        rule_applied_id: this.RULE_ID,
      });
      return {
        action: 'WARN',
        participant: {
          ...participant,
          camera_warning_expires_at_utc: warnExpiry.toISOString(),
        },
      };
    }

    // Warning period also expired — eject
    if (warningExpiry && now >= warningExpiry) {
      this.nats.publish(NATS_TOPICS.BIJOU_EJECTION, {
        session_id: session.session_id,
        user_id,
        reason: 'CAMERA_COMPLIANCE_EJECTION',
        rule_applied_id: this.RULE_ID,
      });
      this.logger.warn('BijouSessionService: participant ejected — camera non-compliance', {
        session_id: session.session_id,
        user_id,
        rule_applied_id: this.RULE_ID,
      });
      return { action: 'EJECT', participant };
    }

    return { action: 'WARN', participant };
  }

  /**
   * Records a 5-second dwell tick for a participant.
   * Published to NATS for DwellService to aggregate for bonus pool calculation.
   */
  recordDwellTick(session: BijouSession, user_id: string): void {
    const participant = session.participants.find(p => p.user_id === user_id);
    if (!participant) return;

    this.nats.publish(NATS_TOPICS.BIJOU_DWELL_TICK, {
      session_id: session.session_id,
      show_id: session.show_id,
      creator_id: session.creator_id,
      user_id,
      tick_secs: 5,
      timestamp_utc: new Date().toISOString(),
      rule_applied_id: this.RULE_ID,
    });
  }

  /**
   * Adds a VIP to the standby queue.
   * Queue is FIFO. Returns updated session.
   */
  joinStandby(session: BijouSession, user_id: string): BijouSession {
    const alreadyQueued = session.standby_queue.some(e => e.user_id === user_id);
    if (alreadyQueued) return session;

    const entry: StandbyEntry = {
      user_id,
      queued_at_utc: new Date().toISOString(),
    };

    this.logger.log('BijouSessionService: VIP joined standby', {
      session_id: session.session_id,
      user_id,
      queue_position: session.standby_queue.length + 1,
    });

    return { ...session, standby_queue: [...session.standby_queue, entry] };
  }

  /**
   * Notifies the next standby VIP of an available seat.
   * The notified VIP has STANDBY_ACCEPT_WINDOW_SEC to accept.
   * Returns the updated session and the notified user_id.
   */
  notifyNextStandby(session: BijouSession): {
    session: BijouSession;
    notified_user_id: string | null;
  } {
    const next = session.standby_queue[0];
    if (!next) return { session, notified_user_id: null };

    const acceptExpiry = new Date(
      Date.now() + BIJOU_PRICING.STANDBY_ACCEPT_WINDOW_SEC * 1000
    );

    const updatedEntry: StandbyEntry = {
      ...next,
      notified_at_utc: new Date().toISOString(),
      accept_expires_at_utc: acceptExpiry.toISOString(),
    };

    const updatedQueue = [
      updatedEntry,
      ...session.standby_queue.slice(1),
    ];

    this.nats.publish(NATS_TOPICS.BIJOU_STANDBY_ALERT, {
      session_id: session.session_id,
      user_id: next.user_id,
      accept_expires_at_utc: acceptExpiry.toISOString(),
      accept_window_secs: BIJOU_PRICING.STANDBY_ACCEPT_WINDOW_SEC,
      rule_applied_id: this.RULE_ID,
    });

    this.logger.log('BijouSessionService: standby alert sent', {
      session_id: session.session_id,
      user_id: next.user_id,
      accept_expires_at_utc: acceptExpiry.toISOString(),
    });

    return {
      session: { ...session, standby_queue: updatedQueue },
      notified_user_id: next.user_id,
    };
  }
}
```

**Task 2: Create `services/bijou/src/bijou.module.ts`**

```typescript
// services/bijou/src/bijou.module.ts
import { Module } from '@nestjs/common';
import { BijouSessionService } from './bijou-session.service';
import { PassPricingService } from './pass-pricing.service';
import { MinSeatGateService } from './min-seat-gate.service';

@Module({
  providers: [BijouSessionService, PassPricingService, MinSeatGateService],
  exports: [BijouSessionService, PassPricingService, MinSeatGateService],
})
export class BijouModule {}
```

**Task 3:** Add `BijouModule` to `AppModule` imports.

**Validation:**
- `admitParticipant()` throws when vipCount >= 24
- `evaluateCameraCompliance()` returns `NONE` when camera is active
- `evaluateCameraCompliance()` returns `WARN` after grace period expires
- `evaluateCameraCompliance()` returns `EJECT` after warning period expires
- `joinStandby()` does not add duplicate entries
- `notifyNextStandby()` returns `null` when queue is empty
- NATS publish called on eject and standby alert
- `npx tsc --noEmit` zero new errors

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/BIJOU-002-SESSION-SERVICE.md`

---

## TIER 5E — GWP / VOUCHERVAULT SERVICE

Run after PRISMA-001. Independent of Tiers 5C and 5D.

---

### DIRECTIVE: GWP-001
**Status:** `[ ] TODO`
**Commit prefix:** `BIJOU:`
**Target path:** `services/core-api/src/growth/gwp.service.ts` (CREATE)
**Risk class:** R1

**Context:** `VoucherVault` table exists in schema. The Sovereign Kernel
defines `VoucherVault` with `is_permanent: true`. The GWP service triggers
on Med-High tipper login, selects an eligible offer, presents it, and credits
the ledger on acceptance. `GuardedNotificationService` provides the transport.

**Task: Create `services/core-api/src/growth/gwp.service.ts`**

```typescript
// services/core-api/src/growth/gwp.service.ts
// BIJOU: GWP-001 — Gift With Purchase service
// Triggers on Med-High tipper login. Presents VoucherVault offer.
// Credits ledger on acceptance. All events logged to audit_events.
import { Injectable, Logger } from '@nestjs/common';
import { NatsService } from '../nats/nats.service';
import { NATS_TOPICS } from '../../../nats/topics.registry';

export type TipperTier = 'LOW' | 'MED' | 'HIGH';

export interface GwpOffer {
  voucher_id: string;
  offer_name: string;
  description: string;
  token_value: number;
  trigger_type: string;
}

export interface GwpEvaluationResult {
  eligible: boolean;
  tipper_tier: TipperTier;
  offer?: GwpOffer;
  reason: string;
}

// Minimum lifetime spend thresholds to qualify as Med or High tipper
const TIPPER_THRESHOLDS = {
  MED_MIN_LIFETIME_TOKENS:  500,
  HIGH_MIN_LIFETIME_TOKENS: 2000,
} as const;

@Injectable()
export class GwpService {
  private readonly logger = new Logger(GwpService.name);
  private readonly RULE_ID = 'GWP_SERVICE_v1';

  constructor(private readonly nats: NatsService) {}

  /**
   * Classifies a VIP's tipper tier based on lifetime token spend.
   * Uses the six permitted HSV inputs — no PII, no message content.
   */
  classifyTipperTier(lifetime_tokens_spent: number): TipperTier {
    if (lifetime_tokens_spent >= TIPPER_THRESHOLDS.HIGH_MIN_LIFETIME_TOKENS) return 'HIGH';
    if (lifetime_tokens_spent >= TIPPER_THRESHOLDS.MED_MIN_LIFETIME_TOKENS)  return 'MED';
    return 'LOW';
  }

  /**
   * Evaluates GWP eligibility on VIP login.
   * Only MED and HIGH tippers receive offers.
   * Offer selection is deterministic from VoucherVault — no randomness.
   * Caller is responsible for fetching available offers from VoucherVault table.
   */
  evaluateOnLogin(params: {
    user_id: string;
    membership_tier: string;
    lifetime_tokens_spent: number;
    available_offers: GwpOffer[];
  }): GwpEvaluationResult {
    const tipper_tier = this.classifyTipperTier(params.lifetime_tokens_spent);

    if (tipper_tier === 'LOW') {
      return {
        eligible: false,
        tipper_tier,
        reason: 'TIPPER_TIER_TOO_LOW: lifetime spend below MED threshold',
      };
    }

    // Select first active offer eligible for this membership tier
    const offer = params.available_offers.find(
      o => o.trigger_type === 'LOGIN'
    );

    if (!offer) {
      return {
        eligible: false,
        tipper_tier,
        reason: 'NO_ELIGIBLE_OFFER: no active LOGIN offers in VoucherVault',
      };
    }

    this.logger.log('GwpService: GWP offer evaluated on login', {
      user_id: params.user_id,
      tipper_tier,
      membership_tier: params.membership_tier,
      voucher_id: offer.voucher_id,
      rule_applied_id: this.RULE_ID,
    });

    // Publish offer trigger event to NATS
    this.nats.publish(NATS_TOPICS.GWP_OFFER_TRIGGERED, {
      user_id: params.user_id,
      voucher_id: offer.voucher_id,
      tipper_tier,
      triggered_at_utc: new Date().toISOString(),
      rule_applied_id: this.RULE_ID,
    });

    return { eligible: true, tipper_tier, offer, reason: 'ELIGIBLE' };
  }

  /**
   * Records offer acceptance. Publishes NATS event.
   * Caller must post ledger credit entry via LedgerService after this returns.
   */
  recordAcceptance(params: {
    user_id: string;
    voucher_id: string;
    token_value: number;
  }): { accepted_at_utc: string; rule_applied_id: string } {
    const accepted_at_utc = new Date().toISOString();

    this.nats.publish(NATS_TOPICS.GWP_OFFER_ACCEPTED, {
      user_id: params.user_id,
      voucher_id: params.voucher_id,
      token_value: params.token_value,
      accepted_at_utc,
      rule_applied_id: this.RULE_ID,
    });

    this.logger.log('GwpService: GWP offer accepted', {
      user_id: params.user_id,
      voucher_id: params.voucher_id,
      token_value: params.token_value,
      rule_applied_id: this.RULE_ID,
    });

    return { accepted_at_utc, rule_applied_id: this.RULE_ID };
  }
}
```

Add `GwpService` to `GrowthModule` providers and exports.

**Validation:**
- `classifyTipperTier(499)` returns `'LOW'`
- `classifyTipperTier(500)` returns `'MED'`
- `classifyTipperTier(2000)` returns `'HIGH'`
- `evaluateOnLogin()` returns `eligible: false` for LOW tier
- `evaluateOnLogin()` returns `eligible: false` when no offers available
- NATS publish called on eligible offer and on acceptance
- `npx tsc --noEmit` zero new errors

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/GWP-001-GWP-SERVICE.md`

---

## RECOMMENDED EXECUTION ORDER

```
HOUSE-001  ──┐
HOUSE-002  ──┘  (parallel, housekeeping first)
              │
         PRISMA-001  (alone — foundation for 5B+)
              │
    ┌─────────┼──────────┐
 PRISMA-002  SHOWZONE-001  GWP-001   (parallel)
              │
           BIJOU-002       (after SHOWZONE-001 pattern established)
```

---

## STANDING INVARIANTS (unchanged from v1/v2)

1. No UPDATE or DELETE on ledger, audit, game, call session, voucher tables.
2. All FIZ commits require four-line format.
3. No hardcoded constants — always read from `governance.config.ts`.
4. `crypto.randomInt()` only. `Math.random()` prohibited.
5. No `@angular/core` imports anywhere.
6. `npx tsc --noEmit` zero code-level errors before commit.
7. Every service has a `Logger` instance.
8. Report-back mandatory before directive marked DONE.
9. NATS topics only from `topics.registry.ts` — no string literals.
10. AI services are advisory only — no financial or enforcement execution.

---

*End of CLAUDE_CODE_BACKLOG_v3.md — Version 3.0*
*Next version issued after Tier 5 completion.*
*All changes require human authorization from Kevin B. Hartley / Program Control.*
