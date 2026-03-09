CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(32) UNIQUE,
    full_name VARCHAR(160) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'artisan', 'admin')),
    password_hash TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS artisans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    brand_name VARCHAR(180) NOT NULL,
    bio TEXT,
    village VARCHAR(120),
    district VARCHAR(120),
    state VARCHAR(120),
    country VARCHAR(120) NOT NULL DEFAULT 'India',
    verification_status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    onboarding_status VARCHAR(20) NOT NULL DEFAULT 'incomplete'
        CHECK (onboarding_status IN ('incomplete', 'in_review', 'completed')),
    rating NUMERIC(3,2) NOT NULL DEFAULT 0.00,
    total_sales BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artisan_id UUID NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
    title VARCHAR(160) NOT NULL,
    description TEXT,
    category VARCHAR(120) NOT NULL,
    craft_type VARCHAR(120),
    material VARCHAR(120),
    price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    currency CHAR(3) NOT NULL DEFAULT 'INR',
    inventory_count INTEGER NOT NULL DEFAULT 0 CHECK (inventory_count >= 0),
    ai_generated_copy JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(20) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    storage_key TEXT UNIQUE NOT NULL,
    cdn_url TEXT NOT NULL,
    mime_type VARCHAR(80),
    width INTEGER,
    height INTEGER,
    file_size_bytes BIGINT,
    sort_order SMALLINT NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    enhancement_status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (enhancement_status IN ('pending', 'processed', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (product_id, sort_order)
);

CREATE TABLE IF NOT EXISTS reels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artisan_id UUID NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    caption TEXT,
    storage_key TEXT UNIQUE NOT NULL,
    thumbnail_key TEXT,
    duration_seconds INTEGER NOT NULL CHECK (duration_seconds > 0),
    views INTEGER NOT NULL DEFAULT 0,
    likes INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'processing'
        CHECK (status IN ('processing', 'published', 'blocked')),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(32) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    artisan_id UUID NOT NULL REFERENCES artisans(id) ON DELETE RESTRICT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN (
            'pending',
            'confirmed',
            'shipped',
            'delivered'
        )),
    subtotal NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0),
    shipping_fee NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (shipping_fee >= 0),
    tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
    total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
    currency CHAR(3) NOT NULL DEFAULT 'INR',
    items_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb,
    shipping_address JSONB NOT NULL,
    placed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    delivered_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    provider VARCHAR(80) NOT NULL,
    provider_payment_id VARCHAR(120) UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'initiated'
        CHECK (status IN ('initiated', 'authorized', 'captured', 'failed', 'refunded')),
    amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    currency CHAR(3) NOT NULL DEFAULT 'INR',
    escrow_release_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS authenticity_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    issuer_type VARCHAR(20) NOT NULL
        CHECK (issuer_type IN ('artisan', 'admin', 'third_party', 'ai')),
    certificate_number VARCHAR(120) UNIQUE,
    evidence_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    blockchain_ref VARCHAR(255),
    verification_status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (verification_status IN ('pending', 'verified', 'disputed', 'rejected')),
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS logistics_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    courier_partner VARCHAR(120),
    tracking_number VARCHAR(120) UNIQUE,
    pickup_address JSONB NOT NULL,
    dropoff_address JSONB NOT NULL,
    route_status VARCHAR(24) NOT NULL DEFAULT 'planned'
        CHECK (route_status IN (
            'planned',
            'picked_up',
            'in_transit',
            'out_for_delivery',
            'delivered',
            'returned'
        )),
    estimated_delivery_date DATE,
    actual_delivery_at TIMESTAMPTZ,
    last_location JSONB,
    last_location_updated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_artisan_status
    ON products (artisan_id, status);

CREATE INDEX IF NOT EXISTS idx_reels_artisan_status_published
    ON reels (artisan_id, status, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_customer_status
    ON orders (customer_id, status, placed_at DESC);

CREATE INDEX IF NOT EXISTS idx_payments_status
    ON payments (status);

CREATE INDEX IF NOT EXISTS idx_auth_records_product_status
    ON authenticity_records (product_id, verification_status);

CREATE INDEX IF NOT EXISTS idx_logistics_order_status
    ON logistics_routes (order_id, route_status);

CREATE UNIQUE INDEX IF NOT EXISTS idx_product_images_primary
    ON product_images (product_id)
    WHERE is_primary = TRUE;
