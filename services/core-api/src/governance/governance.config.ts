// FIZ: PV-001 — DFSP Foundation Layer
// DFSP — Diamond Financial Security Platform™ (v1.1 LOCKED)
// All DFSP governance constants. Source of truth: DFSP Engineering Spec v1.0/v1.1/v1.1a.
// DO NOT hardcode any of these values in services — always read from this config.
import Decimal from 'decimal.js';

export const GovernanceConfig = {
  // ── Integrity Hold (DFSP v1.1a — formula LOCKED) ─────────────────────────
  DFSP_INTEGRITY_HOLD_FLOOR_CAD: new Decimal('100.00'),
  DFSP_INTEGRITY_HOLD_RATE: new Decimal('0.04'),
  DFSP_INTEGRITY_HOLD_CEILING_CAD: new Decimal('500.00'),

  // ── Purchase Window ───────────────────────────────────────────────────────
  DFSP_PURCHASE_WINDOW_OPEN_HOUR: 11,
  DFSP_PURCHASE_WINDOW_CLOSE_HOUR: 23,

  // ── Risk Scoring ──────────────────────────────────────────────────────────
  DFSP_RISK_SCORE_GREEN_MAX: 29,
  DFSP_RISK_SCORE_AMBER_MAX: 59,

  // ── Diamond Token ─────────────────────────────────────────────────────────
  DFSP_DIAMOND_TOKEN_THRESHOLD: 10000,

  // ── OTP ───────────────────────────────────────────────────────────────────
  DFSP_OTP_TTL_SECONDS: 900,
  DFSP_OTP_MAX_ATTEMPTS: 5,

  // ── Account Recovery & Expedited Access ───────────────────────────────────
  DFSP_ACCOUNT_RECOVERY_HOLD_HOURS: 48,
  DFSP_EXPEDITED_ACCESS_MIN_PRIOR_CONTRACTS: 2,

  // ── Contract Offer ────────────────────────────────────────────────────────
  DFSP_CONTRACT_OFFER_EXPIRY_HOURS: 24,

  // ── PROC-001: Webhook Hardening (FIZ) ────────────────────────────────────
  // CEO-AUTHORIZED-STAGED-2026-04-10 — webhook infrastructure only.
  // No ledger writes, no balance columns, no transaction execution.
  /** Maximum allowed drift (seconds) between processor timestamp and server clock. */
  WEBHOOK_REPLAY_WINDOW_SECONDS: 300,   // 5 minutes
  /** TTL (seconds) for entries in the nonce / event_id dedup stores. */
  WEBHOOK_NONCE_STORE_TTL_SECONDS: 600, // 10 minutes
} as const;
