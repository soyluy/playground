package com.orderprocessor.security.service;

import com.orderprocessor.domain.entity.User;
import com.orderprocessor.infrastructure.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private static final Duration LOCK_DURATION = Duration.ofMinutes(15);

    private final UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (Boolean.FALSE.equals(user.getAccountNonLocked()) && user.getLockedAt() != null) {
            Instant unlockAt = user.getLockedAt().plus(LOCK_DURATION);
            if (Instant.now().isAfter(unlockAt)) {
                user.setAccountNonLocked(true);
                user.setFailedLoginAttempts(0);
                user.setLockedAt(null);
                userRepository.save(user);
            }
        }
        return user;
    }
}
