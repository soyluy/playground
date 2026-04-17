package com.orderprocessor.domain.enums;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

public enum OrderStatus {

    PENDING,
    CONFIRMED,
    PROCESSING,
    SHIPPED,
    DELIVERED,
    CANCELLED,
    REFUNDED;

    private static final Map<OrderStatus, Set<OrderStatus>> ALLOWED = new EnumMap<>(OrderStatus.class);

    static {
        ALLOWED.put(PENDING, EnumSet.of(CONFIRMED, CANCELLED));
        ALLOWED.put(CONFIRMED, EnumSet.of(PROCESSING, CANCELLED));
        ALLOWED.put(PROCESSING, EnumSet.of(SHIPPED, CANCELLED));
        ALLOWED.put(SHIPPED, EnumSet.of(DELIVERED));
        ALLOWED.put(DELIVERED, EnumSet.of(REFUNDED));
        ALLOWED.put(CANCELLED, EnumSet.noneOf(OrderStatus.class));
        ALLOWED.put(REFUNDED, EnumSet.noneOf(OrderStatus.class));
    }

    public boolean isTransitionAllowed(OrderStatus target) {
        if (target == null) {
            return false;
        }
        Set<OrderStatus> next = ALLOWED.get(this);
        return next != null && next.contains(target);
    }

    public boolean isTerminal() {
        Set<OrderStatus> next = ALLOWED.get(this);
        return next == null || next.isEmpty();
    }
}
