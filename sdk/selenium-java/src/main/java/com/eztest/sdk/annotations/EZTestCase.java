package com.eztest.sdk.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to mark test methods that should be synced with EZTest.
 * 
 * SDK Boundary: Annotation metadata only. Used by the TestNG listener to
 * identify which tests should be reported to EZTest. No dependencies on
 * EZTest backend code or database.
 * 
 * Usage:
 * <pre>
 * {@code
 * @EZTestCase(testCaseId = "tc_abc123", title = "Verify login functionality")
 * @Test
 * public void testLogin() {
 *     // Test implementation
 * }
 * }
 * </pre>
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface EZTestCase {
    
    /**
     * EZTest test case ID.
     * If provided, the SDK will use this ID to report results to the existing test case.
     * If not provided, the SDK will attempt to create or map a test case using the title.
     * 
     * @return Test case ID in EZTest system
     */
    String testCaseId() default "";
    
    /**
     * Test case title in EZTest.
     * Used for creating/mapping test cases if testCaseId is not provided.
     * 
     * @return Test case title
     */
    String title() default "";
    
    /**
     * Test case description (optional).
     * Only used when creating a new test case.
     * 
     * @return Test case description
     */
    String description() default "";
    
    /**
     * Priority level (CRITICAL, HIGH, MEDIUM, LOW).
     * Only used when creating a new test case.
     * 
     * @return Priority level
     */
    String priority() default "MEDIUM";
}

