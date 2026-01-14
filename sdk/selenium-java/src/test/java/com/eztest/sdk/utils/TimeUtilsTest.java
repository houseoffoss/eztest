package com.eztest.sdk.utils;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for TimeUtils class.
 */
public class TimeUtilsTest {
    
    @Test
    void testGetCurrentTimestamp() {
        String timestamp = TimeUtils.getCurrentTimestamp();
        assertNotNull(timestamp);
        assertTrue(timestamp.contains("T"));
        assertTrue(timestamp.contains("Z") || timestamp.contains("+"));
    }
    
    @Test
    void testMillisecondsToSeconds() {
        assertEquals(0, TimeUtils.millisecondsToSeconds(0));
        assertEquals(1, TimeUtils.millisecondsToSeconds(1000));
        assertEquals(60, TimeUtils.millisecondsToSeconds(60000));
        assertEquals(120, TimeUtils.millisecondsToSeconds(120000));
    }
    
    @Test
    void testCalculateDurationSeconds() {
        long start = 1000L;  // 1 second in ms
        long end = 6000L;    // 6 seconds in ms
        
        assertEquals(5, TimeUtils.calculateDurationSeconds(start, end));
    }
    
    @Test
    void testCalculateDurationSecondsNegative() {
        long start = 1000L;  // 1 second in ms
        long end = 500L;     // 0.5 seconds in ms (end before start)
        
        assertEquals(0, TimeUtils.calculateDurationSeconds(start, end));
    }
}

