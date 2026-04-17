package com.orderprocessor.application.service;

import com.orderprocessor.application.validator.OrderValidator;
import com.orderprocessor.domain.entity.Customer;
import com.orderprocessor.domain.entity.Order;
import com.orderprocessor.domain.entity.OrderItem;
import com.orderprocessor.domain.entity.Product;
import com.orderprocessor.domain.enums.CustomerTier;
import com.orderprocessor.domain.enums.OrderStatus;
import com.orderprocessor.domain.exception.InvalidOrderStatusTransitionException;
import com.orderprocessor.infrastructure.repository.CustomerRepository;
import com.orderprocessor.infrastructure.repository.OrderRepository;
import com.orderprocessor.infrastructure.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private CustomerRepository customerRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private InventoryService inventoryService;
    @Mock
    private PricingService pricingService;
    @Mock
    private OrderValidator validator;

    @InjectMocks
    private OrderService orderService;

    private Customer customer;
    private Product product;

    @BeforeEach
    void setUp() {
        customer = Customer.builder()
                .email("alice@example.com")
                .firstName("Alice")
                .lastName("Smith")
                .tier(CustomerTier.STANDARD)
                .loyaltyPoints(0)
                .build();
        customer.setId(UUID.randomUUID());

        product = Product.builder()
                .sku("P-1")
                .name("Widget")
                .price(new BigDecimal("10.00"))
                .stockQuantity(100)
                .active(true)
                .build();
        product.setId(UUID.randomUUID());
    }

    @Test
    void createOrder_persistsPendingOrderAndReservesStock() {
        when(customerRepository.findById(customer.getId())).thenReturn(Optional.of(customer));
        when(productRepository.findById(product.getId())).thenReturn(Optional.of(product));
        when(pricingService.calculateItemPrice(any(), anyInt(), any()))
                .thenReturn(new BigDecimal("20.00"));
        when(pricingService.applyCustomerDiscount(any(), any()))
                .thenReturn(new BigDecimal("20.00"));
        when(pricingService.calculateTax(any())).thenReturn(new BigDecimal("1.60"));
        when(pricingService.totalWeight(any())).thenReturn(BigDecimal.ZERO);
        when(pricingService.calculateShipping(any(), any())).thenReturn(new BigDecimal("7.99"));
        doNothing().when(validator).validateForCreate(any());
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));

        OrderItem item = OrderItem.builder()
                .product(product)
                .quantity(2)
                .build();

        Order result = orderService.createOrder(customer.getId(), List.of(item), "note");

        assertThat(result.getStatus()).isEqualTo(OrderStatus.PENDING);
        assertThat(result.getItems()).hasSize(1);
        verify(inventoryService).reserveItems(anyMap());
    }

    @Test
    void confirmOrder_transitionsPendingToConfirmed() {
        Order order = pendingOrder();
        when(orderRepository.findById(order.getId())).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));

        Order result = orderService.confirmOrder(order.getId());
        assertThat(result.getStatus()).isEqualTo(OrderStatus.CONFIRMED);
    }

    @Test
    void confirmOrder_rejectsInvalidTransition() {
        Order order = pendingOrder();
        order.setStatus(OrderStatus.DELIVERED);
        when(orderRepository.findById(order.getId())).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> orderService.confirmOrder(order.getId()))
                .isInstanceOf(InvalidOrderStatusTransitionException.class);
    }

    @Test
    void cancelOrder_releasesStockAndCancels() {
        Order order = pendingOrder();
        when(orderRepository.findById(order.getId())).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));

        Order result = orderService.cancelOrder(order.getId());
        assertThat(result.getStatus()).isEqualTo(OrderStatus.CANCELLED);
        verify(inventoryService).releaseItems(anyMap());
    }

    @Test
    void updateOrderStatus_forwardsValidTransitionToEntity() {
        Order order = pendingOrder();
        when(orderRepository.findById(order.getId())).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));
        doNothing().when(validator).validateTransition(any(), any());

        Order result = orderService.updateOrderStatus(order.getId(), OrderStatus.CONFIRMED);
        assertThat(result.getStatus()).isEqualTo(OrderStatus.CONFIRMED);
    }

    private Order pendingOrder() {
        OrderItem item = OrderItem.builder()
                .product(product)
                .quantity(1)
                .unitPrice(product.getPrice())
                .discount(BigDecimal.ZERO)
                .build();
        Order order = Order.builder()
                .orderNumber("ORD-TEST")
                .customer(customer)
                .status(OrderStatus.PENDING)
                .subtotal(BigDecimal.TEN)
                .taxAmount(BigDecimal.ZERO)
                .shippingCost(BigDecimal.ZERO)
                .totalAmount(BigDecimal.TEN)
                .build();
        order.setId(UUID.randomUUID());
        order.addItem(item);
        return order;
    }

    private static int anyInt() {
        return org.mockito.ArgumentMatchers.anyInt();
    }
}
