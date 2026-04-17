package com.orderprocessor.application.validator;

import com.orderprocessor.domain.entity.Product;
import com.orderprocessor.domain.exception.DomainException;
import com.orderprocessor.infrastructure.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class ProductValidator {

    private static final BigDecimal MAX_PRICE = new BigDecimal("1000000.00");

    private final ProductRepository productRepository;

    public void validateForCreate(Product product) {
        if (!StringUtils.hasText(product.getSku())) {
            throw new InvalidProductException("sku required");
        }
        if (productRepository.findBySku(product.getSku()).isPresent()) {
            throw new InvalidProductException("sku already exists");
        }
        validatePrice(product.getPrice());
        validateStock(product.getStockQuantity());
    }

    public void validateForUpdate(Product product) {
        if (!StringUtils.hasText(product.getSku())) {
            throw new InvalidProductException("sku required");
        }
        validatePrice(product.getPrice());
        validateStock(product.getStockQuantity());
    }

    public void validateStockAdjustment(int delta) {
        if (delta == 0) {
            throw new InvalidProductException("delta cannot be zero");
        }
    }

    private void validatePrice(BigDecimal price) {
        if (price == null || price.signum() < 0) {
            throw new InvalidProductException("price must be non-negative");
        }
        if (price.compareTo(MAX_PRICE) > 0) {
            throw new InvalidProductException("price exceeds maximum");
        }
    }

    private void validateStock(Integer stock) {
        if (stock == null || stock < 0) {
            throw new InvalidProductException("stock must be non-negative");
        }
    }

    public static class InvalidProductException extends DomainException {
        public InvalidProductException(String msg) {
            super(msg);
        }
    }
}
