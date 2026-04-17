package com.orderprocessor.domain.entity;

import com.orderprocessor.domain.enums.ProductCategory;
import com.orderprocessor.domain.exception.InsufficientStockException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@ToString(callSuper = true)
@Entity
@Table(name = "products")
public class Product extends BaseEntity {

    @NotBlank
    @Size(max = 64)
    @EqualsAndHashCode.Include
    @Column(name = "sku", nullable = false, unique = true, length = 64)
    private String sku;

    @NotBlank
    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "description", length = 2000)
    private String description;

    @NotNull
    @DecimalMin(value = "0.00")
    @Column(name = "price", nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @NotNull
    @PositiveOrZero
    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 30)
    private ProductCategory category;

    @NotNull
    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean active = true;

    @DecimalMin(value = "0.0")
    @Column(name = "weight", precision = 8, scale = 3)
    private BigDecimal weight;

    public boolean isInStock() {
        return active && stockQuantity != null && stockQuantity > 0;
    }

    public boolean isInStock(int qty) {
        return active && stockQuantity != null && stockQuantity >= qty;
    }

    public void reserveStock(int qty) {
        if (qty <= 0) {
            throw new IllegalArgumentException("quantity must be positive");
        }
        if (stockQuantity == null || stockQuantity < qty) {
            throw new InsufficientStockException(sku, qty, stockQuantity == null ? 0 : stockQuantity);
        }
        stockQuantity -= qty;
    }

    public void releaseStock(int qty) {
        if (qty <= 0) {
            throw new IllegalArgumentException("quantity must be positive");
        }
        stockQuantity += qty;
    }
}
