package com.orderprocessor.domain.event;

import com.orderprocessor.domain.entity.Order;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
public class OrderCreatedEvent {

    private final Order order;
    private final Instant occurredAt;
}
