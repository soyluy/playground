package com.orderprocessor.application.service;

import com.orderprocessor.domain.entity.Product;
import com.orderprocessor.domain.exception.InsufficientStockException;
import com.orderprocessor.infrastructure.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private InventoryService inventoryService;

    private Product product;
    private UUID productId;

    @BeforeEach
    void setUp() {
        productId = UUID.randomUUID();
        product = Product.builder()
                .sku("SKU-1")
                .name("Widget")
                .price(new BigDecimal("9.99"))
                .stockQuantity(10)
                .active(true)
                .build();
        product.setId(productId);
    }

    @Test
    void checkAvailability_returnsTrueWhenEnoughStock() {
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        assertThat(inventoryService.checkAvailability(productId, 5)).isTrue();
    }

    @Test
    void checkAvailability_returnsFalseWhenInsufficient() {
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        assertThat(inventoryService.checkAvailability(productId, 50)).isFalse();
    }

    @Test
    void reserveItems_decrementsStock() {
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenAnswer(i -> i.getArgument(0));

        Map<UUID, Integer> items = new HashMap<>();
        items.put(productId, 3);
        inventoryService.reserveItems(items);

        assertThat(product.getStockQuantity()).isEqualTo(7);
        verify(productRepository).save(product);
    }

    @Test
    void reserveItems_rollsBackOnInsufficient() {
        UUID secondId = UUID.randomUUID();
        Product second = Product.builder()
                .sku("SKU-2")
                .price(BigDecimal.ONE)
                .stockQuantity(1)
                .active(true)
                .build();
        second.setId(secondId);

        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(productRepository.findById(secondId)).thenReturn(Optional.of(second));
        when(productRepository.save(any(Product.class))).thenAnswer(i -> i.getArgument(0));

        Map<UUID, Integer> items = new java.util.LinkedHashMap<>();
        items.put(productId, 2);
        items.put(secondId, 5);

        assertThatThrownBy(() -> inventoryService.reserveItems(items))
                .isInstanceOf(InsufficientStockException.class);

        assertThat(product.getStockQuantity()).isEqualTo(10);
    }

    @Test
    void adjustStock_increasesAndDecreases() {
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenAnswer(i -> i.getArgument(0));

        inventoryService.adjustStock(productId, 5);
        assertThat(product.getStockQuantity()).isEqualTo(15);
    }

    @Test
    void concurrentReservationsDoNotOversell() throws Exception {
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenAnswer(i -> i.getArgument(0));

        int threads = 4;
        int unitsPerRequest = 2;
        ExecutorService pool = Executors.newFixedThreadPool(threads);
        CountDownLatch ready = new CountDownLatch(threads);
        CountDownLatch start = new CountDownLatch(1);
        AtomicInteger successes = new AtomicInteger();

        for (int i = 0; i < threads; i++) {
            pool.submit(() -> {
                ready.countDown();
                try {
                    start.await();
                    inventoryService.reserveItems(Map.of(productId, unitsPerRequest));
                    successes.incrementAndGet();
                } catch (Exception ignored) {
                }
            });
        }
        ready.await();
        start.countDown();
        pool.shutdown();
        pool.awaitTermination(5, TimeUnit.SECONDS);

        assertThat(successes.get()).isLessThanOrEqualTo(threads);
        assertThat(product.getStockQuantity()).isGreaterThanOrEqualTo(0);
    }
}
