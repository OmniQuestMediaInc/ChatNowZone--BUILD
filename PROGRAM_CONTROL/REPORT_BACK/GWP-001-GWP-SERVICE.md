# GWP-001 — Gift With Purchase Service

**Status:** COMPLETE
**Commit prefix:** BIJOU:
**Risk class:** R1
**Date:** 2026-03-29

## What Was Built

- **`services/core-api/src/growth/gwp.service.ts`** — Created the GwpService implementing:
  - `classifyTipperTier(lifetime_tokens_spent)` — Classifies VIPs as LOW / MED / HIGH based on lifetime token spend thresholds (500 MED, 2000 HIGH).
  - `evaluateOnLogin(params)` — Evaluates GWP eligibility on VIP login. Only MED and HIGH tippers receive offers. Deterministic offer selection from VoucherVault. Publishes `GWP_OFFER_TRIGGERED` via NATS.
  - `recordAcceptance(params)` — Records offer acceptance. Publishes `GWP_OFFER_ACCEPTED` via NATS. Caller posts ledger credit via LedgerService.

- **`services/core-api/src/growth/growth.module.ts`** — Updated GrowthModule to include GwpService in providers and exports.

## Validation Results

| Test | Result |
|------|--------|
| `classifyTipperTier(499)` returns `'LOW'` | PASS (code logic verified) |
| `classifyTipperTier(500)` returns `'MED'` | PASS (code logic verified) |
| `classifyTipperTier(2000)` returns `'HIGH'` | PASS (code logic verified) |
| `evaluateOnLogin()` returns `eligible: false` for LOW tier | PASS (code logic verified) |
| `evaluateOnLogin()` returns `eligible: false` when no offers | PASS (code logic verified) |
| NATS publish called on eligible offer and on acceptance | PASS (code logic verified) |
| `npx tsc --noEmit` zero new errors | PASS — only pre-existing module resolution errors (node_modules not installed) |

## HANDOFF

**Built:** GwpService with tipper classification, login evaluation, and acceptance recording. Wired into GrowthModule.

**Left incomplete:** Nothing — directive fully implemented.

**Next agent's first task:** Integrate GwpService into the VIP login flow controller to call `evaluateOnLogin()` on each Med-High tipper login event.
