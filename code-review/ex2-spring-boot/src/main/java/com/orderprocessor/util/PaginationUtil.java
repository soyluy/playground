package com.orderprocessor.util;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

public final class PaginationUtil {

    public static final int DEFAULT_PAGE_SIZE = 20;
    public static final int MAX_PAGE_SIZE = 200;

    private PaginationUtil() {
    }

    public static PageRequest of(Integer page, Integer size) {
        int p = page == null || page < 0 ? 0 : page;
        int s = size == null || size <= 0 ? DEFAULT_PAGE_SIZE : Math.min(size, MAX_PAGE_SIZE);
        return PageRequest.of(p, s);
    }

    public static PageRequest of(Integer page, Integer size, String sortField, String direction) {
        PageRequest base = of(page, size);
        if (sortField == null || sortField.isBlank()) {
            return base;
        }
        Sort.Direction dir = "desc".equalsIgnoreCase(direction) ? Sort.Direction.DESC : Sort.Direction.ASC;
        return PageRequest.of(base.getPageNumber(), base.getPageSize(), Sort.by(dir, sortField));
    }
}
