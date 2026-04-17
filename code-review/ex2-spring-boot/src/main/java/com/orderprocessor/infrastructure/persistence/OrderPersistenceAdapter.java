package com.orderprocessor.infrastructure.persistence;

import com.orderprocessor.application.port.OrderPort;
import com.orderprocessor.domain.entity.Order;
import com.orderprocessor.domain.enums.OrderStatus;
import com.orderprocessor.infrastructure.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderPersistenceAdapter implements OrderPort {

    private final OrderRepository repo;

    @Override
    @Transactional
    public Order save(Order order) {
        return repo.save(order);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Order> findById(UUID id) {
        return repo.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Order> findByOrderNumber(String orderNumber) {
        return repo.findByOrderNumber(orderNumber);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> findByCustomer(UUID customerId) {
        return repo.findByCustomerId(customerId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> findByStatus(OrderStatus status) {
        return repo.findByStatus(status);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> findPendingOlderThan(int minutes) {
        Instant cutoff = Instant.now().minus(minutes, ChronoUnit.MINUTES);
        return repo.findPendingOrdersOlderThan(cutoff);
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal revenueBetween(Instant from, Instant to) {
        BigDecimal v = repo.calculateRevenueByDateRange(from, to);
        return v == null ? BigDecimal.ZERO : v;
    }
}
