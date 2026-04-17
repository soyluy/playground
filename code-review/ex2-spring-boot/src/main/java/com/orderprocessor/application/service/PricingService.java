package com.orderprocessor.application.service;

import com.orderprocessor.domain.entity.Customer;
import com.orderprocessor.domain.entity.OrderItem;
import com.orderprocessor.domain.entity.Product;
import com.orderprocessor.domain.enums.CustomerTier;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Slf4j
@Service
public class PricingService {

    private static final BigDecimal TAX_RATE = new BigDecimal("0.08");
    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("75.00");
    private static final BigDecimal FLAT_SHIPPING = new BigDecimal("7.99");

    @Value("${app.pricing.promo-code:}")
    private String activePromoCode;

    @Value("${app.pricing.promo-percent:0.00}")
    private BigDecimal promoPercent;

    public BigDecimal calculateItemPrice(Product product, int quantity, BigDecimal discount) {
        BigDecimal base = product.getPrice().multiply(BigDecimal.valueOf(quantity));
        BigDecimal d = discount == null ? BigDecimal.ZERO : discount;
        return base.subtract(d).setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal applyCustomerDiscount(BigDecimal subtotal, Customer customer) {
        if (customer == null || customer.getTier() == null) {
            return subtotal;
        }
        CustomerTier tier = customer.getTier();
        BigDecimal discount = subtotal.multiply(tier.getDiscount());
        return subtotal.subtract(discount).setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal calculateTax(BigDecimal subtotal) {
        return subtotal.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal calculateShipping(BigDecimal subtotal, BigDecimal totalWeight) {
        if (subtotal.compareTo(FREE_SHIPPING_THRESHOLD) >= 0) {
            return BigDecimal.ZERO;
        }
        if (totalWeight != null && totalWeight.compareTo(BigDecimal.valueOf(5)) > 0) {
            BigDecimal extra = totalWeight.subtract(BigDecimal.valueOf(5))
                    .multiply(new BigDecimal("1.50"));
            return FLAT_SHIPPING.add(extra).setScale(2, RoundingMode.HALF_UP);
        }
        return FLAT_SHIPPING;
    }

    public BigDecimal applyPromotionalDiscount(BigDecimal subtotal, String promoCode) {
        if (promoCode == null || activePromoCode == null || activePromoCode.isEmpty()) {
            return subtotal;
        }
        if (!promoCode.equalsIgnoreCase(activePromoCode)) {
            return subtotal;
        }
        BigDecimal d = subtotal.multiply(promoPercent);
        return subtotal.subtract(d).setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal totalWeight(Iterable<OrderItem> items) {
        BigDecimal total = BigDecimal.ZERO;
        for (OrderItem it : items) {
            if (it.getProduct() != null && it.getProduct().getWeight() != null) {
                total = total.add(it.getProduct().getWeight()
                        .multiply(BigDecimal.valueOf(it.getQuantity())));
            }
        }
        return total;
    }
}
