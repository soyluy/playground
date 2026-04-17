package com.orderprocessor.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class Address {

    @NotBlank
    @Column(name = "street", length = 255)
    private String street;

    @NotBlank
    @Column(name = "city", length = 120)
    private String city;

    @Column(name = "state", length = 120)
    private String state;

    @NotBlank
    @Size(max = 20)
    @Column(name = "zip_code", length = 20)
    private String zipCode;

    @NotBlank
    @Size(min = 2, max = 2)
    @Column(name = "country", length = 2)
    private String country;
}
