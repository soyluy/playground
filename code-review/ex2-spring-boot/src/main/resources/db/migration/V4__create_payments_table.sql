CREATE TABLE payments (
    id                UUID PRIMARY KEY,
    order_id          UUID NOT NULL,
    amount            NUMERIC(14, 2) NOT NULL,
    currency          CHAR(3) NOT NULL,
    method            VARCHAR(30) NOT NULL,
    status            VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    transaction_id    VARCHAR(128),
    gateway_response  VARCHAR(4000),
    processed_at      TIMESTAMP WITH TIME ZONE,
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at        TIMESTAMP WITH TIME ZONE NOT NULL,
    version           INTEGER,

    CONSTRAINT uq_payments_order UNIQUE (order_id),
    CONSTRAINT uq_payments_txn UNIQUE (transaction_id),
    CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders (id),
    CONSTRAINT ck_payments_amount_nonneg CHECK (amount >= 0)
);

CREATE INDEX idx_payments_status ON payments (status);
CREATE INDEX idx_payments_processed_at ON payments (processed_at);
