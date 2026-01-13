# EZTest Selenium Java SDK - Usage Guide

This guide provides step-by-step instructions and examples for using the EZTest Selenium Java SDK.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Method 1: TestNG Listener (Automatic Sync)](#method-1-testng-listener-automatic-sync)
3. [Method 2: JSON Report Import](#method-2-json-report-import)
4. [Method 3: Programmatic API Usage](#method-3-programmatic-api-usage)
5. [Configuration Options](#configuration-options)
6. [Complete Examples](#complete-examples)

---

## Quick Start

### Step 1: Add Dependency

Add the SDK to your `pom.xml`:

```xml
<dependency>
    <groupId>com.eztest</groupId>
    <artifactId>eztest-selenium-java-sdk</artifactId>
    <version>1.0.0</version>
</dependency>
```

### Step 2: Configure EZTest Connection

Set up your EZTest configuration using one of these methods:

> 📋 **For complete environment variable documentation, see [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md)**

**Option A: Environment Variables (Recommended)**

**Windows (PowerShell):**
```powershell
$env:EZTEST_SERVER_URL = "https://eztest.example.com"
$env:EZTEST_API_KEY = "your-api-key"
$env:EZTEST_PROJECT_ID = "proj_abc123"
$env:EZTEST_ENVIRONMENT = "Staging"  # Optional
```

**Linux/Mac:**
```bash
export EZTEST_SERVER_URL=https://eztest.example.com
export EZTEST_API_KEY=your-api-key
export EZTEST_PROJECT_ID=proj_abc123
export EZTEST_ENVIRONMENT=Staging  # Optional
```

**Option B: System Properties**
```bash
java -Deztest.server.url=https://eztest.example.com \
     -Deztest.api.key=your-api-key \
     -Deztest.project.id=proj_abc123 \
     -Deztest.environment=Staging \
     YourTestClass
```

**Option C: Programmatic Configuration**
```java
EZTestConfig config = new EZTestConfig(
    "https://eztest.example.com",
    "your-api-key",
    "proj_abc123"
);
```

### Required Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `EZTEST_SERVER_URL` | ✅ Yes | EZTest server base URL |
| `EZTEST_API_KEY` | ✅ Yes | API key for authentication |
| `EZTEST_PROJECT_ID` | ✅ Yes | **Default** Project ID in EZTest (can be overridden with `@EZTestProject`) |
| `EZTEST_ENVIRONMENT` | ❌ No | Environment name (default: "AUTOMATION") |

> **Note**: `EZTEST_PROJECT_ID` sets the **default project**. To use a different project for specific tests, use the `@EZTestProject` annotation (see examples below).

### Step 3: Choose Your Integration Method

Choose one of the three integration methods below based on your needs.

---

## Method 1: TestNG Listener (Automatic Sync)

**Best for**: Real-time test execution tracking with TestNG

### Setup

#### Option A: Via testng.xml

Create or update your `testng.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE suite SYSTEM "https://testng.org/testng-1.0.dtd">
<suite name="MyTestSuite">
    <listeners>
        <listener class-name="com.eztest.sdk.listeners.EZTestTestNGListener"/>
    </listeners>
    <test name="MyTests">
        <classes>
            <class name="com.example.tests.LoginTests"/>
            <class name="com.example.tests.RegistrationTests"/>
        </classes>
    </test>
</suite>
```

#### Option B: Via @Listeners Annotation

```java
import com.eztest.sdk.annotations.EZTestCase;
import com.eztest.sdk.listeners.EZTestTestNGListener;
import org.testng.annotations.Listeners;
import org.testng.annotations.Test;

@Listeners(EZTestTestNGListener.class)
public class LoginTests {
    
    @EZTestCase(
        testCaseId = "tc_login_001",
        title = "Verify user login with valid credentials",
        description = "Tests that users can login successfully",
        priority = "HIGH"
    )
    @Test
    public void testValidLogin() {
        // Your Selenium test code here
        WebDriver driver = new ChromeDriver();
        driver.get("https://example.com/login");
        driver.findElement(By.id("username")).sendKeys("testuser");
        driver.findElement(By.id("password")).sendKeys("password123");
        driver.findElement(By.id("login-btn")).click();
        
        // Assertions
        Assert.assertTrue(driver.getCurrentUrl().contains("dashboard"));
        driver.quit();
    }
    
    @EZTestCase(
        title = "Verify login fails with invalid password",
        priority = "MEDIUM"
    )
    @Test
    public void testInvalidPassword() {
        // If testCaseId is not provided, SDK will create a test case
        // using the title
        // Your test code here
    }
}
```

### How It Works

1. **Test Suite Start**: Listener automatically creates a test run in EZTest
2. **Test Execution**: For each `@EZTestCase` annotated test:
   - **Smart Lookup**: First searches for existing test case:
     - If `testCaseId` is provided → Searches by ID
     - If not found or not provided → Searches by title/name
   - **Use or Create**: 
     - If found → Uses existing test case (builds execution history)
     - If not found → Creates new test case
3. **Result Recording**: Automatically records:
   - Test status (PASSED/FAILED/SKIPPED)
   - Duration
   - Error messages and stack traces (for failures)
   - Results are linked to the test case (existing or new)
4. **Test Suite Finish**: Marks test run as completed

**Execution History**: Results are recorded against existing test cases, building a complete execution history over time. No duplicate test cases are created.

---

## Method 2: Report Import (JSON or HTML)

**Best for**: Post-execution import of test reports (ExtentSparkReporter, ExtentReports HTML, TestNG HTML, etc.)

### Setup

```java
import com.eztest.sdk.core.EZTestClient;
import com.eztest.sdk.core.EZTestConfig;
import com.eztest.sdk.core.EZTestReportImporter;

public class ReportImporter {
    public static void main(String[] args) {
        // Configure EZTest
        EZTestConfig config = new EZTestConfig(
            "https://eztest.example.com",
            "your-api-key",
            "proj_abc123"
        );
        
        EZTestClient client = new EZTestClient(config);
        EZTestReportImporter importer = new EZTestReportImporter(client);
        
        try {
            // Import from file
            String testRunId = importer.importFromFile("path/to/report.json");
            
            if (testRunId != null) {
                System.out.println("Report imported successfully!");
                System.out.println("Test Run ID: " + testRunId);
            } else {
                System.err.println("Failed to import report");
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            client.close();
        }
    }
}
```

### JSON Format

Your JSON report should follow this structure:

```json
{
  "report_meta": {
    "project_name": "Web Application Automation",
    "generated_at": "2026-01-12T21:36:55 IST",
    "report_source": "ExtentSparkReporter",
    "environment": {
      "os": "Windows 11",
      "java_version": "21",
      "browser": "Chrome",
      "environment_url": "https://staging.example.com"
    },
    "user_config": {
      "triggered_by": "Jenkins_User",
      "build_id": "v1.0.234",
      "execution_profile": "Regression"
    }
  },
  "summary": {
    "total_tests": 10,
    "passed": 8,
    "failed": 1,
    "skipped": 1,
    "total_duration_ms": 71924,
    "start_time": "2026-01-12T21:35:43 IST",
    "end_time": "2026-01-12T21:36:55 IST"
  },
  "results": [
    {
      "test_id": "TC09",
      "test_name": "TC09_NavigationCheck",
      "class_name": "testcases.TC09_HouseofFoss_Nav_Check",
      "status": "PASS",
      "start_time": "2026-01-12T21:35:54 IST",
      "end_time": "2026-01-12T21:36:54 IST",
      "duration_ms": 60645,
      "tags": ["Smoke", "Navigation"],
      "error_message": null,
      "stack_trace": null
    }
  ]
}
```

### Import Methods

```java
// From file
String testRunId = importer.importFromFile("report.json");

// From JSON string
String jsonReport = "..."; // Your JSON string
String testRunId = importer.importFromJson(jsonReport);

// From InputStream
InputStream inputStream = new FileInputStream("report.json");
String testRunId = importer.importFromStream(inputStream);
```

---

## Method 3: Programmatic API Usage

**Best for**: Custom integration scenarios, full control over test run lifecycle

### Setting Default Project Programmatically

When you provide configuration programmatically via `EZTestConfig`, that project ID becomes the **default project**. Tests without `@EZTestProject` annotation will use this default project.

**Priority Order:**
1. **Method-level** `@EZTestProject` annotation (highest priority)
2. **Class-level** `@EZTestProject` annotation
3. **Programmatic config** (via `EZTestConfig` - becomes default)
4. **Environment variables** (if no programmatic config)

### Example: Setting Default Project

```java
import com.eztest.sdk.core.EZTestConfig;
import com.eztest.sdk.listeners.EZTestTestNGListener;

public class TestSetup {
    public static void main(String[] args) {
        // Create configuration with your default project
        EZTestConfig config = new EZTestConfig(
            "https://eztest.example.com",  // Server URL
            "your-api-key",                 // API Key
            "proj_default"                  // Default Project ID
        );
        
        // Initialize listener with this config
        EZTestTestNGListener listener = new EZTestTestNGListener();
        listener.initialize(config);
        
        // Now all tests without @EZTestProject will use "proj_default"
        // Tests with @EZTestProject will use their specified project
    }
}
```

### Complete Example

```java
import com.eztest.sdk.core.EZTestClient;
import com.eztest.sdk.core.EZTestConfig;
import com.eztest.sdk.models.*;

import java.util.Arrays;

public class ProgrammaticExample {
    public static void main(String[] args) {
        // Step 1: Configure EZTest
        EZTestConfig config = new EZTestConfig(
            "https://eztest.example.com",
            "your-api-key",
            "proj_abc123"
        );
        
        EZTestClient client = new EZTestClient(config);
        
        try {
            // Step 2: Create test cases
            CreateTestCaseRequest testCase1 = new CreateTestCaseRequest(
                "Verify user login with valid credentials"
            );
            testCase1.setDescription("Tests that users can login successfully");
            testCase1.setPriority("HIGH");
            testCase1.setStatus("ACTIVE");
            
            String testCaseId1 = client.createTestCase(testCase1);
            System.out.println("Created test case: " + testCaseId1);
            
            CreateTestCaseRequest testCase2 = new CreateTestCaseRequest(
                "Verify login fails with invalid password"
            );
            testCase2.setPriority("MEDIUM");
            String testCaseId2 = client.createTestCase(testCase2);
            
            // Step 3: Create test run
            CreateTestRunRequest testRunRequest = new CreateTestRunRequest(
                "Sprint 1 - Smoke Tests",
                Arrays.asList(testCaseId1, testCaseId2)
            );
            testRunRequest.setDescription("Automated smoke tests for Sprint 1");
            testRunRequest.setEnvironment("Staging");
            
            String testRunId = client.createTestRun(testRunRequest);
            System.out.println("Created test run: " + testRunId);
            
            // Step 4: Start test run
            client.startTestRun(testRunId);
            
            // Step 5: Execute tests and record results
            // Simulate test execution
            boolean test1Passed = executeTest1();
            
            RecordTestResultRequest result1 = new RecordTestResultRequest(
                testCaseId1,
                test1Passed ? TestResultStatus.PASSED : TestResultStatus.FAILED
            );
            result1.setDuration(120L); // Duration in seconds
            result1.setComment("Test executed successfully");
            if (!test1Passed) {
                result1.setErrorMessage("Login failed");
            }
            client.recordTestResult(testRunId, result1);
            
            // Record second test result
            RecordTestResultRequest result2 = new RecordTestResultRequest(
                testCaseId2,
                TestResultStatus.PASSED
            );
            result2.setDuration(95L);
            client.recordTestResult(testRunId, result2);
            
            // Step 6: Complete test run
            client.completeTestRun(testRunId);
            System.out.println("Test run completed successfully!");
            
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            client.close();
        }
    }
    
    private static boolean executeTest1() {
        // Your test execution logic
        return true;
    }
}
```

---

## Configuration Options

### EZTestConfig Parameters

```java
EZTestConfig config = new EZTestConfig(
    serverUrl,      // EZTest server URL (required)
    apiKey,         // API key for authentication (required)
    projectId,      // Project ID (required)
    connectTimeout, // Connection timeout in ms (optional, default: 30000)
    readTimeout     // Read timeout in ms (optional, default: 60000)
);
```

### Custom Timeouts

```java
EZTestConfig config = new EZTestConfig(
    "https://eztest.example.com",
    "your-api-key",
    "proj_abc123",
    60000,  // 60 second connection timeout
    120000  // 120 second read timeout
);
```

---

## Complete Examples

### Example 1: Selenium Test with TestNG Listener

```java
package com.example.tests;

import com.eztest.sdk.annotations.EZTestCase;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Listeners;
import org.testng.annotations.Test;
import com.eztest.sdk.listeners.EZTestTestNGListener;

@Listeners(EZTestTestNGListener.class)
public class LoginTests {
    
    private WebDriver driver;
    
    @BeforeMethod
    public void setUp() {
        driver = new ChromeDriver();
    }
    
    @EZTestCase(
        testCaseId = "tc_login_001",
        title = "Verify user login with valid credentials",
        description = "Tests that users can login successfully with valid credentials",
        priority = "HIGH"
    )
    @Test
    public void testValidLogin() {
        driver.get("https://example.com/login");
        driver.findElement(By.id("username")).sendKeys("testuser");
        driver.findElement(By.id("password")).sendKeys("password123");
        driver.findElement(By.id("login-btn")).click();
        
        Assert.assertTrue(driver.getCurrentUrl().contains("dashboard"));
        Assert.assertTrue(driver.findElement(By.id("welcome-message")).isDisplayed());
    }
    
    @EZTestCase(
        title = "Verify login fails with invalid password",
        priority = "MEDIUM"
    )
    @Test
    public void testInvalidPassword() {
        driver.get("https://example.com/login");
        driver.findElement(By.id("username")).sendKeys("testuser");
        driver.findElement(By.id("password")).sendKeys("wrongpassword");
        driver.findElement(By.id("login-btn")).click();
        
        String errorMessage = driver.findElement(By.className("error")).getText();
        Assert.assertTrue(errorMessage.contains("Invalid credentials"));
    }
    
    @AfterMethod
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }
}
```

### Example 2: Jenkins Integration with JSON Import

```java
import com.eztest.sdk.core.EZTestClient;
import com.eztest.sdk.core.EZTestConfig;
import com.eztest.sdk.core.EZTestReportImporter;

public class JenkinsPostBuild {
    public static void main(String[] args) {
        // Get configuration from Jenkins environment variables
        String serverUrl = System.getenv("EZTEST_SERVER_URL");
        String apiKey = System.getenv("EZTEST_API_KEY");
        String projectId = System.getenv("EZTEST_PROJECT_ID");
        String reportPath = args[0]; // Report path from Jenkins
        
        EZTestConfig config = new EZTestConfig(serverUrl, apiKey, projectId);
        EZTestClient client = new EZTestClient(config);
        EZTestReportImporter importer = new EZTestReportImporter(client);
        
        try {
            String testRunId = importer.importFromFile(reportPath);
            if (testRunId != null) {
                System.out.println("✅ Report imported to EZTest");
                System.out.println("Test Run ID: " + testRunId);
                System.exit(0);
            } else {
                System.err.println("❌ Failed to import report");
                System.exit(1);
            }
        } catch (Exception e) {
            System.err.println("❌ Error importing report: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        } finally {
            client.close();
        }
    }
}
```

### Example 3: Maven Integration

Add to your `pom.xml`:

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-surefire-plugin</artifactId>
            <version>3.0.0</version>
            <configuration>
                <systemPropertyVariables>
                    <eztest.server.url>https://eztest.example.com</eztest.server.url>
                    <eztest.api.key>your-api-key</eztest.api.key>
                    <eztest.project.id>proj_abc123</eztest.project.id>
                </systemPropertyVariables>
            </configuration>
        </plugin>
    </plugins>
</build>
```

Run tests:
```bash
mvn test
```

---

## Best Practices

1. **Use TestNG Listener for Real-time Tracking**: Best for continuous integration where you want immediate feedback
2. **Use JSON Import for Batch Processing**: Best for importing historical reports or reports from external tools
3. **Always Close Clients**: Use try-finally blocks to ensure `client.close()` is called
4. **Handle Errors Gracefully**: SDK logs errors but doesn't throw exceptions that break test execution
5. **Use Test Case IDs When Available**: Reduces duplicate test case creation
6. **Set Appropriate Priorities**: Use HIGH for critical tests, MEDIUM for regular tests

---

## Troubleshooting

### Tests Not Syncing

1. **Check Configuration**: Verify server URL, API key, and project ID are correct
2. **Check Logs**: SDK uses SLF4J logging - check your logs for error messages
3. **Verify Network**: Ensure your test environment can reach the EZTest server
4. **Check API Permissions**: Verify your API key has `testcases:create` and `testruns:create` permissions

### Test Cases Not Created

1. **Check Annotations**: Ensure `@EZTestCase` annotation is present on test methods
2. **Check API Permissions**: Verify API key has `testcases:create` permission
3. **Check Logs**: Look for error messages about test case creation failures

### JSON Import Fails

1. **Validate JSON**: Ensure your JSON matches the expected format
2. **Check File Path**: Verify the file path is correct and file is readable
3. **Check Logs**: Look for parsing errors in the logs

---

## Next Steps

- Review the [README.md](README.md) for detailed API documentation
- Check the [ExampleTest.java](src/test/java/com/eztest/sdk/ExampleTest.java) for code examples
- Integrate with your CI/CD pipeline using one of the methods above

