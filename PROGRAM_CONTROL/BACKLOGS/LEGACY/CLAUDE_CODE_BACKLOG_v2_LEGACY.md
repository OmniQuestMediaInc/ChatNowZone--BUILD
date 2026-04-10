# CLAUDE CODE BACKLOG v2 — ChatNow.Zone
**Authority:** OmniQuest Media Inc. | CEO Kevin B. Hartley
**Backlog Version:** 2.0
**Generated:** 2026-03-29
**Supersedes:** CLAUDE_CODE_BACKLOG.md (Tiers 1–3 complete)
**Platform Time Standard:** America/Toronto
**Canonical Authority:** OQMI Coding Doctrine v2.0 · Canonical Corpus v10

---

## COMPLETED — TIERS 1–3

| Directive | Description | Commit | Status |
|-----------|-------------|--------|--------|
| FIZ-001 | GovernanceConfig constants | `edb991b` | ✅ DONE |
| FIZ-002 | Dispute resolution (NestJS) | `bc326d9` | ✅ DONE |
| FIZ-003 | Three-Bucket Wallet | `0d08900` | ✅ DONE |
| FIZ-004 | Schema — 6 new tables | `164206a` | ✅ DONE |
| BIJOU-001 | PassPricingService + MinSeatGateService | `22f1ac7` | ✅ DONE |
| GOV-001 | GeoPricingService | merged | ✅ DONE |
| GM-001 | GameEngineService (service only) | `d954f40` | ✅ DONE |
| HZ-001 | HeatScoreService | — | ❌ NEVER RAN — see Tier 4B |

---

## HOW TO USE THIS FILE

Same rules as v1. One directive per session. Read the Doctrine and
copilot-instructions.md first. FIZ commits require the four-line format.
Report-back is mandatory before a directive is marked DONE.

**FIZ commit format — required on every FIZ: directive:**
```
FIZ: <short description>
REASON: <why this change is necessary>
IMPACT: <what balances/flows/constants are affected>
CORRELATION_ID: <generate a uuid v4>
```

---

## TIER 4A — INFRASTRUCTURE (RUN THIS FIRST)

INFRA-001 must complete before any other v2 directive. Every service built
in Tiers 2–3 currently has unverified TypeScript. This directive establishes
the compilation baseline.

---

### DIRECTIVE: INFRA-001
**Status:** `[ ] TODO`
**Commit prefix:** `INFRA:`
**Files:** `package.json` (MODIFY), `tsconfig.json` (CREATE), `services/core-api/tsconfig.json` (CREATE), `docker-compose.yml` (MODIFY — add NATS service)
**Risk class:** R1

**Context:** The repo has TypeScript 5.9.3 installed as a devDependency but no
`tsconfig.json` exists. All NestJS services reference `@nestjs/common`,
`@nestjs/typeorm`, `@prisma/client`, and `typeorm` but these are not in
`package.json`. Every `tsc --noEmit` run fails solely due to missing
dependencies — not code errors. This directive fixes that permanently.

**Task 1: Update root `package.json`**

Replace the existing `package.json` with the following (preserves all
existing devDependencies, adds NestJS and Prisma):

```json
{
  "name": "chatnowzone-build",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "lint": "eslint 'services/**/*.ts' --max-warnings 0",
    "typecheck": "tsc --noEmit --project tsconfig.json",
    "typecheck:api": "tsc --noEmit --project services/core-api/tsconfig.json"
  },
  "dependencies": {
    "@nestjs/common": "^10.4.15",
    "@nestjs/core": "^10.4.15",
    "@nestjs/platform-express": "^10.4.15",
    "@nestjs/typeorm": "^10.0.2",
    "@prisma/client": "^6.2.1",
    "nats": "^2.29.0",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1",
    "typeorm": "^0.3.20"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "7.18.0",
    "@typescript-eslint/parser": "7.18.0",
    "@types/node": "^22.10.0",
    "eslint": "8.57.1",
    "prisma": "^6.2.1",
    "typescript": "5.9.3"
  }
}
```

**Task 2: Create root `tsconfig.json`**

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false,
    "esModuleInterop": true,
    "resolveJsonModule": true
  },
  "include": ["services/**/*.ts", "finance/**/*.ts", "governance/**/*.ts"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts"]
}
```

**Task 3: Create `services/core-api/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "baseUrl": "./src",
    "outDir": "./dist"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts"]
}
```

**Task 4: Run `npm install` and verify**

```bash
npm install
npx tsc --noEmit --project tsconfig.json
```

Expected: zero type errors. If errors remain after install, list them
in the report-back — do NOT attempt to fix them; report and HARD_STOP.

**Task 5: Add NATS to `docker-compose.yml`**

Append the following service block inside the `services:` section of
`docker-compose.yml`, after the `redis:` service block and before the
`api:` service block. Also add `nats` to the `depends_on` list of the
`api:` service.

```yaml
  nats:
    image: nats:2.10-alpine
    container_name: chatnow_nats
    restart: unless-stopped
    # INFRA: NATS.io message fabric — all chat and haptic events route through here.
    # Latency Invariant: REST polling is prohibited. All real-time events via NATS.
    command: >
      -js
      -sd /data
      -m 8222
    ports:
      - "4222:4222"
      - "8222:8222"
    volumes:
      - nats_data:/data
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://localhost:8222/healthz || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - backend
```

Also add `nats_data:` to the `volumes:` block at the bottom of
`docker-compose.yml`.

Also add `nats:` with `condition: service_healthy` to the `api:` service's
`depends_on:` block.

**Validation:**
- `npm install` completes without errors
- `npx tsc --noEmit` produces zero code-level errors (missing module
  errors are acceptable only if `node_modules` is present — if deps
  installed and errors persist, HARD_STOP)
- `docker-compose config` validates without errors
- NATS service appears in `docker-compose config` output
- `nats_data` volume appears in volumes block

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/INFRA-001-NESTJS-SCAFFOLD.md`

---

## TIER 4B — COMPLETE INCOMPLETE WORK

Run these after INFRA-001 is green. They can run in parallel.

---

### DIRECTIVE: HZ-001 (REISSUE)
**Status:** `[ ] TODO`
**Commit prefix:** `HZ:`
**Target path:** `services/core-api/src/analytics/heat-score.service.ts` (CREATE)
**Risk class:** R2

**Context:** This directive was reported as complete but no file exists in the
repo and no report-back file was created. Reissuing in full.

**Corpus constraint (Ch.5 §6.2):** Permitted HSV inputs are tipping events,
session duration, dwell time, entry source type, chat count (NOT message content).
HSV must be non-gating, non-punitive, advisory only. Every output must carry
the advisory disclaimer string.

**Task:** Create the file at `services/core-api/src/analytics/heat-score.service.ts`:

```typescript
// services/core-api/src/analytics/heat-score.service.ts
// HZ: HeatScoreService — six-input behavioral HSV for HotZone / My Zone Manager
// Corpus constraint: advisory only, non-gating, non-punitive. Ch.5 §6.
import { Injectable, Logger } from '@nestjs/common';

export type HeatBand = 'COLD' | 'COOL' | 'WARM' | 'HOT' | 'RED_ZONE';

export interface HeatScoreInput {
  creator_id: string;
  // HIGH weight
  session_spend_tokens: number;
  // MEDIUM weight (count only — message content is PROHIBITED per Corpus Ch.5 §6.2)
  chat_message_count: number;
  // MEDIUM weight
  avg_dwell_time_secs: number;
  // MEDIUM weight — negative: high churn reduces score
  room_churn_rate_pct: number;
  // MEDIUM weight
  avg_attendee_token_balance: number;
  // LOW weight
  profile_ctr_pct: number;
}

export interface HeatScoreResult {
  creator_id: string;
  raw_score: number;
  heat_band: HeatBand;
  computed_at_utc: string;
  // Mandatory per Corpus Ch.5 §6.3 — must appear in every output
  advisory_disclaimer: string;
  // Logged for auditability — metric names only, never values or content
  inputs_used: string[];
}

const WEIGHTS = {
  session_spend:  0.35,
  chat_volume:    0.20,
  dwell_time:     0.20,
  churn_rate:    -0.15,
  token_balance:  0.07,
  profile_ctr:    0.03,
} as const;

// Mandatory advisory disclaimer — Corpus Ch.5 §6.3
const ADVISORY_DISCLAIMER =
  'HSV is an advisory performance signal only. It does not determine eligibility, ' +
  'affect payout percentage, influence moderation decisions, or gate access. ' +
  'Canonical Corpus v10 Ch.5 §6.';

@Injectable()
export class HeatScoreService {
  private readonly logger = new Logger(HeatScoreService.name);

  compute(input: HeatScoreInput): HeatScoreResult {
    // Normalize each input to 0–100 range before weighting
    const spend_norm   = Math.min(input.session_spend_tokens / 500 * 100, 100);
    const chat_norm    = Math.min(input.chat_message_count / 100 * 100, 100);
    const dwell_norm   = Math.min(input.avg_dwell_time_secs / 3600 * 100, 100);
    const churn_norm   = Math.min(input.room_churn_rate_pct, 100);
    const balance_norm = Math.min(input.avg_attendee_token_balance / 500 * 100, 100);
    const ctr_norm     = Math.min(input.profile_ctr_pct, 100);

    const raw_score = Math.max(0, Math.min(100, Math.round(
      spend_norm   * WEIGHTS.session_spend +
      chat_norm    * WEIGHTS.chat_volume +
      dwell_norm   * WEIGHTS.dwell_time +
      churn_norm   * WEIGHTS.churn_rate +
      balance_norm * WEIGHTS.token_balance +
      ctr_norm     * WEIGHTS.profile_ctr
    )));

    const heat_band: HeatBand =
      raw_score >= 85 ? 'RED_ZONE' :
      raw_score >= 65 ? 'HOT' :
      raw_score >= 45 ? 'WARM' :
      raw_score >= 25 ? 'COOL' : 'COLD';

    this.logger.log('HeatScoreService: HSV computed', {
      creator_id: input.creator_id,
      raw_score,
      heat_band,
      advisory: true,
      rule_applied_id: 'HEAT_SCORE_v1',
    });

    return {
      creator_id: input.creator_id,
      raw_score,
      heat_band,
      computed_at_utc: new Date().toISOString(),
      advisory_disclaimer: ADVISORY_DISCLAIMER,
      inputs_used: [
        'session_spend_tokens',
        'chat_message_count',
        'avg_dwell_time_secs',
        'room_churn_rate_pct',
        'avg_attendee_token_balance',
        'profile_ctr_pct',
      ],
    };
  }
}
```

Also create `services/core-api/src/analytics/analytics.module.ts`:

```typescript
// services/core-api/src/analytics/analytics.module.ts
import { Module } from '@nestjs/common';
import { HeatScoreService } from './heat-score.service';

@Module({
  providers: [HeatScoreService],
  exports: [HeatScoreService],
})
export class AnalyticsModule {}
```

Also add `AnalyticsModule` to the imports array in
`services/core-api/src/app.module.ts`.

**Validation:**
- File exists at `services/core-api/src/analytics/heat-score.service.ts`
- `advisory_disclaimer` field is present in `HeatScoreResult` interface
- `HeatScoreInput` has NO field that accepts message text or content
- `compute()` with all-zero inputs returns `raw_score: 0`, `heat_band: 'COLD'`
- `npx tsc --noEmit` clean (after INFRA-001)

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/HZ-001-HEAT-SCORE-SERVICE.md`

---

### DIRECTIVE: GM-002
**Status:** `[ ] TODO`
**Commit prefix:** `BIJOU:`
**Files:** `services/core-api/src/games/games.module.ts` (CREATE), `services/core-api/src/games/games.controller.ts` (CREATE), `services/core-api/src/app.module.ts` (MODIFY — add GamesModule)
**Risk class:** R1

**Context:** GM-001 created `GameEngineService` but left it unwired. The
HANDOFF note in the GM-001 report-back explicitly states: "Next agent's
first task: Wire `GameEngineService` into a `GamesModule`, register in
`CoreApiModule`, and create the controller endpoint that orchestrates
`initiatePlay()` → `LedgerService.debit()` → `resolveOutcome()`."

This directive completes that wiring.

**Task 1: Create `services/core-api/src/games/games.module.ts`**

```typescript
// services/core-api/src/games/games.module.ts
import { Module } from '@nestjs/common';
import { GameEngineService } from './game-engine.service';
import { GamesController } from './games.controller';
import { GovernanceConfigService } from '../config/governance.config';

@Module({
  controllers: [GamesController],
  providers: [GameEngineService, GovernanceConfigService],
  exports: [GameEngineService],
})
export class GamesModule {}
```

**Task 2: Create `services/core-api/src/games/games.controller.ts`**

This controller enforces the debit-before-reveal invariant.
Token debit MUST succeed before `resolveOutcome()` is called.
If debit fails, the play is aborted — no outcome is generated.

```typescript
// services/core-api/src/games/games.controller.ts
// BIJOU: GM-002 — Games controller enforcing debit-before-reveal invariant
// Doctrine: token debit via LedgerService MUST precede outcome resolution.
import { Controller, Post, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { GameEngineService, GameType } from './game-engine.service';

export interface InitiatePlayRequest {
  user_id: string;
  creator_id: string;
  game_type: GameType;
  token_tier: number;
  // Prize table provided by caller (fetched from prize_tables by client)
  prize_table: Array<{ prize_slot: string; prize_description: string }>;
}

export interface PlayResponse {
  session_id: string;
  game_type: GameType;
  token_tier: number;
  outcome_data: Record<string, number>;
  prize_slot: string;
  prize_description: string;
  idempotency_key: string;
  resolved_at_utc: string;
  // Audit trail
  rule_applied_id: string;
}

@Controller('games')
export class GamesController {
  private readonly logger = new Logger(GamesController.name);

  constructor(private readonly gameEngine: GameEngineService) {}

  /**
   * POST /games/play
   *
   * Orchestration order (INVARIANT — do not reorder):
   * 1. Validate play request via initiatePlay()
   * 2. [CALLER RESPONSIBILITY] Debit tokens via LedgerService before calling
   *    this endpoint — the ledger_entry_id must be passed in the request body.
   *    This endpoint will NOT debit tokens itself; it enforces that a
   *    ledger_entry_id proving debit is present before resolving outcome.
   * 3. Resolve outcome via resolveOutcome()
   * 4. Return outcome to client for animation
   *
   * NOTE: Full LedgerService integration is a follow-on directive (GM-003).
   * This controller currently validates and resolves but does not independently
   * verify the ledger_entry_id against the database.
   * That verification will be added in GM-003 once TypeORM is fully wired.
   */
  @Post('play')
  @HttpCode(HttpStatus.OK)
  play(@Body() body: InitiatePlayRequest & { ledger_entry_id: string }): PlayResponse {
    // Guard: ledger_entry_id must be present — proves debit occurred
    if (!body.ledger_entry_id || body.ledger_entry_id.trim().length === 0) {
      this.logger.error('GamesController: play rejected — no ledger_entry_id provided', {
        user_id: body.user_id,
        game_type: body.game_type,
      });
      throw new Error(
        'DEBIT_REQUIRED: ledger_entry_id must be provided before outcome can be resolved. ' +
        'Debit tokens via LedgerService first.'
      );
    }

    const initResult = this.gameEngine.initiatePlay({
      user_id: body.user_id,
      creator_id: body.creator_id,
      game_type: body.game_type,
      token_tier: body.token_tier,
    });

    if (!initResult.valid) {
      throw new Error(`INVALID_PLAY: ${initResult.error}`);
    }

    const outcome = this.gameEngine.resolveOutcome({
      session_id: initResult.idempotency_key,
      game_type: body.game_type,
      token_tier: body.token_tier,
      prize_table: body.prize_table,
    });

    const matched_prize = body.prize_table.find(
      p => p.prize_slot === outcome.prize_slot
    );

    this.logger.log('GamesController: play resolved', {
      session_id: outcome.session_id,
      ledger_entry_id: body.ledger_entry_id,
      prize_slot: outcome.prize_slot,
    });

    return {
      session_id: outcome.session_id,
      game_type: outcome.game_type,
      token_tier: outcome.token_tier,
      outcome_data: outcome.outcome_data,
      prize_slot: outcome.prize_slot,
      prize_description: matched_prize?.prize_description ?? 'Prize',
      idempotency_key: initResult.idempotency_key,
      resolved_at_utc: outcome.resolved_at_utc,
      rule_applied_id: outcome.rule_applied_id,
    };
  }
}
```

**Task 3: Add `GamesModule` to `app.module.ts`**

In `services/core-api/src/app.module.ts`, add the import and register it:

```typescript
import { GamesModule } from './games/games.module';
// Add GamesModule to the imports array in @Module decorator
```

**Validation:**
- `games.module.ts` exists and exports `GameEngineService`
- `games.controller.ts` exists with `POST /games/play` endpoint
- Controller throws `DEBIT_REQUIRED` error when `ledger_entry_id` is absent
- `GamesModule` appears in `app.module.ts` imports array
- `npx tsc --noEmit` clean (after INFRA-001)

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/GM-002-GAMES-MODULE-WIRING.md`

---

## TIER 4C — NATS FABRIC

Run after INFRA-001. NATS-001 must complete before GOV-002, GOV-003, GOV-004
since those services publish/subscribe to NATS topics.

---

### DIRECTIVE: NATS-001
**Status:** `[ ] TODO`
**Commit prefix:** `NATS:`
**Target paths:** `services/nats/topics.registry.ts` (CREATE), `services/core-api/src/nats/nats.module.ts` (CREATE), `services/core-api/src/nats/nats.service.ts` (CREATE)
**Risk class:** R1

**Context:** The Latency Invariant in OQMI Coding Doctrine v2.0 states:
"All chat and haptic events via NATS.io. No REST polling substitutions."
NATS is in `package.json` (added by INFRA-001) and in `docker-compose.yml`
but no application-layer service exists. This directive creates the NATS
fabric layer that all subsequent real-time services depend on.

**Task 1: Create `services/nats/topics.registry.ts`**

This is the single authoritative list of all NATS topic strings.
No service may use a NATS topic string that is not registered here.

```typescript
// services/nats/topics.registry.ts
// NATS: Canonical topic registry — all NATS subjects in one place.
// No service may publish or subscribe to a topic not listed here.
// Any new topic requires a NATS: commit adding it to this registry first.

export const NATS_TOPICS = {
  // ── Geo-pricing & chat stream ──────────────────────────────────────────
  GEO_TIP_TRANSLATED:       'geo.tip.translated',

  // ── Gamification ──────────────────────────────────────────────────────
  GAME_OUTCOME:             'game.outcome',        // game.outcome.<session_id>

  // ── Bijou Play.Zone ────────────────────────────────────────────────────
  BIJOU_DWELL_TICK:         'bijou.dwell.tick',
  BIJOU_SEAT_OPENED:        'bijou.seat.opened',
  BIJOU_STANDBY_ALERT:      'bijou.standby.alert',
  BIJOU_CAMERA_VIOLATION:   'bijou.camera.violation',
  BIJOU_EJECTION:           'bijou.ejection',

  // ── ShowZone Theatre ───────────────────────────────────────────────────
  SHOWZONE_DWELL_TICK:      'showzone.dwell.tick',
  SHOWZONE_SEAT_OPENED:     'showzone.seat.opened',
  SHOWZONE_PHASE2_TRIGGER:  'showzone.phase2.trigger',
  SHOWZONE_SHOW_ENDED:      'showzone.show.ended',

  // ── Chat aggregation (OBS multi-platform) ─────────────────────────────
  CHAT_INGEST_RAW:          'chat.ingest.raw',
  CHAT_RESPONSE_OUTBOUND:   'chat.response.outbound',
  CHAT_BROADCAST_STAGGERED: 'chat.broadcast.staggered',

  // ── HeartZone biometrics ───────────────────────────────────────────────
  HZ_BPM_UPDATE:            'hz.bpm.update',
  HZ_HAPTIC_TRIGGER:        'hz.haptic.trigger',
  HZ_WISH_FULFILLED:        'hz.wish.fulfilled',

  // ── Risk & fraud ───────────────────────────────────────────────────────
  RISK_FLAG_RAISED:         'risk.flag.raised',
  RISK_CONTAINMENT_APPLIED: 'risk.containment.applied',

  // ── GWP / VoucherVault ─────────────────────────────────────────────────
  GWP_OFFER_TRIGGERED:      'gwp.offer.triggered',
  GWP_OFFER_ACCEPTED:       'gwp.offer.accepted',

  // ── Audit & compliance ─────────────────────────────────────────────────
  AUDIT_EVENT_WRITTEN:      'audit.event.written',
  WORM_EXPORT_TRIGGERED:    'worm.export.triggered',
} as const;

export type NatsTopic = typeof NATS_TOPICS[keyof typeof NATS_TOPICS];
```

**Task 2: Create `services/core-api/src/nats/nats.service.ts`**

```typescript
// services/core-api/src/nats/nats.service.ts
// NATS: Core publish/subscribe wrapper. All services use this — never
// import the nats package directly in a feature service.
import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { connect, NatsConnection, StringCodec, Subscription } from 'nats';
import { NatsTopic } from '../../../../nats/topics.registry';

const sc = StringCodec();

@Injectable()
export class NatsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NatsService.name);
  private connection: NatsConnection | null = null;

  async onModuleInit(): Promise<void> {
    const url = process.env.NATS_URL ?? 'nats://localhost:4222';
    try {
      this.connection = await connect({ servers: url });
      this.logger.log('NatsService: connected', { url });
    } catch (err) {
      // Log but do not throw — allows app to start without NATS in dev
      this.logger.warn('NatsService: connection failed — running without NATS', {
        url,
        error: String(err),
      });
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.connection) {
      await this.connection.drain();
      this.logger.log('NatsService: connection drained and closed');
    }
  }

  /**
   * Publish a message to a NATS topic.
   * Topic must be from NATS_TOPICS registry.
   * Payload is serialised to JSON automatically.
   */
  publish(topic: NatsTopic | string, payload: Record<string, unknown>): void {
    if (!this.connection) {
      this.logger.warn('NatsService: publish skipped — no connection', { topic });
      return;
    }
    try {
      this.connection.publish(topic, sc.encode(JSON.stringify(payload)));
    } catch (err) {
      this.logger.error('NatsService: publish failed', err, { topic });
    }
  }

  /**
   * Subscribe to a NATS topic.
   * Returns the raw Subscription — caller manages lifecycle.
   */
  subscribe(
    topic: NatsTopic | string,
    handler: (payload: Record<string, unknown>) => void,
  ): Subscription | null {
    if (!this.connection) {
      this.logger.warn('NatsService: subscribe skipped — no connection', { topic });
      return null;
    }
    const sub = this.connection.subscribe(topic);
    (async (): Promise<void> => {
      for await (const msg of sub) {
        try {
          const parsed = JSON.parse(sc.decode(msg.data)) as Record<string, unknown>;
          handler(parsed);
        } catch (err) {
          this.logger.error('NatsService: message parse error', err, { topic });
        }
      }
    })();
    return sub;
  }
}
```

**Task 3: Create `services/core-api/src/nats/nats.module.ts`**

```typescript
// services/core-api/src/nats/nats.module.ts
import { Global, Module } from '@nestjs/common';
import { NatsService } from './nats.service';

// Global module — NatsService is available to every other module
// without needing to import NatsModule explicitly.
@Global()
@Module({
  providers: [NatsService],
  exports: [NatsService],
})
export class NatsModule {}
```

**Task 4: Register `NatsModule` in `app.module.ts`**

Add `NatsModule` as the FIRST entry in the `imports` array of `AppModule`.
Global modules must be registered in the root module.

**Validation:**
- `services/nats/topics.registry.ts` exists with all topics listed
- `NATS_TOPICS` is exported as `const` — type-safe
- `NatsService` implements `OnModuleInit` and `OnModuleDestroy`
- `NatsModule` is `@Global()` decorated
- `NatsModule` is first in `AppModule` imports
- `npx tsc --noEmit` clean

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/NATS-001-FABRIC-SCAFFOLD.md`

---

## TIER 4D — COMPLIANCE INFRASTRUCTURE

Run after NATS-001. These can run in parallel with each other.

---

### DIRECTIVE: GOV-002
**Status:** `[ ] TODO`
**Commit prefix:** `GOV:`
**Target path:** `services/core-api/src/compliance/worm-export.service.ts` (CREATE)
**Risk class:** R0

**Context:** Canonical Corpus v10 Appendix H requires periodic WORM (Write Once
Read Many) sealed exports of the audit chain. The export must be hash-sealed,
ordered by event, and stored in a tamper-evident path. An integrity verification
function must be included. This is an L0 ship-gate requirement.

**Task: Create `services/core-api/src/compliance/worm-export.service.ts`**

```typescript
// services/core-api/src/compliance/worm-export.service.ts
// GOV: WORM audit export service — Corpus v10 Appendix H
// Produces hash-sealed, ordered snapshots of audit_events for tamper-evident storage.
import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';

export interface WormExportRecord {
  export_id: string;
  from_utc: string;
  to_utc: string;
  event_count: number;
  first_event_id: string;
  last_event_id: string;
  hash_seal: string;           // SHA-256 of ordered event payload
  integrity_verified: boolean;
  exported_at_utc: string;
  rule_applied_id: string;
}

export interface AuditEventSnapshot {
  event_id: string;
  event_type: string;
  actor_id: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class WormExportService {
  private readonly logger = new Logger(WormExportService.name);
  private readonly RULE_ID = 'WORM_EXPORT_v1';

  /**
   * Produces a WORM export record from a provided ordered set of audit events.
   * Caller is responsible for fetching the events from the database in
   * ascending created_at order. This service seals and verifies the snapshot.
   *
   * Corpus Appendix H requirements:
   * - Preserve ordering
   * - Preserve event IDs
   * - Preserve hash chain continuity
   * - WORM seal = SHA-256 of concatenated ordered event IDs + timestamps
   */
  sealSnapshot(params: {
    export_id: string;
    from_utc: string;
    to_utc: string;
    events: AuditEventSnapshot[];
  }): WormExportRecord {
    if (params.events.length === 0) {
      throw new Error('WORM_EXPORT_EMPTY: Cannot seal an empty event set.');
    }

    // Build deterministic payload string from ordered events
    // Order: event_id + created_at concatenated — no metadata included in seal
    // to prevent PII leakage into the hash
    const payload = params.events
      .map(e => `${e.event_id}:${e.created_at}:${e.event_type}`)
      .join('|');

    const hash_seal = createHash('sha256').update(payload).digest('hex');

    const record: WormExportRecord = {
      export_id: params.export_id,
      from_utc: params.from_utc,
      to_utc: params.to_utc,
      event_count: params.events.length,
      first_event_id: params.events[0].event_id,
      last_event_id: params.events[params.events.length - 1].event_id,
      hash_seal,
      integrity_verified: true,
      exported_at_utc: new Date().toISOString(),
      rule_applied_id: this.RULE_ID,
    };

    this.logger.log('WormExportService: snapshot sealed', {
      export_id: params.export_id,
      event_count: params.events.length,
      hash_seal,
      rule_applied_id: this.RULE_ID,
    });

    return record;
  }

  /**
   * Verifies the integrity of a previously sealed WORM export.
   * Re-computes the hash from the provided events and compares to stored seal.
   * Returns true if integrity is confirmed, false if tampered.
   */
  verifyIntegrity(params: {
    stored_record: WormExportRecord;
    events: AuditEventSnapshot[];
  }): boolean {
    const payload = params.events
      .map(e => `${e.event_id}:${e.created_at}:${e.event_type}`)
      .join('|');

    const recomputed_hash = createHash('sha256').update(payload).digest('hex');
    const verified = recomputed_hash === params.stored_record.hash_seal;

    if (!verified) {
      this.logger.error('WormExportService: INTEGRITY FAILURE — hash mismatch', {
        export_id: params.stored_record.export_id,
        stored_hash: params.stored_record.hash_seal,
        recomputed_hash,
        rule_applied_id: this.RULE_ID,
      });
    } else {
      this.logger.log('WormExportService: integrity verified', {
        export_id: params.stored_record.export_id,
        rule_applied_id: this.RULE_ID,
      });
    }

    return verified;
  }
}
```

Also create `services/core-api/src/compliance/compliance.module.ts`:

```typescript
// services/core-api/src/compliance/compliance.module.ts
import { Module } from '@nestjs/common';
import { WormExportService } from './worm-export.service';

@Module({
  providers: [WormExportService],
  exports: [WormExportService],
})
export class ComplianceModule {}
```

Add `ComplianceModule` to `AppModule` imports.

**Validation:**
- `sealSnapshot()` with 3 events produces a deterministic `hash_seal`
- Calling `sealSnapshot()` twice with the same events produces identical hash
- `verifyIntegrity()` returns `true` when events unchanged
- `verifyIntegrity()` returns `false` when any event is modified
- `sealSnapshot()` throws on empty events array
- `npx tsc --noEmit` clean

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/GOV-002-WORM-EXPORT-SERVICE.md`

---

### DIRECTIVE: GOV-003
**Status:** `[ ] TODO`
**Commit prefix:** `GOV:`
**Target path:** `services/zone-gpt/src/proposal.service.ts` (CREATE)
**Risk class:** R1

**Context:** Canonical Corpus v10 Ch.8 §6 requires that every AI output on a
consequential action be structured as a Proposal Object. Humans must ACCEPT,
REJECT, or MODIFY. Decision must be logged with actor_id, timestamp, reason_code.
No silent acceptance. This is an L0 ship-gate requirement for AI advisory boundary.

**Task 1: Create `services/zone-gpt/src/proposal.service.ts`**

```typescript
// services/zone-gpt/src/proposal.service.ts
// GOV: ZONE-GPT Proposal Object service — Corpus v10 Ch.8 §6
// AI is advisory only. Every proposal requires human ACCEPT/REJECT/MODIFY.
// No execution occurs without a logged human decision.
import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';

export type ProposalType =
  | 'PRICE_ADVISORY'
  | 'MODERATION_SUGGESTION'
  | 'RISK_FLAG'
  | 'CONTENT_DRAFT'
  | 'INCIDENT_SUMMARY'
  | 'COMPLIANCE_GUIDANCE';

export type ProposalDecision = 'ACCEPT' | 'REJECT' | 'MODIFY';

export type ProposalStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'MODIFIED' | 'EXPIRED';

export interface Proposal {
  proposal_id: string;
  proposal_type: ProposalType;
  reference_object_id: string;   // ID of the entity this proposal concerns
  rationale: string;
  canonical_basis: string;       // Corpus section or rule that grounds this proposal
  suggested_action: string;
  confidence_score: number;      // 0.00–1.00
  status: ProposalStatus;
  created_at_utc: string;
  expires_at_utc: string;        // Proposals auto-expire — no indefinite pending states
  decision?: {
    decision: ProposalDecision;
    decision_actor_id: string;
    decided_at_utc: string;
    reason_code: string;
    modified_action?: string;    // Populated when decision = MODIFY
  };
}

export interface CreateProposalInput {
  proposal_type: ProposalType;
  reference_object_id: string;
  rationale: string;
  canonical_basis: string;
  suggested_action: string;
  confidence_score: number;
  ttl_hours?: number;            // Default 24h
}

export interface RecordDecisionInput {
  proposal_id: string;
  decision: ProposalDecision;
  decision_actor_id: string;
  reason_code: string;
  modified_action?: string;
}

@Injectable()
export class ProposalService {
  private readonly logger = new Logger(ProposalService.name);
  // In-memory store for MVP — replace with DB-backed table in GM-003 / follow-on
  private readonly proposals = new Map<string, Proposal>();
  private readonly RULE_ID = 'ZONE_GPT_PROPOSAL_v1';
  private readonly DEFAULT_TTL_HOURS = 24;

  /**
   * Creates a new AI proposal. Does not execute any action.
   * All proposals begin in PENDING status.
   */
  createProposal(input: CreateProposalInput): Proposal {
    if (input.confidence_score < 0 || input.confidence_score > 1) {
      throw new Error('INVALID_CONFIDENCE: confidence_score must be between 0.00 and 1.00');
    }

    const now = new Date();
    const ttl = input.ttl_hours ?? this.DEFAULT_TTL_HOURS;
    const expires = new Date(now.getTime() + ttl * 60 * 60 * 1000);

    const proposal_id = createHash('sha256')
      .update(`${input.proposal_type}:${input.reference_object_id}:${now.toISOString()}`)
      .digest('hex')
      .substring(0, 32);

    const proposal: Proposal = {
      proposal_id,
      proposal_type: input.proposal_type,
      reference_object_id: input.reference_object_id,
      rationale: input.rationale,
      canonical_basis: input.canonical_basis,
      suggested_action: input.suggested_action,
      confidence_score: input.confidence_score,
      status: 'PENDING',
      created_at_utc: now.toISOString(),
      expires_at_utc: expires.toISOString(),
    };

    this.proposals.set(proposal_id, proposal);

    this.logger.log('ProposalService: proposal created — awaiting human decision', {
      proposal_id,
      proposal_type: input.proposal_type,
      reference_object_id: input.reference_object_id,
      confidence_score: input.confidence_score,
      rule_applied_id: this.RULE_ID,
    });

    return proposal;
  }

  /**
   * Records a human decision on a proposal.
   * This is the ONLY way a proposal transitions from PENDING.
   * No silent acceptance — decision_actor_id is mandatory.
   */
  recordDecision(input: RecordDecisionInput): Proposal {
    const proposal = this.proposals.get(input.proposal_id);

    if (!proposal) {
      throw new Error(`PROPOSAL_NOT_FOUND: ${input.proposal_id}`);
    }

    if (proposal.status !== 'PENDING') {
      throw new Error(
        `PROPOSAL_ALREADY_DECIDED: proposal ${input.proposal_id} ` +
        `is already in status ${proposal.status}`
      );
    }

    if (!input.decision_actor_id || input.decision_actor_id.trim().length === 0) {
      throw new Error('ACTOR_REQUIRED: decision_actor_id is mandatory. No silent acceptance.');
    }

    if (!input.reason_code || input.reason_code.trim().length === 0) {
      throw new Error('REASON_CODE_REQUIRED: reason_code must be provided with every decision.');
    }

    if (input.decision === 'MODIFY' && !input.modified_action) {
      throw new Error('MODIFIED_ACTION_REQUIRED: modified_action must be provided when decision = MODIFY.');
    }

    const new_status: ProposalStatus =
      input.decision === 'ACCEPT' ? 'ACCEPTED' :
      input.decision === 'REJECT' ? 'REJECTED' : 'MODIFIED';

    proposal.status = new_status;
    proposal.decision = {
      decision: input.decision,
      decision_actor_id: input.decision_actor_id,
      decided_at_utc: new Date().toISOString(),
      reason_code: input.reason_code,
      modified_action: input.modified_action,
    };

    this.proposals.set(input.proposal_id, proposal);

    this.logger.log('ProposalService: human decision recorded', {
      proposal_id: input.proposal_id,
      decision: input.decision,
      decision_actor_id: input.decision_actor_id,
      reason_code: input.reason_code,
      rule_applied_id: this.RULE_ID,
    });

    return proposal;
  }

  getProposal(proposal_id: string): Proposal | undefined {
    return this.proposals.get(proposal_id);
  }

  getPendingProposals(): Proposal[] {
    const now = new Date();
    return Array.from(this.proposals.values()).filter(p => {
      if (p.status !== 'PENDING') return false;
      if (new Date(p.expires_at_utc) < now) {
        p.status = 'EXPIRED';
        return false;
      }
      return true;
    });
  }
}
```

**Task 2:** Create `services/zone-gpt/src/zone-gpt.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ProposalService } from './proposal.service';

@Module({
  providers: [ProposalService],
  exports: [ProposalService],
})
export class ZoneGptModule {}
```

Add `ZoneGptModule` to `AppModule` imports.

**Validation:**
- `createProposal()` returns a proposal with `status: 'PENDING'`
- `recordDecision()` throws when `decision_actor_id` is absent
- `recordDecision()` throws when `reason_code` is absent
- `recordDecision()` throws when `decision = 'MODIFY'` and `modified_action` absent
- `recordDecision()` transitions status correctly for all three decisions
- Cannot call `recordDecision()` twice on the same proposal
- `getPendingProposals()` excludes expired proposals
- `npx tsc --noEmit` clean

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/GOV-003-ZONE-GPT-PROPOSAL-SERVICE.md`

---

### DIRECTIVE: GOV-004
**Status:** `[ ] TODO`
**Commit prefix:** `GOV:`
**Target path:** `services/core-api/src/compliance/sovereign-cac.middleware.ts` (CREATE)
**Risk class:** R0

**Context:** Bill S-210 (Canada) requires "reliable" age assurance for adult content.
Bill 149 (Ontario) requires AI use disclosure in creator/fan interactions.
Corpus Appendix J requires jurisdiction logic to be configurable, versioned,
and not hardcoded. This middleware enforces both at the request layer.

**Task: Create `services/core-api/src/compliance/sovereign-cac.middleware.ts`**

```typescript
// services/core-api/src/compliance/sovereign-cac.middleware.ts
// GOV: Sovereign CaC (Compliance as Code) middleware — Corpus Appendix J
// Enforces: Bill S-210 age assurance, Bill 149 AI disclosure, jurisdiction gating.
// All jurisdiction rules are versioned and configurable — never hardcoded.
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

// Jurisdiction rules version — increment on any rule change (GOV: commit required)
const JURISDICTION_RULES_VERSION = 'v1.0.0';

export interface JurisdictionRule {
  country_code: string;
  region_code?: string;          // Provincial/state level where applicable
  age_assurance_required: boolean;
  age_assurance_method: 'DECLARATION' | 'RELIABLE_ESTIMATION' | 'VERIFIED_ID';
  ai_disclosure_required: boolean;
  content_restriction_variance?: string;
  consent_enforcement_threshold?: string;
  reporting_obligations?: string[];
}

// Versioned jurisdiction overlay — Corpus Appendix J
// Any change requires: version increment + GOV: commit + governance approval
const JURISDICTION_OVERLAY: JurisdictionRule[] = [
  {
    country_code: 'CA',
    age_assurance_required: true,
    age_assurance_method: 'RELIABLE_ESTIMATION',  // Bill S-210
    ai_disclosure_required: true,                  // Bill 149 (ON) — applied nationally
    reporting_obligations: ['BILL_C22_WARRANT_10DAY'],
  },
  {
    country_code: 'CA',
    region_code: 'ON',
    age_assurance_required: true,
    age_assurance_method: 'RELIABLE_ESTIMATION',
    ai_disclosure_required: true,                  // Bill 149 specific to Ontario
    reporting_obligations: ['BILL_C22_WARRANT_10DAY', 'BILL_149_AI_DISCLOSURE'],
  },
  {
    country_code: 'US',
    age_assurance_required: true,
    age_assurance_method: 'DECLARATION',           // 18 USC 2257
    ai_disclosure_required: false,
    reporting_obligations: ['USC_2257_RECORDS'],
  },
  {
    country_code: 'GB',
    age_assurance_required: true,
    age_assurance_method: 'VERIFIED_ID',           // UK Online Safety Act
    ai_disclosure_required: false,
  },
  {
    country_code: 'DEFAULT',
    age_assurance_required: true,
    age_assurance_method: 'DECLARATION',
    ai_disclosure_required: false,
  },
];

@Injectable()
export class SovereignCaCMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SovereignCaCMiddleware.name);

  use(req: Request, res: Response, next: NextFunction): void {
    const country_code = this.resolveCountryCode(req);
    const region_code = this.resolveRegionCode(req);
    const rule = this.resolveRule(country_code, region_code);

    // Attach jurisdiction context to request for downstream services
    (req as Request & { jurisdiction: JurisdictionRule & { version: string } }).jurisdiction = {
      ...rule,
      version: JURISDICTION_RULES_VERSION,
    };

    // Bill 149 (ON): AI disclosure header — must be present on all responses
    // where AI-assisted content may be returned
    if (rule.ai_disclosure_required) {
      res.setHeader('X-AI-Disclosure', 'This platform uses AI-assisted features. ' +
        'AI tools assist creators but do not replace human oversight. ' +
        'Bill 149 (Ontario) 2024.');
    }

    // Age assurance gate — enforced at content delivery layer, not here
    // This middleware attaches the requirement; the SafetyService enforces it
    if (rule.age_assurance_required) {
      res.setHeader('X-Age-Assurance-Required', rule.age_assurance_method);
    }

    this.logger.log('SovereignCaCMiddleware: jurisdiction resolved', {
      country_code,
      region_code: region_code ?? 'NONE',
      age_assurance_method: rule.age_assurance_method,
      ai_disclosure_required: rule.ai_disclosure_required,
      rules_version: JURISDICTION_RULES_VERSION,
      rule_applied_id: 'SOVEREIGN_CAC_v1',
    });

    next();
  }

  private resolveCountryCode(req: Request): string {
    // Priority: Cloudflare header → custom header → default
    return (
      (req.headers['cf-ipcountry'] as string) ??
      (req.headers['x-country-code'] as string) ??
      'DEFAULT'
    ).toUpperCase();
  }

  private resolveRegionCode(req: Request): string | undefined {
    return (req.headers['x-region-code'] as string | undefined)?.toUpperCase();
  }

  private resolveRule(country_code: string, region_code?: string): JurisdictionRule {
    // Try region-specific match first
    if (region_code) {
      const regional = JURISDICTION_OVERLAY.find(
        r => r.country_code === country_code && r.region_code === region_code
      );
      if (regional) return regional;
    }

    // Country-level match (no region)
    const national = JURISDICTION_OVERLAY.find(
      r => r.country_code === country_code && !r.region_code
    );
    if (national) return national;

    // Default fallback
    return JURISDICTION_OVERLAY.find(r => r.country_code === 'DEFAULT')!;
  }
}
```

Also add `SovereignCaCMiddleware` to `AppModule` using `configure()`:

```typescript
// In app.module.ts — add MiddlewareConsumer import and configure method:
import { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { SovereignCaCMiddleware } from './compliance/sovereign-cac.middleware';

// AppModule class must implement NestModule and add:
configure(consumer: MiddlewareConsumer): void {
  consumer
    .apply(SovereignCaCMiddleware)
    .forRoutes('*');
}
```

**Validation:**
- `JURISDICTION_RULES_VERSION` constant is present and versioned
- `resolveRule('CA', 'ON')` returns rule with `ai_disclosure_required: true`
- `resolveRule('CA', undefined)` returns rule with `age_assurance_method: 'RELIABLE_ESTIMATION'`
- `resolveRule('XX', undefined)` returns the DEFAULT rule
- Response headers `X-AI-Disclosure` and `X-Age-Assurance-Required` are set correctly
- `npx tsc --noEmit` clean

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/GOV-004-SOVEREIGN-CAC-MIDDLEWARE.md`

---

## TIER 4E — CI/CD NOTIFICATION

---

### DIRECTIVE: INFRA-002
**Status:** `[ ] TODO`
**Commit prefix:** `INFRA:`
**Target path:** `.github/workflows/notify.yml` (CREATE)
**Risk class:** R2

**Context:** Program Control currently monitors GitHub manually to detect
directive completion. This directive adds a GitHub Actions workflow that posts
a notification to a configured webhook (Slack or email) whenever a commit
lands on `main` and a new report-back file is added to `PROGRAM_CONTROL/REPORT_BACK/`.
This closes the feedback loop without manual monitoring.

**Task: Create `.github/workflows/notify.yml`**

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

**Setup required after merge:**
1. Go to `OmniQuestMediaInc/ChatNowZone--BUILD` → Settings → Secrets → Actions
2. Add secret named `PROGRAM_CONTROL_WEBHOOK` with your Slack incoming webhook URL
   (or any webhook endpoint — Discord, Teams, email relay, etc.)
3. If no webhook is configured, the workflow runs but skips notification gracefully

**Validation:**
- Workflow YAML is valid (`act --list` or GitHub Actions syntax check)
- `paths` filter correctly targets `PROGRAM_CONTROL/REPORT_BACK/**`
- Webhook step skips gracefully when secret is not set (no failure)

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/INFRA-002-NOTIFY-WORKFLOW.md`

---

## STANDING INVARIANTS (unchanged from v1)

1. No UPDATE or DELETE on `ledger_entries`, `audit_events`, `game_sessions`,
   `call_sessions`, `voucher_vault` — ever.

2. All FIZ-scoped commits require the full four-line format.

3. No hardcoded financial constants anywhere — always read from `governance.config.ts`.

4. `crypto.randomInt()` only for all game outcomes. `Math.random()` prohibited.

5. No `@angular/core` imports in any service file.

6. `npx tsc --noEmit` must pass with zero code-level errors before any commit.

7. Every new service file must include a `Logger` instance.

8. Report-back files are mandatory — directive is not DONE without one.

9. `NATS_TOPICS` registry is the only permitted source of NATS topic strings.
   No string literals in publish/subscribe calls.

10. AI services (ZONE-GPT, HeatScore, PersonaEngine) are advisory only.
    They must never execute financial, moderation, or enforcement actions.
    All proposals require human decision logging per Corpus Ch.8 §6.

---

## RECOMMENDED EXECUTION ORDER

```
INFRA-001  (alone — foundation)
     │
     ├── HZ-001 (reissue)     ┐
     ├── GM-002 (wiring)      ├── parallel
     └── NATS-001             ┘
              │
     ┌────────┼────────┐
   GOV-002  GOV-003  GOV-004   (parallel)
                │
            INFRA-002          (last — notification)
```

---

*End of CLAUDE_CODE_BACKLOG_v2.md — Version 2.0*
*Next version to be issued by Program Control after Tier 4 completion.*
*All changes to this file require human authorization from Kevin B. Hartley / Program Control.*
