package com.eztest.sdk.models;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for TestResultStatus enum.
 */
public class TestResultStatusTest {
    
    @Test
    void testFromTestNgStatusSuccess() {
        assertEquals(TestResultStatus.PASSED, TestResultStatus.fromTestNgStatus(1));
    }
    
    @Test
    void testFromTestNgStatusFailure() {
        assertEquals(TestResultStatus.FAILED, TestResultStatus.fromTestNgStatus(2));
    }
    
    @Test
    void testFromTestNgStatusSkip() {
        assertEquals(TestResultStatus.SKIPPED, TestResultStatus.fromTestNgStatus(3));
    }
    
    @Test
    void testFromTestNgStatusUnknown() {
        assertEquals(TestResultStatus.SKIPPED, TestResultStatus.fromTestNgStatus(999));
    }
    
    @Test
    void testEnumValues() {
        assertNotNull(TestResultStatus.PASSED);
        assertNotNull(TestResultStatus.FAILED);
        assertNotNull(TestResultStatus.BLOCKED);
        assertNotNull(TestResultStatus.SKIPPED);
        assertNotNull(TestResultStatus.RETEST);
    }
}

