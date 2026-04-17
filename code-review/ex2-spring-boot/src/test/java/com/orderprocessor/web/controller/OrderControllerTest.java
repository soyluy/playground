package com.orderprocessor.web.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.orderprocessor.application.service.OrderService;
import com.orderprocessor.domain.entity.Customer;
import com.orderprocessor.domain.entity.Order;
import com.orderprocessor.domain.entity.OrderItem;
import com.orderprocessor.domain.entity.Product;
import com.orderprocessor.domain.enums.OrderStatus;
import com.orderprocessor.security.jwt.JwtAuthenticationFilter;
import com.orderprocessor.web.dto.request.CreateOrderRequest;
import com.orderprocessor.web.mapper.OrderMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = OrderController.class)
@Import(OrderMapper.class)
class OrderControllerTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private OrderService orderService;

    @MockBean
    private JwtAuthenticationFilter jwtFilter;

    private Order sampleOrder;

    @BeforeEach
    void setUp() {
        Customer customer = Customer.builder()
                .email("u@e.com")
                .firstName("U")
                .lastName("E")
                .build();
        customer.setId(UUID.randomUUID());

        Product product = Product.builder()
                .sku("P-1")
                .name("Widget")
                .price(new BigDecimal("10.00"))
                .build();
        product.setId(UUID.randomUUID());

        OrderItem item = OrderItem.builder()
                .product(product)
                .quantity(1)
                .unitPrice(new BigDecimal("10.00"))
                .discount(BigDecimal.ZERO)
                .subtotal(new BigDecimal("10.00"))
                .build();
        item.setId(UUID.randomUUID());

        sampleOrder = Order.builder()
                .orderNumber("ORD-1")
                .customer(customer)
                .status(OrderStatus.PENDING)
                .subtotal(new BigDecimal("10.00"))
                .taxAmount(new BigDecimal("0.80"))
                .shippingCost(new BigDecimal("7.99"))
                .totalAmount(new BigDecimal("18.79"))
                .build();
        sampleOrder.setId(UUID.randomUUID());
        sampleOrder.addItem(item);
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void createOrder_returnsCreated() throws Exception {
        when(orderService.createOrder(any(), any(), any())).thenReturn(sampleOrder);

        CreateOrderRequest body = CreateOrderRequest.builder()
                .customerId(sampleOrder.getCustomer().getId())
                .items(List.of(CreateOrderRequest.Item.builder()
                        .productId(UUID.randomUUID())
                        .quantity(1)
                        .build()))
                .build();

        mvc.perform(post("/api/orders")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.orderNumber").value("ORD-1"));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void getOrder_returnsOrder() throws Exception {
        when(orderService.getOrderById(eq(sampleOrder.getId()))).thenReturn(sampleOrder);

        mvc.perform(get("/api/orders/" + sampleOrder.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void listOrders_customerCanListOrders() throws Exception {
        mvc.perform(get("/api/orders"))
                .andExpect(status().isOk());
    }
}
