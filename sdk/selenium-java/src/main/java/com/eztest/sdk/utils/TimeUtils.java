package com.eztest.sdk.utils;

import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.TimeUnit;

/**
 * Utility class for time operations.
 * 
 * SDK Boundary: Pure utility class for time/date handling. No dependencies on
 * EZTest backend or database. Used for formatting timestamps and calculating durations.
 */
public final class TimeUtils {
    
    private static final DateTimeFormatter ISO_8601_FORMATTER = DateTimeFormatter.ISO_INSTANT;
    
    private TimeUtils() {
        // Utility class - prevent instantiation
    }

    /**
     * Gets the current UTC timestamp as an ISO-8601 formatted string.
     * 
     * @return Current timestamp in ISO-8601 format (e.g., "2024-01-15T10:30:00Z")
     */
    public static String getCurrentTimestamp() {
        return ISO_8601_FORMATTER.format(Instant.now());
    }

    /**
     * Formats an Instant as an ISO-8601 string.
     * 
     * @param instant The instant to format
     * @return ISO-8601 formatted string
     */
    public static String formatTimestamp(Instant instant) {
        if (instant == null) {
            return null;
        }
        return ISO_8601_FORMATTER.format(instant);
    }

    /**
     * Converts milliseconds to seconds (used for duration calculations).
     * 
     * @param milliseconds Duration in milliseconds
     * @return Duration in seconds (rounded)
     */
    public static long millisecondsToSeconds(long milliseconds) {
        return TimeUnit.MILLISECONDS.toSeconds(milliseconds);
    }

    /**
     * Calculates the duration in seconds between two timestamps.
     * 
     * @param startMillis Start time in milliseconds since epoch
     * @param endMillis End time in milliseconds since epoch
     * @return Duration in seconds
     */
    public static long calculateDurationSeconds(long startMillis, long endMillis) {
        if (endMillis < startMillis) {
            return 0;
        }
        return millisecondsToSeconds(endMillis - startMillis);
    }
}

