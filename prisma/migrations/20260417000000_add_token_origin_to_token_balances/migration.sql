-- TOK-AUDIT-001: Add token_origin tag to token_balances.
-- Origin classification for CZT issuance: PURCHASED (refundable) vs GIFTED (not refundable).
-- Required for ASC 606 revenue recognition and breakage calculation.
-- Tech Debt Delta 2026-04-16 TOK-006.
-- Additive only — nullable column with default ensures existing rows remain valid.

ALTER TABLE "token_balances"
  ADD COLUMN IF NOT EXISTS "token_origin" VARCHAR DEFAULT 'PURCHASED';
