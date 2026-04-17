package com.orderprocessor.application.service;

import com.orderprocessor.application.validator.CustomerValidator;
import com.orderprocessor.domain.entity.Customer;
import com.orderprocessor.domain.entity.Order;
import com.orderprocessor.domain.enums.CustomerTier;
import com.orderprocessor.domain.exception.DomainException;
import com.orderprocessor.infrastructure.repository.CustomerRepository;
import com.orderprocessor.infrastructure.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final CustomerValidator validator;

    @Transactional
    public Customer createCustomer(Customer customer) {
        validator.validateForCreate(customer);
        if (customer.getTier() == null) {
            customer.setTier(CustomerTier.STANDARD);
        }
        if (customer.getLoyaltyPoints() == null) {
            customer.setLoyaltyPoints(0);
        }
        return customerRepository.save(customer);
    }

    @Transactional
    public Customer updateCustomer(UUID id, Customer updates) {
        Customer existing = customerRepository.findById(id)
                .orElseThrow(() -> new DomainException("Customer not found: " + id) {});
        existing.setFirstName(updates.getFirstName());
        existing.setLastName(updates.getLastName());
        existing.setPhone(updates.getPhone());
        existing.setAddress(updates.getAddress());
        validator.validateForUpdate(existing);
        return customerRepository.save(existing);
    }

    @Transactional(readOnly = true)
    public Customer getCustomerById(UUID id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new DomainException("Customer not found: " + id) {});
    }

    @Transactional(readOnly = true)
    public Customer getCustomerByEmail(String email) {
        return customerRepository.findByEmail(email)
                .orElseThrow(() -> new DomainException("Customer not found: " + email) {});
    }

    @Transactional
    public Customer updateLoyaltyPoints(UUID customerId, int delta) {
        Customer c = getCustomerById(customerId);
        int current = c.getLoyaltyPoints() == null ? 0 : c.getLoyaltyPoints();
        int next = current + delta;
        if (next < 0) {
            next = 0;
        }
        c.setLoyaltyPoints(next);
        autoUpgradeTier(c);
        return customerRepository.save(c);
    }

    private void autoUpgradeTier(Customer c) {
        int pts = c.getLoyaltyPoints();
        if (pts >= 10000) {
            c.setTier(CustomerTier.PLATINUM);
        } else if (pts >= 5000) {
            c.setTier(CustomerTier.GOLD);
        } else if (pts >= 1000) {
            c.setTier(CustomerTier.SILVER);
        }
    }

    @Transactional
    public Customer upgradeTier(UUID customerId, CustomerTier tier) {
        Customer c = getCustomerById(customerId);
        c.setTier(tier);
        return customerRepository.save(c);
    }

    @Transactional(readOnly = true)
    public List<Order> getCustomerOrders(UUID customerId) {
        getCustomerById(customerId);
        return orderRepository.findByCustomerId(customerId);
    }

    @Transactional(readOnly = true)
    public Page<Customer> list(Pageable pageable) {
        return customerRepository.findAll(pageable);
    }

    @Transactional
    public void deleteCustomer(UUID id) {
        Customer c = getCustomerById(id);
        List<Order> orders = orderRepository.findByCustomerId(id);
        if (!orders.isEmpty()) {
            throw new DomainException("Cannot delete customer with existing orders") {};
        }
        customerRepository.delete(c);
    }
}
