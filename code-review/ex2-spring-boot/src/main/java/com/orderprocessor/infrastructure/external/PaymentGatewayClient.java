package com.orderprocessor.infrastructure.external;

import com.orderprocessor.domain.enums.PaymentMethod;
import com.orderprocessor.domain.exception.PaymentException;
import lombok.Builder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
public class PaymentGatewayClient {

    private final RestTemplate restTemplate;
    private final String baseUrl;
    private final String apiKey;

    public PaymentGatewayClient(RestTemplate restTemplate,
                                @Value("${app.payment.gateway.url:http://localhost:9090}") String baseUrl,
                                @Value("${app.payment.gateway.api-key:}") String apiKey) {
        this.restTemplate = restTemplate;
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
    }

    public ChargeResponse charge(ChargeRequest req) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Api-Key", apiKey);

        Map<String, Object> body = new HashMap<>();
        body.put("amount", req.getAmount());
        body.put("currency", req.getCurrency());
        body.put("method", req.getMethod().name());
        body.put("reference", req.getReference());

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> resp = restTemplate.postForObject(
                    baseUrl + "/charge", new HttpEntity<>(body, headers), Map.class);
            if (resp == null) {
                throw new PaymentException("empty gateway response");
            }
            return ChargeResponse.builder()
                    .success("OK".equals(resp.get("status")))
                    .transactionId((String) resp.get("transactionId"))
                    .raw(resp.toString())
                    .build();
        } catch (ResourceAccessException timeout) {
            log.warn("payment gateway timeout for {}: {}", req.getReference(), timeout.getMessage());
            return ChargeResponse.builder()
                    .success(false)
                    .transactionId(null)
                    .raw("TIMEOUT: " + timeout.getMessage())
                    .build();
        } catch (RestClientException ex) {
            throw new PaymentException("gateway charge failed", ex);
        }
    }

    public RefundResponse refund(String transactionId, BigDecimal amount) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Api-Key", apiKey);

        Map<String, Object> body = new HashMap<>();
        body.put("transactionId", transactionId);
        body.put("amount", amount);

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> resp = restTemplate.postForObject(
                    baseUrl + "/refund", new HttpEntity<>(body, headers), Map.class);
            return RefundResponse.builder()
                    .success(resp != null && "OK".equals(resp.get("status")))
                    .refundId(resp == null ? null : (String) resp.get("refundId"))
                    .build();
        } catch (RestClientException ex) {
            throw new PaymentException("gateway refund failed", ex);
        }
    }

    public String getTransactionStatus(String transactionId) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> resp = restTemplate.getForObject(
                    baseUrl + "/status/" + transactionId, Map.class);
            return resp == null ? "UNKNOWN" : (String) resp.getOrDefault("status", "UNKNOWN");
        } catch (RestClientException ex) {
            return "UNKNOWN";
        }
    }

    @lombok.Value
    @Builder
    public static class ChargeRequest {
        BigDecimal amount;
        String currency;
        PaymentMethod method;
        String reference;
        UUID orderId;
    }

    @lombok.Value
    @Builder
    public static class ChargeResponse {
        boolean success;
        String transactionId;
        String raw;
    }

    @lombok.Value
    @Builder
    public static class RefundResponse {
        boolean success;
        String refundId;
    }
}
