package com.eztest.sdk.utils;

import java.util.UUID;

/**
 * Utility class for UUID operations.
 * 
 * SDK Boundary: Pure utility class with no dependencies on EZTest backend or database.
 * Used for generating unique identifiers for test executions and other SDK operations.
 */
public final class UuidUtils {
    
    private UuidUtils() {
        // Utility class - prevent instantiation
    }

    /**
     * Generates a new UUID string.
     * 
     * @return A new UUID as a string
     */
    public static String generateUuid() {
        return UUID.randomUUID().toString();
    }

    /**
     * Validates if a string is a valid UUID format.
     * 
     * @param uuidString The string to validate
     * @return true if the string is a valid UUID format, false otherwise
     */
    public static boolean isValidUuid(String uuidString) {
        if (uuidString == null || uuidString.trim().isEmpty()) {
            return false;
        }
        try {
            UUID.fromString(uuidString.trim());
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}

