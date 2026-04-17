package com.orderprocessor.domain.exception;

import lombok.Getter;

@Getter
public class InsufficientStockException extends DomainException {

    private final String sku;
    private final int requested;
    private final int available;

    public InsufficientStockException(String sku, int requested, int available) {
        super("Insufficient stock for sku=" + sku + " requested=" + requested + " available=" + available);
        this.sku = sku;
        this.requested = requested;
        this.available = available;
    }
}
