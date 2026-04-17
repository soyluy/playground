package com.orderprocessor.infrastructure.repository;

import com.orderprocessor.domain.entity.Customer;
import com.orderprocessor.domain.entity.Order;
import com.orderprocessor.domain.enums.CustomerTier;
import com.orderprocessor.domain.enums.OrderStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase
class OrderRepositoryTest {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private TestEntityManager em;

    private Customer customer;

    @BeforeEach
    void setUp() {
        customer = Customer.builder()
                .email("tester@example.com")
                .firstName("T")
                .lastName("U")
                .tier(CustomerTier.STANDARD)
                .loyaltyPoints(0)
                .build();
        customer = customerRepository.save(customer);
    }

    @Test
    void findByOrderNumber_returnsOrder() {
        Order o = newOrder("ORD-A", OrderStatus.PENDING, new BigDecimal("100.00"));
        orderRepository.save(o);

        assertThat(orderRepository.findByOrderNumber("ORD-A")).isPresent();
    }

    @Test
    void findByStatus_filtersByStatus() {
        orderRepository.save(newOrder("ORD-B", OrderStatus.PENDING, new BigDecimal("10.00")));
        orderRepository.save(newOrder("ORD-C", OrderStatus.CONFIRMED, new BigDecimal("20.00")));

        List<Order> pending = orderRepository.findByStatus(OrderStatus.PENDING);
        assertThat(pending).extracting(Order::getOrderNumber).contains("ORD-B");
    }

    @Test
    void findPendingOrdersOlderThan_includesOldPending() {
        Order old = newOrder("ORD-OLD", OrderStatus.PENDING, BigDecimal.TEN);
        Order fresh = newOrder("ORD-NEW", OrderStatus.PENDING, BigDecimal.TEN);
        orderRepository.save(old);
        orderRepository.save(fresh);

        em.flush();

        List<Order> result = orderRepository.findPendingOrdersOlderThan(Instant.now().plus(1, ChronoUnit.MINUTES));
        assertThat(result).hasSize(2);
    }

    @Test
    void calculateRevenueByDateRange_sumsNonCancelledTotals() {
        Order a = newOrder("ORD-R1", OrderStatus.DELIVERED, new BigDecimal("100.00"));
        Order b = newOrder("ORD-R2", OrderStatus.DELIVERED, new BigDecimal("50.00"));
        Order c = newOrder("ORD-R3", OrderStatus.CANCELLED, new BigDecimal("999.00"));
        orderRepository.save(a);
        orderRepository.save(b);
        orderRepository.save(c);
        em.flush();

        BigDecimal revenue = orderRepository.calculateRevenueByDateRange(
                Instant.now().minus(1, ChronoUnit.DAYS),
                Instant.now().plus(1, ChronoUnit.DAYS));
        assertThat(revenue).isEqualByComparingTo("150.00");
    }

    private Order newOrder(String number, OrderStatus status, BigDecimal total) {
        return Order.builder()
                .orderNumber(number)
                .customer(customer)
                .status(status)
                .subtotal(total)
                .taxAmount(BigDecimal.ZERO)
                .shippingCost(BigDecimal.ZERO)
                .totalAmount(total)
                .build();
    }
}
