package com.orderprocessor.domain.exception;

import java.util.UUID;

public class OrderNotFoundException extends DomainException {

    public OrderNotFoundException(UUID id) {
        super("Order not found: " + id);
    }

    public OrderNotFoundException(String orderNumber) {
        super("Order not found: " + orderNumber);
    }
}
