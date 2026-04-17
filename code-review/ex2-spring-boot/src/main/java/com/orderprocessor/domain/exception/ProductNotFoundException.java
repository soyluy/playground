package com.orderprocessor.domain.exception;

import java.util.UUID;

public class ProductNotFoundException extends DomainException {

    public ProductNotFoundException(UUID id) {
        super("Product not found: " + id);
    }

    public ProductNotFoundException(String sku) {
        super("Product not found: " + sku);
    }
}
