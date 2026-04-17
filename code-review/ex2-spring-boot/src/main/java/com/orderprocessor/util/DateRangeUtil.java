package com.orderprocessor.util;

import com.orderprocessor.domain.exception.DomainException;

import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

public final class DateRangeUtil {

    public static final Duration MAX_RANGE = Duration.ofDays(366);

    private DateRangeUtil() {
    }

    public static Range normalize(Instant from, Instant to) {
        Instant end = to != null ? to : Instant.now();
        Instant start = from != null ? from : end.minus(30, ChronoUnit.DAYS);
        if (start.isAfter(end)) {
            throw new InvalidDateRangeException("from must be before to");
        }
        if (Duration.between(start, end).compareTo(MAX_RANGE) > 0) {
            throw new InvalidDateRangeException("range exceeds maximum of " + MAX_RANGE.toDays() + " days");
        }
        return new Range(start, end);
    }

    public record Range(Instant from, Instant to) {
    }

    public static class InvalidDateRangeException extends DomainException {
        public InvalidDateRangeException(String msg) {
            super(msg);
        }
    }
}
