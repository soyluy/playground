package com.orderprocessor.domain.exception;

import com.orderprocessor.domain.enums.OrderStatus;
import lombok.Getter;

@Getter
public class InvalidOrderStatusTransitionException extends DomainException {

    private final OrderStatus from;
    private final OrderStatus to;

    public InvalidOrderStatusTransitionException(OrderStatus from, OrderStatus to) {
        super("Invalid order status transition: " + from + " -> " + to);
        this.from = from;
        this.to = to;
    }
}
