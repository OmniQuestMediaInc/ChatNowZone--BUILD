-- =============================================================================
-- ChatNow.Zone — Core Financial Ledger Schema
-- WO: WO-INIT-001
-- Doctrine: Append-Only Ledger | Deterministic Logic
-- =============================================================================

-- -----------------------------------------------------------------------------
-- EXTENSION: UUID generation
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- TABLE: user_risk_profiles
-- PURPOSE: Mini Credit Bureau — stores risk scoring data per user.
-- MUTATION POLICY: INSERT and UPDATE allowed; DELETE prohibited by policy.
-- =============================================================================
CREATE TABLE IF NOT EXISTS user_risk_profiles (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID        NOT NULL UNIQUE,

    -- Risk scoring
    risk_score          NUMERIC(5, 2)  NOT NULL DEFAULT 0.00
                            CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_tier           VARCHAR(20) NOT NULL DEFAULT 'UNRATED'
                            CHECK (risk_tier IN ('UNRATED', 'LOW', 'MEDIUM', 'HIGH', 'BLOCKED')),

    -- Credit bureau data
    total_charged_back  NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_disputed      NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_approved      NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    chargeback_ratio    NUMERIC(5, 4)  NOT NULL DEFAULT 0.0000
                            CHECK (chargeback_ratio >= 0 AND chargeback_ratio <= 1),

    -- Velocity controls
    daily_spend_limit   NUMERIC(12, 2) NOT NULL DEFAULT 500.00,
    monthly_spend_limit NUMERIC(12, 2) NOT NULL DEFAULT 5000.00,

    -- Audit timestamps
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_evaluated_at   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_user_risk_profiles_risk_tier
    ON user_risk_profiles (risk_tier);

COMMENT ON TABLE user_risk_profiles IS
    'Mini Credit Bureau: stores risk scoring and velocity data per user. '
    'Risk scores are recalculated deterministically from ledger_entries. '
    'DELETE is prohibited by OQMI Append-Only Ledger Doctrine.';

-- =============================================================================
-- TABLE: studio_contracts
-- PURPOSE: Payroll split logic — defines revenue share between studio and
--          performers for each contract period.
-- MUTATION POLICY: INSERT and UPDATE allowed; DELETE prohibited by policy.
-- =============================================================================
CREATE TABLE IF NOT EXISTS studio_contracts (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id           UUID        NOT NULL,
    performer_id        UUID        NOT NULL,

    -- Contract terms
    contract_ref        VARCHAR(100) NOT NULL UNIQUE,
    effective_date      DATE        NOT NULL,
    expiry_date         DATE,
    status              VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                            CHECK (status IN ('DRAFT', 'ACTIVE', 'SUSPENDED', 'EXPIRED', 'TERMINATED')),

    -- Split ratios (must sum to 1.0000)
    studio_split        NUMERIC(5, 4) NOT NULL
                            CHECK (studio_split >= 0 AND studio_split <= 1),
    performer_split     NUMERIC(5, 4) NOT NULL
                            CHECK (performer_split >= 0 AND performer_split <= 1),
    platform_split      NUMERIC(5, 4) NOT NULL DEFAULT 0.0000
                            CHECK (platform_split >= 0 AND platform_split <= 1),

    -- Constraint: splits must sum to exactly 1
    CONSTRAINT split_ratio_sum CHECK (
        ROUND(studio_split + performer_split + platform_split, 4) = 1.0000
    ),

    -- Floor guarantees
    performer_floor_per_minute NUMERIC(8, 4),

    -- Audit timestamps
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID        NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_studio_contracts_studio_id
    ON studio_contracts (studio_id);

CREATE INDEX IF NOT EXISTS idx_studio_contracts_performer_id
    ON studio_contracts (performer_id);

CREATE INDEX IF NOT EXISTS idx_studio_contracts_status
    ON studio_contracts (status);

COMMENT ON TABLE studio_contracts IS
    'Payroll split logic: defines revenue share ratios between studio, performer, '
    'and platform for each active contract. studio_split + performer_split + '
    'platform_split must equal 1.0000. DELETE is prohibited by policy.';

-- =============================================================================
-- TABLE: ledger_entries
-- PURPOSE: Append-Only Transaction History — immutable financial record.
-- MUTATION POLICY: INSERT ONLY. No UPDATE. No DELETE. Ever.
-- =============================================================================
CREATE TABLE IF NOT EXISTS ledger_entries (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Transaction identity
    transaction_ref     VARCHAR(100) NOT NULL UNIQUE,
    idempotency_key     VARCHAR(200) NOT NULL UNIQUE,
    parent_entry_id     UUID        REFERENCES ledger_entries(id),

    -- Parties
    user_id             UUID        NOT NULL,
    studio_id           UUID,
    performer_id        UUID,
    contract_id         UUID        REFERENCES studio_contracts(id),

    -- Transaction classification
    entry_type          VARCHAR(50) NOT NULL
                            CHECK (entry_type IN (
                                'CHARGE',
                                'REFUND',
                                'CHARGEBACK',
                                'REVERSAL',
                                'PAYOUT_STUDIO',
                                'PAYOUT_PERFORMER',
                                'PAYOUT_PLATFORM',
                                'ADJUSTMENT',
                                'FEE',
                                'REWARD_CREDIT',
                                'REWARD_REDEEM'
                            )),
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                            CHECK (status IN ('PENDING', 'SETTLED', 'FAILED', 'DISPUTED', 'REVERSED')),

    -- Amounts (all in minor units: cents)
    gross_amount_cents  BIGINT      NOT NULL CHECK (gross_amount_cents >= 0),
    fee_amount_cents    BIGINT      NOT NULL DEFAULT 0 CHECK (fee_amount_cents >= 0),
    net_amount_cents    BIGINT      NOT NULL CHECK (
                                (entry_type IN ('REFUND', 'CHARGEBACK', 'REVERSAL') AND net_amount_cents <= 0)
                                OR
                                (entry_type NOT IN ('REFUND', 'CHARGEBACK', 'REVERSAL') AND net_amount_cents >= 0)
                            ),
    currency            CHAR(3)     NOT NULL DEFAULT 'USD',

    -- Split ledger (populated for PAYOUT entries)
    studio_amount_cents    BIGINT   DEFAULT 0,
    performer_amount_cents BIGINT   DEFAULT 0,
    platform_amount_cents  BIGINT   DEFAULT 0,

    -- External gateway
    gateway             VARCHAR(50),
    gateway_txn_id      VARCHAR(200),
    gateway_response    JSONB,

    -- Metadata
    description         TEXT,
    metadata            JSONB,

    -- Immutable audit timestamp (no updated_at — append-only)
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enforce append-only: prevent UPDATE and DELETE via triggers that raise errors
CREATE OR REPLACE FUNCTION ledger_entries_block_mutation()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION
        'OQMI Append-Only Doctrine violation: % on ledger_entries is prohibited. '
        'Ledger entries are immutable. Create a new correcting entry instead.',
        TG_OP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_ledger_entries_no_update
    BEFORE UPDATE ON ledger_entries
    FOR EACH ROW EXECUTE FUNCTION ledger_entries_block_mutation();

CREATE OR REPLACE TRIGGER trg_ledger_entries_no_delete
    BEFORE DELETE ON ledger_entries
    FOR EACH ROW EXECUTE FUNCTION ledger_entries_block_mutation();

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_ledger_entries_user_id
    ON ledger_entries (user_id);

CREATE INDEX IF NOT EXISTS idx_ledger_entries_studio_id
    ON ledger_entries (studio_id);

CREATE INDEX IF NOT EXISTS idx_ledger_entries_performer_id
    ON ledger_entries (performer_id);

CREATE INDEX IF NOT EXISTS idx_ledger_entries_contract_id
    ON ledger_entries (contract_id);

CREATE INDEX IF NOT EXISTS idx_ledger_entries_entry_type
    ON ledger_entries (entry_type);

CREATE INDEX IF NOT EXISTS idx_ledger_entries_status
    ON ledger_entries (status);

CREATE INDEX IF NOT EXISTS idx_ledger_entries_created_at
    ON ledger_entries (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ledger_entries_gateway_txn_id
    ON ledger_entries (gateway_txn_id)
    WHERE gateway_txn_id IS NOT NULL;

COMMENT ON TABLE ledger_entries IS
    'Append-Only Transaction History. IMMUTABLE by OQMI Doctrine. '
    'INSERT ONLY — UPDATE and DELETE are blocked by database rules. '
    'Every financial event must produce a new row. '
    'Use parent_entry_id to link reversals, refunds, or corrections to originals.';

COMMENT ON COLUMN ledger_entries.idempotency_key IS
    'Caller-supplied idempotency key. Unique constraint prevents duplicate charges.';

COMMENT ON COLUMN ledger_entries.parent_entry_id IS
    'Links a REFUND, REVERSAL, or CHARGEBACK back to the original CHARGE entry.';

-- =============================================================================
-- TABLE: transactions
-- PURPOSE: High-level transaction record linking a user action (e.g. tip,
--          purchase) to one or more ledger_entries. Provides a single point
--          of reference for the originating event.
-- MUTATION POLICY: INSERT ONLY except status transitions. INSERT and status
--                  UPDATE are permitted. All other UPDATE columns and all
--                  DELETE operations are blocked by trigger.
-- =============================================================================
CREATE TABLE IF NOT EXISTS transactions (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identity
    transaction_ref     VARCHAR(100) NOT NULL UNIQUE,
    idempotency_key     VARCHAR(200) NOT NULL UNIQUE,

    -- Parties
    user_id             UUID        NOT NULL,
    performer_id        UUID,
    studio_id           UUID,

    -- Classification
    transaction_type    VARCHAR(50) NOT NULL
                            CHECK (transaction_type IN (
                                'TIP',
                                'PURCHASE',
                                'SUBSCRIPTION',
                                'REFUND',
                                'CHARGEBACK',
                                'PAYOUT'
                            )),
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                            CHECK (status IN ('PENDING', 'SETTLED', 'FAILED', 'DISPUTED', 'REVERSED')),

    -- Amount
    gross_amount_cents  BIGINT      NOT NULL CHECK (gross_amount_cents >= 0),
    currency            CHAR(3)     NOT NULL DEFAULT 'USD',

    -- Metadata
    metadata            JSONB,

    -- Audit
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id
    ON transactions (user_id);

CREATE INDEX IF NOT EXISTS idx_transactions_performer_id
    ON transactions (performer_id)
    WHERE performer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_status
    ON transactions (status);

CREATE INDEX IF NOT EXISTS idx_transactions_created_at
    ON transactions (created_at DESC);

COMMENT ON TABLE transactions IS
    'High-level transaction record. Each transaction may produce one or more '
    'ledger_entries. Provides a single originating event reference for auditing.';

-- ---------------------------------------------------------------------------
-- Trigger: block DELETE and non-status UPDATE on transactions (append-only
-- with the sole exception of status transitions).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION transactions_block_mutation()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION
            'transactions is append-only: DELETE is not permitted (id=%).', OLD.id;
    END IF;
    -- On UPDATE, only the status column may change.
    -- Note: updated_at is intentionally excluded here — it is managed by the
    -- separate trg_transactions_status_updated_at trigger and must be allowed
    -- to change in concert with a status update.
    IF TG_OP = 'UPDATE' THEN
        IF NEW.transaction_ref     IS DISTINCT FROM OLD.transaction_ref     OR
           NEW.idempotency_key     IS DISTINCT FROM OLD.idempotency_key     OR
           NEW.user_id             IS DISTINCT FROM OLD.user_id             OR
           NEW.performer_id        IS DISTINCT FROM OLD.performer_id        OR
           NEW.studio_id           IS DISTINCT FROM OLD.studio_id           OR
           NEW.transaction_type    IS DISTINCT FROM OLD.transaction_type    OR
           NEW.gross_amount_cents  IS DISTINCT FROM OLD.gross_amount_cents  OR
           NEW.currency            IS DISTINCT FROM OLD.currency            OR
           NEW.metadata            IS DISTINCT FROM OLD.metadata            OR
           NEW.created_at          IS DISTINCT FROM OLD.created_at
        THEN
            RAISE EXCEPTION
                'transactions is append-only: only status updates are permitted (id=%).', OLD.id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_transactions_block_mutation
BEFORE UPDATE OR DELETE ON transactions
FOR EACH ROW EXECUTE FUNCTION transactions_block_mutation();

-- ---------------------------------------------------------------------------
-- Trigger: maintain updated_at when transaction status changes.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
        NEW.updated_at := NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_transactions_status_updated_at
BEFORE UPDATE OF status ON transactions
FOR EACH ROW EXECUTE FUNCTION set_transactions_updated_at();

