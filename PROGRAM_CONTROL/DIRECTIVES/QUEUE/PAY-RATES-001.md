# DIRECTIVE: PAY-RATES-001

**Directive ID:** PAY-RATES-001
**Agent:** CLAUDE_CODE
**Parallel-safe:** NO
**Touches:** services/core-api/src/governance/governance.config.ts
**Mode:** DROID
**FIZ:** YES
**Commit prefix:** FIZ:
**Risk class:** R1
**Status:** QUEUED
**Gate:** NONE

---

## Objective

Add the FairPay/FairPlay payout rate constants and Room-Heat tier boundaries
to `services/core-api/src/governance/governance.config.ts`.

These constants cover requirements PAY-001 through PAY-005 and are the
**single source of truth** for all payout rate logic in the platform.
No service may hardcode these values — all payout calculations must read
from `GovernanceConfig`.

---

## Pre-flight Reads (MANDATORY)

Before writing any code, read:

1. `docs/REQUIREMENTS_MASTER.md` — SECTION 2 (PAY-001 through PAY-005)
2. `docs/DOMAIN_GLOSSARY.md` — confirm Room-Heat, FairPay, RATE_COLD, RATE_WARM, RATE_HOT, RATE_INFERNO, RATE_DIAMOND_FLOOR terminology
3. `services/core-api/src/governance/governance.config.ts` — full file (confirm no rate constants exist yet)
4. `services/core-api/src/config/governance.config.ts` — full file (confirm no rate constants exist here)
5. `prisma/schema.prisma` — confirm schema unchanged

Pre-flight confirmation required:
- `GovernanceConfig` does NOT already contain `RATE_COLD`, `RATE_WARM`,
  `RATE_HOT`, `RATE_INFERNO`, or `RATE_DIAMOND_FLOOR`
- `GovernanceConfig` does NOT already contain `HEAT_COLD_MAX`,
  `HEAT_WARM_MAX`, or `HEAT_HOT_MAX`
- If any of the above already exist: HARD_STOP. Do not proceed.

---

## File to Modify

`services/core-api/src/governance/governance.config.ts`

**Additive only.** Do not modify any existing constant.

Append a new block at the END of the `GovernanceConfig` object, immediately
before the closing `} as const;` line:

```typescript
  // ── FairPay / FairPlay — Room-Heat Payout Rates (PAY-001 – PAY-005) ──────
  // CEO-CONFIRMED — rates locked. Source: Tech Debt Delta 2026-04-16.
  // All values are USD per CZT. Use Decimal arithmetic — never floating-point.

  // Heat tier boundaries (inclusive upper bound)
  FAIRPAY_HEAT_COLD_MAX: 33,    // heat 0–33 → RATE_COLD
  FAIRPAY_HEAT_WARM_MAX: 60,    // heat 34–60 → RATE_WARM
  FAIRPAY_HEAT_HOT_MAX: 85,     // heat 61–85 → RATE_HOT
  // heat 86–100 → RATE_INFERNO (no constant needed; anything above HOT_MAX)

  // Payout rates (USD per CZT, Decimal)
  FAIRPAY_RATE_COLD:          new Decimal('0.075'),  // PAY-001: heat 0–33
  FAIRPAY_RATE_WARM:          new Decimal('0.080'),  // PAY-002: heat 34–60
  FAIRPAY_RATE_HOT:           new Decimal('0.085'),  // PAY-003: heat 61–85
  FAIRPAY_RATE_INFERNO:       new Decimal('0.090'),  // PAY-004: heat 86–100
  FAIRPAY_RATE_DIAMOND_FLOOR: new Decimal('0.080'),  // PAY-005: floor on 10,000+ CZT bulk
  // Diamond floor: higher rate applies if heat warrants. This is the minimum.
  // Diamond threshold is DFSP_DIAMOND_TOKEN_THRESHOLD (10,000 CZT) — do not duplicate.
```

> **Note:** Constants are prefixed `FAIRPAY_` to avoid collisions with
> any future platform constants and to make their domain explicit in
> search/grep results. The domain glossary entries for RATE_COLD, etc.,
> map to these `FAIRPAY_RATE_*` constants.

---

## Commit Format (FIZ — four-line mandatory)

```
FIZ: PAY-RATES-001 — Add FairPay/FairPlay payout rate constants to GovernanceConfig
REASON: PAY-001 through PAY-005 require immutable payout rate constants; no service
may hardcode rates — all must read from GovernanceConfig
IMPACT: Additive only — six new constants appended to GovernanceConfig object;
no existing constants modified; no schema changes; no migrations; no service logic
CORRELATION_ID: PAY-RATES-001-2026-04-17
GATE: Tech Debt Delta 2026-04-16 / CEO-confirmed
```

---

## Validation

- `npx tsc --noEmit` produces zero NEW errors (establish baseline first)
- `grep -n "FAIRPAY_RATE_COLD\|FAIRPAY_RATE_WARM\|FAIRPAY_RATE_HOT\|FAIRPAY_RATE_INFERNO\|FAIRPAY_RATE_DIAMOND_FLOOR" services/core-api/src/governance/governance.config.ts` returns five hits
- `grep -n "FAIRPAY_HEAT_COLD_MAX\|FAIRPAY_HEAT_WARM_MAX\|FAIRPAY_HEAT_HOT_MAX" services/core-api/src/governance/governance.config.ts` returns three hits
- No other file is modified

---

## Report-Back Requirements

Create: `PROGRAM_CONTROL/REPORT_BACK/PAY-RATES-001-REPORT-BACK.md`

Must include:
- Branch + HEAD commit hash
- Files created (list)
- Files modified (list with summary)
- Files confirmed unchanged (prisma/schema.prisma, all other governance files)
- GovernanceConfig constants added (confirm from source — paste the block)
- Baseline `npx tsc --noEmit` result vs. post-change result
- All 15 invariants: confirmed or flagged
- `git diff --stat` output
- Result: SUCCESS or HARD_STOP

---

## Definition of Done

- [ ] Six new constants appended to `GovernanceConfig` (three heat boundaries + five rates — note COLD/WARM/HOT boundaries = 3; rates = 5; total = 8 lines)
- [ ] No existing constants modified
- [ ] `npx tsc --noEmit` zero new errors
- [ ] Report-back filed at `PROGRAM_CONTROL/REPORT_BACK/PAY-RATES-001-REPORT-BACK.md`
- [ ] `docs/REQUIREMENTS_MASTER.md` updated: PAY-001 through PAY-005 Status → DONE, Directive → PAY-RATES-001
- [ ] Directive moved to `PROGRAM_CONTROL/DIRECTIVES/DONE/PAY-RATES-001.md`
