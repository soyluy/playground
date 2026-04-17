package com.orderprocessor.application.validator;

import com.orderprocessor.domain.entity.Order;
import com.orderprocessor.domain.entity.OrderItem;
import com.orderprocessor.domain.entity.Product;
import com.orderprocessor.domain.enums.OrderStatus;
import com.orderprocessor.domain.exception.DomainException;
import com.orderprocessor.domain.exception.InsufficientStockException;
import com.orderprocessor.domain.exception.InvalidOrderStatusTransitionException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OrderValidator {

    public void validateForCreate(Order order) {
        if (order.getCustomer() == null) {
            throw new InvalidOrderException("customer required");
        }
        if (order.getItems() == null || order.getItems().isEmpty()) {
            throw new InvalidOrderException("order must have at least one item");
        }
        for (OrderItem it : order.getItems()) {
            if (it.getQuantity() == null || it.getQuantity() <= 0) {
                throw new InvalidOrderException("item quantity must be positive");
            }
        }
    }

    public void validateTransition(OrderStatus from, OrderStatus to) {
        if (!from.isTransitionAllowed(to)) {
            throw new InvalidOrderStatusTransitionException(from, to);
        }
    }

    public void validateStockAvailability(Product product, int requested) {
        if (product.getStockQuantity() == null || product.getStockQuantity() < requested) {
            int avail = product.getStockQuantity() == null ? 0 : product.getStockQuantity();
            throw new InsufficientStockException(product.getSku(), requested, avail);
        }
    }

    public static class InvalidOrderException extends DomainException {
        public InvalidOrderException(String msg) {
            super(msg);
        }
    }
}
