# CLAUDE CODE BACKLOG v5 — ChatNow.Zone

**Authority:** OmniQuest Media Inc. | CEO Kevin B. Hartley
**Backlog Version:** 5.0
**Supersedes:** v4 (Tier 6 complete)
**Platform Time Standard:** America/Toronto
**Canonical Authority:** OQMI Coding Doctrine v2.0 · Canonical Corpus v10

---

## COMPLETED — TIERS 1–6

All Tier 1–6 directives complete. See CLAUDE_CODE_BACKLOG_v4.md.
L0 ship-gate: all requirements satisfied at Tier 6 close.

---

## HOW TO USE THIS FILE

Same rules as v1–v4. One directive per session unless told otherwise.
Read OQMI CODING DOCTRINE v2.0 and .github/copilot-instructions.md first.
Non-code governance directives (marked GOV:) require human legal review —
they are not Claude Code tasks.

---

## TIER 7A — CODE DIRECTIVES (Claude Code execution path)

Gate: All Tier 6 directives must be on main before starting.

---

### DIRECTIVE: LEGAL-HOLD-DB

**Status:** `[ ] TODO`
**Commit prefix:** `CHORE:`
**Target path:** `services/core-api/src/compliance/legal-hold.service.ts` (MODIFY)
**Risk class:** R1
**Gate:** AUDIT-002 on main.

**Context:**
LegalHoldService (AUDIT-002) uses an in-memory Map store. This is intentional
for the L0 gate but must be migrated to DB-backed storage before go-live.
The TODO: LEGAL-HOLD-DB advisory comment is already present in the file.

**Task:**
Migrate the in-memory `holds` Map in LegalHoldService to a Prisma-backed
`legal_holds` table. Schema changes required:

```prisma
model LegalHold {
  id             String   @id @default(uuid())
  hold_id        String   @unique
  subject_id     String
  subject_type   String
  applied_by     String
  applied_at_utc DateTime
  lifted_by      String?
  lifted_at_utc  DateTime?
  reason_code    String
  rule_applied_id String
  created_at     DateTime @default(now())
}
```

- `applyHold()` writes to DB via PrismaService
- `liftHold()` updates record via DB (UPDATE on lifted_by + lifted_at_utc only —
  this is the single permitted UPDATE on this table; all other fields are append-only)
- `isHeld()` queries DB for active hold (lifted_at_utc IS NULL)
- Remove the in-memory Map entirely
- Remove the TODO: LEGAL-HOLD-DB comment — replaced by implementation
- Logger instance retained

**Validation:**
- [ ] applyHold() persists to DB
- [ ] isHeld() queries DB, not memory
- [ ] liftHold() updates lifted_by + lifted_at_utc in DB
- [ ] isHeld() returns false after liftHold() across process restart
- [ ] npx tsc --noEmit zero new errors

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/LEGAL-HOLD-DB-MIGRATION.md`

---

### DIRECTIVE: CHORE-TS

**Status:** `[ ] TODO`
**Commit prefix:** `CHORE:`
**Target path:** Multiple (see below)
**Risk class:** R0
**Gate:** All Tier 6 directives on main.

**Context:**
13 pre-existing TypeScript errors confirmed before v4. Not introduced by any
v4 directive. Two categories:
- 6x snake_case Prisma accessor mismatches (ledger_entries, audit_events, etc.)
- 1x user_risk_profiles accessor mismatch
- 6x TypeORM getRepository(string) type mismatches

**Task:**
Resolve all 13 errors. Zero new errors permitted.
Run `npx tsc --noEmit` before and after — output must go from 13 errors to 0.

**Validation:**
- [ ] npx tsc --noEmit output: 0 errors
- [ ] No source logic changed — types and accessors only
- [ ] All Prisma accessors use camelCase (Prisma client convention)

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/CHORE-TS-CLEANUP.md`
Required: before/after tsc output, list of files modified.

---

### DIRECTIVE: GEO-001

**Status:** `[ ] TODO`
**Commit prefix:** `GEO:`
**Target path:** `services/core-api/src/compliance/geo-fencing.service.ts` (CREATE)
**Risk class:** R1
**Gate:** CHORE-TS complete.

**Context:**
SovereignCaCMiddleware (GOV-004) handles Bill S-210 + Bill 149 at national level.
Gap: no granular sub-national geo-fencing. Requirement: account-level jurisdiction
precision (e.g. Germany vs Switzerland — different regulatory regimes).
GeoPricingService (GOV-001) has country-tier resolution — extend, do not replace.

**Scope:**
- `GeoFencingService` with `jurisdiction_code` enum (ISO 3166-1 alpha-2 + alpha-3 sub-national)
- Per-account override capability for COMPLIANCE role (with step-up)
- Enforcement model: `BLOCK | REDIRECT | FEATURE_LIMIT` per jurisdiction rule
- NATS events on fence crossing
- Full audit trail on every enforcement decision
- `rule_applied_id` on every output object
- EU DSA per-member-state rules modeled as jurisdiction configs
- GDPR cross-border data flow enforcement hook (Germany strict, Switzerland non-EU)

**Validation:**
- [ ] BLOCK outcome fires NATS event with jurisdiction_code
- [ ] COMPLIANCE override requires step-up assertion from caller
- [ ] Every enforcement decision has rule_applied_id
- [ ] npx tsc --noEmit zero new errors

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/GEO-001-GEOFENCING-SERVICE.md`

---

### DIRECTIVE: AV-001

**Status:** `[ ] TODO`
**Commit prefix:** `AV:`
**Target path:** `services/core-api/src/safety/age-verification.service.ts` (CREATE)
**Risk class:** R1
**Gate:** GEO-001 complete. Requires legal sign-off before go-live (see GOV-AV below).

**Context:**
Tiered viewer age verification to control third-party AV vendor cost at scale.
Kevin's model:
- Under 30: third-party AV check (YOTI or equivalent) — full verification
- 30 and over: self-attestation with platform liability disclaimer
- Edge case: flag users aged 25–30 for manual review queue

**Critical constraints:**
- COPPA biometric restriction (effective April 22, 2026): no biometric data storage
- IPC Ontario: retain hash + outcome record only — raw image destruction required
- 18 U.S.C. § 2257: retain age verification records (hash + outcome sufficient)
- Resolution: VerificationOutcomeStore — hash + result + timestamp + method.
  Raw image purge trigger on successful hash seal. Never store raw to operational DB.
- This architecture requires legal sign-off (GOV-AV) before AV-001 goes to Claude Code.

**Scope:**
- `AgeVerificationService` with tiered routing logic
- `VerificationOutcomeStore` — stores hash + result + timestamp + method
- Raw image purge trigger (advisory hook — actual purge via vendor webhook)
- Manual review queue flag for 25–30 cohort
- Vendor abstraction interface (supports YOTI, Veriff, iDenfy, Au10tix)
- NATS event on verification outcome
- `rule_applied_id` on every output

**Validation:**
- [ ] Under-30 path routes to vendor interface
- [ ] 30+ path routes to self-attestation
- [ ] 25–30 cohort flagged for manual review queue
- [ ] VerificationOutcomeStore never holds raw image data
- [ ] Purge trigger fires on successful hash seal
- [ ] npx tsc --noEmit zero new errors

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/AV-001-AGE-VERIFICATION-SERVICE.md`

---

### DIRECTIVE: PV-001

**Status:** `[ ] TODO`
**Commit prefix:** `FIZ:`
**Target path:** `services/core-api/src/compliance/purchase-verification.service.ts` (CREATE)
**Risk class:** R0 (FIZ-prefix — four-line commit format required)
**Gate:** LEGAL-HOLD-DB + CHORE-TS complete. Kevin to brief full requirements.

**Context:**
Purchase verification hardening. Non-refundable acknowledgment already at UI level
(Canonical Corpus). Idempotency keys enforced (FIZ-003). Webhook signature validation
in place. Gap area: Diamond tier high-value transaction verification, funding hold
enforcement, and Digital High-Volume Liquidity Agreement signing workflow automation.

**Status:** AWAITING KEVIN BRIEF — full requirements to be provided before
this directive is expanded. Placeholder committed for queue visibility.

**Report-back file:** `PROGRAM_CONTROL/REPORT_BACK/PV-001-PURCHASE-VERIFICATION.md`

---

## TIER 7B — GOVERNANCE DIRECTIVES (Human legal review path — not Claude Code)

These directives require legal or compliance review by qualified counsel.
They are tracked here for visibility and sequencing.
Execution owner: Kevin B. Hartley + retained legal counsel.

---

### GOV-FINTRAC

**Status:** `[ ] TODO`
**Execution path:** Legal review
**Priority:** HIGH — 50 recent MSB revocations signal active FINTRAC enforcement.

**Scope:**
Confirm that the CNZ token economy does not classify OmniQuest Media Inc. as a
Money Services Business (MSB) under FINTRAC. Key question: do tokens constitute
a virtual currency under the PCMLTFA? The no-cash-out design is the primary
defence — requires formal legal opinion before processor go-live.

**Action:** Retain counsel. Obtain written opinion. File in INTEL folder.

---

### GOV-AGCO

**Status:** `[ ] TODO`
**Execution path:** Legal review

**Scope:**
Document formally that CNZ tokens have no cash-out value and cannot be redeemed
for cash or cash equivalents. Gambling-adjacent risk mitigation under AGCO.
Required before payment processor onboarding.

**Action:** Internal documentation + legal review. File in INTEL folder.

---

### GOV-QUEBEC-25

**Status:** `[ ] TODO`
**Execution path:** Legal review + technical implementation (if gaps identified)

**Scope:**
Privacy governance and data residency review under Quebec Law 25.
- Privacy Impact Assessment (PIA) required for new systems
- Data residency: confirm Canadian hosting for Quebec resident data
- Consent framework: Law 25 requires explicit, granular consent
- Breach notification: 72-hour window to Commission d'accès à l'information

**Action:** Legal review. Gap analysis. File in INTEL folder.
Any technical gaps surface as new code directives.

---

### GOV-PIPEDA

**Status:** `[ ] TODO`
**Execution path:** Legal review + policy update

**Scope:**
Privacy policy and consent framework update for PIPEDA compliance.
Coordinate with Quebec Law 25 review — overlap is significant.
CNZ Privacy Policy (existing HTML embed) may require revision.

**Action:** Legal review. Update privacy policy. File in INTEL folder.

---

### GOV-CRTC-C11

**Status:** `[ ] TODO`
**Execution path:** Monitoring + legal review at threshold

**Scope:**
Revenue threshold monitoring for CRTC Bill C-11 Online Streaming Act.
C$25M gross revenue trigger for contribution requirement.
Current stage: pre-revenue. Monitor quarterly.

**Action:** Set calendar reminder for quarterly revenue check.
Retain broadcast counsel when approaching C$5M range.

---

### GOV-S230

**Status:** `[ ] TODO`
**Execution path:** Long-horizon monitoring

**Scope:**
Section 230 sunset effective January 1, 2027. Legislative risk to platform
liability shield for user-generated content. CNZ operates under Canadian law
(CDSA) but US processor relationships create exposure.

**Action:** Monitor quarterly. Brief legal counsel at 6-month mark (July 2026).

---

## L0 SHIP-GATE — CONFIRMED CLOSED AT TIER 6

All L0 requirements satisfied. Platform cleared for processor onboarding (V6).

---

## STANDING INVARIANTS (unchanged from v1–v4)

1. No UPDATE or DELETE on ledger, audit, game, call session, voucher tables.
2. All FIZ commits require four-line format.
3. No hardcoded constants — always read from governance.config.ts.
4. crypto.randomInt() only. Math.random() prohibited.
5. No @angular/core imports anywhere.
6. npx tsc --noEmit zero code-level errors before commit.
7. Every service has a Logger instance.
8. Report-back mandatory before directive marked DONE.
9. NATS topics only from topics.registry.ts — no string literals.
10. AI services are advisory only — no financial or enforcement execution.
11. Step-up authentication required before any sensitive action execution.
12. RBAC check required before step-up — fail-closed on unknown permission.
13. SHA-256 for all hash operations.
14. All timestamps in America/Toronto.
15. rule_applied_id on every service output object.

---

*End of CLAUDE_CODE_BACKLOG_v5.md — Version 5.0*
*Next version issued after Tier 7 completion.*
*All changes require human authorization from Kevin B. Hartley / Program Control.*
