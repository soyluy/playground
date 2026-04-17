package com.orderprocessor.web.controller;

import com.orderprocessor.application.service.InventoryService;
import com.orderprocessor.application.service.OrderService;
import com.orderprocessor.application.service.ProductService;
import com.orderprocessor.domain.entity.Product;
import com.orderprocessor.domain.enums.OrderStatus;
import com.orderprocessor.infrastructure.repository.OrderRepository;
import com.orderprocessor.infrastructure.repository.ProductRepository;
import com.orderprocessor.web.dto.response.ProductResponse;
import com.orderprocessor.web.mapper.ProductMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or hasRole('SUPPORT')")
public class AdminController {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;
    private final OrderService orderService;
    private final ProductService productService;
    private final ProductMapper productMapper;

    @GetMapping("/stats")
    public Map<String, Object> stats() {
        Map<String, Object> out = new HashMap<>();
        Instant dayAgo = Instant.now().minus(1, ChronoUnit.DAYS);
        for (OrderStatus st : OrderStatus.values()) {
            out.put("orders_" + st.name().toLowerCase() + "_24h",
                    orderRepository.countByStatusAndCreatedAtAfter(st, dayAgo));
        }
        out.put("totalProducts", productRepository.count());
        return out;
    }

    @GetMapping("/revenue")
    public Map<String, Object> revenue(@RequestParam(required = false) Instant from,
                                       @RequestParam(required = false) Instant to) {
        Instant start = from != null ? from : Instant.now().minus(30, ChronoUnit.DAYS);
        Instant end = to != null ? to : Instant.now();
        BigDecimal revenue = orderRepository.calculateRevenueByDateRange(start, end);
        Map<String, Object> out = new HashMap<>();
        out.put("from", start);
        out.put("to", end);
        out.put("revenue", revenue == null ? BigDecimal.ZERO : revenue);
        return out;
    }

    @GetMapping("/low-stock")
    public List<ProductResponse> lowStock() {
        return inventoryService.getLowStockAlerts().stream()
                .map(productMapper::toResponse)
                .toList();
    }

    @PostMapping("/products/bulk-price-update")
    @Transactional
    public int bulkPriceUpdate(@RequestBody BulkPriceUpdateRequest request) {
        List<Product> all = productRepository.findAllById(request.getProductIds());
        BigDecimal factor = BigDecimal.ONE.add(request.getPercentChange()
                .divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP));
        for (Product p : all) {
            p.setPrice(p.getPrice().multiply(factor).setScale(2, RoundingMode.HALF_UP));
            productRepository.save(p);
        }
        return all.size();
    }

    @PostMapping("/orders/bulk-status-update")
    @Transactional
    public int bulkStatusUpdate(@RequestBody BulkStatusUpdateRequest request) {
        int updated = 0;
        for (UUID id : request.getOrderIds()) {
            orderService.updateOrderStatus(id, request.getStatus());
            updated++;
        }
        return updated;
    }

    @lombok.Data
    public static class BulkPriceUpdateRequest {
        private List<UUID> productIds;
        private BigDecimal percentChange;
    }

    @lombok.Data
    public static class BulkStatusUpdateRequest {
        private List<UUID> orderIds;
        private OrderStatus status;
    }
}
