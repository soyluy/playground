package com.orderprocessor.web.dto.response;

import com.orderprocessor.domain.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderSummaryResponse {

    private UUID id;
    private String orderNumber;
    private OrderStatus status;
    private int itemCount;
    private BigDecimal totalAmount;
    private Instant createdAt;
}
