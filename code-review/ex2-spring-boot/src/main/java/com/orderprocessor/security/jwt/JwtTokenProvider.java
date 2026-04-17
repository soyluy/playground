package com.orderprocessor.security.jwt;

import com.orderprocessor.domain.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class JwtTokenProvider {

    private final SecretKey key;
    private final long accessTtlMs;
    private final long refreshTtlMs;
    private final String issuer;

    public JwtTokenProvider(
            @Value("${app.security.jwt.secret}") String secret,
            @Value("${app.security.jwt.access-ttl-ms:900000}") long accessTtlMs,
            @Value("${app.security.jwt.refresh-ttl-ms:604800000}") long refreshTtlMs,
            @Value("${app.security.jwt.issuer:order-processor}") String issuer) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTtlMs = accessTtlMs;
        this.refreshTtlMs = refreshTtlMs;
        this.issuer = issuer;
    }

    public String generateAccessToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("uid", user.getId().toString());
        claims.put("role", user.getRole().name());
        claims.put("authorities", user.getRole().authorityNames());
        claims.put("type", "access");
        return buildToken(user.getEmail(), claims, accessTtlMs);
    }

    public String generateRefreshToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("uid", user.getId().toString());
        claims.put("type", "refresh");
        return buildToken(user.getEmail(), claims, refreshTtlMs);
    }

    private String buildToken(String subject, Map<String, Object> claims, long ttlMs) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + ttlMs);
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuer(issuer)
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validate(String token) {
        try {
            parse(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            log.debug("jwt validation failed: {}", ex.getMessage());
            return false;
        }
    }

    public Jws<Claims> parse(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token);
    }

    public String getSubject(String token) {
        return parse(token).getBody().getSubject();
    }

    public String getRole(String token) {
        return (String) parse(token).getBody().get("role");
    }

    @SuppressWarnings("unchecked")
    public List<String> getAuthorities(String token) {
        Object raw = parse(token).getBody().get("authorities");
        if (raw instanceof List<?> l) {
            return (List<String>) l;
        }
        return List.of();
    }

    public boolean isRefresh(String token) {
        return "refresh".equals(parse(token).getBody().get("type"));
    }

    public boolean isExpired(String token) {
        try {
            return parse(token).getBody().getExpiration().before(new Date());
        } catch (JwtException ex) {
            return true;
        }
    }
}
