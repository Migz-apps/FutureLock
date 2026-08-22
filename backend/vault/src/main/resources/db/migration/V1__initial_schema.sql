-- =========================================================
-- FutureLock
-- Initial PostgreSQL database schema
-- =========================================================


-- =========================================================
-- USERS
-- =========================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,

    username VARCHAR(100) NOT NULL,
    email VARCHAR(320),
    hashed_password VARCHAR(255),
    wallet_address VARCHAR(255),
    role VARCHAR(50) NOT NULL,

    trust_score DOUBLE PRECISION NOT NULL DEFAULT 0,
    ratings_count BIGINT NOT NULL DEFAULT 0,

    total_weighted_score DOUBLE PRECISION NOT NULL DEFAULT 0,
    total_weight_sum DOUBLE PRECISION NOT NULL DEFAULT 0,

    secret_salt VARCHAR(255) NOT NULL,

    version BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT users_identity_required CHECK (
        email IS NOT NULL
        OR wallet_address IS NOT NULL
    )
);


CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_unique
    ON users (LOWER(username));


CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique
    ON users (LOWER(email))
    WHERE email IS NOT NULL;


CREATE UNIQUE INDEX IF NOT EXISTS idx_users_wallet_unique
    ON users (LOWER(wallet_address))
    WHERE wallet_address IS NOT NULL;


-- =========================================================
-- INTEL METADATA
-- =========================================================

CREATE TABLE IF NOT EXISTS intel_metadata (
    id UUID PRIMARY KEY,

    title VARCHAR(255) NOT NULL,

    description TEXT NOT NULL,

    price_eth NUMERIC(38, 18) NOT NULL DEFAULT 0,

    price_usd NUMERIC(19, 2) NOT NULL DEFAULT 0,

    category VARCHAR(100) NOT NULL,

    creator VARCHAR(255) NOT NULL,

    unlock_days INTEGER NOT NULL DEFAULT 0,

    trust_score DOUBLE PRECISION NOT NULL DEFAULT 0,

    ratings_count BIGINT NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    version BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT intel_metadata_price_eth_nonnegative
        CHECK (price_eth >= 0),

    CONSTRAINT intel_metadata_price_usd_nonnegative
        CHECK (price_usd >= 0),

    CONSTRAINT intel_metadata_unlock_days_nonnegative
        CHECK (unlock_days >= 0)
);


CREATE INDEX IF NOT EXISTS idx_intel_metadata_category
    ON intel_metadata(category);


CREATE INDEX IF NOT EXISTS idx_intel_metadata_creator
    ON intel_metadata(creator);


CREATE INDEX IF NOT EXISTS idx_intel_metadata_created_at
    ON intel_metadata(created_at);


-- =========================================================
-- PURCHASE HISTORY
-- =========================================================

CREATE TABLE IF NOT EXISTS purchase_history (
    id UUID PRIMARY KEY,

    user_id UUID NOT NULL,

    intel_id UUID NOT NULL,

    transaction_hash VARCHAR(255),

    purchase_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    version BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT fk_purchase_history_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_purchase_history_intel
        FOREIGN KEY (intel_id)
        REFERENCES intel_metadata(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_purchase_history_user_intel
        UNIQUE (user_id, intel_id)
);


CREATE INDEX IF NOT EXISTS idx_purchase_history_user
    ON purchase_history(user_id);


CREATE INDEX IF NOT EXISTS idx_purchase_history_intel
    ON purchase_history(intel_id);


CREATE INDEX IF NOT EXISTS idx_purchase_history_date
    ON purchase_history(purchase_date);


-- =========================================================
-- RATINGS
-- =========================================================

CREATE TABLE IF NOT EXISTS ratings (
    id UUID PRIMARY KEY,

    user_id UUID NOT NULL,

    intel_id UUID NOT NULL,

    score INTEGER NOT NULL,

    is_dispute BOOLEAN NOT NULL DEFAULT FALSE,

    rated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    version BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT fk_ratings_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_ratings_intel
        FOREIGN KEY (intel_id)
        REFERENCES intel_metadata(id)
        ON DELETE CASCADE,

    CONSTRAINT ratings_score_range
        CHECK (score BETWEEN 1 AND 10),

    CONSTRAINT uq_ratings_user_intel
        UNIQUE (user_id, intel_id)
);


CREATE INDEX IF NOT EXISTS idx_ratings_user
    ON ratings(user_id);


CREATE INDEX IF NOT EXISTS idx_ratings_intel
    ON ratings(intel_id);


CREATE INDEX IF NOT EXISTS idx_ratings_dispute
    ON ratings(is_dispute);


CREATE INDEX IF NOT EXISTS idx_ratings_date
    ON ratings(rated_at);

-- Persistent verification state survives Render restarts. Codes are SHA-256 hashes,
-- expire after five minutes, and are deleted only after a successful signup.
CREATE TABLE IF NOT EXISTS email_verifications (
    email VARCHAR(320) PRIMARY KEY,
    code_hash VARCHAR(64) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    request_count INTEGER NOT NULL DEFAULT 0,
    window_started_at TIMESTAMPTZ NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE purchase_history ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE ratings ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE email_verifications ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
