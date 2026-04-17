package com.orderprocessor.application.eventhandler;

import com.orderprocessor.application.service.AuditService;
import com.orderprocessor.application.service.NotificationService;
import com.orderprocessor.domain.event.OrderCancelledEvent;
import com.orderprocessor.domain.event.OrderConfirmedEvent;
import com.orderprocessor.domain.event.OrderCreatedEvent;
import com.orderprocessor.domain.event.OrderShippedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventHandler {

    private final NotificationService notificationService;
    private final AuditService auditService;

    @Async
    @EventListener
    public void handleOrderCreated(OrderCreatedEvent event) {
        log.info("order created: {}", event.getOrder().getOrderNumber());
        notificationService.sendOrderConfirmation(event.getOrder());
        auditService.logEntityChange(
                "Order",
                event.getOrder().getId(),
                "CREATED",
                event.getOrder().getCustomer().getEmail(),
                "order " + event.getOrder().getOrderNumber());
    }

    @Async
    @EventListener
    public void handleOrderConfirmed(OrderConfirmedEvent event) {
        log.info("order confirmed: {}", event.getOrderNumber());
        auditService.logEntityChange(
                "Order",
                event.getOrderId(),
                "CONFIRMED",
                null,
                "status=CONFIRMED");
    }

    @Async
    @EventListener
    public void handleOrderShipped(OrderShippedEvent event) {
        log.info("order shipped: {}", event.getOrderNumber());
        auditService.logEntityChange(
                "Order",
                event.getOrderId(),
                "SHIPPED",
                null,
                "tracking=" + event.getTrackingNumber());
    }

    @EventListener
    public void handleOrderCancelled(OrderCancelledEvent event) {
        log.info("order cancelled: {}", event.getOrderNumber());
        auditService.logEntityChange(
                "Order",
                event.getOrderId(),
                "CANCELLED",
                null,
                "reason=" + event.getReason());
    }
}
