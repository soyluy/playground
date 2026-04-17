package com.orderprocessor.application.eventhandler;

import com.orderprocessor.application.service.AuditService;
import com.orderprocessor.application.service.NotificationService;
import com.orderprocessor.domain.entity.Order;
import com.orderprocessor.domain.entity.Payment;
import com.orderprocessor.domain.enums.OrderStatus;
import com.orderprocessor.domain.event.PaymentCompletedEvent;
import com.orderprocessor.infrastructure.repository.OrderRepository;
import com.orderprocessor.infrastructure.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentEventHandler {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    @Async
    @EventListener
    @Transactional
    public void handlePaymentCompleted(PaymentCompletedEvent event) {
        log.info("payment completed for order {}", event.getOrderId());

        Order order = orderRepository.findById(event.getOrderId()).orElse(null);
        if (order == null) {
            return;
        }
        if (order.getStatus() == OrderStatus.PENDING) {
            order.confirm();
            orderRepository.save(order);
        }

        Payment payment = paymentRepository.findById(event.getPaymentId()).orElse(null);
        if (payment != null) {
            notificationService.sendPaymentConfirmation(payment);
        }

        auditService.logEntityChange(
                "Payment",
                event.getPaymentId(),
                "COMPLETED",
                null,
                "txn=" + event.getTransactionId() + " amount=" + event.getAmount());
    }
}
