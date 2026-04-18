# THREAD 14 — SCHEMA INTEGRITY + QUEUE STATE AUDIT

**Directive:** AUDIT — MembershipTier Schema Integrity + QUEUE State Verification
**Authority:** Kevin B. Hartley, CEO — OmniQuest Media Inc.
**Date:** 2026-04-18
**Agent:** CLAUDE_CODE
**Mode:** READ-ONLY (no schema, queue, or PR mutations)
**Branch:** claude/audit-membership-queue-rJwlw
**origin/main HEAD:** e420458 (CHORE: update REPO_MANIFEST [skip ci])

---

## STEP 1 — Schema State

Source: `git show origin/main:prisma/schema.prisma` (1,181 lines).

**a. MembershipTier enum exists?** ✅ YES — declared at line 865 of prisma/schema.prisma on origin/main.

**b. Exact values (line 865–872):**

```prisma
enum MembershipTier {
  GUEST
  VIP
  VIP_SILVER
  VIP_GOLD
  VIP_PLATINUM
  VIP_DIAMOND
}
```

Match to canonical set: ✅ **EXACT MATCH.** Six values, in canonical order, no extras, no retired tokens.
Retired values present? ❌ NONE. DAY_PASS, ANNUAL (as tier), OMNIPASS_PLUS, standalone DIAMOND — all absent from the enum body.

**c. Enum absence check:** N/A — enum is present.

**d. Required models present on origin/main:**

| Model | Line | Present | Notes |
|---|---|---|---|
| `User` (stub) | 850 | ✅ | id, organization_id, tenant_id, created_at, updated_at; relations to Membership and CardOnFile |
| `Membership` | 919 | ✅ | tier, account_status, product_variant, paid_block_started_at/expires_at, guest_expires_at, guest_purge_at, org+tenant, indexes on tier/status/guest_expires_at/paid_block_expires_at |
| `MembershipTierTransition` | 946 | ✅ | previous_tier (nullable), new_tier, previous_status, new_status, trigger_type, actor_id, rule_applied_id, occurred_at |
| `AgeVerification` | 970 | ✅ | method, result, triggering_event, rule_applied_id, occurred_at |
| `CardOnFile` | 991 | ✅ | cardholder_name, billing_address, phone_number, email, card_expiration_{month,year}, card_cvv_hash, card_token, is_complete |
| `MembershipSubscription` | 1029 | ✅ | tier, status, billing_interval, commitment_months, bonus_months, period bounds, org+tenant |

**e. CardOnFile SHA-256 CVV hashing:** ✅ Present — line 1000 `card_cvv_hash String?  // SHA-256 hash only — never store raw CVV`. Field holds hash only; no raw-CVV column.

**f. Append-only nature of MembershipTierTransition and AgeVerification:**

- Neither model has an `@updatedAt` column (only `occurred_at` with `@default(now())`) — application-level append-only contract is preserved.
- Neither model has `onDelete: Cascade` on its relations — relation to `Membership` is default (no cascade clause), consistent with append-only ledger semantics.
- File header (line 15) declares the convention: "Append-only: no update/delete permitted (enforced by DB triggers)."
- **Caveat:** DB-level enforcement triggers for these two specific tables are NOT introduced by schema.prisma itself — they are expected to be installed via SQL migration (consistent with `infra/postgres/init-ledger.sql` convention). Migration is out of scope for MEMB-001 by the directive's own text.

---

## STEP 2 — PR #265 State

- **State:** `closed`, `merged: true`
- **Merged at:** 2026-04-17T15:50:15Z by `OmniQuestMediaInc`
- **Base SHA:** 716dc6f
- **Head SHA (branch tip):** c7c50cd (branch `claude/fiz-memb-001-membership-schema-foundation`)
- **Merge commit on main:** fc1dc38 ("Merge pull request #265 …")
- **Follow-up merged:** PR #266 (gap-fill) at merge commit 89acb32, HEAD commit 7221f86 — shipped `prisma/seed.test.ts` + corrected `prisma/seed.ts` per MEMB-001 §6.b–§6.d.
- **Reflected in main HEAD?** ✅ YES. Both #265 and #266 are ancestors of origin/main (e420458).

The task brief's premise — *"PR #265 OPEN and not yet merged"* — is **factually incorrect at time of audit**. PR #265 merged 2026-04-17 15:50 UTC; PR #266 (gap-fill) merged shortly thereafter.

---

## STEP 3 — PR #254 / #255 Diff Analysis

### Pre-PR-254 state (76fd094:prisma/schema.prisma, 961 lines)

The schema contained **TWO duplicate `MembershipTier` enum declarations**, both with **RETIRED** values:

Block A — line 849 (under header "// ─── Membership Subscriptions — MEMB-002 ──"):
```prisma
enum MembershipTier {
  DAY_PASS
  ANNUAL
  OMNIPASS_PLUS
  DIAMOND
}
```

Block B — line 918 (under header "// ─── Membership — MEMB-002: MembershipSubscription ──"):
```prisma
enum MembershipTier {
  DAY_PASS
  ANNUAL
  OMNIPASS_PLUS
  DIAMOND
}
```
accompanied by a duplicate `MembershipSubscription` model at line 939.

Neither duplicate matched the canonical 6-value set. The file would not compile as-is due to the duplicate enum declaration (Prisma rejects duplicate type names).

### PR #254 (merge 2d81e8c) — what actually changed

Diff against base 76fd094 (`git diff 76fd094 2d81e8c -- prisma/schema.prisma`):

```
prisma/schema.prisma | 46 --
```

- **Removed:** Block B (the second duplicate enum + duplicate `MembershipSubscription` + `MembershipStatus` + `MembershipBillingInterval`). 46-line deletion, zero insertions.
- **Retained:** Block A (still holding retired values).
- Branch head commit `17864eb` is the Copilot "Initial plan" commit — schema edit occurred in the merge itself (fast-forward of a collapsed Copilot change).

**Nature:** **DUPLICATE REMOVAL.** The removed block was a literal duplicate of the already-broken Block A. The canonical 6-value enum did NOT exist in the repo at this point, so PR #254 could not have wiped it.

### PR #255 (merge 996dba0) — what actually changed

Diff against 2d81e8c (`git diff 2d81e8c 996dba0 --stat`):

```
PROGRAM_CONTROL/REPO_MANIFEST.md | 6 +++---
```

- **Prisma schema:** UNCHANGED. PR #255 is a no-op on prisma/schema.prisma.
- Branch head commit `9ba7907` is another Copilot "Initial plan" placeholder.
- Only REPO_MANIFEST.md was modified (3 lines in, 3 lines out).

**Nature:** **NO-OP on schema.** PR title is misleading — nothing tier-related was removed.

### After #254/#255, before PR #265

Schema still contained the single retired-values `MembershipTier` enum (Block A). Still broken, but no longer duplicated.

### PR #265 (merge fc1dc38) — MEMB-001 schema foundation

- **Replaced** the retired-values `MembershipTier` enum with the canonical 6 values.
- **Added** `Membership`, `MembershipTierTransition`, `AgeVerification`, `CardOnFile`, plus supporting enums (`AccountStatus`, `TransitionTrigger`, `AgeVerificationMethod`, `AgeVerificationResult`, `AgeVerificationTrigger`) and `User` stub.
- **Stats:** +375 / −7, 4 files changed.

### PR #266 (merge 89acb32) — MEMB-001 seed/guardrail gap-fill

- **Added** `prisma/seed.test.ts` negative-space guardrail.
- **Rewrote** `prisma/seed.ts` to seed all 6 tier enum values (one user per tier) with correct per-tier trigger mapping.

### Verdict for Step 3

- PRs #254/#255 wiped **DUPLICATE / STALE** enum content, not the canonical definition. The canonical 6-value enum did not exist in the repo until PR #265 landed 11 minutes later.
- Current main state: **MEMB-001 is FULLY LANDED.**

---

## STEP 4 — seed.ts State

Source: `git show origin/main:prisma/seed.ts` (109 lines).

**a. Seeds exactly 6 users (one per tier)?** ✅ YES. `TIER_FIXTURES` is a 6-element `ReadonlyArray` with distinct `userId` values `0…0011` through `0…0016`, one entry per canonical tier (GUEST, VIP, VIP_SILVER, VIP_GOLD, VIP_PLATINUM, VIP_DIAMOND). Each fixture drives one `user.upsert`, one `membership.upsert`, and one `membershipTierTransition.create`.

**b. trigger_types correctly mapped per tier?** ✅ YES:

| Tier | trigger_type | Policy alignment |
|---|---|---|
| GUEST | `GATE_1_GUEST_GRANTED` | policy §2 Gate 1 |
| VIP | `GATE_2_VIP_GRANTED` | policy §2 Gate 2 |
| VIP_SILVER | `GATE_3_PAID_TIER_PURCHASED` | policy §2 Gate 3 |
| VIP_GOLD | `GATE_3_PAID_TIER_PURCHASED` | policy §2 Gate 3 |
| VIP_PLATINUM | `GATE_3_PAID_TIER_PURCHASED` | policy §2 Gate 3 |
| VIP_DIAMOND | `GATE_3_PAID_TIER_PURCHASED` | policy §2 Gate 3 |

**c. Retired tier values present?** ❌ NONE. No DAY_PASS, ANNUAL (as tier), OMNIPASS_PLUS, or standalone DIAMOND in the file.

Import line: `import { PrismaClient, MembershipTier, TransitionTrigger } from '@prisma/client';` — types sourced from generated Prisma client; no retired-value string literals leak into TypeScript either.

Multi-tenant mandate: ✅ every write includes `organization_id: TEST_ORG_ID` and `tenant_id: TEST_TENANT_ID`.

---

## STEP 5 — seed.test.ts State

**a. File exists?** ✅ YES — `prisma/seed.test.ts` (~95 lines) present on origin/main, landed via PR #266.

**b. Negative-space guardrail present?** ✅ YES. The test:
1. Asserts `MembershipTier` enum body contains **exactly** `[GUEST, VIP, VIP_SILVER, VIP_GOLD, VIP_PLATINUM, VIP_DIAMOND]` (set-equal, order-independent via `.sort()`).
2. Iterates `RETIRED_TIERS = ['DAY_PASS','ANNUAL','OMNIPASS_PLUS','DIAMOND']` and asserts none appear as tokens.
3. Explicit positive check that `VIP_DIAMOND` is present (prevents regex-scoping bug from silently dropping it).
4. Scopes regex to the `enum MembershipTier { ... }` block so `BillingInterval.ANNUAL` and `VIP_DIAMOND` are not misflagged.

**c. Standalone run via `npx ts-node prisma/seed.test.ts`:**

Environment note: Prior to running the test, `node_modules` was absent. I ran `yarn install --frozen-lockfile` (idempotent, no lockfile change) to restore deps — no tracked files modified. Then:

```
$ npx ts-node prisma/seed.test.ts
MEMB-001 negative-space guardrail PASSED — MembershipTier = [GUEST, VIP, VIP_SILVER, VIP_GOLD, VIP_PLATINUM, VIP_DIAMOND]
$ echo $?
0
```

Result: ✅ **PASS** — exit code 0.

---

## STEP 6 — QUEUE State

**a. Current contents of `PROGRAM_CONTROL/DIRECTIVES/QUEUE/`:**

```
PROGRAM_CONTROL/DIRECTIVES/QUEUE/
└── .gitkeep
```

Excluding `.gitkeep`: **zero files**. QUEUE is empty on both local working tree and `origin/main` (confirmed via `git ls-tree -r origin/main -- PROGRAM_CONTROL/DIRECTIVES/QUEUE/`).

**b. Per-file classification:** N/A — QUEUE is empty.

**c. THREAD11-COPILOT-INTAKE.md / THREAD11-DIRECTIVE-SERIES-001.md status:**

| File | Expected action per Thread 12 handoff | Actual current location |
|---|---|---|
| THREAD11-COPILOT-INTAKE.md | "CONTAMINATED — must be removed from QUEUE" (handoff line 105, 117, 161) | Moved to `PROGRAM_CONTROL/DIRECTIVES/DONE/THREAD11-COPILOT-INTAKE.md` (preserved as archival record, not executed) |
| THREAD11-DIRECTIVE-SERIES-001.md | "DUPLICATE — remove" (handoff line 106, 118, 164) | **Not present anywhere in PROGRAM_CONTROL/** — deleted entirely |

Cross-reference: `find PROGRAM_CONTROL -name "THREAD11*"` returns only `PROGRAM_CONTROL/DIRECTIVES/DONE/THREAD11-COPILOT-INTAKE.md`. The Thread 12→13 cleanup (PRs #260/#262/#264) successfully removed both contaminated/duplicate files from QUEUE; one was archived to DONE, the other was fully deleted. **Cleanup is complete per handoff intent.**

IN_PROGRESS/: empty (0 files).

---

## STEP 7 — Stale Document Scan

Scanned files for tokens: `DAY_PASS`, `ANNUAL` (bare), `OMNIPASS_PLUS`, standalone `DIAMOND`, `XXXChatNow`, `xxxchatnow.com`.

### docs/MEMBERSHIP_LIFECYCLE_POLICY.md

| Line | Token | Context | Assessment |
|---|---|---|---|
| 30 | `DAY_PASS` | "`DAY_PASS` — concept fully retired" | ✅ Properly labeled as retired in §1.1 |
| 31 | `ANNUAL` | "`ANNUAL` — never a tier; may appear elsewhere only as a billing-interval label" | ✅ Properly labeled |
| 32 | `OMNIPASS_PLUS` | "`OMNIPASS_PLUS` — is a **product**, not a tier" | ✅ Properly labeled |
| 33 | Standalone `DIAMOND` | "Standalone `DIAMOND` — canonical form is `VIP_DIAMOND`" | ✅ Properly labeled |
| 212 | `DIAMOND` | `VIP_SILVER / GOLD / PLATINUM / DIAMOND` in a benefits table | ⚠️ **MINOR** — shorthand for `VIP_DIAMOND` in prose table; ambiguous with retired standalone `DIAMOND`. Recommend rewriting as `VIP_DIAMOND` for strictness. Not a schema-level violation. |

### docs/DOMAIN_GLOSSARY.md — ⚠️ **CONTAMINATED**

| Line | Content | Issue |
|---|---|---|
| 101 | `RETIRED: Day Pass \| Retired concept — remove all references \| RETIRED: day_pass` | ✅ Properly labeled retired |
| 102 | `Annual \| Annual subscription tier \| ANNUAL` | ❌ Conflicts with policy §1.1: "ANNUAL — never a tier". Should be retagged `RETIRED:` or moved to BillingInterval section. |
| 103 | `OmniPass+ \| Premium subscription tier \| OmniPassPlus, omni_pass_plus` | ❌ Conflicts with policy §1.1: `OMNIPASS_PLUS` is a product, not a tier. Should be retagged. |
| 104 | `Diamond \| Highest membership tier \| DIAMOND, diamond` | ❌ Conflicts with policy §1.1: canonical form is `VIP_DIAMOND`; standalone `DIAMOND` retired. |

Three rows in the `## MEMBERSHIP AND ACCESS` section still present retired tier tokens as though they were active tiers. This is stale-documentation drift and should be remediated in a follow-up CHORE directive.

### docs/REQUIREMENTS_MASTER.md

- No hits for any of the seven tokens. ✅ CLEAN.

### docs/RRR_CEO_DECISIONS_FINAL_2026-04-17.md

| Line | Context | Assessment |
|---|---|---|
| 13 | `archive/xxxchatnow-seed/: remove` | ✅ Path reference, scheduled-for-removal instruction |
| 16 | "XXXChatNow.com was the prior platform name. All references must be updated to ChatNow.Zone." | ✅ Historical note in a rename-policy document |

Both hits are intentional references to the rename operation, not residual brand contamination.

### PROGRAM_CONTROL/DIRECTIVES/QUEUE/*.md

QUEUE directory is empty — nothing to scan.

---

## VERDICT

- **MEMB-001 landing status:** **FULLY LANDED.** PR #265 merged 2026-04-17 (schema §1–§5) + PR #266 merged same day (seed/guardrail §6). All six canonical tier values present in enum; all five required models (Membership, MembershipTierTransition, AgeVerification, CardOnFile, User stub) present; seed.ts produces 6-of-6 tier coverage with correct trigger mapping; seed.test.ts guardrail executes and PASSES.
- **Schema integrity:** **CLEAN.** PRs #254/#255 removed a duplicate stale enum block and a REPO_MANIFEST tweak respectively — they did NOT wipe the canonical enum (which did not yet exist at that time). Current `origin/main` enum equals the canonical 6. No retired tokens anywhere in prisma/schema.prisma, prisma/seed.ts, or prisma/seed.test.ts. QUEUE cleanup from Thread 12→13 is complete.
- **Recommended next action:** File a CHORE directive to remediate `docs/DOMAIN_GLOSSARY.md` lines 102–104 (retag retired `Annual`/`OmniPass+`/`Diamond` rows to match `MEMBERSHIP_LIFECYCLE_POLICY.md` §1.1) and optionally tighten `MEMBERSHIP_LIFECYCLE_POLICY.md` line 212 to use `VIP_DIAMOND` instead of shorthand `DIAMOND`.

---

## Audit Provenance

| Check | Method | Source |
|---|---|---|
| Schema content | `git show origin/main:prisma/schema.prisma` | commit e420458 |
| PR #265 state | GitHub MCP `pull_request_read` | live API |
| PR #254 diff | `git diff 76fd094 2d81e8c -- prisma/schema.prisma` | local git |
| PR #255 diff | `git diff 2d81e8c 996dba0 --stat` | local git |
| seed.test.ts run | `npx ts-node prisma/seed.test.ts` after `yarn install --frozen-lockfile` | exit 0 |
| QUEUE listing | `git ls-tree -r origin/main -- PROGRAM_CONTROL/DIRECTIVES/QUEUE/` + local `ls` | both empty except .gitkeep |
| Document scan | Grep across listed docs | read-only |

No schema, queue, PR, or migration mutations performed during this audit.
