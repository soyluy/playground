package com.orderprocessor.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.concurrent.ThreadLocalRandom;

@Component
public class OrderNumberGenerator {

    @Value("${app.order.prefix:ORD}")
    private String prefix;

    public String generate() {
        long ts = Instant.now().toEpochMilli();
        int suffix = ThreadLocalRandom.current().nextInt(0, 10_000);
        return prefix + "-" + ts + "-" + String.format("%04d", suffix);
    }
}
