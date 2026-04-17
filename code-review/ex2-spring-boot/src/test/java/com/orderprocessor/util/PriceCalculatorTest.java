package com.orderprocessor.util;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class PriceCalculatorTest {

    @Test
    void round_halfUpToTwoScale() {
        assertThat(PriceCalculator.round(new BigDecimal("1.235"))).isEqualByComparingTo("1.24");
        assertThat(PriceCalculator.round(new BigDecimal("1.234"))).isEqualByComparingTo("1.23");
    }

    @Test
    void round_nullReturnsZero() {
        assertThat(PriceCalculator.round(null)).isEqualByComparingTo("0");
    }

    @Test
    void applyPercent_addsPercentage() {
        BigDecimal result = PriceCalculator.applyPercent(new BigDecimal("100.00"), new BigDecimal("8.00"));
        assertThat(result).isEqualByComparingTo("108.00");
    }

    @Test
    void applyDiscount_reducesByPercent() {
        BigDecimal result = PriceCalculator.applyDiscount(new BigDecimal("100.00"), new BigDecimal("0.15"));
        assertThat(result).isEqualByComparingTo("85.00");
    }

    @Test
    void applyDiscount_zeroPercentUnchanged() {
        BigDecimal result = PriceCalculator.applyDiscount(new BigDecimal("42.42"), BigDecimal.ZERO);
        assertThat(result).isEqualByComparingTo("42.42");
    }

    @Test
    void calculateTax_multipliesByRate() {
        BigDecimal result = PriceCalculator.calculateTax(new BigDecimal("200.00"), new BigDecimal("0.08"));
        assertThat(result).isEqualByComparingTo("16.00");
    }

    @Test
    void sum_addsAllNonNullValues() {
        BigDecimal result = PriceCalculator.sum(
                new BigDecimal("10.00"),
                null,
                new BigDecimal("5.50"));
        assertThat(result).isEqualByComparingTo("15.50");
    }

    @Test
    void taxOnDiscountedPrice_combinesCorrectly() {
        BigDecimal discounted = PriceCalculator.applyDiscount(new BigDecimal("100.00"), new BigDecimal("0.10"));
        BigDecimal tax = PriceCalculator.calculateTax(discounted, new BigDecimal("0.08"));
        assertThat(discounted.add(tax)).isEqualByComparingTo("97.20");
    }
}
