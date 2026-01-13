package com.eztest.sdk;

import com.eztest.sdk.annotations.EZTestCase;
import org.testng.annotations.Test;

/**
 * Example test class demonstrating SDK usage.
 * 
 * This is a reference example - not meant to be executed as-is.
 * Replace with your actual Selenium tests.
 */
public class ExampleTest {
    
    @EZTestCase(
        testCaseId = "tc_example_001",
        title = "Example Login Test",
        description = "Verifies user can login with valid credentials",
        priority = "HIGH"
    )
    @Test
    public void testLogin() {
        // Your Selenium test implementation here
        // Example:
        // WebDriver driver = new ChromeDriver();
        // driver.get("https://example.com/login");
        // driver.findElement(By.id("username")).sendKeys("user");
        // driver.findElement(By.id("password")).sendKeys("pass");
        // driver.findElement(By.id("submit")).click();
        // Assert.assertTrue(driver.getCurrentUrl().contains("dashboard"));
    }
    
    @EZTestCase(
        title = "Example Registration Test",
        description = "Verifies new user registration",
        priority = "MEDIUM"
    )
    @Test
    public void testRegistration() {
        // If testCaseId is not provided, SDK will create/map the test case
        // using the title provided in the annotation
    }
}

