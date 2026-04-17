package com.orderprocessor.application.service;

import com.orderprocessor.domain.entity.Customer;
import com.orderprocessor.domain.entity.Order;
import com.orderprocessor.domain.entity.Payment;
import com.orderprocessor.domain.entity.Product;
import com.orderprocessor.infrastructure.external.EmailServiceClient;
import com.orderprocessor.infrastructure.external.EmailServiceClient.EmailMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final EmailServiceClient emailClient;

    @Value("${app.notifications.ops-email:ops@orderprocessor.local}")
    private String opsEmail;

    @Async
    public void sendOrderConfirmation(Order order) {
        Customer c = order.getCustomer();
        Map<String, Object> vars = new HashMap<>();
        vars.put("orderNumber", order.getOrderNumber());
        vars.put("total", order.getTotalAmount());
        vars.put("firstName", c.getFirstName());
        emailClient.sendEmail(EmailMessage.builder()
                .to(c.getEmail())
                .subject("Order " + order.getOrderNumber() + " received")
                .template("order-confirmation")
                .variables(vars)
                .build());
    }

    @Async
    public void sendShippingNotification(Order order, String trackingNumber) {
        Customer c = order.getCustomer();
        Map<String, Object> vars = new HashMap<>();
        vars.put("orderNumber", order.getOrderNumber());
        vars.put("trackingNumber", trackingNumber);
        emailClient.sendEmail(EmailMessage.builder()
                .to(c.getEmail())
                .subject("Your order has shipped")
                .template("order-shipped")
                .variables(vars)
                .build());
    }

    @Async
    public void sendDeliveryConfirmation(Order order) {
        Customer c = order.getCustomer();
        Map<String, Object> vars = new HashMap<>();
        vars.put("orderNumber", order.getOrderNumber());
        emailClient.sendEmail(EmailMessage.builder()
                .to(c.getEmail())
                .subject("Your order has been delivered")
                .template("order-delivered")
                .variables(vars)
                .build());
    }

    @Async
    public void sendPaymentConfirmation(Payment payment) {
        Order order = payment.getOrder();
        Customer c = order.getCustomer();
        Map<String, Object> vars = new HashMap<>();
        vars.put("orderNumber", order.getOrderNumber());
        vars.put("amount", payment.getAmount());
        vars.put("currency", payment.getCurrency());
        emailClient.sendEmail(EmailMessage.builder()
                .to(c.getEmail())
                .subject("Payment received")
                .template("payment-confirmation")
                .variables(vars)
                .build());
    }

    @Async
    public void sendCancellationNotification(Order order, String reason) {
        Customer c = order.getCustomer();
        Map<String, Object> vars = new HashMap<>();
        vars.put("orderNumber", order.getOrderNumber());
        vars.put("reason", reason == null ? "" : reason);
        emailClient.sendEmail(EmailMessage.builder()
                .to(c.getEmail())
                .subject("Order cancelled")
                .template("order-cancelled")
                .variables(vars)
                .build());
    }

    @Async
    public void sendRefundNotification(Payment payment) {
        Order order = payment.getOrder();
        Customer c = order.getCustomer();
        Map<String, Object> vars = new HashMap<>();
        vars.put("orderNumber", order.getOrderNumber());
        vars.put("amount", payment.getAmount());
        emailClient.sendEmail(EmailMessage.builder()
                .to(c.getEmail())
                .subject("Refund processed")
                .template("refund-processed")
                .variables(vars)
                .build());
    }

    public void sendLowStockAlert(Product product) {
        Map<String, Object> vars = new HashMap<>();
        vars.put("sku", product.getSku());
        vars.put("name", product.getName());
        vars.put("stock", product.getStockQuantity());
        emailClient.sendEmail(EmailMessage.builder()
                .to(opsEmail)
                .subject("Low stock: " + product.getSku())
                .template("low-stock-alert")
                .variables(vars)
                .build());
    }
}
