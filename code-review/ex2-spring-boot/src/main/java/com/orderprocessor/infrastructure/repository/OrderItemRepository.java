package com.orderprocessor.infrastructure.repository;

import com.orderprocessor.domain.entity.OrderItem;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {

    List<OrderItem> findByOrderId(UUID orderId);

    List<OrderItem> findByProductId(UUID productId);

    @Query("""
            select oi.product.id as productId, sum(oi.quantity) as totalQty
            from OrderItem oi
            where oi.order.createdAt >= :startDate and oi.order.createdAt <= :endDate
            group by oi.product.id
            order by sum(oi.quantity) desc
            """)
    List<Object[]> findTopSellingProducts(@Param("startDate") Instant startDate,
                                          @Param("endDate") Instant endDate,
                                          Pageable pageable);
}
