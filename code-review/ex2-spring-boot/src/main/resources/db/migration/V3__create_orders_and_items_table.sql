CREATE TABLE orders (
    id                UUID PRIMARY KEY,
    order_number      VARCHAR(40) NOT NULL,
    customer_id       UUID NOT NULL,
    status            VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    street            VARCHAR(255),
    city              VARCHAR(120),
    state             VARCHAR(120),
    zip_code          VARCHAR(20),
    country           VARCHAR(2),
    subtotal          NUMERIC(14, 2) NOT NULL DEFAULT 0,
    tax_amount        NUMERIC(14, 2) NOT NULL DEFAULT 0,
    shipping_cost     NUMERIC(14, 2) NOT NULL DEFAULT 0,
    total_amount      NUMERIC(14, 2) NOT NULL DEFAULT 0,
    notes             VARCHAR(1000),
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at        TIMESTAMP WITH TIME ZONE NOT NULL,
    version           INTEGER,

    CONSTRAINT uq_orders_order_number UNIQUE (order_number),
    CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers (id)
);

CREATE INDEX idx_orders_customer_id ON orders (customer_id);
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_orders_created_at ON orders (created_at);
CREATE INDEX idx_orders_status_created_at ON orders (status, created_at);

CREATE TABLE order_items (
    id          UUID PRIMARY KEY,
    order_id    UUID NOT NULL,
    product_id  UUID NOT NULL,
    quantity    INTEGER NOT NULL,
    unit_price  NUMERIC(12, 2) NOT NULL,
    discount    NUMERIC(12, 2) DEFAULT 0,
    subtotal    NUMERIC(14, 2),
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL,
    version     INTEGER,

    CONSTRAINT fk_items_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    CONSTRAINT fk_items_product FOREIGN KEY (product_id) REFERENCES products (id),
    CONSTRAINT ck_items_qty_positive CHECK (quantity > 0)
);

CREATE INDEX idx_order_items_order_id ON order_items (order_id);
CREATE INDEX idx_order_items_product_id ON order_items (product_id);
