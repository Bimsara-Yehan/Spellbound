-- V20260730150000__create_catalogue_and_inventory_tables.sql
-- Migration: Create catalogue, inventory, and stock adjustment audit tables
-- Author: Deeghayu (Backend — Catalogue)
-- Target Reviewer: Bimsara (Tech Lead)

CREATE TABLE category (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug        VARCHAR(255) NOT NULL UNIQUE,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id   UUID REFERENCES category(id) ON DELETE SET NULL
);

CREATE TABLE product (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            VARCHAR(255) NOT NULL UNIQUE,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    category_id     UUID REFERENCES category(id) ON DELETE SET NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    attributes      TEXT,
    pos_external_id VARCHAR(100),
    last_synced_at  TIMESTAMPTZ,
    sync_status     VARCHAR(20) NOT NULL DEFAULT 'WEB_ONLY',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE product_variant (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id       UUID NOT NULL REFERENCES product(id) ON DELETE CASCADE,
    sku              VARCHAR(100) NOT NULL UNIQUE,
    option_values    TEXT NOT NULL,
    price_cents      BIGINT NOT NULL,
    compare_at_cents BIGINT,
    pos_external_id  VARCHAR(100),
    CONSTRAINT uq_product_option_values UNIQUE (product_id, option_values)
);

CREATE TABLE inventory (
    variant_id        UUID PRIMARY KEY REFERENCES product_variant(id) ON DELETE CASCADE,
    quantity_on_hand  INTEGER NOT NULL DEFAULT 0,
    quantity_reserved INTEGER NOT NULL DEFAULT 0,
    safety_buffer     INTEGER NOT NULL DEFAULT 0,
    last_synced_at    TIMESTAMPTZ,
    CONSTRAINT chk_quantity_on_hand_non_negative CHECK (quantity_on_hand >= 0),
    CONSTRAINT chk_quantity_reserved_non_negative CHECK (quantity_reserved >= 0),
    CONSTRAINT chk_safety_buffer_non_negative CHECK (safety_buffer >= 0)
);

CREATE TABLE stock_adjustment_audit (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id        UUID NOT NULL REFERENCES product_variant(id) ON DELETE CASCADE,
    actor             VARCHAR(255) NOT NULL,
    quantity_delta    INTEGER NOT NULL,
    previous_quantity INTEGER NOT NULL,
    new_quantity      INTEGER NOT NULL,
    reason            TEXT,
    adjusted_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX idx_category_slug ON category(slug);
CREATE INDEX idx_category_parent ON category(parent_id);
CREATE INDEX idx_product_slug ON product(slug);
CREATE INDEX idx_product_status ON product(status);
CREATE INDEX idx_product_category ON product(category_id);
CREATE INDEX idx_product_pos_external ON product(pos_external_id);
CREATE INDEX idx_variant_sku ON product_variant(sku);
CREATE INDEX idx_variant_product ON product_variant(product_id);
CREATE INDEX idx_variant_pos_external ON product_variant(pos_external_id);
CREATE INDEX idx_audit_variant ON stock_adjustment_audit(variant_id);
