package com.orderprocessor.infrastructure.repository;

import com.orderprocessor.domain.entity.Customer;
import com.orderprocessor.domain.enums.CustomerTier;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, UUID> {

    Optional<Customer> findByEmail(String email);

    List<Customer> findByTierAndLoyaltyPointsGreaterThan(CustomerTier tier, Integer minPoints);

    @Query("""
            select c from Customer c
            left join c.orders o
            group by c
            order by count(o) desc
            """)
    List<Customer> findTopCustomersByOrderCount(Pageable pageable);

    @Query("""
            select c from Customer c
            where lower(c.firstName) like lower(concat('%', :term, '%'))
               or lower(c.lastName) like lower(concat('%', :term, '%'))
            """)
    List<Customer> searchByName(@Param("term") String term);
}
