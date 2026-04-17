package com.orderprocessor.application.service;

import com.orderprocessor.domain.entity.Customer;
import com.orderprocessor.domain.entity.Product;
import com.orderprocessor.domain.enums.CustomerTier;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class PricingServiceTest {

    private PricingService pricingService;

    @BeforeEach
    void setUp() {
        pricingService = new PricingService();
        ReflectionTestUtils.setField(pricingService, "activePromoCode", "SAVE10");
        ReflectionTestUtils.setField(pricingService, "promoPercent", new BigDecimal("0.10"));
    }

    @Test
    void calculateItemPrice_subtractsDiscount() {
        Product p = Product.builder().price(new BigDecimal("10.00")).build();
        BigDecimal result = pricingService.calculateItemPrice(p, 3, new BigDecimal("2.00"));
        assertThat(result).isEqualByComparingTo("28.00");
    }

    @Test
    void applyCustomerDiscount_standardTierUnchanged() {
        Customer c = Customer.builder().tier(CustomerTier.STANDARD).build();
        BigDecimal result = pricingService.applyCustomerDiscount(new BigDecimal("100.00"), c);
        assertThat(result).isEqualByComparingTo("100.00");
    }

    @Test
    void applyCustomerDiscount_goldTierGivesTenPercent() {
        Customer c = Customer.builder().tier(CustomerTier.GOLD).build();
        BigDecimal result = pricingService.applyCustomerDiscount(new BigDecimal("100.00"), c);
        assertThat(result).isEqualByComparingTo("90.00");
    }

    @Test
    void applyCustomerDiscount_platinumTierGivesFifteenPercent() {
        Customer c = Customer.builder().tier(CustomerTier.PLATINUM).build();
        BigDecimal result = pricingService.applyCustomerDiscount(new BigDecimal("200.00"), c);
        assertThat(result).isEqualByComparingTo("170.00");
    }

    @Test
    void calculateTax_appliesEightPercent() {
        BigDecimal result = pricingService.calculateTax(new BigDecimal("50.00"));
        assertThat(result).isEqualByComparingTo("4.00");
    }

    @Test
    void calculateShipping_freeAboveThreshold() {
        BigDecimal result = pricingService.calculateShipping(new BigDecimal("100.00"), BigDecimal.ZERO);
        assertThat(result).isEqualByComparingTo("0.00");
    }

    @Test
    void calculateShipping_flatBelowThreshold() {
        BigDecimal result = pricingService.calculateShipping(new BigDecimal("40.00"), new BigDecimal("2.00"));
        assertThat(result).isEqualByComparingTo("7.99");
    }

    @Test
    void calculateShipping_heavierItemsIncurSurcharge() {
        BigDecimal result = pricingService.calculateShipping(new BigDecimal("40.00"), new BigDecimal("8.00"));
        assertThat(result).isEqualByComparingTo("12.49");
    }

    @Test
    void applyPromotionalDiscount_matchingCodeReducesSubtotal() {
        BigDecimal result = pricingService.applyPromotionalDiscount(new BigDecimal("100.00"), "save10");
        assertThat(result).isEqualByComparingTo("90.00");
    }

    @Test
    void applyPromotionalDiscount_missingCodeReturnsSubtotal() {
        BigDecimal result = pricingService.applyPromotionalDiscount(new BigDecimal("100.00"), null);
        assertThat(result).isEqualByComparingTo("100.00");
    }
}
