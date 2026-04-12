# FIZ-PRICING-DECISIONS-2026-04-11 — Report Back

**Directive Batch:** FIZ-PRICING-DECISIONS-2026-04-11
**Repo:** OmniQuestMediaInc/ChatNowZone--BUILD
**Branch:** copilot/fiz-pricing-decisions-2026-04-11

---

## COMMIT 1 of 4

**HEAD:** `59ce944`
**Message:** FIZ: Lock April 11 CEO pricing decisions into governance.config.ts
**File changed:** `services/core-api/src/config/governance.config.ts` (1 file, +11/-4)

### CHANGE 1 — SHOWTOKEN_EXCHANGE confirmed

Keys renamed and values updated exactly as directed:

```
VIP_COST_PCT:      0.05,   // 5%   — highest friction
SILVER_COST_PCT:   0.04,   // 4%
GOLD_COST_PCT:     0.025,  // 2.5%
PLATINUM_COST_PCT: 0.025,  // 2.5%
DIAMOND_COST_PCT:  0.00,   // 0%   — fee-free earned perk, locked 2026-04-11
```

### CHANGE 2 — MEMBERSHIP.TIERS canonical comment confirmed

Canonical comment added immediately above the TIERS line:

```
// CANONICAL — 5-tier repo structure locked 2026-04-11.
// Pricing doc names (Day Pass / Annual Pass / OmniPass Plus / Diamond)
// refer to PASS PRODUCTS, not membership tiers.
// Pass product eligibility by tier: see DOMAIN_GLOSSARY.md
TIERS: ['VIP', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'] as const,
```

### CHANGE 3 — DIAMOND_TIER.VOLUME_TIERS canonical comment confirmed

Canonical comment added immediately above the VOLUME_TIERS array:

```
// CANONICAL — 3-tier structure locked 2026-04-11.
// Pricing Architecture v1.3 5-tier Concierge table superseded by this.
VOLUME_TIERS: [
  { min_tokens: 10000,  max_tokens: 27499,    base_rate: 0.095 },
  { min_tokens: 30000,  max_tokens: 57499,    base_rate: 0.088 },
  { min_tokens: 60000,  max_tokens: Infinity, base_rate: 0.082 },
],
```

### TSC Result

Pre-existing errors only (unrelated to this commit):
```
services/core-api/src/app.module.ts(10,10): error TS2300: Duplicate identifier 'PaymentsModule'.
services/core-api/src/app.module.ts(19,10): error TS2300: Duplicate identifier 'PaymentsModule'.
```
Zero new errors introduced.

**Result: SUCCESS**

---

## COMMIT 2 of 4

**HEAD:** `7d79182`
**Message:** FIZ: Add TOKEN_EXTENSION constant block to governance.config.ts
**File changed:** `services/core-api/src/config/governance.config.ts` (1 file, +17/0)

### TOKEN_EXTENSION block confirmed

New constant block added after MEMBERSHIP section (before PRIVATE_CALL):

```typescript
export const TOKEN_EXTENSION = {
  OPTION_A_FEE_PCT:         0.20,  // fee = 20% of expired volume at 1K-bundle rate
  OPTION_A_LIFESPAN_DAYS:   46,    // 45 + 1
  OPTION_B_TOKEN_PURCHASE:  2500,
  OPTION_B_FORFEITURE_PCT:  0.25,
  OPTION_B_LIFESPAN_DAYS:   46,    // 45 + 1
  OPTION_C_TOKEN_PURCHASE:  5000,
  OPTION_C_FORFEITURE_PCT:  0.20,
  OPTION_C_LIFESPAN_DAYS:   91,    // 90 + 1
} as const;
```

No existing constants modified. No service logic. No schema changes. No migrations.

### TSC Result

Same pre-existing errors only — zero new errors introduced.

**Result: SUCCESS**
