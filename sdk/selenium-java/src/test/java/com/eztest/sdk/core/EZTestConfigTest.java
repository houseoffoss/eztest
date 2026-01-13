package com.eztest.sdk.core;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for EZTestConfig class.
 */
public class EZTestConfigTest {
    
    @Test
    void testValidConfig() {
        EZTestConfig config = new EZTestConfig(
            "https://eztest.example.com",
            "test-api-key",
            "proj_123"
        );
        
        assertEquals("https://eztest.example.com", config.getServerUrl());
        assertEquals("test-api-key", config.getApiKey());
        assertEquals("proj_123", config.getProjectId());
        assertEquals("https://eztest.example.com/api", config.getApiBaseUrl());
    }
    
    @Test
    void testConfigWithTrailingSlash() {
        EZTestConfig config = new EZTestConfig(
            "https://eztest.example.com/",
            "test-api-key",
            "proj_123"
        );
        
        assertEquals("https://eztest.example.com", config.getServerUrl());
    }
    
    @Test
    void testConfigWithCustomTimeouts() {
        EZTestConfig config = new EZTestConfig(
            "https://eztest.example.com",
            "test-api-key",
            "proj_123",
            60000,
            120000
        );
        
        assertEquals(60000, config.getConnectTimeoutMs());
        assertEquals(120000, config.getReadTimeoutMs());
    }
    
    @Test
    void testNullServerUrl() {
        assertThrows(IllegalArgumentException.class, () -> {
            new EZTestConfig(null, "api-key", "proj_123");
        });
    }
    
    @Test
    void testEmptyServerUrl() {
        assertThrows(IllegalArgumentException.class, () -> {
            new EZTestConfig("", "api-key", "proj_123");
        });
    }
    
    @Test
    void testNullApiKey() {
        assertThrows(IllegalArgumentException.class, () -> {
            new EZTestConfig("https://eztest.example.com", null, "proj_123");
        });
    }
    
    @Test
    void testEmptyApiKey() {
        assertThrows(IllegalArgumentException.class, () -> {
            new EZTestConfig("https://eztest.example.com", "", "proj_123");
        });
    }
    
    @Test
    void testNullProjectId() {
        assertThrows(IllegalArgumentException.class, () -> {
            new EZTestConfig("https://eztest.example.com", "api-key", null);
        });
    }
    
    @Test
    void testInvalidConnectTimeout() {
        assertThrows(IllegalArgumentException.class, () -> {
            new EZTestConfig(
                "https://eztest.example.com",
                "api-key",
                "proj_123",
                0,
                60000
            );
        });
    }
    
    @Test
    void testInvalidReadTimeout() {
        assertThrows(IllegalArgumentException.class, () -> {
            new EZTestConfig(
                "https://eztest.example.com",
                "api-key",
                "proj_123",
                30000,
                -1
            );
        });
    }
}

