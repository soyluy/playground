package com.orderprocessor.web.dto.response;

import com.orderprocessor.domain.enums.ProductCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {

    private UUID id;
    private String sku;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer stockQuantity;
    private ProductCategory category;
    private Boolean active;
    private BigDecimal weight;
    private Instant createdAt;
    private Instant updatedAt;
}
