package com.orderprocessor.security.service;

import com.orderprocessor.domain.entity.Customer;
import com.orderprocessor.domain.entity.User;
import com.orderprocessor.domain.enums.CustomerTier;
import com.orderprocessor.domain.enums.UserRole;
import com.orderprocessor.domain.exception.DomainException;
import com.orderprocessor.infrastructure.repository.CustomerRepository;
import com.orderprocessor.infrastructure.repository.UserRepository;
import com.orderprocessor.security.dto.LoginRequest;
import com.orderprocessor.security.dto.LoginResponse;
import com.orderprocessor.security.dto.RegisterRequest;
import com.orderprocessor.security.dto.TokenRefreshRequest;
import com.orderprocessor.security.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final int MAX_FAILED_ATTEMPTS = 5;

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Value("${app.security.jwt.access-ttl-ms:900000}")
    private long accessTtlMs;

    @Transactional
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!user.isAccountNonLocked()) {
            throw new LockedException("Account locked");
        }
        if (!user.isEnabled()) {
            throw new DomainException("User disabled") {};
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            int attempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(attempts);
            if (attempts >= MAX_FAILED_ATTEMPTS) {
                user.setAccountNonLocked(false);
                user.setLockedAt(Instant.now());
            }
            userRepository.save(user);
            throw new BadCredentialsException("Invalid credentials");
        }

        user.setFailedLoginAttempts(0);
        user.setLastLoginAt(Instant.now());
        userRepository.save(user);

        String access = tokenProvider.generateAccessToken(user);
        String refresh = tokenProvider.generateRefreshToken(user);
        return LoginResponse.builder()
                .accessToken(access)
                .refreshToken(refresh)
                .tokenType("Bearer")
                .expiresIn(accessTtlMs / 1000)
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    @Transactional
    public LoginResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DomainException("Email already registered") {};
        }

        UserRole role = request.getRole() != null ? request.getRole() : UserRole.CUSTOMER;

        Customer customer = null;
        if (role == UserRole.CUSTOMER) {
            customer = Customer.builder()
                    .email(request.getEmail())
                    .firstName(request.getFirstName())
                    .lastName(request.getLastName())
                    .phone(request.getPhone())
                    .tier(CustomerTier.STANDARD)
                    .loyaltyPoints(0)
                    .build();
            customer = customerRepository.save(customer);
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .customer(customer)
                .enabled(true)
                .accountNonLocked(true)
                .failedLoginAttempts(0)
                .build();
        user = userRepository.save(user);

        String access = tokenProvider.generateAccessToken(user);
        String refresh = tokenProvider.generateRefreshToken(user);
        return LoginResponse.builder()
                .accessToken(access)
                .refreshToken(refresh)
                .tokenType("Bearer")
                .expiresIn(accessTtlMs / 1000)
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    @Transactional(readOnly = true)
    public LoginResponse refreshToken(TokenRefreshRequest request) {
        String token = request.getRefreshToken();
        if (!tokenProvider.validate(token)) {
            throw new BadCredentialsException("Invalid refresh token");
        }
        String email = tokenProvider.getSubject(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid refresh token"));

        String access = tokenProvider.generateAccessToken(user);
        return LoginResponse.builder()
                .accessToken(access)
                .refreshToken(token)
                .tokenType("Bearer")
                .expiresIn(accessTtlMs / 1000)
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    public void logout(String token) {
        log.info("logout requested");
    }
}
