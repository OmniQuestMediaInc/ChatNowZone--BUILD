# CLAUDE CODE BACKLOG v4 — ChatNow.Zone

**Authority:** OmniQuest Media Inc. | CEO Kevin B. Hartley
**Backlog Version:** 4.0
**Generated:** 2026-04-08
**Supersedes:** CLAUDE_CODE_BACKLOG_v3.md (Tiers 1–5 complete)
**Platform Time Standard:** America/Toronto
**Canonical Authority:** OQMI Coding Doctrine v2.0 · Canonical Corpus v10

-----

## COMPLETED — TIERS 1–5

|Directive    |Description                               |Status|
|-------------|------------------------------------------|------|
|FIZ-001      |GovernanceConfig constants                |✅     |
|FIZ-002      |Dispute resolution (NestJS)               |✅     |
|FIZ-003      |Three-Bucket Wallet                       |✅     |
|FIZ-004      |Schema — 6 new tables                     |✅     |
|BIJOU-001    |PassPricingService + MinSeatGateService   |✅     |
|GOV-001      |GeoPricingService                         |✅     |
|GM-001       |GameEngineService                         |✅     |
|GM-002       |GamesModule wiring                        |✅     |
|HZ-001       |HeatScoreService                          |✅     |
|NATS-001     |NATS fabric scaffold                      |✅     |
|GOV-002      |WormExportService                         |✅     |
|GOV-003      |ZONE-GPT ProposalService                  |✅     |
|GOV-004      |SovereignCaCMiddleware                    |✅     |
|INFRA-001    |NestJS scaffold + tsconfig                |✅     |
|INFRA-002/003|TypeScript fixes                          |✅     |
|HOUSE-001    |AppModule restore                         |✅     |
|HOUSE-002    |notify.yml workflow                       |✅     |
|PRISMA-001   |Prisma schema (16 models) + PrismaModule  |✅     |
|PRISMA-002   |ProvisionalSuppressionService DB migration|✅     |
|SHOWZONE-001 |ShowZone room lifecycle state machine     |✅     |
|BIJOU-002    |Bijou session service (camera + standby)  |✅     |
|GWP-001      |Gift With Purchase service                |✅     |

-----

## HOW TO USE THIS FILE

Same rules as v1–v3. One directive per session unless told otherwise.
Read `OQMI CODING DOCTRINE v2.0` and `.github/copilot-instructions.md` first.
FIZ commits require the four-line format. Report-back is mandatory.

**FIZ commit format:**

```
FIZ: <short description>
REASON: <why this change is necessary>
IMPACT: <what balances/flows/constants are affected>
CORRELATION_ID: <generate a uuid v4>
```

Non-FIZ directives use their designated prefix (`AUTH:`, `KYC:`, `MOD:`, `AUDIT:`, `INFRA:`, `CHORE:`).

-----

## TIER 6 — L0 SHIP-GATE SERVICES

This tier implements the remaining L0-blocking systems as defined in Canonical Corpus v10,
Chapter 10 (Launch Doctrine). The platform cannot expose publicly until all of these pass.

Execution order is enforced. Do not begin a tier until its prerequisite is merged.

```
AUTH-001  ──┐
AUTH-002  ──┘  (step-up auth foundation — run together)
              │
         KYC-001   (performer identity — depends on AUTH foundation)
              │
    ┌─────────┼─────────┐
 MOD-001   AUDIT-001  AUDIT-002   (parallel after KYC-001)
              │
           INFRA-004   (reconciliation — final gate)
```

-----

## TIER 6A — STEP-UP AUTHENTICATION

L0 requirement: RBAC + step-up enforced.
These two directives are the foundation for all sensitive-action enforcement.

-----

### DIRECTIVE: AUTH-001

**Status:** `[ ] TODO`
**Commit prefix:** `AUTH:`
**Target path:** `services/core-api/src/auth/step-up.service.ts` (CREATE)
**Risk class:** R1

**Context:** The Canonical Corpus (Chapter 7, §8.2) mandates step-up authentication
for all sensitive actions: wallet modification, payout changes, takedown submission,
account freeze, content deletion, refund override. Currently no step-up service exists.
TOTP (RFC 6238) is the required mechanism. SMS is explicitly prohibited as primary method.

**Task 1: Create `services/core-api/src/auth/step-up.service.ts`**

```typescript
// services/core-api/src/auth/step-up.service.ts
// AUTH: AUTH-001 — Step-up authentication service
// Canonical Corpus v10, Chapter 7 §8.2
// Required for: wallet modification, payout changes, takedown, freeze, deletion, refund override.
// TOTP (RFC 6238) only. SMS is prohibited as primary method.
import { Injectable, Logger } from '@nestjs/common';
import { NatsService } from '../nats/nats.service';
import { NATS_TOPICS } from '../../../nats/topics.registry';

export type StepUpAction =
  | 'WALLET_MODIFICATION'
  | 'PAYOUT_CHANGE'
  | 'TAKEDOWN_SUBMISSION'
  | 'ACCOUNT_FREEZE'
  | 'CONTENT_DELETION'
  | 'REFUND_OVERRIDE'
  | 'GEO_BLOCK_MODIFICATION'
  | 'PAYMENT_DETAIL_CHANGE';

export type StepUpMethod = 'TOTP' | 'BACKUP_CODE';

export interface StepUpChallenge {
  challenge_id: string;
  actor_id: string;
  action: StepUpAction;
  method: StepUpMethod;
  issued_at_utc: string;
  expires_at_utc: string;
  device_fingerprint: string;
  rule_applied_id: string;
}

export interface StepUpVerificationResult {
  verified: boolean;
  challenge_id: string;
  actor_id: string;
  action: StepUpAction;
  verified_at_utc: string | null;
  failure_reason: string | null;
  rule_applied_id: string;
}

// Step-up challenge window in seconds (5 minutes)
const CHALLENGE_WINDOW_SECS = 300;

// Actions that require step-up — enforced as an allow-list
const STEP_UP_REQUIRED_ACTIONS = new Set<StepUpAction>([
  'WALLET_MODIFICATION',
  'PAYOUT_CHANGE',
  'TAKEDOWN_SUBMISSION',
  'ACCOUNT_FREEZE',
  'CONTENT_DELETION',
  'REFUND_OVERRIDE',
  'GEO_BLOCK_MODIFICATION',
  'PAYMENT_DETAIL_CHANGE',
]);

@Injectable()
export class StepUpService {
  private readonly logger = new Logger(StepUpService.name);
  private readonly RULE_ID = 'STEP_UP_AUTH_v1';

  constructor(private readonly nats: NatsService) {}

  /**
   * Returns true if the given action requires step-up authentication.
   * This is an allow-list check — anything not on the list does not require step-up.
   */
  requiresStepUp(action: StepUpAction): boolean {
    return STEP_UP_REQUIRED_ACTIONS.has(action);
  }

  /**
   * Issues a step-up challenge for a sensitive action.
   * Caller is responsible for delivering the TOTP prompt to the actor.
   * Publishes challenge issued event to NATS for audit logging.
   */
  issueChallenge(params: {
    challenge_id: string;
    actor_id: string;
    action: StepUpAction;
    method: StepUpMethod;
    device_fingerprint: string;
  }): StepUpChallenge {
    if (!this.requiresStepUp(params.action)) {
      throw new Error(
        `STEP_UP_NOT_REQUIRED: action ${params.action} does not require step-up authentication.`
      );
    }

    const now = new Date();
    const expires = new Date(now.getTime() + CHALLENGE_WINDOW_SECS * 1000);

    const challenge: StepUpChallenge = {
      challenge_id: params.challenge_id,
      actor_id: params.actor_id,
      action: params.action,
      method: params.method,
      issued_at_utc: now.toISOString(),
      expires_at_utc: expires.toISOString(),
      device_fingerprint: params.device_fingerprint,
      rule_applied_id: this.RULE_ID,
    };

    this.logger.log('StepUpService: challenge issued', {
      challenge_id: challenge.challenge_id,
      actor_id: challenge.actor_id,
      action: challenge.action,
      method: challenge.method,
      rule_applied_id: this.RULE_ID,
    });

    this.nats.publish(NATS_TOPICS.STEP_UP_CHALLENGE_ISSUED, {
      challenge_id: challenge.challenge_id,
      actor_id: challenge.actor_id,
      action: challenge.action,
      method: challenge.method,
      expires_at_utc: challenge.expires_at_utc,
      device_fingerprint: challenge.device_fingerprint,
      rule_applied_id: this.RULE_ID,
    });

    return challenge;
  }

  /**
   * Verifies a step-up challenge response.
   * token_valid: caller has already verified the TOTP token against the actor's secret.
   * This service records the outcome and publishes to NATS — it does not verify TOTP math.
   * TOTP math must be performed by the caller using a library (e.g., otplib).
   */
  verifyChallenge(params: {
    challenge: StepUpChallenge;
    token_valid: boolean;
    device_fingerprint: string;
  }): StepUpVerificationResult {
    const now = new Date();
    const expired = now > new Date(params.challenge.expires_at_utc);

    if (expired) {
      this.logger.warn('StepUpService: challenge expired', {
        challenge_id: params.challenge.challenge_id,
        actor_id: params.challenge.actor_id,
        action: params.challenge.action,
        rule_applied_id: this.RULE_ID,
      });

      this.nats.publish(NATS_TOPICS.STEP_UP_CHALLENGE_FAILED, {
        challenge_id: params.challenge.challenge_id,
        actor_id: params.challenge.actor_id,
        action: params.challenge.action,
        failure_reason: 'CHALLENGE_EXPIRED',
        device_fingerprint: params.device_fingerprint,
        rule_applied_id: this.RULE_ID,
      });

      return {
        verified: false,
        challenge_id: params.challenge.challenge_id,
        actor_id: params.challenge.actor_id,
        action: params.challenge.action,
        verified_at_utc: null,
        failure_reason: 'CHALLENGE_EXPIRED',
        rule_applied_id: this.RULE_ID,
      };
    }

    if (!params.token_valid) {
      this.logger.warn('StepUpService: token invalid', {
        challenge_id: params.challenge.challenge_id,
        actor_id: params.challenge.actor_id,
        action: params.challenge.action,
        rule_applied_id: this.RULE_ID,
      });

      this.nats.publish(NATS_TOPICS.STEP_UP_CHALLENGE_FAILED, {
        challenge_id: params.challenge.challenge_id,
        actor_id: params.challenge.actor_id,
        action: params.challenge.action,
        failure_reason: 'TOKEN_INVALID',
        device_fingerprint: params.device_fingerprint,
        rule_applied_id: this.RULE_ID,
      });

      return {
        verified: false,
        challenge_id: params.challenge.challenge_id,
        actor_id: params.challenge.actor_id,
        action: params.challenge.action,
        verified_at_utc: null,
        failure_reason: 'TOKEN_INVALID',
        rule_applied_id: this.RULE_ID,
      };
    }

    const verified_at_utc = now.toISOString();

    this.logger.log('StepUpService: challenge verified', {
      challenge_id: params.challenge.challenge_id,
      actor_id: params.challenge.actor_id,
      action: params.challenge.action,
      rule_applied_id: this.RULE_ID,
    });

    this.nats.publish(NATS_TOPICS.STEP_UP_CHALLENGE_VERIFIED, {
      challenge_id: params.challenge.challenge_id,
      actor_id: params.challenge.actor_id,
      action: params.challenge.action,
      verified_at_utc,
      device_fingerprint: params.device_fingerprint,
      rule_applied_id: this.RULE_ID,
    });

    return {
      verified: true,
      challenge_id: params.challenge.challenge_id,
      actor_id: params.challenge.actor_id,
      action: params.challenge.action,
      verified_at_utc,
      failure_reason: null,
      rule_applied_id: this.RULE_ID,
    };
  }
}
```

**Task 2: Create `services/core-api/src/auth/auth.module.ts`**

```typescript
// services/core-api/src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { StepUpService } from './step-up.service';

@Module({
  providers: [StepUpService],
  exports: [StepUpService],
})
export class AuthModule {}
```

**Task 3: Add `AuthModule` to `AppModule` imports.**

**Task 4: Add NATS topics to `services/nats/topics.registry.ts` if not present:**

```typescript
STEP_UP_CHALLENGE_ISSUED:   'auth.step_up.challenge.issued',
STEP_UP_CHALLENGE_VERIFIED: 'auth.step_up.challenge.verified',
STEP_UP_CHALLENGE_FAILED:   'auth.step_up.challenge.failed',
```

**Validation:**

- `requiresStepUp('WALLET_MODIFICATION')` returns `true`
- `requiresStepUp('ACCOUNT_FREEZE')` returns `true`
- `issueChallenge()` throws when action is not in the required set
- `verifyChallenge()` returns `verified: false` when challenge is expired
- `verifyChallenge()` returns `verified: false` when `token_valid` is `false`
- `verifyChallenge()` returns `verified: true` when token is valid and not expired
- NATS publish called on issue, verify, and fail
- `npx tsc --noEmit` zero new errors

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/AUTH-001-STEP-UP-SERVICE.md`

-----

### DIRECTIVE: AUTH-002

**Status:** `[ ] TODO`
**Commit prefix:** `AUTH:`
**Target path:** `services/core-api/src/auth/rbac.guard.ts` (CREATE)
**Risk class:** R1

**Context:** The Canonical Corpus (Chapter 7, §8.1) mandates an explicit, non-implicit,
least-privilege RBAC permission matrix. The RBAC ladder from Appendix E defines five tiers:
Viewer, Creator, Moderator, Compliance, Administrator. Currently no RBAC guard exists.

**Task 1: Create `services/core-api/src/auth/rbac.guard.ts`**

```typescript
// services/core-api/src/auth/rbac.guard.ts
// AUTH: AUTH-002 — RBAC guard
// Canonical Corpus v10, Chapter 7 §8.1 + Appendix E
// Roles: VIEWER < CREATOR < MODERATOR < COMPLIANCE < ADMIN
// All sensitive actions require role eligibility + step-up (enforced by StepUpService).
import { Injectable, Logger } from '@nestjs/common';

export type RbacRole =
  | 'VIEWER'
  | 'CREATOR'
  | 'MODERATOR'
  | 'COMPLIANCE'
  | 'ADMIN';

// Numeric rank — higher rank satisfies lower rank requirements
const ROLE_RANK: Record<RbacRole, number> = {
  VIEWER:     1,
  CREATOR:    2,
  MODERATOR:  3,
  COMPLIANCE: 4,
  ADMIN:      5,
};

// Explicit permission matrix — each permission lists the minimum role required
// Source: Canonical Corpus v10, Appendix E
const PERMISSION_MATRIX: Record<string, RbacRole> = {
  // Viewer-level
  'content:view':              'VIEWER',
  'token:purchase':            'VIEWER',

  // Creator-level
  'broadcast:start':           'CREATOR',
  'broadcast:stop':            'CREATOR',
  'rate_card:configure':       'CREATOR',
  'earnings:view':             'CREATOR',

  // Moderator-level
  'content:flag':              'MODERATOR',
  'stream:suspend':            'MODERATOR',
  'severity:assign':           'MODERATOR',

  // Compliance-level
  'suspension:override':       'COMPLIANCE',
  'ncii:suppress':             'COMPLIANCE',
  'legal_hold:trigger':        'COMPLIANCE',
  'refund:override':           'COMPLIANCE',

  // Admin-level
  'role:manage':               'ADMIN',
  'audit_log:view':            'ADMIN',
  'worm:export':               'ADMIN',
  'geo_block:modify':          'ADMIN',
};

export interface RbacCheckResult {
  permitted: boolean;
  actor_id: string;
  actor_role: RbacRole;
  permission: string;
  required_role: RbacRole;
  failure_reason: string | null;
  rule_applied_id: string;
}

@Injectable()
export class RbacGuard {
  private readonly logger = new Logger(RbacGuard.name);
  private readonly RULE_ID = 'RBAC_GUARD_v1';

  /**
   * Checks whether an actor with the given role has the given permission.
   * Returns a structured result — caller decides how to handle denial.
   * No silent pass. Every check is logged.
   */
  check(params: {
    actor_id: string;
    actor_role: RbacRole;
    permission: string;
  }): RbacCheckResult {
    const required_role = PERMISSION_MATRIX[params.permission];

    if (!required_role) {
      this.logger.error('RbacGuard: unknown permission requested', {
        actor_id: params.actor_id,
        permission: params.permission,
        rule_applied_id: this.RULE_ID,
      });
      return {
        permitted: false,
        actor_id: params.actor_id,
        actor_role: params.actor_role,
        permission: params.permission,
        required_role: 'ADMIN', // fail-closed: unknown permission requires max role
        failure_reason: 'UNKNOWN_PERMISSION',
        rule_applied_id: this.RULE_ID,
      };
    }

    const actorRank = ROLE_RANK[params.actor_role];
    const requiredRank = ROLE_RANK[required_role];
    const permitted = actorRank >= requiredRank;

    if (!permitted) {
      this.logger.warn('RbacGuard: permission denied', {
        actor_id: params.actor_id,
        actor_role: params.actor_role,
        permission: params.permission,
        required_role,
        rule_applied_id: this.RULE_ID,
      });
    } else {
      this.logger.log('RbacGuard: permission granted', {
        actor_id: params.actor_id,
        actor_role: params.actor_role,
        permission: params.permission,
        rule_applied_id: this.RULE_ID,
      });
    }

    return {
      permitted,
      actor_id: params.actor_id,
      actor_role: params.actor_role,
      permission: params.permission,
      required_role,
      failure_reason: permitted ? null : 'INSUFFICIENT_ROLE',
      rule_applied_id: this.RULE_ID,
    };
  }

  /**
   * Returns all permissions available to the given role.
   * Used for UI capability negotiation — not for enforcement decisions.
   */
  getPermissionsForRole(role: RbacRole): string[] {
    const rank = ROLE_RANK[role];
    return Object.entries(PERMISSION_MATRIX)
      .filter(([, required]) => rank >= ROLE_RANK[required])
      .map(([permission]) => permission);
  }
}
```

**Task 2: Add `RbacGuard` to `AuthModule` providers and exports.**

**Validation:**

- `check()` returns `permitted: true` for ADMIN on any permission
- `check()` returns `permitted: false` for VIEWER on `'refund:override'`
- `check()` returns `permitted: false` for CREATOR on `'ncii:suppress'`
- `check()` returns `permitted: false` for unknown permission (fail-closed)
- `getPermissionsForRole('VIEWER')` returns only viewer-level permissions
- `getPermissionsForRole('ADMIN')` returns all permissions
- `npx tsc --noEmit` zero new errors

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/AUTH-002-RBAC-GUARD.md`

-----

## TIER 6B — PERFORMER KYC + PUBLISH GATE

Do not start until AUTH-001 is merged.

-----

### DIRECTIVE: KYC-001

**Status:** `[ ] TODO`
**Commit prefix:** `KYC:`
**Target path:** `services/core-api/src/safety/publish-gate.service.ts` (CREATE)
**Risk class:** R0

**Context:** The Canonical Corpus (Chapter 10, §2.2) defines the L0 ship gate requirement:
“Performer KYC + 18+ at recorded_at enforcement live.” The 18+ gate is deterministic:
it calculates whether the performer was 18 years or older at the `recorded_at` timestamp
of the content — not whether they are currently verified. If the gate fails, the system
must block publication and generate a SEV1 incident. No exceptions. No manual override
except via `COMPLIANCE` role with step-up.

**Task 1: Create `services/core-api/src/safety/publish-gate.service.ts`**

```typescript
// services/core-api/src/safety/publish-gate.service.ts
// KYC: KYC-001 — Deterministic 18+ publish gate
// Canonical Corpus v10, Chapter 10 §2.2 + Chapter 9 §3.1
// Gate: performer must be >= 18 years old at content recorded_at timestamp.
// Failure: blocks publication, generates SEV1 incident via NATS.
// Override: COMPLIANCE role + step-up only (not implemented here — advisory boundary).
import { Injectable, Logger } from '@nestjs/common';
import { NatsService } from '../nats/nats.service';
import { NATS_TOPICS } from '../../../nats/topics.registry';

export type PublishGateOutcome = 'APPROVED' | 'BLOCKED_AGE_GATE' | 'BLOCKED_KYC_PENDING' | 'BLOCKED_KYC_EXPIRED';

export interface PublishGateResult {
  content_id: string;
  performer_id: string;
  outcome: PublishGateOutcome;
  performer_age_at_recording: number | null;
  gate_passed: boolean;
  blocked_reason: string | null;
  evaluated_at_utc: string;
  rule_applied_id: string;
}

// Minimum age in years — deterministic constant, never hardcoded in callers
const MINIMUM_AGE_YEARS = 18;

@Injectable()
export class PublishGateService {
  private readonly logger = new Logger(PublishGateService.name);
  private readonly RULE_ID = 'PUBLISH_GATE_v1';

  constructor(private readonly nats: NatsService) {}

  /**
   * Calculates the performer's age in completed years at a given reference date.
   * Pure function — no side effects.
   */
  calculateAgeAtDate(dob: Date, reference_date: Date): number {
    let age = reference_date.getFullYear() - dob.getFullYear();
    const monthDiff = reference_date.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && reference_date.getDate() < dob.getDate())) {
      age -= 1;
    }
    return age;
  }

  /**
   * Evaluates whether content may be published.
   * Checks KYC status and 18+ at recorded_at.
   * Publishes SEV1 to NATS on any block.
   * Caller must not publish if gate_passed is false.
   */
  evaluatePublishGate(params: {
    content_id: string;
    performer_id: string;
    performer_dob: Date;
    kyc_status: 'VERIFIED' | 'PENDING' | 'EXPIRED' | 'REJECTED';
    kyc_expiry_date: Date | null;
    recorded_at: Date;
  }): PublishGateResult {
    const evaluated_at_utc = new Date().toISOString();

    // Block 1: KYC must be VERIFIED
    if (params.kyc_status !== 'VERIFIED') {
      const outcome: PublishGateOutcome = params.kyc_status === 'EXPIRED'
        ? 'BLOCKED_KYC_EXPIRED'
        : 'BLOCKED_KYC_PENDING';

      this.logger.warn('PublishGateService: blocked — KYC not verified', {
        content_id: params.content_id,
        performer_id: params.performer_id,
        kyc_status: params.kyc_status,
        rule_applied_id: this.RULE_ID,
      });

      this.nats.publish(NATS_TOPICS.PUBLISH_GATE_BLOCKED, {
        content_id: params.content_id,
        performer_id: params.performer_id,
        outcome,
        blocked_reason: `KYC_STATUS_${params.kyc_status}`,
        severity: 'SEV1',
        evaluated_at_utc,
        rule_applied_id: this.RULE_ID,
      });

      return {
        content_id: params.content_id,
        performer_id: params.performer_id,
        outcome,
        performer_age_at_recording: null,
        gate_passed: false,
        blocked_reason: `KYC_STATUS_${params.kyc_status}`,
        evaluated_at_utc,
        rule_applied_id: this.RULE_ID,
      };
    }

    // Block 2: KYC must not be expired relative to recorded_at
    if (params.kyc_expiry_date && params.recorded_at > params.kyc_expiry_date) {
      this.logger.warn('PublishGateService: blocked — KYC expired at recording time', {
        content_id: params.content_id,
        performer_id: params.performer_id,
        kyc_expiry_date: params.kyc_expiry_date.toISOString(),
        recorded_at: params.recorded_at.toISOString(),
        rule_applied_id: this.RULE_ID,
      });

      this.nats.publish(NATS_TOPICS.PUBLISH_GATE_BLOCKED, {
        content_id: params.content_id,
        performer_id: params.performer_id,
        outcome: 'BLOCKED_KYC_EXPIRED',
        blocked_reason: 'KYC_EXPIRED_AT_RECORDING_TIME',
        severity: 'SEV1',
        evaluated_at_utc,
        rule_applied_id: this.RULE_ID,
      });

      return {
        content_id: params.content_id,
        performer_id: params.performer_id,
        outcome: 'BLOCKED_KYC_EXPIRED',
        performer_age_at_recording: null,
        gate_passed: false,
        blocked_reason: 'KYC_EXPIRED_AT_RECORDING_TIME',
        evaluated_at_utc,
        rule_applied_id: this.RULE_ID,
      };
    }

    // Block 3: Performer must be >= 18 at recorded_at (not at publish time)
    const age_at_recording = this.calculateAgeAtDate(params.performer_dob, params.recorded_at);

    if (age_at_recording < MINIMUM_AGE_YEARS) {
      this.logger.error('PublishGateService: SEV1 — performer under 18 at recording time', {
        content_id: params.content_id,
        performer_id: params.performer_id,
        age_at_recording,
        recorded_at: params.recorded_at.toISOString(),
        rule_applied_id: this.RULE_ID,
      });

      this.nats.publish(NATS_TOPICS.PUBLISH_GATE_BLOCKED, {
        content_id: params.content_id,
        performer_id: params.performer_id,
        outcome: 'BLOCKED_AGE_GATE',
        blocked_reason: `AGE_AT_RECORDING_${age_at_recording}_BELOW_MINIMUM_${MINIMUM_AGE_YEARS}`,
        severity: 'SEV1',
        age_at_recording,
        evaluated_at_utc,
        rule_applied_id: this.RULE_ID,
      });

      return {
        content_id: params.content_id,
        performer_id: params.performer_id,
        outcome: 'BLOCKED_AGE_GATE',
        performer_age_at_recording: age_at_recording,
        gate_passed: false,
        blocked_reason: `AGE_AT_RECORDING_${age_at_recording}_BELOW_MINIMUM_${MINIMUM_AGE_YEARS}`,
        evaluated_at_utc,
        rule_applied_id: this.RULE_ID,
      };
    }

    // Gate passed
    this.logger.log('PublishGateService: approved', {
      content_id: params.content_id,
      performer_id: params.performer_id,
      age_at_recording,
      rule_applied_id: this.RULE_ID,
    });

    this.nats.publish(NATS_TOPICS.PUBLISH_GATE_APPROVED, {
      content_id: params.content_id,
      performer_id: params.performer_id,
      age_at_recording,
      evaluated_at_utc,
      rule_applied_id: this.RULE_ID,
    });

    return {
      content_id: params.content_id,
      performer_id: params.performer_id,
      outcome: 'APPROVED',
      performer_age_at_recording: age_at_recording,
      gate_passed: true,
      blocked_reason: null,
      evaluated_at_utc,
      rule_applied_id: this.RULE_ID,
    };
  }
}
```

**Task 2: Add `PublishGateService` to `SafetyModule` providers and exports.**

**Task 3: Add NATS topics to `services/nats/topics.registry.ts` if not present:**

```typescript
PUBLISH_GATE_APPROVED: 'kyc.publish_gate.approved',
PUBLISH_GATE_BLOCKED:  'kyc.publish_gate.blocked',
```

**Validation:**

- `calculateAgeAtDate(dob_17_years_364_days_ago, today)` returns `17`
- `calculateAgeAtDate(dob_18_years_ago, today)` returns `18`
- `evaluatePublishGate()` returns `BLOCKED_KYC_PENDING` when `kyc_status === 'PENDING'`
- `evaluatePublishGate()` returns `BLOCKED_KYC_EXPIRED` when `kyc_status === 'EXPIRED'`
- `evaluatePublishGate()` returns `BLOCKED_AGE_GATE` when performer was 17 at `recorded_at`
- `evaluatePublishGate()` returns `APPROVED` when performer was 18 at `recorded_at` and KYC is `VERIFIED`
- SEV1 NATS event published on every block
- `npx tsc --noEmit` zero new errors

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/KYC-001-PUBLISH-GATE-SERVICE.md`

-----

## TIER 6C — MODERATION + INCIDENT LIFECYCLE

Do not start until KYC-001 is merged.

-----

### DIRECTIVE: MOD-001

**Status:** `[ ] TODO`
**Commit prefix:** `MOD:`
**Target path:** `services/core-api/src/safety/incident.service.ts` (CREATE)
**Risk class:** R1

**Context:** The Canonical Corpus (Chapter 7, §6.1) defines the incident lifecycle:
`OPEN → UNDER_REVIEW → ACTIONED → CLOSED`. Every transition must be logged with
severity (SEV1/SEV2/SEV3), assigned role, reason code, and evidence hash.
No silent transitions. No informal resolution.

**Task 1: Create `services/core-api/src/safety/incident.service.ts`**

```typescript
// services/core-api/src/safety/incident.service.ts
// MOD: MOD-001 — Incident lifecycle state machine
// Canonical Corpus v10, Chapter 7 §6 + Appendix B + Appendix G
// Lifecycle: OPEN → UNDER_REVIEW → ACTIONED → CLOSED
// All transitions logged. No silent state changes.
// TAKE IT DOWN Act (effective May 2026): NCII incidents require 48-hour SLA enforcement.
import { Injectable, Logger } from '@nestjs/common';
import { NatsService } from '../nats/nats.service';
import { NATS_TOPICS } from '../../../nats/topics.registry';

export type IncidentStatus = 'OPEN' | 'UNDER_REVIEW' | 'ACTIONED' | 'CLOSED';
export type IncidentSeverity = 'SEV1' | 'SEV2' | 'SEV3';
export type IncidentAssignedRole = 'MODERATOR' | 'COMPLIANCE' | 'ADMIN';
export type IncidentCategory =
  | 'NCII'          // Non-consensual intimate imagery — 48h SLA (TAKE IT DOWN Act)
  | 'CSAM'          // Child sexual abuse material — immediate SEV1
  | 'HATE_SPEECH'
  | 'VIOLENCE'
  | 'FRAUD'
  | 'OPERATIONAL'
  | 'OTHER';

// SLA window in milliseconds for categories requiring timed removal
const SLA_WINDOWS_MS: Partial<Record<IncidentCategory, number>> = {
  NCII: 48 * 60 * 60 * 1000,   // 48 hours — TAKE IT DOWN Act, FTC enforced, effective May 2026
  CSAM: 0,                      // Immediate — no window, block on creation
};

export interface Incident {
  incident_id: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  incident_category: IncidentCategory;
  assigned_role: IncidentAssignedRole;
  actor_id: string;
  content_id: string | null;
  evidence_hash: string | null;
  reason_code: string;
  resolution_summary: string | null;
  sla_deadline_utc: string | null;  // null for non-SLA categories; set at creation for NCII/CSAM
  created_at_utc: string;
  updated_at_utc: string;
  closed_at_utc: string | null;
  rule_applied_id: string;
}

// Valid lifecycle transitions — enforced as allow-list
const VALID_TRANSITIONS: Record<IncidentStatus, IncidentStatus[]> = {
  OPEN:         ['UNDER_REVIEW'],
  UNDER_REVIEW: ['ACTIONED'],
  ACTIONED:     ['CLOSED'],
  CLOSED:       [],
};

// Minimum role required to transition by severity
const SEVERITY_ROLE_REQUIREMENT: Record<IncidentSeverity, IncidentAssignedRole> = {
  SEV1: 'COMPLIANCE',
  SEV2: 'MODERATOR',
  SEV3: 'MODERATOR',
};

@Injectable()
export class IncidentService {
  private readonly logger = new Logger(IncidentService.name);
  private readonly RULE_ID = 'INCIDENT_LIFECYCLE_v1';

  constructor(private readonly nats: NatsService) {}

  /**
   * Transitions an incident to a new status.
   * Validates transition is permitted.
   * Requires reason_code on every transition.
   * Publishes NATS event for every transition.
   * Throws on invalid transition — no silent state corruption.
   */
  transition(
    incident: Incident,
    to: IncidentStatus,
    params: {
      actor_id: string;
      reason_code: string;
      resolution_summary?: string;
      evidence_hash?: string;
    },
  ): Incident {
    const allowed = VALID_TRANSITIONS[incident.status];
    if (!allowed.includes(to)) {
      const msg =
        `INVALID_TRANSITION: ${incident.status} → ${to} is not permitted ` +
        `for incident ${incident.incident_id}. Allowed: [${allowed.join(', ')}]`;
      this.logger.error(msg, undefined, { incident_id: incident.incident_id });
      throw new Error(msg);
    }

    const now = new Date().toISOString();
    const updated: Incident = {
      ...incident,
      status: to,
      actor_id: params.actor_id,
      reason_code: params.reason_code,
      resolution_summary: params.resolution_summary ?? incident.resolution_summary,
      evidence_hash: params.evidence_hash ?? incident.evidence_hash,
      updated_at_utc: now,
      closed_at_utc: to === 'CLOSED' ? now : incident.closed_at_utc,
    };

    this.logger.log('IncidentService: status transition', {
      incident_id: incident.incident_id,
      from: incident.status,
      to,
      severity: incident.severity,
      actor_id: params.actor_id,
      reason_code: params.reason_code,
      rule_applied_id: this.RULE_ID,
    });

    this.nats.publish(NATS_TOPICS.INCIDENT_TRANSITION, {
      incident_id: incident.incident_id,
      from: incident.status,
      to,
      severity: incident.severity,
      actor_id: params.actor_id,
      reason_code: params.reason_code,
      updated_at_utc: now,
      rule_applied_id: this.RULE_ID,
    });

    return updated;
  }

  /**
   * Returns the minimum role required to act on an incident of given severity.
   * Used for RBAC pre-check before transition — caller enforces.
   */
  getRequiredRole(severity: IncidentSeverity): IncidentAssignedRole {
    return SEVERITY_ROLE_REQUIREMENT[severity];
  }

  /**
   * Computes the SLA deadline UTC string for a given category at creation time.
   * Returns null for categories without a mandatory SLA window.
   * NCII: 48h (TAKE IT DOWN Act, FTC enforced, effective May 2026)
   * CSAM: immediate (SLA window = 0 — block must occur at creation)
   */
  computeSlaDeadline(category: IncidentCategory, created_at_utc: string): string | null {
    const windowMs = SLA_WINDOWS_MS[category];
    if (windowMs === undefined) return null;
    const deadline = new Date(new Date(created_at_utc).getTime() + windowMs);
    return deadline.toISOString();
  }

  /**
   * Returns true if an incident has breached its SLA window without being closed.
   * Advisory only — caller must execute removal or escalation.
   * TAKE IT DOWN Act compliance hook for NCII category.
   */
  isSlaBreach(incident: Incident): boolean {
    if (!incident.sla_deadline_utc) return false;
    if (incident.status === 'CLOSED') return false;
    return new Date() > new Date(incident.sla_deadline_utc);
  }
}
```

**Task 2: Add `IncidentService` to `SafetyModule` providers and exports.**

**Task 3: Add NATS topic to `services/nats/topics.registry.ts` if not present:**

```typescript
INCIDENT_TRANSITION: 'moderation.incident.transition',
```

**Validation:**

- `transition()` throws on `OPEN → ACTIONED` (invalid — must go through UNDER_REVIEW)
- `transition()` throws on `CLOSED → OPEN` (terminal state)
- `transition()` succeeds `OPEN → UNDER_REVIEW` with reason code
- `transition()` stamps `closed_at_utc` when transitioning to `CLOSED`
- `getRequiredRole('SEV1')` returns `'COMPLIANCE'`
- `getRequiredRole('SEV2')` returns `'MODERATOR'`
- `computeSlaDeadline('NCII', now)` returns a timestamp 48 hours in the future
- `computeSlaDeadline('FRAUD', now)` returns `null`
- `isSlaBreach()` returns `false` when `sla_deadline_utc` is null
- `isSlaBreach()` returns `false` when incident is `CLOSED`
- `isSlaBreach()` returns `true` when deadline has passed and status is not `CLOSED`
- NATS published on every valid transition
- `npx tsc --noEmit` zero new errors

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/MOD-001-INCIDENT-SERVICE.md`

-----

## TIER 6D — AUDIT CHAIN INTEGRITY

Do not start until MOD-001 is merged.
These two directives may run in parallel with each other.

-----

### DIRECTIVE: AUDIT-001

**Status:** `[ ] TODO`
**Commit prefix:** `AUDIT:`
**Target path:** `services/core-api/src/compliance/audit-chain.service.ts` (CREATE)
**Risk class:** R0

**Context:** The Canonical Corpus (Chapter 7, §5 + Appendix D) defines the hash-chained
audit event model. Each event is hash-linked to the prior event block:
`E(n) → HASH(E(n-1) + E(n))`. The integrity verification tool must confirm
replay-to-commit consistency. This service computes and verifies the hash chain.
SHA-256 is the required algorithm (per `WormExportService` precedent).

**Task:** Create `services/core-api/src/compliance/audit-chain.service.ts`

The service must implement:

- `computeEventHash(prior_hash: string, event_payload: object): string` — SHA-256 of `prior_hash + JSON.stringify(event_payload)`
- `verifyChain(events: AuditChainEvent[]): AuditChainVerificationResult` — replays the chain and confirms each stored hash matches computed hash
- `GENESIS_HASH` constant — `'0'.repeat(64)` — used as prior hash for the first event
- All operations use Node.js `crypto.createHash('sha256')` — no external libraries
- Logger instance present
- NATS publish on chain integrity failure (`AUDIT_CHAIN_INTEGRITY_FAILURE` topic)

```typescript
export interface AuditChainEvent {
  event_id: string;
  prior_hash: string;
  stored_hash: string;
  payload: object;
  created_at_utc: string;
}

export interface AuditChainVerificationResult {
  valid: boolean;
  events_verified: number;
  first_failure_event_id: string | null;
  failure_reason: string | null;
  verified_at_utc: string;
  rule_applied_id: string;
}
```

**Add `AuditChainService` to `ComplianceModule` providers and exports.**

**Add NATS topic if not present:**

```typescript
AUDIT_CHAIN_INTEGRITY_FAILURE: 'audit.chain.integrity_failure',
```

**Validation:**

- `computeEventHash('0'.repeat(64), { id: 'e1' })` produces a 64-character hex string
- `verifyChain([])` returns `valid: true`, `events_verified: 0`
- `verifyChain()` returns `valid: false` and identifies the first tampered event
- `verifyChain()` returns `valid: true` for a correctly chained sequence
- NATS published on integrity failure
- `npx tsc --noEmit` zero new errors

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/AUDIT-001-AUDIT-CHAIN-SERVICE.md`

-----

### DIRECTIVE: AUDIT-002

**Status:** `[ ] TODO`
**Commit prefix:** `AUDIT:`
**Target path:** `services/core-api/src/compliance/legal-hold.service.ts` (CREATE)
**Risk class:** R0

**Context:** The Canonical Corpus (Chapter 7, §13.2) mandates a legal hold mechanism
that overrides retention deletion and is reversible only by an authorized role.
Legal hold is an L0 ship-gate requirement. Hold actions must be logged and audit-trailed.

**Task:** Create `services/core-api/src/compliance/legal-hold.service.ts`

The service must implement:

- `applyHold(params)` — marks a subject (by `subject_id` + `subject_type`) as held; publishes NATS; returns `LegalHold` record
- `liftHold(params)` — requires `COMPLIANCE` role assertion from caller; logs lift; publishes NATS
- `isHeld(subject_id: string, subject_type: string): boolean` — returns hold status (in-memory for now; DB migration in v5)
- `HoldSubjectType` enum: `'USER' | 'CONTENT' | 'TRANSACTION' | 'INCIDENT'`
- Logger instance present
- Advisory comment: `// TODO: LEGAL-HOLD-DB — migrate to DB-backed store before go-live`

```typescript
export interface LegalHold {
  hold_id: string;
  subject_id: string;
  subject_type: HoldSubjectType;
  applied_by: string;
  applied_at_utc: string;
  lifted_by: string | null;
  lifted_at_utc: string | null;
  reason_code: string;
  rule_applied_id: string;
}
```

**Add `LegalHoldService` to `ComplianceModule` providers and exports.**

**Add NATS topics if not present:**

```typescript
LEGAL_HOLD_APPLIED: 'compliance.legal_hold.applied',
LEGAL_HOLD_LIFTED:  'compliance.legal_hold.lifted',
```

**Validation:**

- `applyHold()` returns a `LegalHold` with `lifted_by: null`
- `isHeld()` returns `true` after `applyHold()`
- `liftHold()` updates the in-memory hold record with `lifted_by` and `lifted_at_utc`
- `isHeld()` returns `false` after `liftHold()`
- NATS published on apply and lift
- `npx tsc --noEmit` zero new errors

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/AUDIT-002-LEGAL-HOLD-SERVICE.md`

-----

## TIER 6E — LEDGER RECONCILIATION

Run after AUDIT-001 and AUDIT-002 are merged. This is the final L0 gate directive.

-----

### DIRECTIVE: INFRA-004

**Status:** `[ ] TODO`
**Commit prefix:** `INFRA:`
**Target path:** `services/core-api/src/compliance/reconciliation.service.ts` (CREATE)
**Risk class:** R0

**Context:** The Canonical Corpus (Chapter 10, §2.2 + Appendix F) lists
“Wallet reconciliation confirmed” as an L0 ship-gate requirement.
The reconciliation service must detect drift between computed wallet balances
(derived from ledger replay) and stored wallet states, escalate on mismatch,
and produce a reconciliation report. It does not correct drift — it detects and alerts.
Correction requires human authorization.

**Task:** Create `services/core-api/src/compliance/reconciliation.service.ts`

The service must implement:

- `computeBalanceFromLedger(entries: LedgerReplayEntry[]): WalletBalance` — replays ledger entries to derive the three-bucket balance
- `detectDrift(computed: WalletBalance, stored: WalletBalance): ReconciliationResult` — compares buckets; flags any discrepancy > 0 cents as drift
- `buildReport(params)` — produces a `ReconciliationReport` with timestamp, user scope, drift detected flag, and per-bucket breakdown
- NATS publish on drift detected (`RECONCILIATION_DRIFT_DETECTED` topic)
- Advisory: drift detection only — no correction logic permitted in this service

```typescript
export interface WalletBalance {
  user_id: string;
  promotional_bonus_cents: bigint;
  membership_allocation_cents: bigint;
  purchased_tokens_cents: bigint;
  computed_at_utc: string;
}

export interface LedgerReplayEntry {
  entry_type: string;         // 'CREDIT' | 'DEBIT' | 'REVERSAL'
  bucket: 'PROMOTIONAL' | 'MEMBERSHIP' | 'PURCHASED';
  amount_cents: bigint;
}

export interface ReconciliationResult {
  drift_detected: boolean;
  drift_by_bucket: {
    promotional_bonus_cents: bigint;
    membership_allocation_cents: bigint;
    purchased_tokens_cents: bigint;
  };
  rule_applied_id: string;
}

export interface ReconciliationReport {
  report_id: string;
  user_id: string;
  drift_detected: boolean;
  computed_balance: WalletBalance;
  stored_balance: WalletBalance;
  drift_by_bucket: ReconciliationResult['drift_by_bucket'];
  generated_at_utc: string;
  rule_applied_id: string;
}
```

**Add `ReconciliationService` to `ComplianceModule` providers and exports.**

**Add NATS topic if not present:**

```typescript
RECONCILIATION_DRIFT_DETECTED: 'compliance.reconciliation.drift_detected',
```

**Validation:**

- `computeBalanceFromLedger([])` returns all-zero balances
- `computeBalanceFromLedger()` correctly accumulates CREDIT and DEBIT entries per bucket
- `detectDrift()` returns `drift_detected: false` when balances match exactly
- `detectDrift()` returns `drift_detected: true` when any bucket differs by > 0
- NATS published when drift detected
- No correction logic present in the service
- `npx tsc --noEmit` zero new errors

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/INFRA-004-RECONCILIATION-SERVICE.md`

-----

## RECOMMENDED EXECUTION ORDER

```
AUTH-001 ──┐
AUTH-002 ──┘  (parallel, both are auth foundation)
              │
           KYC-001   (publish gate — depends on SafetyModule pattern)
              │
    ┌─────────┼─────────┐
 MOD-001   AUDIT-001  AUDIT-002   (parallel after KYC-001)
              │
           INFRA-004   (reconciliation — L0 final gate)
```

-----

## L0 SHIP-GATE TRACKER

|Requirement (Canonical Corpus v10, Appendix F)|Directive                                              |Status|
|----------------------------------------------|-------------------------------------------------------|------|
|Viewer Age Assurance                          |*(existing SovereignCaCMiddleware — GOV-004)*          |✅     |
|Performer KYC + 18+ gate                      |KYC-001                                                |`[ ]` |
|Consent & NCII workflow                       |*(existing ProvisionalSuppressionService — PRISMA-002)*|✅     |
|Moderation + kill switch                      |MOD-001                                                |`[ ]` |
|Audit chain + WORM export                     |AUDIT-001 + *(existing WormExportService — GOV-002)*   |`[ ]` |
|RBAC + step-up enforced                       |AUTH-001 + AUTH-002                                    |`[ ]` |
|Wallet & token integrity                      |INFRA-004                                              |`[ ]` |
|Processor webhook validation                  |*(existing LedgerService — FIZ-003)*                   |✅     |
|Incident lifecycle active                     |MOD-001                                                |`[ ]` |
|Legal hold mechanism                          |AUDIT-002                                              |`[ ]` |
|Reconciliation tests passed                   |INFRA-004                                              |`[ ]` |

-----

## STANDING INVARIANTS (unchanged from v1–v3)

1. No UPDATE or DELETE on ledger, audit, game, call session, voucher tables.
1. All FIZ commits require four-line format.
1. No hardcoded constants — always read from `governance.config.ts`.
1. `crypto.randomInt()` only. `Math.random()` prohibited.
1. No `@angular/core` imports anywhere.
1. `npx tsc --noEmit` zero code-level errors before commit.
1. Every service has a `Logger` instance.
1. Report-back mandatory before directive marked DONE.
1. NATS topics only from `topics.registry.ts` — no string literals.
1. AI services are advisory only — no financial or enforcement execution.
1. Step-up authentication required before any sensitive action execution.
1. RBAC check required before step-up — fail-closed on unknown permission.

-----

*End of CLAUDE_CODE_BACKLOG_v4.md — Version 4.0*
*Next version issued after Tier 6 completion.*
*All changes require human authorization from Kevin B. Hartley / Program Control.*
