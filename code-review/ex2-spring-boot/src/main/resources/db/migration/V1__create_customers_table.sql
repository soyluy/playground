CREATE TABLE customers (
    id              UUID PRIMARY KEY,
    email           VARCHAR(255) NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    phone           VARCHAR(30),
    street          VARCHAR(255),
    city            VARCHAR(120),
    state           VARCHAR(120),
    zip_code        VARCHAR(20),
    country         VARCHAR(2),
    loyalty_points  INTEGER NOT NULL DEFAULT 0,
    tier            VARCHAR(20) NOT NULL DEFAULT 'STANDARD',
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    version         INTEGER
);

CREATE UNIQUE INDEX idx_customers_email ON customers (email);
CREATE INDEX idx_customers_tier ON customers (tier);
CREATE INDEX idx_customers_last_first ON customers (last_name, first_name);
