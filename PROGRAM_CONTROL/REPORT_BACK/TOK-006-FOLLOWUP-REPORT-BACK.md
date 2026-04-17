# TOK-006-FOLLOWUP — Report-Back

**Directive:** TOK-006-FOLLOWUP
**Agent:** CLAUDE_CODE
**Branch:** claude/concierge-config-001-SeN4Z
**HEAD commit:** e2e837b
**Date:** 2026-04-17
**Authority:** Kevin B. Hartley, CEO — Thread 11 / Step 2

## Result

SUCCESS

## Scope executed

1. `LedgerService.recordEntry` — now accepts `tokenOrigin: TokenOrigin` as a
   required parameter and persists it on every ledger write (top-level
   `token_origin` column + `metadata.token_origin`).
2. All callers of `recordEntry` within the repo — updated to pass the correct
   `TokenOrigin` value.
3. `prisma/schema.prisma` — `TokenBalance.token_origin` made non-nullable with
   `@default("PURCHASED")` retained. No migration generated.

## Files modified

- `services/core-api/src/finance/ledger.service.ts`
  - Imported `TokenOrigin` from `./types/ledger.types`.
  - `recordEntry` signature: added required `tokenOrigin: TokenOrigin` (placed
    alongside `tokenType`).
  - `recordEntry` body: persists `token_origin` as a top-level column on the
    ledger entry AND mirrors it into `metadata.token_origin` for redundancy.
  - `debitWallet` internal `recordEntry` call: derives `tokenOrigin` from the
    `WalletBucket` being iterated:
    - `WalletBucket.PURCHASED` → `TokenOrigin.PURCHASED`
    - `WalletBucket.PROMOTIONAL_BONUS` → `TokenOrigin.GIFTED`
    - `WalletBucket.MEMBERSHIP_ALLOCATION` → `TokenOrigin.GIFTED`

- `tests/integration/ledger-service.spec.ts`
  - Imported `TokenOrigin` from
    `../../services/core-api/src/finance/types/ledger.types`.
  - Updated all 11 `recordEntry` call sites (see table below).

- `prisma/schema.prisma`
  - `TokenBalance.token_origin` changed from
    `String?  @default("PURCHASED")` → `String   @default("PURCHASED")`.

## Files created

- `PROGRAM_CONTROL/REPORT_BACK/TOK-006-FOLLOWUP-REPORT-BACK.md` (this file)

## Files confirmed unchanged

- `services/core-api/src/governance/governance.config.ts`
- `services/nats/topics.registry.ts`
- `services/core-api/src/finance/types/ledger.types.ts` (TokenOrigin enum
  already present from TOK-AUDIT-001)
- `services/core-api/src/finance/ledger.types.ts` (TipTransaction unchanged)
- `package.json` and `yarn.lock` (reverted side-effects from
  `prisma generate`; directive scope is schema-only)

## Call-site assignments

### Internal caller (non-ambiguous)

| File | Line | Context | TokenOrigin assigned | Reasoning |
|------|------|---------|----------------------|-----------|
| `services/core-api/src/finance/ledger.service.ts` | 200 (pre-change) / 207 (post-change) | `debitWallet` per-bucket debit | Derived from bucket: `PURCHASED` bucket → `PURCHASED`; `PROMOTIONAL_BONUS` / `MEMBERSHIP_ALLOCATION` → `GIFTED` | Each bucket's origin is fixed by definition — PROMOTIONAL_BONUS and MEMBERSHIP_ALLOCATION are platform-granted (GIFTED); PURCHASED is user-bought (PURCHASED). |

### Test callers (non-ambiguous)

| File | Line | Context | TokenOrigin assigned | Reasoning |
|------|------|---------|----------------------|-----------|
| `tests/integration/ledger-service.spec.ts` | 133 | `recordEntry` — records valid BigInt, reason `TOPUP` | `PURCHASED` | Top-up is a user purchase. |
| `tests/integration/ledger-service.spec.ts` | 149 | `recordEntry` — non-BigInt rejection test, reason `TOPUP` | `PURCHASED` | Top-up is a user purchase. |
| `tests/integration/ledger-service.spec.ts` | 162 | `recordEntry` — idempotency seed, reason `TOPUP` | `PURCHASED` | Top-up is a user purchase. |
| `tests/integration/ledger-service.spec.ts` | 169 | `recordEntry` — idempotency replay, reason `TOPUP` | `PURCHASED` | Duplicate of the idempotency seed call. |
| `tests/integration/ledger-service.spec.ts` | 182 | `recordEntry` — rule_applied_id default, reason `TOPUP` | `PURCHASED` | Top-up is a user purchase. |
| `tests/integration/ledger-service.spec.ts` | 225 | `recordEntry` — `getBalance` seed, reason `TOPUP` | `PURCHASED` | Top-up is a user purchase. |
| `tests/integration/ledger-service.spec.ts` | 226 | `recordEntry` — `getBalance` seed, reason `TOPUP` | `PURCHASED` | Top-up is a user purchase. |
| `tests/integration/ledger-service.spec.ts` | 227 | `recordEntry` — `getBalance` seed, reason `SPEND`, negative amount | `PURCHASED` | Spending against tokens whose origin in this test scenario was PURCHASED. Debit mirrors origin of the balance being drawn from. |
| `tests/integration/ledger-service.spec.ts` | 235 | `recordEntry` — token-type isolation, reason `TOPUP` | `PURCHASED` | Top-up is a user purchase. |
| `tests/integration/ledger-service.spec.ts` | 236 | `recordEntry` — token-type isolation, reason `TOPUP` (TokenType.BIJOU) | `PURCHASED` | Top-up is a user purchase. |
| `tests/integration/ledger-service.spec.ts` | 438 | `recordEntry` — Ghost Alpha scenario replay, reason `TOPUP`, metadata wallet_bucket=PURCHASED | `PURCHASED` | Top-up plus explicit bucket=PURCHASED in metadata. |

### Ambiguous call site (flagged)

| File | Line | Context | TokenOrigin assigned | Flag reasoning |
|------|------|---------|----------------------|----------------|
| `tests/integration/ledger-service.spec.ts` | 200 (pre-change) / 204 (post-change) | `recordEntry` — CSV seed-replay loop, reason `TIP`, positive amount credited to `tx.customer_id` | `PURCHASED` (assigned) | **AMBIGUOUS.** The test posts positive `gross_tokens` amounts to each customer's wallet with reason code `TIP` — this is scenario seed-data replay rather than an actual tip from creator to customer. A tip typically flows tokens OUT of a customer. Treating the credit as a replay of previously purchased tokens into the customer wallet, I assigned `PURCHASED`. An inline code comment in the test explains this. If the CSV scenario is intended to seed gifts (e.g. creator-to-creator transfers), this should be `GIFTED` instead. |

**Total call sites updated:** 11 test + 1 internal = 12.
**Flagged ambiguous sites:** 1 (documented above and inline in test file).

## Methods deliberately not modified (scope notes)

- `LedgerService.handleDisputeReversal` writes a ledger entry directly via
  `ledgerRepo.create` + `save`, not through `recordEntry`. The directive's
  scope is "LedgerService.recordEntry — accept token_origin as a required
  parameter on recordEntry" and "All callers of LedgerService.recordEntry" —
  `handleDisputeReversal` is neither. It is a sibling method. I did **not**
  modify it. If the "no ledger write may omit token_origin" invariant is
  intended to apply to all ledger-write paths (not just `recordEntry`), a
  follow-up directive should extend the reversal path to look up the origin
  of the parent entry and persist it on the reversal. Flagged here per the
  directive's instruction to surface ambiguity rather than guess.

## GovernanceConfig constants used

None (directive does not touch governance constants).

## NATS topic constants used

None (directive does not emit NATS events).

## Prisma schema

Single field change, confirmed from source:
```
- token_origin        String?  @default("PURCHASED")
+ token_origin        String   @default("PURCHASED")
```
`npx prisma@6.19.3 generate` executed successfully against the schema.
Side effects on `package.json` and `yarn.lock` (`prisma` and `@prisma/client`
version pins) were reverted — the directive is schema-only. No migration
generated, per directive.

## Invariants

1. Append-only: confirmed — no UPDATE or DELETE introduced on any balance column or ledger row; `recordEntry` remains a single `.save()` append; the new `token_origin` field is written once at insert time.
2. Deterministic: confirmed — `token_origin` derivation in `debitWallet` is a pure function of the bucket iteration; no wall-clock or random input.
3. Idempotent: confirmed — existing `reference_id` dedup preserved unchanged.
4. No hardcoded token_origin strings: confirmed — `TokenOrigin` enum used at all 12 call sites; no `"PURCHASED"` or `"GIFTED"` string literals were added in TypeScript.
5. Commit prefix discipline: confirmed — FIZ four-line format with REASON / IMPACT / CORRELATION_ID / GATE.
6. Every table includes `correlation_id` and `reason_code`: N/A for this change — no new tables. Existing `reason_code` on ledger entries preserved. `token_origin` sits alongside (not replacing) reason_code.
7. Postgres/Redis not on public interfaces: N/A — no infra change.
8. All chat/haptic events via NATS: N/A — no event publishing touched.
9. No secrets/tokens/credentials/PII logged: confirmed — `token_origin` is a categorical enum value (PURCHASED / GIFTED), not PII.
10. No refactoring unless instructed: confirmed — only the scoped additions; existing method bodies unchanged except for the targeted additions.
11. `rule_applied_id` on outputs: confirmed — existing `rule_applied_id` logic (default `GENERAL_GOVERNANCE_v10`, warn on omit) preserved unchanged.
12. Logger on `LedgerService`: confirmed — `private readonly logger = new Logger(LedgerService.name)` unchanged.
13. No SHA-256 for sensitive hashes: N/A — no hashing touched.
14. NATS topic constants (no raw strings): N/A — no NATS emit.
15. Multi-tenant mandate (`organization_id` + `tenant_id` on Prisma writes): confirmed untouched on `TokenBalance` — both fields remain present in the model alongside the now-non-nullable `token_origin`. No Prisma write paths were modified by this directive.

## Multi-tenant mandate

Confirmed. `TokenBalance.organization_id` and `TokenBalance.tenant_id` remain
non-nullable and unchanged. No new Prisma write paths introduced.

## TypeScript check

- Baseline (`origin/main`, clean tree): `npx tsc --noEmit` exit 0, no output.
- With changes applied: `npx tsc --noEmit` exit 0, no output.
- **Zero new errors.** Run was performed in `services/core-api/` against the
  project's tsconfig; `tests/**/*.spec.ts` are excluded by both root and
  core-api tsconfigs, but were updated for runtime call-site correctness.

## Deviations from directive

- **Branch**: directive specified `fiz/tok-006-followup`; session harness
  assigned `claude/concierge-config-001-SeN4Z`. Both Step 1 and Step 2 commits
  were pushed to the harness-assigned branch. After the Step 1 merge, the
  branch was hard-reset to `origin/main` before Step 2 work began, so Step 2
  commits sit on top of the post-merge main — no stale Step 1 state carried
  forward.
- **Directive path assumption**: directive said "File: locate under
  `services/core-api/src/ledger/` (confirm path before editing)". Actual path
  is `services/core-api/src/finance/ledger.service.ts`. Confirmed before
  editing.
- **handleDisputeReversal**: flagged above rather than modified, per the
  directive's "if ambiguous, flag rather than guess" rule.

## git diff --stat

```
 prisma/schema.prisma                            |  2 +-
 services/core-api/src/finance/ledger.service.ts | 14 ++++++++++++++
 tests/integration/ledger-service.spec.ts        | 21 ++++++++++++++++-----
 3 files changed, 31 insertions(+), 6 deletions(-)
```

## Commit trail

- `e2e837b` — FIZ: Wire token_origin into LedgerService.recordEntry

CORRELATION_ID: TOK-006-FOLLOWUP-2026-04-17
GATE: N/A
