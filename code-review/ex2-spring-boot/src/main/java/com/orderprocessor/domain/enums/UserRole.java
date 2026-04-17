package com.orderprocessor.domain.enums;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;

public enum UserRole {

    CUSTOMER(List.of("ROLE_CUSTOMER", "ORDER_READ", "ORDER_CREATE")),
    ADMIN(List.of("ROLE_ADMIN", "ORDER_READ", "ORDER_WRITE", "PRODUCT_WRITE", "USER_MANAGE")),
    WAREHOUSE_STAFF(List.of("ROLE_WAREHOUSE", "ORDER_READ", "ORDER_FULFILL", "PRODUCT_STOCK_UPDATE")),
    SUPPORT(List.of("ROLE_SUPPORT", "ORDER_READ", "CUSTOMER_READ"));

    private final List<String> authorities;

    UserRole(List<String> authorities) {
        this.authorities = authorities;
    }

    public List<GrantedAuthority> grantedAuthorities() {
        return authorities.stream()
                .map(SimpleGrantedAuthority::new)
                .map(a -> (GrantedAuthority) a)
                .toList();
    }

    public List<String> authorityNames() {
        return authorities;
    }
}
