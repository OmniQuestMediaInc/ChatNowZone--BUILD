DIRECTIVE SERIES — Thread 11 | Author: Kevin B. Hartley, CEO
Source: REQUIREMENTS_MASTER v1.0 (Apr 13 2026) × Tech Debt Master (Apr 14 2026)
Priority order: P0 release blockers → P1 near-term
Each directive is self-gated. Do not begin the next until the prior PR
is merged to main and report-back is filed.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DIRECTIVE 1 — GOV-CONST-001-PATCH
CHORE | Agent: COPILOT | Branch: chore/gov-const-001-patch
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILE: services/core-api/src/config/governance.config.ts

Add two null placeholder fields — no other changes:

  Under FAN_CLUB:
    ANNUAL_DISCOUNT_PCT: null,

  Under CREATOR_SAAS:
    ANNUAL_DISCOUNT_PCT: null,

These are intentionally null. Do not assign a value. They unblock
future activation directives without requiring a code change.

Invariant checks:
  - npx tsc --noEmit zero new errors
  - No other fields touched

Commit format:
  CHORE: Add ANNUAL_DISCOUNT_PCT null placeholders to GovernanceConfig

  - FAN_CLUB.ANNUAL_DISCOUNT_PCT: null added
  - CREATOR_SAAS.ANNUAL_DISCOUNT_PCT: null added
  - Resolves open deviation from GOV-CONST-001

  Rule: GOV-CONST-001-PATCH

PR targeting main. Report back with commit hash + tsc confirmation.
Move to DONE on merge.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DIRECTIVE 2 — MEMB-001
FIZ-scoped | Agent: CLAUDE_CODE | Branch: fiz/memb-001
Begin only after DIRECTIVE 1 is merged.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Context: No server-side zone access enforcement exists. Every protected
endpoint is open. This is the single highest-priority product-surface
gap blocking launch.

SCOPE:

1. Create ZoneAccessService
   Path: services/core-api/src/zone-access/zone-access.service.ts
   - On every protected endpoint call, resolve the requesting user's
     current membership tier (DAY_PASS / ANNUAL / OMNIPASS_PLUS /
     DIAMOND) plus any active ShowZonePass records
   - Check resolved access against ZoneMap in GovernanceConfig
   - Return: GRANTED or DENIED with reason_code and rule_applied_id
   - Log every access decision via Logger (granted and denied)
   - Throw 403 ForbiddenException with structured payload on DENIED
   - No hardcoded tier or zone values — GovernanceConfig only

2. ZoneMap in GovernanceConfig
   File: services/core-api/src/config/governance.config.ts
   Add ZONE_MAP block defining which tiers may access which zones.
   Canonical zones (use these exact keys):
     CHAT_ZONE, SHOW_THEATRE, BIJOU, PRIVATE_CALL, DIAMOND_CONCIERGE
   Canonical tiers: DAY_PASS, ANNUAL, OMNIPASS_PLUS, DIAMOND
   ShowZonePass access overrides tier gate for SHOW_THEATRE and BIJOU.

3. Guard
   Create ZoneAccessGuard implementing CanActivate.
   Apply to all zone-gated route controllers.
   Guard calls ZoneAccessService and blocks on DENIED.

4. NATS topic
   Register: zone.access.denied
   Key: ZONE_ACCESS_DENIED
   File: services/nats/topics.registry.ts
   Publish on every DENIED decision with user_id, zone, reason_code,
   rule_applied_id, timestamp (America/Toronto).

5. Prisma
   Confirm or add ShowZonePass model if not present.
   Required fields: id, user_id, zone (enum), valid_from, valid_until,
   organization_id, tenant_id, created_at.
   Run prisma generate (schema only, no migration).

Invariant checks:
  - No hardcoded zone or tier strings — enums and GovernanceConfig only
  - rule_applied_id on every access decision output
  - organization_id + tenant_id on all Prisma writes
  - Logger on ZoneAccessService and ZoneAccessGuard
  - npx tsc --noEmit zero new errors
  - NATS_TOPICS.* constants only — no raw strings

Commit format (FIZ four-line):
  FIZ: Add ZoneAccessService + Guard — server-side zone enforcement

  - ZoneAccessService: resolves tier + ShowZonePass, checks ZoneMap
  - ZoneAccessGuard: applied to all protected zone endpoints
  - ZONE_MAP added to GovernanceConfig; ZONE_ACCESS_DENIED NATS topic
  - Zero new tsc errors

  Rule: MEMB-001

PR targeting main. Report back with:
  - Commit hash
  - List of controllers ZoneAccessGuard was applied to
  - Confirmation ShowZonePass model exists in schema
  - tsc --noEmit confirmation
Move to DONE on merge.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DIRECTIVE 3 — MEMB-002
FIZ-scoped | Agent: CLAUDE_CODE | Branch: fiz/memb-002
Begin only after DIRECTIVE 2 is merged.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Context: Membership tier state does not persist. MEMB-001 introduced
ZoneAccessService but it has no durable tier record to resolve against.
This directive builds the persistence and billing foundation.

SCOPE:

1. MembershipSubscription model (Prisma)
   Add to prisma/schema.prisma:
   Fields: id, user_id, tier (enum: DAY_PASS / ANNUAL /
   OMNIPASS_PLUS / DIAMOND), status (ACTIVE / CANCELLED / EXPIRED /
   GRACE), billing_interval (MONTHLY / QUARTERLY / SEMI_ANNUAL /
   ANNUAL), commitment_months (Int), bonus_months (Int, default 0),
   current_period_start, current_period_end, cancelled_at (nullable),
   organization_id, tenant_id, created_at, updated_at.
   Add unique constraint: one ACTIVE subscription per user.
   Run prisma generate (schema only, no migration).

2. MembershipService
   Path: services/core-api/src/membership/membership.service.ts
   Methods:
   - getActiveTier(userId): resolves current tier from
     MembershipSubscription; returns DAY_PASS if none active
   - createSubscription(userId, tier, billingInterval): creates record,
     calculates bonus_months per ADR-003 (3+1 / 6+2 / 12+3 matrix),
     sets period dates
   - cancelSubscription(userId): sets status CANCELLED, retains access
     until current_period_end
   - expireSubscription(subscriptionId): sets EXPIRED, downgrades user
     to DAY_PASS

   Logger on every method. rule_applied_id on every state change.

3. Wire into ZoneAccessService (MEMB-001)
   Replace any stub tier resolution with MembershipService.getActiveTier().
   No other changes to ZoneAccessService logic.

4. Bonus month matrix in GovernanceConfig
   File: services/core-api/src/config/governance.config.ts
   Add MEMBERSHIP.DURATION_BONUS block:
     QUARTERLY: { commitment_months: 3, bonus_months: 1 }
     SEMI_ANNUAL: { commitment_months: 6, bonus_months: 2 }
     ANNUAL: { commitment_months: 12, bonus_months: 3 }

5. NATS topics
   Register in services/nats/topics.registry.ts:
     membership.subscription.created  → MEMBERSHIP_SUBSCRIPTION_CREATED
     membership.subscription.cancelled → MEMBERSHIP_SUBSCRIPTION_CANCELLED
     membership.subscription.expired  → MEMBERSHIP_SUBSCRIPTION_EXPIRED
   Publish on each corresponding MembershipService state change.

Invariant checks:
  - Append-only ledger not touched — MembershipSubscription is not a
    ledger model; status field updates are permitted
  - One ACTIVE subscription per user enforced at DB level (unique constraint)
  - No hardcoded tier/interval values — GovernanceConfig and enums only
  - organization_id + tenant_id on all Prisma writes
  - Logger + rule_applied_id on all methods
  - npx tsc --noEmit zero new errors

Commit format (FIZ four-line):
  FIZ: Add MembershipSubscription model + MembershipService

  - MembershipSubscription schema with tier, billing, bonus_months
  - MembershipService: getActiveTier / create / cancel / expire
  - Duration bonus matrix in GovernanceConfig (ADR-003)
  - ZoneAccessService wired to MembershipService.getActiveTier

  Rule: MEMB-002

PR targeting main. Report back: commit hash, schema diff summary,
tsc confirmation. Move to DONE on merge.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DIRECTIVE 4 — MEMB-003
FIZ-scoped | Agent: CLAUDE_CODE | Branch: fiz/memb-003
Begin only after DIRECTIVE 3 is merged.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Context: Membership tiers carry monthly CZT stipends. No stipend job
exists. This directive builds the monthly stipend distribution job.

SCOPE:

1. Stipend amounts in GovernanceConfig
   File: services/core-api/src/config/governance.config.ts
   Add MEMBERSHIP.STIPEND_CZT block:
     DAY_PASS: 0
     ANNUAL: 100
     OMNIPASS_PLUS: 250
     DIAMOND: 500
   Values are CZT units. CEO may revise via a GOV: commit.

2. StipendDistributionJob
   Path: services/core-api/src/membership/stipend-distribution.job.ts
   - Scheduled: first day of each billing month per subscription
     current_period_start
   - For each ACTIVE subscription with stipend > 0:
     * Call LedgerService.recordEntry with:
         amount: STIPEND_CZT[tier]
         token_origin: TokenOrigin.GIFTED
         reason_code: 'MONTHLY_STIPEND'
         rule_applied_id: populated
         organization_id, tenant_id: from subscription
     * Publish NATS topic: membership.stipend.distributed
   - If LedgerService throws, log error and continue (do not fail
     the entire job batch); dead-letter for manual review
   - Logger on job start, each grant, each error, job complete

3. NATS topic
   Register: membership.stipend.distributed
   Key: MEMBERSHIP_STIPEND_DISTRIBUTED

4. Idempotency
   Each stipend grant must carry a unique idempotency_key composed of:
   subscription_id + billing_period_start (ISO string).
   LedgerService must reject duplicate keys — do not double-grant.
   Confirm LedgerService supports idempotency_key on recordEntry;
   if not, add the field and unique constraint in this directive.

Invariant checks:
  - Append-only ledger — no UPDATE on ledger rows
  - token_origin: GIFTED on all stipend entries
  - idempotency_key prevents double-grant
  - rule_applied_id on every ledger entry
  - organization_id + tenant_id on all Prisma writes
  - npx tsc --noEmit zero new errors

Commit format (FIZ four-line):
  FIZ: Add StipendDistributionJob — monthly CZT grant per tier

  - StipendDistributionJob: scheduled, idempotent, GIFTED origin
  - MEMBERSHIP.STIPEND_CZT constants in GovernanceConfig
  - MEMBERSHIP_STIPEND_DISTRIBUTED NATS topic registered
  - LedgerService idempotency_key confirmed / added

  Rule: MEMB-003

PR targeting main. Report back: commit hash, idempotency approach
confirmed, tsc confirmation. Move to DONE on merge.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DIRECTIVE 5 — BJ-002
BIJOU-scoped | Agent: CLAUDE_CODE | Branch: bijou/bj-002
Begin only after DIRECTIVE 4 is merged.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Context: Bijou Scheduler is absent. Bijou rooms require 15-minute
rolling schedule windows, velocity rules, and a 24-VIP cap.
This directive builds the scheduler only. Admission queue is BJ-003.

SCOPE:

1. BijouSession model (Prisma) — confirm or create
   Required fields: id, creator_id, scheduled_start, scheduled_end,
   capacity (max 24), status (SCHEDULED / OPEN / CLOSED / CANCELLED),
   organization_id, tenant_id, created_at, updated_at.
   Add index on (status, scheduled_start).
   Run prisma generate (schema only, no migration).

2. BijouSchedulerService
   Path: services/bijou/src/bijou-scheduler.service.ts
   (or locate existing bijou package path and use it)
   - createSession(creatorId, scheduledStart): validates 15-minute
     boundary alignment (start must land on :00/:15/:30/:45);
     throws if not aligned
   - Velocity rule: a creator may not have more than
     BIJOU.MAX_SESSIONS_PER_HOUR sessions starting within any
     rolling 60-minute window. Read from GovernanceConfig.
     Throw 429-equivalent domain error on violation.
   - cancelSession(sessionId): sets CANCELLED; publishes NATS event
   - openSession(sessionId): sets OPEN at scheduled_start;
     publishes NATS event
   - closeSession(sessionId): sets CLOSED; publishes NATS event
   - Logger on all methods. rule_applied_id on all state changes.

3. GovernanceConfig additions
   File: services/core-api/src/governance/governance.config.ts
   Add BIJOU block:
     MAX_CAPACITY: 24
     SESSION_DURATION_MINUTES: 60
     SCHEDULE_SLOT_MINUTES: 15
     MAX_SESSIONS_PER_HOUR: 2   (CEO may revise via GOV: commit)

4. NATS topics
   Register in services/nats/topics.registry.ts:
     bijou.session.scheduled  → BIJOU_SESSION_SCHEDULED
     bijou.session.opened     → BIJOU_SESSION_OPENED
     bijou.session.closed     → BIJOU_SESSION_CLOSED
     bijou.session.cancelled  → BIJOU_SESSION_CANCELLED

Invariant checks:
  - No hardcoded Bijou constants — GovernanceConfig BIJOU block only
  - rule_applied_id on every session state change
  - organization_id + tenant_id on all Prisma writes
  - Logger on BijouSchedulerService
  - npx tsc --noEmit zero new errors
  - NATS_TOPICS.* constants only

Commit format (BIJOU four-line):
  BIJOU: Add BijouSchedulerService + session model

  - BijouSession schema: capacity 24, 15-min slot alignment enforced
  - BijouSchedulerService: create / open / close / cancel + velocity rule
  - BIJOU GovernanceConfig block; four NATS session topics registered
  - Zero new tsc errors

  Rule: BJ-002

PR targeting main. Report back: commit hash, velocity rule logic
described, tsc confirmation. Move to DONE on merge.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DIRECTIVE 6 — BJ-003
BIJOU-scoped | Agent: CLAUDE_CODE | Branch: bijou/bj-003
Begin only after DIRECTIVE 5 is merged.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Context: Bijou Admission queue. Guests request entry; the queue manages
the 10-second accept window, standby, camera enforcement grace period,
and ejection. Depends on BijouSession from BJ-002.

SCOPE:

1. BijouAdmission model (Prisma)
   Fields: id, session_id, user_id, status (PENDING / ADMITTED /
   STANDBY / EJECTED / ABANDONED), admitted_at (nullable),
   camera_grace_deadline (nullable), organization_id, tenant_id,
   created_at, updated_at.
   Add unique constraint: one non-EJECTED/ABANDONED record per
   (session_id, user_id).
   Run prisma generate (schema only, no migration).

2. BijouAdmissionService
   Path: services/bijou/src/bijou-admission.service.ts
   - requestAdmission(sessionId, userId):
     * If session at capacity (admitted count = MAX_CAPACITY):
       place on STANDBY queue; publish bijou.admission.standby
     * If seat available: set PENDING with 10s accept window;
       publish bijou.admission.offered
   - acceptAdmission(admissionId, userId):
     * Must be called within 10s of PENDING; else auto-ABANDONED
     * On accept: set ADMITTED, camera_grace_deadline = now + 30s;
       publish bijou.admission.admitted
   - enforceCamera(admissionId):
     * Called at camera_grace_deadline
     * If camera not confirmed active: set EJECTED;
       publish bijou.admission.ejected
     * Decrement admitted count; promote next STANDBY to PENDING
   - Camera confirmation method: confirmCamera(admissionId)
     * Sets camera active flag; clears ejection risk
   - Logger on all methods. rule_applied_id on all state transitions.

3. Accept window + standby promotion
   10-second accept window is a hard timeout enforced by a scheduler
   job or delayed NATS message — not a client-side timer.
   On ABANDONED: promote next STANDBY record to PENDING (FIFO).
   On EJECTED: same promotion logic.

4. NATS topics
   Register:
     bijou.admission.offered   → BIJOU_ADMISSION_OFFERED
     bijou.admission.admitted  → BIJOU_ADMISSION_ADMITTED
     bijou.admission.standby   → BIJOU_ADMISSION_STANDBY
     bijou.admission.ejected   → BIJOU_ADMISSION_EJECTED
     bijou.admission.abandoned → BIJOU_ADMISSION_ABANDONED

Invariant checks:
  - MAX_CAPACITY from GovernanceConfig BIJOU block (BJ-002) — no
    hardcoded 24
  - camera_grace_deadline of 30s from GovernanceConfig
    (add BIJOU.CAMERA_GRACE_SECONDS: 30)
  - accept window of 10s from GovernanceConfig
    (add BIJOU.ADMIT_ACCEPT_WINDOW_SECONDS: 10)
  - rule_applied_id on all state transitions
  - organization_id + tenant_id on all Prisma writes
  - Logger on BijouAdmissionService
  - npx tsc --noEmit zero new errors

Commit format:
  BIJOU: Add BijouAdmissionService + admission queue

  - BijouAdmission schema with standby, grace, ejection states
  - 10s accept window + 30s camera grace enforced server-side
  - Standby FIFO promotion on abandon or ejection
  - Five admission NATS topics registered

  Rule: BJ-003

PR targeting main. Report back: commit hash, standby promotion
mechanism described, tsc confirmation. Move to DONE on merge.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DIRECTIVE 7 — BJ-004
BIJOU-scoped | Agent: CLAUDE_CODE | Branch: bijou/bj-004
Begin only after DIRECTIVE 6 is merged.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Context: Bijou dwell-credit algorithm. Admitted guests earn CZT credit
based on dwell time. The 65/35 split funds creator payout from dwell.
Depends on BijouSession (BJ-002) and BijouAdmission (BJ-003).

SCOPE:

1. DwellLog model (Prisma)
   Fields: id, admission_id, session_id, user_id, dwell_seconds (Int),
   czt_credited (Int), payout_czt (Int), platform_czt (Int),
   organization_id, tenant_id, created_at.
   Append-only — no UPDATE or DELETE triggers permitted.
   Run prisma generate (schema only, no migration).

2. BijouDwellService
   Path: services/bijou/src/bijou-dwell.service.ts
   - On BijouSession CLOSED event (subscribe to BIJOU_SESSION_CLOSED):
     For each ADMITTED record on the session:
       * Calculate dwell_seconds from admitted_at to session close
       * Apply dwell-credit formula from GovernanceConfig:
           czt_credited = floor(dwell_seconds / DWELL_CREDIT_INTERVAL_SECONDS)
                          * DWELL_CREDIT_PER_INTERVAL
           payout_czt  = floor(czt_credited * BIJOU_CREATOR_SPLIT)  (65%)
           platform_czt = czt_credited - payout_czt                 (35%)
       * Write DwellLog record (append-only)
       * Call LedgerService.recordEntry for guest credit:
           amount: czt_credited, token_origin: GIFTED,
           reason_code: 'BIJOU_DWELL_CREDIT',
           rule_applied_id, idempotency_key: admission_id + session_id
       * Publish NATS: bijou.dwell.credited
   - Creator payout_czt accumulates for creator payout cycle —
     do NOT write creator payout in this directive; write to a
     CreatorDwellAccrual staging record only. Creator payout
     settlement is a separate directive.
   - Logger on all operations. Errors logged and dead-lettered;
     job does not halt on a single record failure.

3. GovernanceConfig additions (BIJOU block)
   Add:
     DWELL_CREDIT_INTERVAL_SECONDS: 60
     DWELL_CREDIT_PER_INTERVAL: 5
     BIJOU_CREATOR_SPLIT: 0.65

4. CreatorDwellAccrual model (Prisma)
   Fields: id, creator_id, session_id, payout_czt (Int),
   settled (Boolean, default false), organization_id, tenant_id,
   created_at.
   Append-only.

5. NATS topic
   Register: bijou.dwell.credited → BIJOU_DWELL_CREDITED

Invariant checks:
  - Append-only: no UPDATE/DELETE on DwellLog or LedgerEntry
  - idempotency_key prevents double-credit on retry
  - token_origin: GIFTED on guest dwell credits
  - All split constants from GovernanceConfig BIJOU block
  - rule_applied_id on every ledger entry
  - organization_id + tenant_id on all Prisma writes
  - npx tsc --noEmit zero new errors

Commit format:
  BIJOU: Add BijouDwellService + dwell-credit algorithm

  - DwellLog + CreatorDwellAccrual schemas (append-only)
  - 65/35 dwell-credit split; guest credited GIFTED CZT on close
  - Creator payout staged to CreatorDwellAccrual (not settled here)
  - BIJOU_DWELL_CREDITED NATS topic; idempotent on admission+session key

  Rule: BJ-004

PR targeting main. Report back: commit hash, dwell formula
confirmed, creator accrual staging confirmed, tsc confirmation.
Move to DONE on merge.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DIRECTIVE 8 — OBS-001
OBS-scoped | Agent: CLAUDE_CODE | Branch: obs/obs-001
XL effort. Begin only after DIRECTIVE 7 is merged.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Context: The OBS Bridge, Chat Aggregator, and Persona Engine are
entirely absent. This is the largest single debt item and the core
of the creator broadcast stack. Given XL effort, this directive
covers the foundational layer only. OBS-002 through OBS-008 will
follow in subsequent directives.

SCOPE — OBS-001 covers three components:

━━ COMPONENT A — OBS Bridge ━━

1. OBS Bridge Service
   Path: services/obs-bridge/src/obs-bridge.service.ts
   (create the obs-bridge package if it does not exist)
   - Accepts RTMP ingest from OBS client (or native browser stream)
   - Validates stream key against creator record
   - Publishes NATS: obs.stream.started on connect
   - Publishes NATS: obs.stream.ended on disconnect
   - Logger on connect, disconnect, and any validation failure
   - Stream key must be hashed (SHA-256) in storage — never plaintext
   - No LiveKit SFU wiring in this directive — that is OBS-002

2. Stream key management
   Add stream_key_hash (String, unique) to Creator model in Prisma
   (or locate existing field and confirm).
   Add regenerateStreamKey(creatorId) method to OBS Bridge Service.
   Regeneration publishes NATS: obs.stream.key.rotated.
   Run prisma generate (schema only, no migration).

━━ COMPONENT B — Chat Aggregator ━━

3. ChatAggregatorService
   Path: services/obs-bridge/src/chat-aggregator.service.ts
   - Ingests chat messages from multiple platform sources.
   - For this directive: implement the internal CNZ chat source only.
     External platform connectors (Twitch, YouTube) are OBS-003.
   - Normalises each message to ChatMessage type:
     { id, source, creator_id, user_id, content, timestamp,
       platform_user_id, organization_id, tenant_id }
   - Publishes NATS: chat.message.ingested per message
   - Variable jitter delivery: apply random 150–450ms delay before
     publishing each message. Read jitter bounds from GovernanceConfig.
   - Logger on each ingested message (info level).

━━ COMPONENT C — Persona Engine foundation ━━

4. PersonaEngineService
   Path: services/obs-bridge/src/persona-engine.service.ts
   - Subscribes to NATS: chat.message.ingested
   - For each message: evaluate whether an auto-response is warranted
     using a rule-based pass only (no AI call in this directive —
     AI integration is OBS-004).
   - Check CREATOR_AUTO flag on creator record:
     If CREATOR_AUTO = false: no auto-response generated.
     If CREATOR_AUTO = true: apply Bill 149 (ON) AI disclosure prefix
     to any generated response before publishing.
   - Publish NATS: persona.response.queued when a response is generated.
   - Logger on all decisions. rule_applied_id required on every
     persona.response.queued event.

5. GovernanceConfig additions
   File: services/core-api/src/config/governance.config.ts
   Add OBS block:
     CHAT_JITTER_MIN_MS: 150
     CHAT_JITTER_MAX_MS: 450
     BILL_149_DISCLOSURE_PREFIX: 'This message was generated with AI assistance. '

6. NATS topics — register all in topics.registry.ts:
     obs.stream.started         → OBS_STREAM_STARTED
     obs.stream.ended           → OBS_STREAM_ENDED
     obs.stream.key.rotated     → OBS_STREAM_KEY_ROTATED
     chat.message.ingested      → CHAT_MESSAGE_INGESTED
     persona.response.queued    → PERSONA_RESPONSE_QUEUED

7. CREATOR_AUTO flag
   Confirm or add creator_auto (Boolean, default false) field on
   Creator model in Prisma. Run prisma generate if added.

Invariant checks:
  - Stream key stored as SHA-256 hash — never plaintext
  - Bill 149 disclosure prefix on all CREATOR_AUTO=true outputs
  - Jitter bounds from GovernanceConfig OBS block — no hardcoded values
  - rule_applied_id on all persona.response.queued events
  - Logger on all three services
  - organization_id + tenant_id on all Prisma writes
  - npx tsc --noEmit zero new errors
  - NATS_TOPICS.* constants only

Commit format:
  OBS: Add OBS Bridge + Chat Aggregator + Persona Engine foundation

  - OBSBridgeService: RTMP ingest, stream key (SHA-256), NATS events
  - ChatAggregatorService: CNZ source, normalised ChatMessage, jitter delivery
  - PersonaEngineService: CREATOR_AUTO gate, Bill 149 prefix, rule_applied_id
  - OBS GovernanceConfig block; 5 NATS topics registered
  - Zero new tsc errors

  Rule: OBS-001

PR targeting main. Report back:
  - Commit hash
  - Confirm stream key stored as hash (not plaintext)
  - Confirm CREATOR_AUTO flag location in schema
  - tsc --noEmit confirmation
Move to DONE on merge.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
END OF SERIES — Thread 11 | Directives 1–8
Next series (OBS-002 through OBS-008, MEMB-004+, HZ-001) will be
authored after this series clears.
Authority: Kevin B. Hartley, CEO — OmniQuest Media Inc.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
