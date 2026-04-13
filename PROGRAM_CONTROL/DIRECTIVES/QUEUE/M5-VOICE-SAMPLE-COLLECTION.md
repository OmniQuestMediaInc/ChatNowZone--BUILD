# DIRECTIVE: M5 -- Voice Sample Collection Service
# DFSP Engineering Spec v1.0, Module 5
# Status: QUEUED
# Agent: Claude Code
# Mode: DROID
# FIZ: YES -- four-line commit format required
# Risk class: R0
# Date: 2026-04-12
# Gate: None -- zero external dependencies

---

## Objective

Implement DFS Module 5 -- VoiceSampleCollectionService.
Schema exists (VoiceSample -- PV-001). No migrations required.
Service collects, validates format compliance, enforces consent gate,
stores encrypted path reference, and emits NATS events.

---

## Pre-flight Checklist

- [ ] Read `.github/copilot-instructions.md`
- [ ] Read `OQMI_SYSTEM_STATE.md`
- [ ] Confirm VoiceSample model exists in prisma/schema.prisma
- [ ] Confirm GovernanceConfig in services/core-api/src/governance/governance.config.ts
- [ ] Check services/nats/topics.registry.ts for existing VOICE_SAMPLE topics

---

## Scope

Files to Create:
- services/core-api/src/dfsp/voice-sample.service.ts

Files to Modify:
- services/core-api/src/dfsp/dfsp.module.ts -- import + register VoiceSampleService
- services/nats/topics.registry.ts -- add VOICE_SAMPLE topics if absent
- services/core-api/src/governance/governance.config.ts -- add VOICE_SAMPLE block if absent

Files to Confirm Unchanged:
- prisma/schema.prisma -- NO changes. VoiceSample model from PV-001.

---

## VoiceSample Prisma Model (READ ONLY -- confirmed PV-001)

Fields: id, account_id, session_id, file_path, file_format, sample_rate_hz,
bit_depth, duration_seconds, consent_confirmed, consent_confirmed_at,
collected_at, encryption_key_ref, status, organization_id, tenant_id

---

## GovernanceConfig Constants Required

Add to services/core-api/src/governance/governance.config.ts if absent:

export const VOICE_SAMPLE = {
  ACCEPTED_FORMATS: ['WAV', 'FLAC'] as const,
  REQUIRED_SAMPLE_RATE_HZ: 16000,
  REQUIRED_BIT_DEPTH: 16,
  MIN_DURATION_SECONDS: 3,
  MAX_DURATION_SECONDS: 30,
  ENCRYPTION_PROVIDER: 'AWS_SSE_S3',
  STORAGE_PATH_PREFIX: 'voice-samples/',
} as const;

---

## NATS Topics Required

Add to services/nats/topics.registry.ts if absent:
VOICE_SAMPLE_COLLECTED: 'dfsp.voice_sample.collected'
VOICE_SAMPLE_CONSENT_MISSING: 'dfsp.voice_sample.consent_missing'
VOICE_SAMPLE_FORMAT_REJECTED: 'dfsp.voice_sample.format_rejected'

---

## Implementation Requirements: voice-sample.service.ts

RULE_ID: 'VOICE_SAMPLE_v1'

collectSample() method:
1. Gate 1: Consent mandatory -- reject if consent_confirmed = false
2. Gate 2: Format must be WAV or FLAC only
3. Gate 3: sample_rate_hz must equal 16000 (16kHz)
4. Gate 4: bit_depth must equal 16
5. Gate 5: duration_seconds between MIN (3) and MAX (30)
6. Supersede any prior ACTIVE sample for this account (updateMany -- documented M5 exception)
7. Create new VoiceSample record with status: ACTIVE
8. Emit VOICE_SAMPLE_COLLECTED via NATS
9. Return result with rule_applied_id

IMPORTANT: file_path stores the SSE-S3 object key ONLY.
Raw audio is NEVER stored in the database.
Caller uploads audio to S3 and passes the encrypted path key.

getActiveSample() method:
- Returns current ACTIVE sample for account or null

revokeSample() method:
- Marks ACTIVE samples as REVOKED via updateMany

Result codes: COLLECTED | CONSENT_MISSING | FORMAT_REJECTED |
SAMPLE_RATE_REJECTED | BIT_DEPTH_REJECTED | DURATION_REJECTED

---

## Invariant Checklist

- [ ] 1. updateMany on VoiceSample for SUPERSEDED/REVOKED is documented M5 exception
- [ ] 2. FIZ four-line commit format
- [ ] 3. No hardcoded constants -- all from VOICE_SAMPLE GovernanceConfig
- [ ] 5. No @angular/core imports
- [ ] 6. npx tsc --noEmit -- zero new errors
- [ ] 7. Logger instance present
- [ ] 8. Report-back filed before DONE
- [ ] 9. NATS_TOPICS constants only -- no string literals
- [ ] 12. RBAC check upstream -- documented in collectSample JSDoc
- [ ] 14. All timestamps America/Toronto
- [ ] 15. rule_applied_id: 'VOICE_SAMPLE_v1' on every output
- [ ] MT. organization_id + tenant_id on all Prisma writes
- [ ] Schema: No new models, no migrations

---

## Commit Format (FIZ -- four-line mandatory)

REASON: M5 -- Implement VoiceSampleCollectionService (DFSP Module 5);
16-bit/16kHz WAV/FLAC consent-gated voice sample collection with
encrypted path reference, format validation, and ACTIVE/SUPERSEDED lifecycle
IMPACT: One new DFSP service + dfsp.module.ts registration + VOICE_SAMPLE
GovernanceConfig block + 3 NATS topics; no schema changes; no migrations;
VoiceSample model confirmed from PV-001; no existing logic modified
CORRELATION_ID: M5-2026-04-12
GATE: NONE -- no external dependencies

---

## Report-Back Requirements

File to: PROGRAM_CONTROL/REPORT_BACK/M5-VOICE-SAMPLE-COLLECTION.md

Must include:
- Commit hash
- Files created/modified
- VOICE_SAMPLE GovernanceConfig block added (confirm)
- NATS topics added (list exact keys)
- VoiceSample schema confirmed from PV-001 -- no migrations
- updateMany SUPERSEDED write exception documented
- Encrypted path reference pattern confirmed -- no raw audio in DB
- All 11 invariants confirmed or flagged
- Multi-tenant confirmed
- npx tsc --noEmit result -- zero new errors
