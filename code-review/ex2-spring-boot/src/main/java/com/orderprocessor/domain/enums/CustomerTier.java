package com.orderprocessor.domain.enums;

import java.math.BigDecimal;

public enum CustomerTier {

    STANDARD(new BigDecimal("0.00")),
    SILVER(new BigDecimal("0.05")),
    GOLD(new BigDecimal("0.10")),
    PLATINUM(new BigDecimal("0.15"));

    private final BigDecimal discount;

    CustomerTier(BigDecimal discount) {
        this.discount = discount;
    }

    public BigDecimal getDiscount() {
        return discount;
    }
}
