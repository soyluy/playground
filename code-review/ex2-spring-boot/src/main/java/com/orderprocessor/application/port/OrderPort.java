package com.orderprocessor.application.port;

import com.orderprocessor.domain.entity.Order;
import com.orderprocessor.domain.enums.OrderStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrderPort {

    Order save(Order order);

    Optional<Order> findById(UUID id);

    Optional<Order> findByOrderNumber(String orderNumber);

    List<Order> findByCustomer(UUID customerId);

    List<Order> findByStatus(OrderStatus status);

    List<Order> findPendingOlderThan(int minutes);

    BigDecimal revenueBetween(Instant from, Instant to);
}
