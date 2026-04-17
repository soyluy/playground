package com.orderprocessor.web.mapper;

import com.orderprocessor.domain.entity.Product;
import com.orderprocessor.web.dto.request.CreateProductRequest;
import com.orderprocessor.web.dto.request.UpdateProductRequest;
import com.orderprocessor.web.dto.response.ProductResponse;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

    public Product toEntity(CreateProductRequest req) {
        return Product.builder()
                .sku(req.getSku())
                .name(req.getName())
                .description(req.getDescription())
                .price(req.getPrice())
                .stockQuantity(req.getStockQuantity())
                .category(req.getCategory())
                .active(req.getActive() == null ? true : req.getActive())
                .weight(req.getWeight())
                .build();
    }

    public Product toEntity(UpdateProductRequest req) {
        return Product.builder()
                .name(req.getName())
                .description(req.getDescription())
                .price(req.getPrice())
                .category(req.getCategory())
                .weight(req.getWeight())
                .build();
    }

    public ProductResponse toResponse(Product p) {
        String description = p.getDescription();
        if (description != null && description.length() > 500) {
            description = description.substring(0, 500);
        }
        return ProductResponse.builder()
                .id(p.getId())
                .sku(p.getSku())
                .name(p.getName())
                .description(description)
                .price(p.getPrice())
                .stockQuantity(p.getStockQuantity())
                .category(p.getCategory())
                .active(p.getActive())
                .weight(p.getWeight())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
