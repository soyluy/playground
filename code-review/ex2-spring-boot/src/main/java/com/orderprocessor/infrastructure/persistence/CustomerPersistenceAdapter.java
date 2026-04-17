package com.orderprocessor.infrastructure.persistence;

import com.orderprocessor.application.port.CustomerPort;
import com.orderprocessor.domain.entity.Customer;
import com.orderprocessor.domain.enums.CustomerTier;
import com.orderprocessor.infrastructure.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class CustomerPersistenceAdapter implements CustomerPort {

    private final CustomerRepository repo;

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Customer save(Customer customer) {
        return repo.save(customer);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Customer> findById(UUID id) {
        return repo.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Customer> findByEmail(String email) {
        return repo.findByEmail(email);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Customer> findByTier(CustomerTier tier, int minLoyaltyPoints) {
        return repo.findByTierAndLoyaltyPointsGreaterThan(tier, minLoyaltyPoints);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Customer> searchByName(String term) {
        return repo.searchByName(term);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Customer> topByOrderCount(int limit) {
        return repo.findTopCustomersByOrderCount(PageRequest.of(0, limit));
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        repo.deleteById(id);
    }
}
