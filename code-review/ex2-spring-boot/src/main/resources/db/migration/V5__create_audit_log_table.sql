CREATE TABLE audit_log (
    id            BIGSERIAL PRIMARY KEY,
    entity_type   VARCHAR(100) NOT NULL,
    entity_id     UUID NOT NULL,
    action        VARCHAR(20) NOT NULL,
    actor         VARCHAR(255),
    changes       TEXT,
    occurred_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_entity ON audit_log (entity_type, entity_id);
CREATE INDEX idx_audit_occurred_at ON audit_log (occurred_at);
