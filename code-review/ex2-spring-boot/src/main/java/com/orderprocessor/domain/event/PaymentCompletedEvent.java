package com.orderprocessor.domain.event;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class PaymentCompletedEvent {
    UUID paymentId;
    UUID orderId;
    BigDecimal amount;
    String currency;
    String transactionId;
    Instant occurredAt;
}
