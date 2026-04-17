package com.orderprocessor.infrastructure.repository;

import com.orderprocessor.domain.entity.Payment;
import com.orderprocessor.domain.enums.PaymentStatus;
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
public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    Optional<Payment> findByOrderId(UUID orderId);

    Optional<Payment> findByTransactionId(String transactionId);

    List<Payment> findByStatus(PaymentStatus status);

    @Query("""
            select p from Payment p
            where p.status = com.orderprocessor.domain.enums.PaymentStatus.FAILED
              and p.processedAt > :after
            """)
    List<Payment> findFailedPaymentsAfter(@Param("after") Instant after);

    @Query("""
            select coalesce(sum(p.amount), 0) from Payment p
            where p.status = com.orderprocessor.domain.enums.PaymentStatus.COMPLETED
              and p.processedAt between :from and :to
            """)
    BigDecimal sumCompletedPaymentsForPeriod(@Param("from") Instant from, @Param("to") Instant to);
}
