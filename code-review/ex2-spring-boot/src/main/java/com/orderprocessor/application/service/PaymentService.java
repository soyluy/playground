package com.orderprocessor.application.service;

import com.orderprocessor.domain.entity.Order;
import com.orderprocessor.domain.entity.Payment;
import com.orderprocessor.domain.enums.PaymentMethod;
import com.orderprocessor.domain.enums.PaymentStatus;
import com.orderprocessor.domain.event.PaymentCompletedEvent;
import com.orderprocessor.domain.exception.OrderNotFoundException;
import com.orderprocessor.domain.exception.PaymentException;
import com.orderprocessor.infrastructure.external.PaymentGatewayClient;
import com.orderprocessor.infrastructure.external.PaymentGatewayClient.ChargeRequest;
import com.orderprocessor.infrastructure.external.PaymentGatewayClient.ChargeResponse;
import com.orderprocessor.infrastructure.repository.OrderRepository;
import com.orderprocessor.infrastructure.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private static final int MAX_RETRIES = 3;

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final PaymentGatewayClient gateway;
    private final ApplicationEventPublisher publisher;

    @Transactional
    public Payment initiatePayment(UUID orderId, PaymentMethod method, String currency) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        Payment payment = Payment.builder()
                .order(order)
                .amount(order.getTotalAmount())
                .currency(currency)
                .method(method)
                .status(PaymentStatus.PENDING)
                .build();
        return paymentRepository.save(payment);
    }

    @Transactional
    public Payment processPayment(UUID paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new PaymentException("payment not found: " + paymentId));

        payment.setStatus(PaymentStatus.PROCESSING);
        paymentRepository.save(payment);

        ChargeResponse resp = null;
        PaymentException lastError = null;
        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                resp = gateway.charge(ChargeRequest.builder()
                        .amount(payment.getAmount())
                        .currency(payment.getCurrency())
                        .method(payment.getMethod())
                        .reference(payment.getOrder().getOrderNumber())
                        .orderId(payment.getOrder().getId())
                        .build());
                if (resp.isSuccess()) {
                    break;
                }
            } catch (PaymentException ex) {
                lastError = ex;
                log.warn("charge attempt {} failed: {}", attempt, ex.getMessage());
            }
        }

        if (resp != null && resp.isSuccess()) {
            payment.setTransactionId(resp.getTransactionId());
            payment.setGatewayResponse(resp.getRaw());
            payment.setStatus(PaymentStatus.COMPLETED);
            payment.setProcessedAt(Instant.now());
            Payment saved = paymentRepository.save(payment);
            publisher.publishEvent(PaymentCompletedEvent.builder()
                    .paymentId(saved.getId())
                    .orderId(saved.getOrder().getId())
                    .amount(saved.getAmount())
                    .currency(saved.getCurrency())
                    .transactionId(saved.getTransactionId())
                    .occurredAt(Instant.now())
                    .build());
            return saved;
        }

        payment.setStatus(PaymentStatus.FAILED);
        payment.setProcessedAt(Instant.now());
        payment.setGatewayResponse(resp == null ? "no response" : resp.getRaw());
        paymentRepository.save(payment);
        if (lastError != null) {
            throw lastError;
        }
        throw new PaymentException("payment failed after " + MAX_RETRIES + " attempts");
    }

    @Transactional
    public Payment confirmPayment(UUID paymentId, String externalTxn) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new PaymentException("payment not found"));
        payment.setTransactionId(externalTxn);
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setProcessedAt(Instant.now());
        return paymentRepository.save(payment);
    }

    @Transactional
    public Payment refundPayment(UUID paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new PaymentException("payment not found"));
        if (payment.getStatus() != PaymentStatus.COMPLETED) {
            throw new PaymentException("only completed payments can be refunded");
        }
        var resp = gateway.refund(payment.getTransactionId(), payment.getAmount());
        if (!resp.isSuccess()) {
            throw new PaymentException("refund failed at gateway");
        }
        payment.setStatus(PaymentStatus.REFUNDED);
        return paymentRepository.save(payment);
    }

    @Transactional(readOnly = true)
    public Payment getPaymentByOrderId(UUID orderId) {
        return paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new PaymentException("payment not found for order " + orderId));
    }

    @Transactional(readOnly = true)
    public PaymentStatus getPaymentStatus(UUID paymentId) {
        return paymentRepository.findById(paymentId)
                .map(Payment::getStatus)
                .orElseThrow(() -> new PaymentException("payment not found"));
    }

    @Transactional
    public void handleGatewayCallback(Map<String, Object> callback) {
        String txn = (String) callback.get("transactionId");
        String status = (String) callback.get("status");
        if (txn == null) {
            return;
        }
        paymentRepository.findByTransactionId(txn).ifPresent(p -> {
            if ("OK".equalsIgnoreCase(status)) {
                p.setStatus(PaymentStatus.COMPLETED);
                p.setProcessedAt(Instant.now());
            } else if ("FAILED".equalsIgnoreCase(status)) {
                p.setStatus(PaymentStatus.FAILED);
            }
            paymentRepository.save(p);
        });
    }
}
