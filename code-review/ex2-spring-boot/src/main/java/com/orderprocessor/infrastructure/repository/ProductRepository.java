package com.orderprocessor.infrastructure.repository;

import com.orderprocessor.domain.entity.Product;
import com.orderprocessor.domain.enums.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    Optional<Product> findBySku(String sku);

    List<Product> findByCategory(ProductCategory category);

    @Query("select p from Product p where p.stockQuantity < :threshold and p.active = true")
    List<Product> findLowStockProducts(@Param("threshold") int threshold);

    @Query("select p from Product p where p.active = true and p.stockQuantity > 0")
    List<Product> findActiveProductsWithAvailableStock();

    @Query("""
            select p from Product p
            where lower(p.name) like lower(concat('%', :q, '%'))
               or lower(p.description) like lower(concat('%', :q, '%'))
            """)
    List<Product> searchByNameOrDescription(@Param("q") String q);
}
