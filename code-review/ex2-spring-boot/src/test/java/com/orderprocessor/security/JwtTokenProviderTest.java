package com.orderprocessor.security;

import com.orderprocessor.domain.entity.User;
import com.orderprocessor.domain.enums.UserRole;
import com.orderprocessor.security.jwt.JwtTokenProvider;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtTokenProviderTest {

    private static final String SECRET = "this-is-a-long-enough-hs256-secret-value-for-test-32bytes";

    private JwtTokenProvider provider;
    private User user;

    @BeforeEach
    void setUp() {
        provider = new JwtTokenProvider(SECRET, 60_000L, 3_600_000L, "test-issuer");
        user = User.builder()
                .email("a@b.com")
                .role(UserRole.CUSTOMER)
                .enabled(true)
                .accountNonLocked(true)
                .failedLoginAttempts(0)
                .password("hashed")
                .build();
        user.setId(UUID.randomUUID());
    }

    @Test
    void generateAndParseAccessToken_returnsExpectedClaims() {
        String token = provider.generateAccessToken(user);
        assertThat(provider.validate(token)).isTrue();
        assertThat(provider.getSubject(token)).isEqualTo(user.getEmail());
        assertThat(provider.getRole(token)).isEqualTo(UserRole.CUSTOMER.name());
        assertThat(provider.getAuthorities(token)).contains("ROLE_CUSTOMER");
    }

    @Test
    void validate_returnsFalseForTamperedToken() {
        String token = provider.generateAccessToken(user);
        String tampered = token.substring(0, token.length() - 2) + "xx";
        assertThat(provider.validate(tampered)).isFalse();
    }

    @Test
    void parse_throwsForMalformedToken() {
        assertThatThrownBy(() -> provider.parse("not-a-jwt"))
                .isInstanceOf(JwtException.class);
    }

    @Test
    void isRefresh_trueForRefreshToken() {
        String refresh = provider.generateRefreshToken(user);
        assertThat(provider.isRefresh(refresh)).isTrue();
    }

    @Test
    void expiredToken_isExpiredReturnsTrue() throws Exception {
        JwtTokenProvider shortLived = new JwtTokenProvider(SECRET, 1L, 1000L, "test-issuer");
        String token = shortLived.generateAccessToken(user);
        Thread.sleep(50);
        assertThat(shortLived.validate(token)).isFalse();
    }
}
