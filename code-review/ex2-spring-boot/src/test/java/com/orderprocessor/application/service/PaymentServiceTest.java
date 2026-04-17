package com.orderprocessor.application.service;

import com.orderprocessor.domain.entity.Customer;
import com.orderprocessor.domain.entity.Order;
import com.orderprocessor.domain.entity.Payment;
import com.orderprocessor.domain.enums.OrderStatus;
import com.orderprocessor.domain.enums.PaymentMethod;
import com.orderprocessor.domain.enums.PaymentStatus;
import com.orderprocessor.domain.exception.PaymentException;
import com.orderprocessor.infrastructure.external.PaymentGatewayClient;
import com.orderprocessor.infrastructure.external.PaymentGatewayClient.ChargeResponse;
import com.orderprocessor.infrastructure.external.PaymentGatewayClient.RefundResponse;
import com.orderprocessor.infrastructure.repository.OrderRepository;
import com.orderprocessor.infrastructure.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private PaymentGatewayClient gateway;
    @Mock
    private ApplicationEventPublisher publisher;

    @InjectMocks
    private PaymentService paymentService;

    private Order order;
    private Payment payment;

    @BeforeEach
    void setUp() {
        Customer c = Customer.builder().email("b@e.com").firstName("B").lastName("E").build();
        c.setId(UUID.randomUUID());

        order = Order.builder()
                .orderNumber("ORD-1")
                .customer(c)
                .status(OrderStatus.PENDING)
                .totalAmount(new BigDecimal("25.00"))
                .build();
        order.setId(UUID.randomUUID());

        payment = Payment.builder()
                .order(order)
                .amount(order.getTotalAmount())
                .currency("USD")
                .method(PaymentMethod.CREDIT_CARD)
                .status(PaymentStatus.PENDING)
                .build();
        payment.setId(UUID.randomUUID());
    }

    @Test
    void initiatePayment_createsPendingPayment() {
        when(orderRepository.findById(order.getId())).thenReturn(Optional.of(order));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> i.getArgument(0));

        Payment p = paymentService.initiatePayment(order.getId(), PaymentMethod.CREDIT_CARD, "USD");

        assertThat(p.getStatus()).isEqualTo(PaymentStatus.PENDING);
        assertThat(p.getAmount()).isEqualByComparingTo("25.00");
    }

    @Test
    void processPayment_successStoresTransactionAndPublishesEvent() {
        when(paymentRepository.findById(payment.getId())).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> i.getArgument(0));
        when(gateway.charge(any())).thenReturn(ChargeResponse.builder()
                .success(true)
                .transactionId("txn_1")
                .raw("{\"status\":\"OK\"}")
                .build());

        Payment p = paymentService.processPayment(payment.getId());

        assertThat(p.getStatus()).isEqualTo(PaymentStatus.COMPLETED);
        assertThat(p.getTransactionId()).isEqualTo("txn_1");
        verify(publisher).publishEvent(any());
    }

    @Test
    void processPayment_retriesOnFailure() {
        when(paymentRepository.findById(payment.getId())).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> i.getArgument(0));
        when(gateway.charge(any()))
                .thenReturn(ChargeResponse.builder().success(false).raw("FAIL").build())
                .thenReturn(ChargeResponse.builder().success(false).raw("FAIL").build())
                .thenReturn(ChargeResponse.builder().success(true).transactionId("txn_ok").raw("OK").build());

        Payment p = paymentService.processPayment(payment.getId());

        assertThat(p.getStatus()).isEqualTo(PaymentStatus.COMPLETED);
        assertThat(p.getTransactionId()).isEqualTo("txn_ok");
    }

    @Test
    void refundPayment_rejectsNonCompleted() {
        when(paymentRepository.findById(payment.getId())).thenReturn(Optional.of(payment));

        assertThatThrownBy(() -> paymentService.refundPayment(payment.getId()))
                .isInstanceOf(PaymentException.class);
    }

    @Test
    void refundPayment_marksRefundedOnSuccess() {
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setTransactionId("txn_1");
        when(paymentRepository.findById(payment.getId())).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> i.getArgument(0));
        when(gateway.refund(any(), any())).thenReturn(RefundResponse.builder()
                .success(true).refundId("rfd_1").build());

        Payment p = paymentService.refundPayment(payment.getId());
        assertThat(p.getStatus()).isEqualTo(PaymentStatus.REFUNDED);
    }
}
