package com.eztest.sdk.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to specify project configuration at class or suite level.
 * 
 * SDK Boundary: Annotation metadata only. Used by the TestNG listener to
 * determine which EZTest project to use for a test class or suite. No dependencies
 * on EZTest backend code or database.
 * 
 * This annotation allows different test classes to sync with different EZTest projects.
 * If not specified, the SDK uses the default project ID from configuration.
 * 
 * Usage:
 * <pre>
 * {@code
 * @EZTestProject(projectId = "proj_abc123")
 * public class LoginTests {
 *     // All tests in this class will sync to proj_abc123
 * }
 * }
 * </pre>
 */
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface EZTestProject {
    
    /**
     * EZTest project ID for this test class or method.
     * If not provided, uses the default project ID from configuration.
     * 
     * @return Project ID in EZTest system
     */
    String projectId() default "";
    
    /**
     * Override server URL for this project (optional).
     * If not provided, uses the default server URL from configuration.
     * 
     * @return Server URL override
     */
    String serverUrl() default "";
    
    /**
     * Override API key for this project (optional).
     * If not provided, uses the default API key from configuration.
     * 
     * @return API key override
     */
    String apiKey() default "";
}

