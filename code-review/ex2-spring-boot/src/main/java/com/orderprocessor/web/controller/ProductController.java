package com.orderprocessor.web.controller;

import com.orderprocessor.application.service.ProductService;
import com.orderprocessor.domain.entity.Product;
import com.orderprocessor.domain.enums.ProductCategory;
import com.orderprocessor.web.dto.request.CreateProductRequest;
import com.orderprocessor.web.dto.request.UpdateProductRequest;
import com.orderprocessor.web.dto.response.PagedResponse;
import com.orderprocessor.web.dto.response.ProductResponse;
import com.orderprocessor.web.mapper.ProductMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final ProductMapper productMapper;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public ProductResponse create(@Valid @RequestBody CreateProductRequest request) {
        Product saved = productService.createProduct(productMapper.toEntity(request));
        return productMapper.toResponse(saved);
    }

    @GetMapping("/{id}")
    public ProductResponse get(@PathVariable UUID id) {
        return productMapper.toResponse(productService.getProductById(id));
    }

    @GetMapping("/sku/{sku}")
    public ProductResponse getBySku(@PathVariable String sku) {
        return productMapper.toResponse(productService.getProductBySku(sku));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ProductResponse update(@PathVariable UUID id,
                                  @Valid @RequestBody UpdateProductRequest request) {
        Product updated = productService.updateProduct(id, productMapper.toEntity(request));
        return productMapper.toResponse(updated);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void deactivate(@PathVariable UUID id) {
        productService.deactivateProduct(id);
    }

    @PutMapping("/{id}/stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_STAFF')")
    public ProductResponse updateStock(@PathVariable UUID id, @RequestParam int quantity) {
        return productMapper.toResponse(productService.updateStock(id, quantity));
    }

    @GetMapping
    public PagedResponse<ProductResponse> search(@RequestParam(required = false) String q,
                                                 @RequestParam(required = false) ProductCategory category,
                                                 @RequestParam(defaultValue = "0") int page,
                                                 @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return PagedResponse.from(productService.searchProducts(q, category, pageable), productMapper::toResponse);
    }
}
