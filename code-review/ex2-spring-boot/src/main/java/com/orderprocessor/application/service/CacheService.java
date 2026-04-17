package com.orderprocessor.application.service;

import com.orderprocessor.infrastructure.config.CacheConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CacheService {

    private final CacheManager cacheManager;

    public void evictProduct(UUID productId) {
        Cache c = cacheManager.getCache(CacheConfig.PRODUCTS);
        if (c != null) {
            c.evict(productId);
        }
    }

    public void evictCustomer(UUID customerId) {
        Cache c = cacheManager.getCache(CacheConfig.CUSTOMERS);
        if (c != null) {
            c.evict(customerId);
        }
    }

    public void evictOrder(UUID orderId) {
        Cache c = cacheManager.getCache(CacheConfig.ORDER_SUMMARIES);
        if (c != null) {
            c.evict(orderId);
        }
    }

    public void evictAll() {
        for (String name : cacheManager.getCacheNames()) {
            Cache c = cacheManager.getCache(name);
            if (c != null) {
                c.clear();
            }
        }
    }
}
