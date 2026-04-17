package com.orderprocessor.application.port;

import com.orderprocessor.domain.entity.Customer;
import com.orderprocessor.domain.enums.CustomerTier;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CustomerPort {

    Customer save(Customer customer);

    Optional<Customer> findById(UUID id);

    Optional<Customer> findByEmail(String email);

    List<Customer> findByTier(CustomerTier tier, int minLoyaltyPoints);

    List<Customer> searchByName(String term);

    List<Customer> topByOrderCount(int limit);

    void delete(UUID id);
}
