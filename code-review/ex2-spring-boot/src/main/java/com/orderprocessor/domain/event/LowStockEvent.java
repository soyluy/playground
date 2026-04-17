package com.orderprocessor.domain.event;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class LowStockEvent {
    UUID productId;
    String sku;
    int currentStock;
    int threshold;
    Instant occurredAt;
}
