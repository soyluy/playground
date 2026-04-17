CREATE TABLE products (
    id              UUID PRIMARY KEY,
    sku             VARCHAR(64) NOT NULL,
    name            VARCHAR(255) NOT NULL,
    description     VARCHAR(2000),
    price           NUMERIC(12, 2) NOT NULL,
    stock_quantity  INTEGER NOT NULL,
    category        VARCHAR(30) NOT NULL,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    weight          NUMERIC(8, 3),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    version         INTEGER,

    CONSTRAINT uq_products_sku UNIQUE (sku),
    CONSTRAINT ck_products_price_nonneg CHECK (price >= 0),
    CONSTRAINT ck_products_stock_nonneg CHECK (stock_quantity >= 0)
);

CREATE INDEX idx_products_category ON products (category);
CREATE INDEX idx_products_active_stock ON products (active, stock_quantity);
CREATE INDEX idx_products_name ON products (name);
