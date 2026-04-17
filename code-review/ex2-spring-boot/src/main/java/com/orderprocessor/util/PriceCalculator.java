package com.orderprocessor.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

public final class PriceCalculator {

    private PriceCalculator() {
    }

    public static BigDecimal round(BigDecimal value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }
        return value.setScale(2, RoundingMode.HALF_UP);
    }

    public static BigDecimal applyPercent(BigDecimal base, BigDecimal percent) {
        if (base == null || percent == null) {
            return base == null ? BigDecimal.ZERO : base;
        }
        BigDecimal factor = percent.divide(new BigDecimal("100"), 6, RoundingMode.HALF_UP);
        BigDecimal delta = base.multiply(factor);
        return round(base.add(delta));
    }

    public static BigDecimal applyDiscount(BigDecimal base, BigDecimal discountPercent) {
        if (base == null) {
            return BigDecimal.ZERO;
        }
        if (discountPercent == null || discountPercent.signum() == 0) {
            return round(base);
        }
        BigDecimal discount = base.multiply(discountPercent);
        return round(base.subtract(discount));
    }

    public static BigDecimal calculateTax(BigDecimal base, BigDecimal rate) {
        if (base == null || rate == null) {
            return BigDecimal.ZERO;
        }
        return round(base.multiply(rate));
    }

    public static BigDecimal sum(BigDecimal... values) {
        BigDecimal total = BigDecimal.ZERO;
        for (BigDecimal v : values) {
            if (v != null) {
                total = total.add(v);
            }
        }
        return round(total);
    }
}
