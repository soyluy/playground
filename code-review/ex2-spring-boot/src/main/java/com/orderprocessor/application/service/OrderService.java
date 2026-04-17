package com.orderprocessor.application.service;

import com.orderprocessor.application.validator.OrderValidator;
import com.orderprocessor.domain.entity.Customer;
import com.orderprocessor.domain.entity.Order;
import com.orderprocessor.domain.entity.OrderItem;
import com.orderprocessor.domain.entity.Product;
import com.orderprocessor.domain.enums.OrderStatus;
import com.orderprocessor.domain.exception.DomainException;
import com.orderprocessor.domain.exception.OrderNotFoundException;
import com.orderprocessor.domain.exception.ProductNotFoundException;
import com.orderprocessor.infrastructure.repository.CustomerRepository;
import com.orderprocessor.infrastructure.repository.OrderRepository;
import com.orderprocessor.infrastructure.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;
    private final PricingService pricingService;
    private final OrderValidator validator;

    @Transactional
    public Order createOrder(UUID customerId, List<OrderItem> items, String notes) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new DomainException("Customer not found: " + customerId) {});

        Order order = Order.builder()
                .orderNumber(generateOrderNumber())
                .customer(customer)
                .status(OrderStatus.PENDING)
                .shippingAddress(customer.getAddress())
                .notes(notes)
                .build();

        for (OrderItem item : items) {
            Product p = productRepository.findById(item.getProduct().getId())
                    .orElseThrow(() -> new ProductNotFoundException(item.getProduct().getId()));
            item.setProduct(p);
            item.setUnitPrice(p.getPrice());
            if (item.getDiscount() == null) {
                item.setDiscount(BigDecimal.ZERO);
            }
            order.addItem(item);
        }

        validator.validateForCreate(order);

        Map<UUID, Integer> reservation = new HashMap<>();
        for (OrderItem it : order.getItems()) {
            reservation.merge(it.getProduct().getId(), it.getQuantity(), Integer::sum);
        }
        inventoryService.reserveItems(reservation);

        calculateOrderTotal(order);
        return orderRepository.save(order);
    }

    @Transactional
    public Order confirmOrder(UUID orderId) {
        Order order = getOrderById(orderId);
        order.confirm();
        return orderRepository.save(order);
    }

    @Transactional
    public Order cancelOrder(UUID orderId) {
        Order order = getOrderById(orderId);
        order.cancel();

        Map<UUID, Integer> release = new HashMap<>();
        for (OrderItem it : order.getItems()) {
            release.merge(it.getProduct().getId(), it.getQuantity(), Integer::sum);
        }
        inventoryService.releaseItems(release);
        return orderRepository.save(order);
    }

    @Transactional(readOnly = true)
    public Order getOrderById(UUID id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException(id));
    }

    @Transactional(readOnly = true)
    public Order getOrderByNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new OrderNotFoundException(orderNumber));
    }

    @Transactional(readOnly = true)
    public List<Order> getCustomerOrders(UUID customerId) {
        return orderRepository.findByCustomerId(customerId);
    }

    @Transactional(readOnly = true)
    public Page<Order> list(Pageable pageable) {
        return orderRepository.findAll(pageable);
    }

    @Transactional
    public Order updateOrderStatus(UUID orderId, OrderStatus target) {
        Order order = getOrderById(orderId);
        validator.validateTransition(order.getStatus(), target);
        order.setStatus(target);
        return orderRepository.save(order);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public Order addItemToOrder(UUID orderId, OrderItem item) {
        Order order = getOrderById(orderId);
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new DomainException("Cannot modify non-pending order") {};
        }
        Product p = productRepository.findById(item.getProduct().getId())
                .orElseThrow(() -> new ProductNotFoundException(item.getProduct().getId()));
        item.setProduct(p);
        item.setUnitPrice(p.getPrice());
        order.addItem(item);
        inventoryService.reserveItems(Map.of(p.getId(), item.getQuantity()));
        calculateOrderTotal(order);
        return orderRepository.save(order);
    }

    @Transactional
    public Order removeItemFromOrder(UUID orderId, UUID itemId) {
        Order order = getOrderById(orderId);
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new DomainException("Cannot modify non-pending order") {};
        }
        OrderItem target = order.getItems().stream()
                .filter(i -> itemId.equals(i.getId()))
                .findFirst()
                .orElseThrow(() -> new DomainException("Item not found in order") {});
        order.removeItem(target);
        inventoryService.releaseItems(Map.of(target.getProduct().getId(), target.getQuantity()));
        calculateOrderTotal(order);
        return orderRepository.save(order);
    }

    public void calculateOrderTotal(Order order) {
        BigDecimal subtotal = BigDecimal.ZERO;
        for (OrderItem it : order.getItems()) {
            BigDecimal line = pricingService.calculateItemPrice(it.getProduct(), it.getQuantity(), it.getDiscount());
            it.setSubtotal(line);
            subtotal = subtotal.add(line);
        }
        BigDecimal afterTier = pricingService.applyCustomerDiscount(subtotal, order.getCustomer());
        BigDecimal tax = pricingService.calculateTax(afterTier);
        BigDecimal weight = pricingService.totalWeight(order.getItems());
        BigDecimal shipping = pricingService.calculateShipping(afterTier, weight);

        order.setSubtotal(afterTier.setScale(2, RoundingMode.HALF_UP));
        order.setTaxAmount(tax);
        order.setShippingCost(shipping);
        order.setTotalAmount(afterTier.add(tax).add(shipping).setScale(2, RoundingMode.HALF_UP));
    }

    private String generateOrderNumber() {
        return "ORD-" + System.currentTimeMillis() + "-" +
                UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }
}
