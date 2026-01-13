/**
 * EZTest Selenium Java SDK
 * 
 * <p>This SDK provides integration between Selenium test automation and EZTest test management system.
 * 
 * <p><b>Architecture Principles:</b>
 * <ul>
 *   <li>No database access - All communication via HTTPS REST APIs only</li>
 *   <li>No backend dependencies - Does not import any EZTest backend/frontend code</li>
 *   <li>Independently buildable - Has its own pom.xml</li>
 *   <li>Portable - Can be moved to a separate repository without refactoring</li>
 * </ul>
 * 
 * <p><b>Package Structure:</b>
 * <ul>
 *   <li>{@link com.eztest.sdk.core} - Core SDK components (EZTestClient, EZTestConfig)</li>
 *   <li>{@link com.eztest.sdk.annotations} - Annotations for test method metadata</li>
 *   <li>{@link com.eztest.sdk.listeners} - TestNG listeners for automatic test execution tracking</li>
 *   <li>{@link com.eztest.sdk.models} - Data transfer objects for API communication</li>
 *   <li>{@link com.eztest.sdk.utils} - Utility classes (time, UUID helpers)</li>
 * </ul>
 * 
 * @since 1.0.0
 */
package com.eztest.sdk;

