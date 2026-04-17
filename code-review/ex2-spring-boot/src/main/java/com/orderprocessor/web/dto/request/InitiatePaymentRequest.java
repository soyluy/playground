package com.orderprocessor.web.dto.request;

import com.orderprocessor.domain.enums.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InitiatePaymentRequest {

    @NotNull
    private UUID orderId;

    @NotNull
    private PaymentMethod method;

    @NotBlank
    @Size(min = 3, max = 3)
    private String currency;
}
