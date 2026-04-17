package com.orderprocessor.application.service;

import com.orderprocessor.domain.entity.Product;
import com.orderprocessor.domain.exception.InsufficientStockException;
import com.orderprocessor.domain.exception.ProductNotFoundException;
import com.orderprocessor.infrastructure.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryService {

    private static final int LOW_STOCK_THRESHOLD = 10;

    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public boolean checkAvailability(UUID productId, int quantity) {
        Product p = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException(productId));
        return p.isInStock(quantity);
    }

    @Transactional
    public void reserveItems(Map<UUID, Integer> itemsByProductId) {
        Map<UUID, Integer> reserved = new LinkedHashMap<>();
        try {
            for (Map.Entry<UUID, Integer> e : itemsByProductId.entrySet()) {
                Product p = productRepository.findById(e.getKey())
                        .orElseThrow(() -> new ProductNotFoundException(e.getKey()));
                if (!p.isInStock(e.getValue())) {
                    throw new InsufficientStockException(p.getSku(), e.getValue(),
                            p.getStockQuantity() == null ? 0 : p.getStockQuantity());
                }
                p.reserveStock(e.getValue());
                productRepository.save(p);
                reserved.put(e.getKey(), e.getValue());
            }
        } catch (RuntimeException ex) {
            for (Map.Entry<UUID, Integer> r : reserved.entrySet()) {
                productRepository.findById(r.getKey()).ifPresent(p -> {
                    p.releaseStock(r.getValue());
                    productRepository.save(p);
                });
            }
            throw ex;
        }
    }

    @Transactional
    public void releaseItems(Map<UUID, Integer> itemsByProductId) {
        for (Map.Entry<UUID, Integer> e : itemsByProductId.entrySet()) {
            Product p = productRepository.findById(e.getKey())
                    .orElseThrow(() -> new ProductNotFoundException(e.getKey()));
            p.releaseStock(e.getValue());
            productRepository.save(p);
        }
    }

    @Transactional
    public void confirmReservation(Map<UUID, Integer> itemsByProductId) {
        log.info("confirming reservation of {} items", itemsByProductId.size());
    }

    @Transactional(readOnly = true)
    public int getStockLevel(UUID productId) {
        Product p = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException(productId));
        return p.getStockQuantity() == null ? 0 : p.getStockQuantity();
    }

    @Transactional
    public Product adjustStock(UUID productId, int delta) {
        Product p = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException(productId));
        int current = p.getStockQuantity() == null ? 0 : p.getStockQuantity();
        int next = current + delta;
        if (next < 0) {
            throw new InsufficientStockException(p.getSku(), Math.abs(delta), current);
        }
        p.setStockQuantity(next);
        return productRepository.save(p);
    }

    @Transactional(readOnly = true)
    public List<Product> getLowStockAlerts() {
        return productRepository.findLowStockProducts(LOW_STOCK_THRESHOLD);
    }
}
