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
    studio_amount_cents    BIGINT   NOT NULL DEFAULT 0,
    performer_amount_cents BIGINT   NOT NULL DEFAULT 0,
    platform_amount_cents  BIGINT   NOT NULL DEFAULT 0,

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
    RETURN NULL;
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
-- WO: WO-INIT-001
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

-- =============================================================================
-- TABLE: identity_verification
-- WO: WO-036-KYC-VAULT-PUBLISH-GATE
-- PURPOSE: KYC identity verification records for performers.
--          Enforces Vault Segregation per Corpus v10 Section 4.2.
-- MUTATION POLICY: INSERT only. Status changes produce new rows (append-only).
--                  Expiry extension requires step-up auth (enforced in service
--                  layer). No raw PII stored — document_hash is SHA-256 only.
-- =============================================================================
CREATE TABLE IF NOT EXISTS identity_verification (
    verification_id     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    performer_id        UUID        NOT NULL,

    -- Identity evidence (no raw PII — hash reference only per Corpus v10 §4.2)
    document_hash       CHAR(64)    NOT NULL,  -- SHA-256 hex digest

    -- Age / eligibility
    dob                 DATE        NOT NULL,

    -- Verification lifecycle
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                            CHECK (status IN ('PENDING', 'VERIFIED', 'EXPIRED', 'REJECTED')),
    expiry_date         TIMESTAMPTZ,
    liveness_pass       BOOLEAN     NOT NULL DEFAULT FALSE,

    -- Step-up audit trail for expiry overrides (populated on manual extension)
    expiry_override_actor_id    UUID,
    expiry_override_reason_code VARCHAR(100),
    expiry_override_at          TIMESTAMPTZ,

    -- Audit timestamps
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_identity_verification_performer_id
    ON identity_verification (performer_id);

CREATE INDEX IF NOT EXISTS idx_identity_verification_status
    ON identity_verification (status);

COMMENT ON TABLE identity_verification IS
    'KYC identity verification records for performers. '
    'document_hash stores SHA-256 reference only — no raw PII (Corpus v10 §4.2). '
    'Expiry extensions require step-up authentication and a reason_code. '
    'WO: WO-036-KYC-VAULT-PUBLISH-GATE.';

-- Prevent deletion of identity_verification rows (append-only doctrine).
CREATE OR REPLACE FUNCTION identity_verification_block_delete()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION
        'identity_verification is append-only: DELETE is not permitted (verification_id=%).', OLD.verification_id;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_identity_verification_block_delete
BEFORE DELETE ON identity_verification
FOR EACH ROW EXECUTE FUNCTION identity_verification_block_delete();

-- Maintain updated_at on status change.
CREATE OR REPLACE FUNCTION set_identity_verification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_identity_verification_updated_at
BEFORE UPDATE ON identity_verification
FOR EACH ROW EXECUTE FUNCTION set_identity_verification_updated_at();

-- =============================================================================
-- TABLE: audit_events
-- WO: WO-036-KYC-VAULT-PUBLISH-GATE
-- PURPOSE: Immutable audit chain for compliance events.
--          Covers publish eligibility checks, vault access, and overrides.
-- MUTATION POLICY: INSERT only. No UPDATE or DELETE permitted.
-- =============================================================================
CREATE TABLE IF NOT EXISTS audit_events (
    event_id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Event classification
    event_type          VARCHAR(50) NOT NULL
                            CHECK (event_type IN (
                                'PUBLISH_ELIGIBILITY_CHECK',
                                'VAULT_ACCESS',
                                'EXPIRY_OVERRIDE',
                                'NOTIFICATION_SENT',
                                'NOTIFICATION_SUPPRESSED'
                            )),

    -- Actor / subject
    actor_id            UUID        NOT NULL,
    performer_id        UUID,

    -- Event detail
    purpose_code        VARCHAR(100),
    device_fingerprint  VARCHAR(255),
    outcome             VARCHAR(50),
    reason_code         VARCHAR(100),

    -- Notification audit fields (WO-038)
    template_id         VARCHAR(100),
    consent_basis_id    VARCHAR(100),

    -- Arbitrary structured context (no raw PII)
    metadata            JSONB,

    -- Immutable timestamp
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_events_actor_id
    ON audit_events (actor_id);

CREATE INDEX IF NOT EXISTS idx_audit_events_performer_id
    ON audit_events (performer_id);

CREATE INDEX IF NOT EXISTS idx_audit_events_event_type
    ON audit_events (event_type);

CREATE INDEX IF NOT EXISTS idx_audit_events_created_at
    ON audit_events (created_at DESC);

COMMENT ON TABLE audit_events IS
    'Immutable audit chain for compliance events. '
    'Covers publish eligibility checks, vault access, and expiry overrides. '
    'INSERT only — no UPDATE or DELETE permitted. '
    'WO: WO-036-KYC-VAULT-PUBLISH-GATE.';

-- Enforce append-only on audit_events.
CREATE OR REPLACE FUNCTION audit_events_block_mutation()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION
            'audit_events is append-only: DELETE is not permitted (event_id=%).', OLD.event_id;
    END IF;
    IF TG_OP = 'UPDATE' THEN
        RAISE EXCEPTION
            'audit_events is append-only: UPDATE is not permitted (event_id=%).', OLD.event_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_events_block_mutation
BEFORE UPDATE OR DELETE ON audit_events
FOR EACH ROW EXECUTE FUNCTION audit_events_block_mutation();

-- =============================================================================
-- TABLE: referral_links
-- PURPOSE: Creator-Led Attribution Engine — tracks referral campaigns issued
--          by creators. Each link carries a fixed attribution window.
-- MUTATION POLICY: INSERT only. No UPDATE or DELETE permitted.
-- WO: WO-037
-- =============================================================================
CREATE TABLE IF NOT EXISTS referral_links (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Parties
    creator_id          UUID        NOT NULL,
    campaign_id         UUID        NOT NULL,

    -- Attribution window in days (deterministic, no hidden defaults)
    attribution_window_days  INTEGER NOT NULL CHECK (attribution_window_days > 0),

    -- Slug used in the referral URL (unique, URL-safe)
    link_slug           VARCHAR(100) NOT NULL UNIQUE,

    -- Anti-fraud: device fingerprint and payment instrument captured at
    -- link creation time to detect self-referral loops (WO-037 §anti-fraud).
    device_fingerprint  VARCHAR(255),
    payment_instrument_hash VARCHAR(64),   -- SHA-256 hash only — no raw PAN

    -- Status
    is_active           BOOLEAN     NOT NULL DEFAULT TRUE,

    -- Platform time (America/Toronto context embedded in metadata)
    metadata            JSONB,

    -- Immutable audit timestamp
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_links_creator_id
    ON referral_links (creator_id);

CREATE INDEX IF NOT EXISTS idx_referral_links_campaign_id
    ON referral_links (campaign_id);

CREATE INDEX IF NOT EXISTS idx_referral_links_link_slug
    ON referral_links (link_slug);

COMMENT ON TABLE referral_links IS
    'Creator-Led Attribution Engine: referral campaign links issued by creators. '
    'attribution_window_days determines the eligibility window for reward credit. '
    'device_fingerprint and payment_instrument_hash enable anti-fraud self-referral '
    'loop detection. INSERT only — no UPDATE or DELETE (WO-037).';

-- Enforce append-only on referral_links.
CREATE OR REPLACE FUNCTION referral_links_block_mutation()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION
            'referral_links is append-only: DELETE is not permitted (id=%).', OLD.id;
    END IF;
    IF TG_OP = 'UPDATE' THEN
        RAISE EXCEPTION
            'referral_links is append-only: UPDATE is not permitted (id=%).', OLD.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_referral_links_block_mutation
BEFORE UPDATE OR DELETE ON referral_links
FOR EACH ROW EXECUTE FUNCTION referral_links_block_mutation();

-- =============================================================================
-- TABLE: attribution_events
-- PURPOSE: Records every attribution event (click, sign-up, conversion)
--          linked to a referral_link. Each row is immutable.
-- MUTATION POLICY: INSERT only. No UPDATE or DELETE permitted.
-- WO: WO-037
-- =============================================================================
CREATE TABLE IF NOT EXISTS attribution_events (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Link back to the issuing referral
    referral_link_id    UUID        NOT NULL REFERENCES referral_links(id),

    -- Parties
    creator_id          UUID        NOT NULL,
    campaign_id         UUID        NOT NULL,

    -- Attributed user (the newly referred user)
    attributed_user_id  UUID        NOT NULL,

    -- Event classification
    event_type          VARCHAR(50) NOT NULL
                            CHECK (event_type IN (
                                'CLICK',
                                'SIGNUP',
                                'FIRST_PURCHASE',
                                'CONVERSION'
                            )),

    -- Anti-fraud snapshot at event time
    device_fingerprint  VARCHAR(255),
    payment_instrument_hash VARCHAR(64),   -- SHA-256 hash only — no raw PAN

    -- Ledger link: populated when a reward is credited
    ledger_entry_id     UUID        REFERENCES ledger_entries(id),
    rule_applied_id     VARCHAR(100),

    -- Platform time (America/Toronto)
    platform_time       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Metadata
    metadata            JSONB,

    -- Immutable audit timestamp
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attribution_events_referral_link_id
    ON attribution_events (referral_link_id);

CREATE INDEX IF NOT EXISTS idx_attribution_events_creator_id
    ON attribution_events (creator_id);

CREATE INDEX IF NOT EXISTS idx_attribution_events_attributed_user_id
    ON attribution_events (attributed_user_id);

CREATE INDEX IF NOT EXISTS idx_attribution_events_event_type
    ON attribution_events (event_type);

CREATE INDEX IF NOT EXISTS idx_attribution_events_created_at
    ON attribution_events (created_at DESC);

COMMENT ON TABLE attribution_events IS
    'Immutable log of attribution events tied to referral_links. '
    'Each rewarded conversion produces a ledger_entry (REWARD_CREDIT) and '
    'records the ledger_entry_id and rule_applied_id here. '
    'platform_time uses America/Toronto as primary timezone per OQMI doctrine. '
    'INSERT only — no UPDATE or DELETE (WO-037).';

-- Enforce append-only on attribution_events.
CREATE OR REPLACE FUNCTION attribution_events_block_mutation()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION
            'attribution_events is append-only: DELETE is not permitted (id=%).', OLD.id;
    END IF;
    IF TG_OP = 'UPDATE' THEN
        RAISE EXCEPTION
            'attribution_events is append-only: UPDATE is not permitted (id=%).', OLD.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_attribution_events_block_mutation
BEFORE UPDATE OR DELETE ON attribution_events
FOR EACH ROW EXECUTE FUNCTION attribution_events_block_mutation();

-- =============================================================================
-- TABLE: notification_consent_store
-- PURPOSE: Consent-Aware Notification Service — stores per-user, per-channel
--          opt-in/out state with jurisdiction rule versioning.
-- MUTATION POLICY: INSERT and UPDATE allowed (consent state may change over time).
--                  DELETE is prohibited — historical consent records are retained.
-- WO: WO-038
-- =============================================================================
CREATE TABLE IF NOT EXISTS notification_consent_store (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Subject
    user_id                 UUID        NOT NULL,

    -- Notification channel
    channel                 VARCHAR(20) NOT NULL
                                CHECK (channel IN ('Email', 'SMS', 'Push')),

    -- Consent state
    is_opted_in             BOOLEAN     NOT NULL DEFAULT FALSE,

    -- Jurisdiction compliance
    jurisdiction_rule_version VARCHAR(50) NOT NULL,

    -- Audit timestamps
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One active record per user+channel
    CONSTRAINT uq_notification_consent_user_channel UNIQUE (user_id, channel)
);

CREATE INDEX IF NOT EXISTS idx_notification_consent_store_user_id
    ON notification_consent_store (user_id);

CREATE INDEX IF NOT EXISTS idx_notification_consent_store_channel
    ON notification_consent_store (channel);

COMMENT ON TABLE notification_consent_store IS
    'Per-user, per-channel notification consent records. '
    'GuardedNotificationService checks is_opted_in before emitting any message. '
    'jurisdiction_rule_version pins the regulation version under which consent '
    'was captured (e.g. CASL-2024, GDPR-2023). '
    'WO: WO-038.';

-- Prevent deletion of consent records.
CREATE OR REPLACE FUNCTION notification_consent_store_block_delete()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION
        'notification_consent_store is append-only: DELETE is not permitted (id=%).', OLD.id;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notification_consent_store_block_delete
BEFORE DELETE ON notification_consent_store
FOR EACH ROW EXECUTE FUNCTION notification_consent_store_block_delete();

-- Maintain updated_at on consent change.
CREATE OR REPLACE FUNCTION set_notification_consent_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notification_consent_updated_at
BEFORE UPDATE ON notification_consent_store
FOR EACH ROW EXECUTE FUNCTION set_notification_consent_updated_at();
