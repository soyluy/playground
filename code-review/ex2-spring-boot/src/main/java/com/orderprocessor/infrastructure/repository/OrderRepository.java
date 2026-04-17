package com.orderprocessor.infrastructure.repository;

import com.orderprocessor.domain.entity.Order;
import com.orderprocessor.domain.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    Optional<Order> findByOrderNumber(String orderNumber);

    List<Order> findByCustomerId(UUID customerId);

    List<Order> findByStatus(OrderStatus status);

    @Query("select o from Order o where o.createdAt >= :from and o.createdAt <= :to")
    List<Order> findOrdersWithinDateRange(@Param("from") Instant from, @Param("to") Instant to);

    @Query("""
            select o from Order o
            where o.status = com.orderprocessor.domain.enums.OrderStatus.PENDING
              and o.createdAt < :cutoff
            """)
    List<Order> findPendingOrdersOlderThan(@Param("cutoff") Instant cutoff);

    long countByStatusAndCreatedAtAfter(OrderStatus status, Instant after);

    @Query(value = """
            select coalesce(sum(total_amount), 0)
            from orders
            where created_at >= :from and created_at <= :to
              and status <> 'CANCELLED'
            """, nativeQuery = true)
    BigDecimal calculateRevenueByDateRange(@Param("from") Instant from, @Param("to") Instant to);
}
