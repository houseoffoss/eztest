package com.eztest.sdk.utils;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for UuidUtils class.
 */
public class UuidUtilsTest {
    
    @Test
    void testGenerateUuid() {
        String uuid = UuidUtils.generateUuid();
        assertNotNull(uuid);
        assertTrue(uuid.length() > 0);
        assertTrue(UuidUtils.isValidUuid(uuid));
    }
    
    @Test
    void testIsValidUuid() {
        assertTrue(UuidUtils.isValidUuid("550e8400-e29b-41d4-a716-446655440000"));
        assertTrue(UuidUtils.isValidUuid("00000000-0000-0000-0000-000000000000"));
        assertFalse(UuidUtils.isValidUuid("not-a-uuid"));
        assertFalse(UuidUtils.isValidUuid(""));
        assertFalse(UuidUtils.isValidUuid(null));
    }
    
    @Test
    void testIsValidUuidWithWhitespace() {
        assertTrue(UuidUtils.isValidUuid("  550e8400-e29b-41d4-a716-446655440000  "));
    }
}

