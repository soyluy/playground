package com.orderprocessor.web.controller;

import com.orderprocessor.application.service.OrderService;
import com.orderprocessor.domain.entity.Order;
import com.orderprocessor.domain.entity.OrderItem;
import com.orderprocessor.domain.entity.Product;
import com.orderprocessor.domain.enums.OrderStatus;
import com.orderprocessor.web.dto.request.CreateOrderRequest;
import com.orderprocessor.web.dto.request.UpdateOrderRequest;
import com.orderprocessor.web.dto.response.OrderResponse;
import com.orderprocessor.web.dto.response.PagedResponse;
import com.orderprocessor.web.mapper.OrderMapper;
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

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final OrderMapper orderMapper;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("isAuthenticated()")
    public OrderResponse create(@Valid @RequestBody CreateOrderRequest request) {
        List<OrderItem> items = new ArrayList<>();
        for (CreateOrderRequest.Item i : request.getItems()) {
            Product p = Product.builder().id(i.getProductId()).build();
            items.add(OrderItem.builder()
                    .product(p)
                    .quantity(i.getQuantity())
                    .discount(i.getDiscount())
                    .build());
        }
        Order created = orderService.createOrder(request.getCustomerId(), items, request.getNotes());
        return orderMapper.toResponse(created);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public OrderResponse get(@PathVariable UUID id) {
        return orderMapper.toResponse(orderService.getOrderById(id));
    }

    @GetMapping("/number/{orderNumber}")
    @PreAuthorize("isAuthenticated()")
    public OrderResponse getByNumber(@PathVariable String orderNumber) {
        return orderMapper.toResponse(orderService.getOrderByNumber(orderNumber));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPORT')")
    public PagedResponse<OrderResponse> list(@RequestParam(defaultValue = "0") int page,
                                             @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return PagedResponse.from(orderService.list(pageable), orderMapper::toResponse);
    }

    @GetMapping("/by-customer/{customerId}")
    @PreAuthorize("isAuthenticated()")
    public List<OrderResponse> byCustomer(@PathVariable UUID customerId) {
        return orderService.getCustomerOrders(customerId).stream()
                .map(orderMapper::toResponse)
                .toList();
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_STAFF')")
    public OrderResponse updateStatus(@PathVariable UUID id,
                                      @RequestBody UpdateOrderRequest request) {
        OrderStatus target = request.getStatus();
        return orderMapper.toResponse(orderService.updateOrderStatus(id, target));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    @PreAuthorize("isAuthenticated()")
    public OrderResponse cancel(@PathVariable UUID id) {
        return orderMapper.toResponse(orderService.cancelOrder(id));
    }
}
