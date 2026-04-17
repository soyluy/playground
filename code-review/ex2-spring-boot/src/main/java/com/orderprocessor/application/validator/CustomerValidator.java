package com.orderprocessor.application.validator;

import com.orderprocessor.domain.entity.Address;
import com.orderprocessor.domain.entity.Customer;
import com.orderprocessor.domain.exception.DomainException;
import com.orderprocessor.infrastructure.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.regex.Pattern;

@Component
@RequiredArgsConstructor
public class CustomerValidator {

    private static final Pattern PHONE = Pattern.compile("^\\+?[0-9 .()-]{7,20}$");

    private final CustomerRepository customerRepository;

    public void validateForCreate(Customer customer) {
        if (!StringUtils.hasText(customer.getEmail())) {
            throw new InvalidCustomerException("email required");
        }
        if (customerRepository.findByEmail(customer.getEmail()).isPresent()) {
            throw new InvalidCustomerException("email already in use");
        }
        validatePhone(customer.getPhone());
        validateAddress(customer.getAddress());
    }

    public void validateForUpdate(Customer customer) {
        if (!StringUtils.hasText(customer.getEmail())) {
            throw new InvalidCustomerException("email required");
        }
        validatePhone(customer.getPhone());
        validateAddress(customer.getAddress());
    }

    private void validatePhone(String phone) {
        if (phone == null) {
            return;
        }
        if (!PHONE.matcher(phone).matches()) {
            throw new InvalidCustomerException("invalid phone format");
        }
    }

    private void validateAddress(Address address) {
        if (address == null) {
            return;
        }
        if (!StringUtils.hasText(address.getStreet())
                || !StringUtils.hasText(address.getCity())
                || !StringUtils.hasText(address.getZipCode())
                || !StringUtils.hasText(address.getCountry())) {
            throw new InvalidCustomerException("address incomplete");
        }
    }

    public static class InvalidCustomerException extends DomainException {
        public InvalidCustomerException(String msg) {
            super(msg);
        }
    }
}
