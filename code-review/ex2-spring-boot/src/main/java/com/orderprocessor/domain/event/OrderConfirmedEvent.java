package com.orderprocessor.domain.event;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class OrderConfirmedEvent {
    UUID orderId;
    String orderNumber;
    UUID customerId;
    Instant occurredAt;
}
