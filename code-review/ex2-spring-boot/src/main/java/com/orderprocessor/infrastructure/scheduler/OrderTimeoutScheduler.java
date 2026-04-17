package com.orderprocessor.infrastructure.scheduler;

import com.orderprocessor.application.service.NotificationService;
import com.orderprocessor.domain.entity.Order;
import com.orderprocessor.domain.entity.OrderItem;
import com.orderprocessor.domain.enums.OrderStatus;
import com.orderprocessor.infrastructure.repository.OrderRepository;
import com.orderprocessor.infrastructure.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderTimeoutScheduler {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final NotificationService notificationService;

    @Value("${app.scheduler.order-timeout-minutes:30}")
    private int timeoutMinutes;

    @Scheduled(fixedDelayString = "${app.scheduler.order-timeout-check-ms:60000}")
    @Transactional
    public void cancelStalePendingOrders() {
        Instant cutoff = Instant.now().minus(timeoutMinutes, ChronoUnit.MINUTES);
        List<Order> stale = orderRepository.findPendingOrdersOlderThan(cutoff);
        log.info("found {} stale pending orders", stale.size());

        for (Order order : stale) {
            if (order.getStatus() != OrderStatus.PENDING) {
                continue;
            }
            order.cancel();

            for (OrderItem item : order.getItems()) {
                var p = item.getProduct();
                p.releaseStock(item.getQuantity());
                productRepository.save(p);
            }
            orderRepository.save(order);
            notificationService.sendCancellationNotification(order, "timeout");
        }
    }
}
