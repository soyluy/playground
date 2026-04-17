package com.orderprocessor.application.service;

import com.orderprocessor.application.validator.ProductValidator;
import com.orderprocessor.domain.entity.Product;
import com.orderprocessor.domain.enums.OrderStatus;
import com.orderprocessor.domain.enums.ProductCategory;
import com.orderprocessor.domain.exception.ProductNotFoundException;
import com.orderprocessor.domain.exception.DomainException;
import com.orderprocessor.infrastructure.repository.OrderItemRepository;
import com.orderprocessor.infrastructure.repository.OrderRepository;
import com.orderprocessor.infrastructure.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderRepository orderRepository;
    private final ProductValidator validator;

    @Transactional
    public Product createProduct(Product product) {
        validator.validateForCreate(product);
        if (product.getActive() == null) {
            product.setActive(true);
        }
        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(UUID id, Product updates) {
        Product existing = getProductById(id);
        existing.setName(updates.getName());
        existing.setDescription(updates.getDescription());
        existing.setPrice(updates.getPrice());
        existing.setCategory(updates.getCategory());
        existing.setWeight(updates.getWeight());
        validator.validateForUpdate(existing);
        return productRepository.save(existing);
    }

    @Transactional(readOnly = true)
    public Product getProductById(UUID id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
    }

    @Transactional(readOnly = true)
    public Product getProductBySku(String sku) {
        return productRepository.findBySku(sku)
                .orElseThrow(() -> new ProductNotFoundException(sku));
    }

    @Transactional
    public Product updateStock(UUID productId, int newQuantity) {
        Product p = getProductById(productId);
        p.setStockQuantity(newQuantity);
        return productRepository.save(p);
    }

    @Transactional
    public void reserveStock(UUID productId, int quantity) {
        Product p = getProductById(productId);
        p.reserveStock(quantity);
        productRepository.save(p);
    }

    @Transactional
    public void releaseStock(UUID productId, int quantity) {
        Product p = getProductById(productId);
        p.releaseStock(quantity);
        productRepository.save(p);
    }

    @Transactional(readOnly = true)
    public Page<Product> searchProducts(String text, ProductCategory category, Pageable pageable) {
        if (category != null) {
            List<Product> all = productRepository.findByCategory(category);
            return pageSlice(all, pageable);
        }
        if (text != null && !text.isBlank()) {
            List<Product> all = productRepository.searchByNameOrDescription(text);
            return pageSlice(all, pageable);
        }
        return productRepository.findAll(pageable);
    }

    private Page<Product> pageSlice(List<Product> all, Pageable pageable) {
        int from = (int) pageable.getOffset();
        int to = Math.min(from + pageable.getPageSize(), all.size());
        List<Product> slice = from >= all.size() ? List.of() : all.subList(from, to);
        return new org.springframework.data.domain.PageImpl<>(slice, pageable, all.size());
    }

    @Transactional
    public Product deactivateProduct(UUID id) {
        Product p = getProductById(id);
        boolean hasActiveOrders = orderItemRepository.findByProductId(id).stream()
                .map(oi -> oi.getOrder().getStatus())
                .anyMatch(st -> st == OrderStatus.PENDING
                        || st == OrderStatus.CONFIRMED
                        || st == OrderStatus.PROCESSING);
        if (hasActiveOrders) {
            throw new DomainException("Cannot deactivate product with active orders") {};
        }
        p.setActive(false);
        return productRepository.save(p);
    }
}
