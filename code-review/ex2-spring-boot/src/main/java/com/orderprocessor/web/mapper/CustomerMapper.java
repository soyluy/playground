package com.orderprocessor.web.mapper;

import com.orderprocessor.domain.entity.Address;
import com.orderprocessor.domain.entity.Customer;
import com.orderprocessor.web.dto.request.CreateCustomerRequest;
import com.orderprocessor.web.dto.request.CreateCustomerRequest.AddressDto;
import com.orderprocessor.web.dto.request.UpdateCustomerRequest;
import com.orderprocessor.web.dto.response.CustomerResponse;
import org.springframework.stereotype.Component;

@Component
public class CustomerMapper {

    public Customer toEntity(CreateCustomerRequest req) {
        return Customer.builder()
                .email(req.getEmail())
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .phone(req.getPhone())
                .address(toAddress(req.getAddress()))
                .tier(req.getTier())
                .loyaltyPoints(req.getLoyaltyPoints())
                .build();
    }

    public Customer toEntity(UpdateCustomerRequest req) {
        return Customer.builder()
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .phone(req.getPhone())
                .address(toAddress(req.getAddress()))
                .build();
    }

    public CustomerResponse toResponse(Customer c) {
        Address a = c.getAddress();
        CustomerResponse.AddressDto addr = a == null ? null : CustomerResponse.AddressDto.builder()
                .street(a.getStreet())
                .city(a.getCity())
                .state(a.getState())
                .zipCode(a.getZipCode())
                .country(a.getCountry())
                .build();
        return CustomerResponse.builder()
                .id(c.getId())
                .email(c.getEmail())
                .firstName(c.getFirstName())
                .lastName(c.getLastName())
                .phone(c.getPhone())
                .address(addr)
                .loyaltyPoints(c.getLoyaltyPoints())
                .tier(c.getTier())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }

    private Address toAddress(AddressDto dto) {
        if (dto == null) {
            return null;
        }
        return Address.builder()
                .street(dto.getStreet())
                .city(dto.getCity())
                .state(dto.getState())
                .zipCode(dto.getZipCode())
                .country(dto.getCountry())
                .build();
    }
}
