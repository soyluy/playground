package com.orderprocessor.infrastructure.scheduler;

import com.orderprocessor.application.service.NotificationService;
import com.orderprocessor.domain.entity.Product;
import com.orderprocessor.domain.event.LowStockEvent;
import com.orderprocessor.infrastructure.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class InventoryReconciliationScheduler {

    private final ProductRepository productRepository;
    private final NotificationService notificationService;
    private final ApplicationEventPublisher publisher;

    @Value("${app.scheduler.low-stock-threshold:10}")
    private int lowStockThreshold;

    @Scheduled(cron = "${app.scheduler.inventory-cron:0 0 */1 * * *}")
    @Transactional
    public void reconcile() {
        List<Product> lowStock = productRepository.findLowStockProducts(lowStockThreshold);
        log.info("reconciliation: {} products below threshold {}", lowStock.size(), lowStockThreshold);

        for (Product p : lowStock) {
            notificationService.sendLowStockAlert(p);
            publisher.publishEvent(LowStockEvent.builder()
                    .productId(p.getId())
                    .sku(p.getSku())
                    .currentStock(p.getStockQuantity() == null ? 0 : p.getStockQuantity())
                    .threshold(lowStockThreshold)
                    .occurredAt(Instant.now())
                    .build());
        }
    }
}
