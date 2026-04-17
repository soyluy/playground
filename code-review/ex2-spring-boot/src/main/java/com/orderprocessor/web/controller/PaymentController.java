package com.orderprocessor.web.controller;

import com.orderprocessor.application.service.PaymentService;
import com.orderprocessor.domain.entity.Payment;
import com.orderprocessor.domain.enums.PaymentStatus;
import com.orderprocessor.web.dto.request.InitiatePaymentRequest;
import com.orderprocessor.web.dto.response.PaymentResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("isAuthenticated()")
    public PaymentResponse initiate(@Valid @RequestBody InitiatePaymentRequest request) {
        Payment p = paymentService.initiatePayment(request.getOrderId(), request.getMethod(), request.getCurrency());
        return toResponse(p);
    }

    @PostMapping("/{id}/process")
    @PreAuthorize("isAuthenticated()")
    public PaymentResponse process(@PathVariable UUID id) {
        return toResponse(paymentService.processPayment(id));
    }

    @PostMapping("/{id}/refund")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPORT')")
    public PaymentResponse refund(@PathVariable UUID id) {
        return toResponse(paymentService.refundPayment(id));
    }

    @GetMapping("/{id}/status")
    @PreAuthorize("isAuthenticated()")
    public PaymentStatus status(@PathVariable UUID id) {
        return paymentService.getPaymentStatus(id);
    }

    @GetMapping("/by-order/{orderId}")
    @PreAuthorize("isAuthenticated()")
    public PaymentResponse byOrder(@PathVariable UUID orderId) {
        return toResponse(paymentService.getPaymentByOrderId(orderId));
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> webhook(@RequestBody Map<String, Object> payload) {
        paymentService.handleGatewayCallback(payload);
        return ResponseEntity.ok().build();
    }

    private PaymentResponse toResponse(Payment p) {
        return PaymentResponse.builder()
                .id(p.getId())
                .orderId(p.getOrder() == null ? null : p.getOrder().getId())
                .amount(p.getAmount())
                .currency(p.getCurrency())
                .method(p.getMethod())
                .status(p.getStatus())
                .transactionId(p.getTransactionId())
                .processedAt(p.getProcessedAt())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
