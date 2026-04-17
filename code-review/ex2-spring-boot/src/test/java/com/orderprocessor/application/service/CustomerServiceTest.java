package com.orderprocessor.application.service;

import com.orderprocessor.application.validator.CustomerValidator;
import com.orderprocessor.domain.entity.Customer;
import com.orderprocessor.domain.entity.Order;
import com.orderprocessor.domain.enums.CustomerTier;
import com.orderprocessor.domain.exception.DomainException;
import com.orderprocessor.infrastructure.repository.CustomerRepository;
import com.orderprocessor.infrastructure.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private CustomerValidator validator;

    @InjectMocks
    private CustomerService customerService;

    private Customer customer;

    @BeforeEach
    void setUp() {
        customer = Customer.builder()
                .email("jane@example.com")
                .firstName("Jane")
                .lastName("Doe")
                .tier(CustomerTier.STANDARD)
                .loyaltyPoints(0)
                .build();
        customer.setId(UUID.randomUUID());
    }

    @Test
    void createCustomer_persistsWithDefaults() {
        doNothing().when(validator).validateForCreate(any());
        when(customerRepository.save(any(Customer.class))).thenAnswer(i -> i.getArgument(0));

        Customer incoming = Customer.builder()
                .email("new@example.com")
                .firstName("New")
                .lastName("User")
                .build();

        Customer result = customerService.createCustomer(incoming);

        assertThat(result.getTier()).isEqualTo(CustomerTier.STANDARD);
        assertThat(result.getLoyaltyPoints()).isZero();
        verify(customerRepository).save(any(Customer.class));
    }

    @Test
    void getCustomerById_returnsCustomerWhenFound() {
        when(customerRepository.findById(customer.getId())).thenReturn(Optional.of(customer));
        Customer found = customerService.getCustomerById(customer.getId());
        assertThat(found).isEqualTo(customer);
    }

    @Test
    void getCustomerById_throwsWhenMissing() {
        UUID id = UUID.randomUUID();
        when(customerRepository.findById(id)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> customerService.getCustomerById(id))
                .isInstanceOf(DomainException.class);
    }

    @Test
    void updateLoyaltyPoints_addsAndAutoUpgradesTier() {
        customer.setLoyaltyPoints(900);
        when(customerRepository.findById(customer.getId())).thenReturn(Optional.of(customer));
        when(customerRepository.save(any(Customer.class))).thenAnswer(i -> i.getArgument(0));

        Customer result = customerService.updateLoyaltyPoints(customer.getId(), 200);

        assertThat(result.getLoyaltyPoints()).isEqualTo(1100);
        assertThat(result.getTier()).isEqualTo(CustomerTier.SILVER);
    }

    @Test
    void updateLoyaltyPoints_negativeDeltaClampsAtZero() {
        customer.setLoyaltyPoints(50);
        when(customerRepository.findById(customer.getId())).thenReturn(Optional.of(customer));
        when(customerRepository.save(any(Customer.class))).thenAnswer(i -> i.getArgument(0));

        Customer result = customerService.updateLoyaltyPoints(customer.getId(), -200);

        assertThat(result.getLoyaltyPoints()).isZero();
    }

    @Test
    void upgradeTier_setsExplicitTier() {
        when(customerRepository.findById(customer.getId())).thenReturn(Optional.of(customer));
        when(customerRepository.save(any(Customer.class))).thenAnswer(i -> i.getArgument(0));

        Customer result = customerService.upgradeTier(customer.getId(), CustomerTier.GOLD);
        assertThat(result.getTier()).isEqualTo(CustomerTier.GOLD);
    }

    @Test
    void deleteCustomer_allowsWhenNoOrders() {
        when(customerRepository.findById(customer.getId())).thenReturn(Optional.of(customer));
        when(orderRepository.findByCustomerId(customer.getId())).thenReturn(List.of());

        customerService.deleteCustomer(customer.getId());

        verify(customerRepository).delete(customer);
    }

    @Test
    void deleteCustomer_rejectsWhenOrdersExist() {
        when(customerRepository.findById(customer.getId())).thenReturn(Optional.of(customer));
        when(orderRepository.findByCustomerId(customer.getId())).thenReturn(List.of(new Order()));

        assertThatThrownBy(() -> customerService.deleteCustomer(customer.getId()))
                .isInstanceOf(DomainException.class);
    }
}
