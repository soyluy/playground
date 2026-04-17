package com.orderprocessor.infrastructure.external;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class EmailServiceClient {

    private final RestTemplate restTemplate;
    private final String baseUrl;
    private final String apiKey;
    private final String fromAddress;

    public EmailServiceClient(RestTemplate restTemplate,
                              @Value("${app.email.service.url:http://localhost:9091}") String baseUrl,
                              @Value("${app.email.service.api-key:}") String apiKey,
                              @Value("${app.email.from:no-reply@orderprocessor.local}") String fromAddress) {
        this.restTemplate = restTemplate;
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
        this.fromAddress = fromAddress;
    }

    public boolean sendEmail(EmailMessage message) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Api-Key", apiKey);

        Map<String, Object> body = new HashMap<>();
        body.put("from", fromAddress);
        body.put("to", message.getTo());
        body.put("subject", message.getSubject());
        body.put("template", message.getTemplate());
        body.put("variables", message.getVariables());

        try {
            restTemplate.postForObject(baseUrl + "/send", new HttpEntity<>(body, headers), Void.class);
            return true;
        } catch (RestClientException ex) {
            log.error("failed to send email to {}: {}", message.getTo(), ex.getMessage());
            return false;
        }
    }

    public int sendBulkEmail(List<EmailMessage> messages) {
        int sent = 0;
        for (EmailMessage m : messages) {
            if (sendEmail(m)) {
                sent++;
            }
        }
        return sent;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmailMessage {
        private String to;
        private String subject;
        private String template;
        private Map<String, Object> variables;
    }
}
