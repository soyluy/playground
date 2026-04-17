package com.orderprocessor.web.mapper;

import com.orderprocessor.domain.entity.Order;
import com.orderprocessor.domain.entity.OrderItem;
import com.orderprocessor.web.dto.response.OrderResponse;
import com.orderprocessor.web.dto.response.OrderSummaryResponse;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class OrderMapper {

    public OrderResponse toResponse(Order order) {
        List<OrderResponse.ItemDto> items = order.getItems().stream()
                .map(this::toItemDto)
                .toList();
        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .customerId(order.getCustomer() == null ? null : order.getCustomer().getId())
                .customerEmail(order.getCustomer() == null ? null : order.getCustomer().getEmail())
                .status(order.getStatus())
                .items(items)
                .subtotal(order.getSubtotal())
                .taxAmount(order.getTaxAmount())
                .shippingCost(order.getShippingCost())
                .totalAmount(order.getTotalAmount())
                .notes(order.getNotes())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    public OrderSummaryResponse toSummary(Order order) {
        return OrderSummaryResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus())
                .itemCount(order.getItems().size())
                .totalAmount(order.getTotalAmount())
                .createdAt(order.getCreatedAt())
                .build();
    }

    private OrderResponse.ItemDto toItemDto(OrderItem it) {
        return OrderResponse.ItemDto.builder()
                .id(it.getId())
                .productId(it.getProduct() == null ? null : it.getProduct().getId())
                .sku(it.getProduct() == null ? null : it.getProduct().getSku())
                .name(it.getProduct() == null ? null : it.getProduct().getName())
                .quantity(it.getQuantity())
                .unitPrice(it.getUnitPrice())
                .discount(it.getDiscount())
                .subtotal(it.getSubtotal())
                .build();
    }
}
