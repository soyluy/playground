package com.orderprocessor.application.port;

import com.orderprocessor.domain.entity.Product;
import com.orderprocessor.domain.enums.ProductCategory;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProductPort {

    Product save(Product product);

    Optional<Product> findById(UUID id);

    Optional<Product> findBySku(String sku);

    List<Product> findByCategory(ProductCategory category);

    List<Product> findLowStock(int threshold);

    List<Product> searchByText(String q);

    void delete(UUID id);
}
