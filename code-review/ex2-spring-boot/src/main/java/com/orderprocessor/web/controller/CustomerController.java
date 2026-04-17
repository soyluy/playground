package com.orderprocessor.web.controller;

import com.orderprocessor.application.service.CustomerService;
import com.orderprocessor.domain.entity.Customer;
import com.orderprocessor.domain.enums.CustomerTier;
import com.orderprocessor.web.dto.request.CreateCustomerRequest;
import com.orderprocessor.web.dto.request.UpdateCustomerRequest;
import com.orderprocessor.web.dto.response.CustomerResponse;
import com.orderprocessor.web.dto.response.OrderSummaryResponse;
import com.orderprocessor.web.dto.response.PagedResponse;
import com.orderprocessor.web.mapper.CustomerMapper;
import com.orderprocessor.web.mapper.OrderMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;
    private final CustomerMapper customerMapper;
    private final OrderMapper orderMapper;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPORT')")
    public CustomerResponse create(@Valid @RequestBody CreateCustomerRequest request) {
        Customer saved = customerService.createCustomer(customerMapper.toEntity(request));
        return customerMapper.toResponse(saved);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public CustomerResponse get(@PathVariable UUID id) {
        return customerMapper.toResponse(customerService.getCustomerById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public CustomerResponse update(@PathVariable UUID id,
                                   @Valid @RequestBody UpdateCustomerRequest request) {
        Customer updated = customerService.updateCustomer(id, customerMapper.toEntity(request));
        return customerMapper.toResponse(updated);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable UUID id) {
        customerService.deleteCustomer(id);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPORT')")
    public PagedResponse<CustomerResponse> list(@RequestParam(defaultValue = "0") int page,
                                                @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return PagedResponse.from(customerService.list(pageable), customerMapper::toResponse);
    }

    @PostMapping("/{id}/loyalty-points")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPORT')")
    public CustomerResponse adjustLoyaltyPoints(@PathVariable UUID id,
                                                @RequestParam int delta) {
        return customerMapper.toResponse(customerService.updateLoyaltyPoints(id, delta));
    }

    @PutMapping("/{id}/tier")
    @PreAuthorize("hasRole('ADMIN')")
    public CustomerResponse upgradeTier(@PathVariable UUID id, @RequestParam CustomerTier tier) {
        return customerMapper.toResponse(customerService.upgradeTier(id, tier));
    }

    @GetMapping("/{id}/orders")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<OrderSummaryResponse>> orders(@PathVariable UUID id) {
        List<OrderSummaryResponse> list = customerService.getCustomerOrders(id).stream()
                .map(orderMapper::toSummary)
                .toList();
        return ResponseEntity.ok(list);
    }
}
