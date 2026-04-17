package com.orderprocessor.domain.entity;

import com.orderprocessor.domain.enums.OrderStatus;
import com.orderprocessor.domain.exception.InvalidOrderStatusTransitionException;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@ToString(callSuper = true, exclude = {"customer", "items"})
@Entity
@Table(name = "orders")
public class Order extends BaseEntity {

    private static final BigDecimal TAX_RATE = new BigDecimal("0.08");

    @NotBlank
    @EqualsAndHashCode.Include
    @Column(name = "order_number", nullable = false, unique = true, length = 40)
    private String orderNumber;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;

    @Embedded
    private Address shippingAddress;

    @Column(name = "subtotal", precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "tax_amount", precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "shipping_cost", precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal shippingCost = BigDecimal.ZERO;

    @Column(name = "total_amount", precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "notes", length = 1000)
    private String notes;

    public void addItem(OrderItem item) {
        item.setOrder(this);
        items.add(item);
    }

    public void removeItem(OrderItem item) {
        Iterator<OrderItem> it = items.iterator();
        while (it.hasNext()) {
            OrderItem current = it.next();
            if (current.equals(item)) {
                it.remove();
                break;
            }
        }
    }

    public void calculateTotals() {
        BigDecimal sub = BigDecimal.ZERO;
        for (OrderItem it : items) {
            if (it.getSubtotal() != null) {
                sub = sub.add(it.getSubtotal());
            }
        }
        this.subtotal = sub.setScale(2, RoundingMode.HALF_UP);
        this.taxAmount = this.subtotal.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal ship = shippingCost != null ? shippingCost : BigDecimal.ZERO;
        this.totalAmount = this.subtotal.add(this.taxAmount).add(ship).setScale(2, RoundingMode.HALF_UP);
    }

    public void confirm() {
        transitionTo(OrderStatus.CONFIRMED);
    }

    public void ship() {
        transitionTo(OrderStatus.SHIPPED);
    }

    public void deliver() {
        transitionTo(OrderStatus.DELIVERED);
    }

    public void cancel() {
        transitionTo(OrderStatus.CANCELLED);
    }

    private void transitionTo(OrderStatus target) {
        if (!status.isTransitionAllowed(target)) {
            throw new InvalidOrderStatusTransitionException(status, target);
        }
        this.status = target;
    }
}
