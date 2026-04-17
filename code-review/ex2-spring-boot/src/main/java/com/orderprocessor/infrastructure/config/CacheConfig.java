package com.orderprocessor.infrastructure.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.List;

@Configuration
@EnableCaching
public class CacheConfig {

    public static final String PRODUCTS = "products";
    public static final String CUSTOMERS = "customers";
    public static final String ORDER_SUMMARIES = "orderSummaries";

    @Bean
    public CacheManager cacheManager() {
        CaffeineCache products = new CaffeineCache(PRODUCTS,
                Caffeine.newBuilder()
                        .maximumSize(5_000)
                        .expireAfterWrite(Duration.ofMinutes(30))
                        .recordStats()
                        .build());

        CaffeineCache customers = new CaffeineCache(CUSTOMERS,
                Caffeine.newBuilder()
                        .maximumSize(10_000)
                        .expireAfterWrite(Duration.ofMinutes(15))
                        .recordStats()
                        .build());

        CaffeineCache orderSummaries = new CaffeineCache(ORDER_SUMMARIES,
                Caffeine.newBuilder()
                        .maximumSize(20_000)
                        .expireAfterWrite(Duration.ofMinutes(5))
                        .recordStats()
                        .build());

        SimpleCacheManager mgr = new SimpleCacheManager();
        mgr.setCaches(List.of(products, customers, orderSummaries));
        return mgr;
    }
}
