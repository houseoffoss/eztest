# EZTest Selenium Java SDK - Testing Guide

This guide explains how to test the SDK functionality, including unit tests, integration tests, and manual testing scenarios.

## Table of Contents

1. [Building the SDK](#building-the-sdk)
2. [Unit Testing](#unit-testing)
3. [Integration Testing](#integration-testing)
4. [Manual Testing Scenarios](#manual-testing-scenarios)
5. [Mock Server Setup](#mock-server-setup)
6. [Troubleshooting Tests](#troubleshooting-tests)

---

## Building the SDK

### Prerequisites

- Java 11 or higher
- Maven 3.6+
- Internet connection (for downloading dependencies)

### Build Commands

```bash
# Navigate to SDK directory
cd sdk/selenium-java

# Clean and compile
mvn clean compile

# Run tests
mvn test

# Build JAR file
mvn clean package

# Install to local Maven repository
mvn clean install
```

### Verify Build

After building, check that the JAR is created:

```bash
ls target/eztest-selenium-java-sdk-1.0.0.jar
```

---

## Unit Testing

### Running Unit Tests

```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=EZTestConfigTest

# Run with verbose output
mvn test -X

# Skip tests during build
mvn package -DskipTests
```

### Test Structure

Create unit tests in `src/test/java/com/eztest/sdk/`:

```
src/test/java/com/eztest/sdk/
├── core/
│   ├── EZTestConfigTest.java
│   ├── EZTestClientTest.java
│   └── EZTestReportImporterTest.java
├── utils/
│   ├── TimeUtilsTest.java
│   └── UuidUtilsTest.java
└── models/
    └── TestResultStatusTest.java
```

---

## Integration Testing

### TestNG Listener Testing

#### Step 1: Create Test Class

```java
package com.example.tests;

import com.eztest.sdk.annotations.EZTestCase;
import com.eztest.sdk.listeners.EZTestTestNGListener;
import org.testng.Assert;
import org.testng.annotations.Listeners;
import org.testng.annotations.Test;

@Listeners(EZTestTestNGListener.class)
public class LoginTests {
    
    @EZTestCase(
        testCaseId = "tc_test_001",
        title = "Test Login Functionality",
        priority = "HIGH"
    )
    @Test
    public void testLogin() {
        // Simple test that always passes
        Assert.assertTrue(true, "Login test passed");
    }
    
    @EZTestCase(
        title = "Test Login Failure",
        priority = "MEDIUM"
    )
    @Test
    public void testLoginFailure() {
        // Test that fails
        Assert.fail("Intentional failure for testing");
    }
    
    @EZTestCase(
        title = "Test Login Skip",
        priority = "LOW"
    )
    @Test(enabled = false)
    public void testLoginSkip() {
        // This test will be skipped
    }
}
```

#### Step 2: Create testng.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE suite SYSTEM "https://testng.org/testng-1.0.dtd">
<suite name="SDK Test Suite">
    <listeners>
        <listener class-name="com.eztest.sdk.listeners.EZTestTestNGListener"/>
    </listeners>
    <test name="SDK Integration Tests">
        <classes>
            <class name="com.example.tests.LoginTests"/>
        </classes>
    </test>
</suite>
```

#### Step 3: Configure EZTest

Set environment variables or system properties:

```bash
export EZTEST_SERVER_URL=http://localhost:3000
export EZTEST_API_KEY=test-api-key
export EZTEST_PROJECT_ID=test-project-id
```

#### Step 4: Run Tests

```bash
# Using Maven
mvn test

# Using TestNG directly
java -cp "target/test-classes:target/classes:$(mvn dependency:build-classpath -q -Dmdep.outputFile=/dev/stdout)" \
     org.testng.TestNG testng.xml
```

---

## Manual Testing Scenarios

### Scenario 1: Test JSON Report Import

#### Step 1: Create Sample JSON Report

Create `test-report.json`:

```json
{
  "report_meta": {
    "project_name": "Test Project",
    "generated_at": "2026-01-12T21:36:55 IST",
    "report_source": "ExtentSparkReporter",
    "environment": {
      "os": "Windows 11",
      "java_version": "21",
      "browser": "Chrome",
      "environment_url": "https://staging.example.com"
    },
    "user_config": {
      "triggered_by": "Test_User",
      "build_id": "v1.0.0",
      "execution_profile": "Smoke"
    }
  },
  "summary": {
    "total_tests": 2,
    "passed": 1,
    "failed": 1,
    "skipped": 0,
    "total_duration_ms": 120000,
    "start_time": "2026-01-12T21:35:43 IST",
    "end_time": "2026-01-12T21:36:55 IST"
  },
  "results": [
    {
      "test_id": "TC001",
      "test_name": "Test Login",
      "class_name": "com.example.LoginTest",
      "status": "PASS",
      "start_time": "2026-01-12T21:35:54 IST",
      "end_time": "2026-01-12T21:36:54 IST",
      "duration_ms": 60000,
      "tags": ["Smoke", "Login"]
    },
    {
      "test_id": "TC002",
      "test_name": "Test Registration",
      "class_name": "com.example.RegistrationTest",
      "status": "FAIL",
      "start_time": "2026-01-12T21:36:00 IST",
      "end_time": "2026-01-12T21:36:30 IST",
      "duration_ms": 30000,
      "tags": ["Smoke"],
      "error_message": "Registration failed",
      "stack_trace": "java.lang.AssertionError: Registration failed"
    }
  ]
}
```

#### Step 2: Create Test Program

Create `TestJsonImport.java`:

```java
import com.eztest.sdk.core.EZTestClient;
import com.eztest.sdk.core.EZTestConfig;
import com.eztest.sdk.core.EZTestReportImporter;

public class TestJsonImport {
    public static void main(String[] args) {
        EZTestConfig config = new EZTestConfig(
            System.getProperty("eztest.server.url", "http://localhost:3000"),
            System.getProperty("eztest.api.key", "test-api-key"),
            System.getProperty("eztest.project.id", "test-project-id")
        );
        
        EZTestClient client = new EZTestClient(config);
        EZTestReportImporter importer = new EZTestReportImporter(client);
        
        try {
            String testRunId = importer.importFromFile("test-report.json");
            if (testRunId != null) {
                System.out.println("✅ JSON import successful!");
                System.out.println("Test Run ID: " + testRunId);
            } else {
                System.err.println("❌ JSON import failed");
            }
        } catch (Exception e) {
            System.err.println("❌ Error: " + e.getMessage());
            e.printStackTrace();
        } finally {
            client.close();
        }
    }
}
```

#### Step 3: Run Test

```bash
# Compile
javac -cp "target/classes:$(mvn dependency:build-classpath -q -Dmdep.outputFile=/dev/stdout)" TestJsonImport.java

# Run
java -cp ".:target/classes:$(mvn dependency:build-classpath -q -Dmdep.outputFile=/dev/stdout)" \
     -Deztest.server.url=http://localhost:3000 \
     -Deztest.api.key=your-api-key \
     -Deztest.project.id=your-project-id \
     TestJsonImport
```

---

### Scenario 2: Test HTML Report Import

#### Step 1: Create Sample HTML Report

Create `test-report.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Test Report</title>
</head>
<body>
    <h1>Test Execution Report</h1>
    <table class="suiteTable">
        <tr>
            <th>Test Method</th>
            <th>Class</th>
            <th>Status</th>
            <th>Duration</th>
        </tr>
        <tr>
            <td>testLogin</td>
            <td>com.example.LoginTest</td>
            <td>PASS</td>
            <td>60 sec</td>
        </tr>
        <tr>
            <td>testRegistration</td>
            <td>com.example.RegistrationTest</td>
            <td>FAIL</td>
            <td>30 sec</td>
        </tr>
    </table>
</body>
</html>
```

#### Step 2: Create Test Program

Create `TestHtmlImport.java`:

```java
import com.eztest.sdk.core.EZTestClient;
import com.eztest.sdk.core.EZTestConfig;
import com.eztest.sdk.core.EZTestHtmlReportImporter;

public class TestHtmlImport {
    public static void main(String[] args) {
        EZTestConfig config = new EZTestConfig(
            System.getProperty("eztest.server.url", "http://localhost:3000"),
            System.getProperty("eztest.api.key", "test-api-key"),
            System.getProperty("eztest.project.id", "test-project-id")
        );
        
        EZTestClient client = new EZTestClient(config);
        EZTestHtmlReportImporter importer = new EZTestHtmlReportImporter(client);
        
        try {
            String testRunId = importer.importFromFile("test-report.html");
            if (testRunId != null) {
                System.out.println("✅ HTML import successful!");
                System.out.println("Test Run ID: " + testRunId);
            } else {
                System.err.println("❌ HTML import failed");
            }
        } catch (Exception e) {
            System.err.println("❌ Error: " + e.getMessage());
            e.printStackTrace();
        } finally {
            client.close();
        }
    }
}
```

#### Step 3: Run Test

```bash
# Compile and run (similar to JSON import)
javac -cp "target/classes:$(mvn dependency:build-classpath -q -Dmdep.outputFile=/dev/stdout)" TestHtmlImport.java
java -cp ".:target/classes:$(mvn dependency:build-classpath -q -Dmdep.outputFile=/dev/stdout)" \
     -Deztest.server.url=http://localhost:3000 \
     -Deztest.api.key=your-api-key \
     -Deztest.project.id=your-project-id \
     TestHtmlImport
```

---

### Scenario 3: Test Programmatic API

Create `TestProgrammaticAPI.java`:

```java
import com.eztest.sdk.core.EZTestClient;
import com.eztest.sdk.core.EZTestConfig;
import com.eztest.sdk.models.*;

import java.util.Arrays;

public class TestProgrammaticAPI {
    public static void main(String[] args) {
        EZTestConfig config = new EZTestConfig(
            System.getProperty("eztest.server.url", "http://localhost:3000"),
            System.getProperty("eztest.api.key", "test-api-key"),
            System.getProperty("eztest.project.id", "test-project-id")
        );
        
        EZTestClient client = new EZTestClient(config);
        
        try {
            // Create test case
            CreateTestCaseRequest testCase = new CreateTestCaseRequest("Test Case from SDK");
            testCase.setDescription("Created via SDK programmatic API");
            testCase.setPriority("HIGH");
            String testCaseId = client.createTestCase(testCase);
            System.out.println("Created test case: " + testCaseId);
            
            // Create test run
            CreateTestRunRequest testRun = new CreateTestRunRequest(
                "SDK Test Run",
                Arrays.asList(testCaseId)
            );
            String testRunId = client.createTestRun(testRun);
            System.out.println("Created test run: " + testRunId);
            
            // Start test run
            client.startTestRun(testRunId);
            System.out.println("Started test run");
            
            // Record result
            RecordTestResultRequest result = new RecordTestResultRequest(
                testCaseId,
                TestResultStatus.PASSED
            );
            result.setDuration(120L);
            result.setComment("Test executed successfully");
            client.recordTestResult(testRunId, result);
            System.out.println("Recorded test result");
            
            // Complete test run
            client.completeTestRun(testRunId);
            System.out.println("Completed test run");
            
            System.out.println("✅ All operations successful!");
            
        } catch (Exception e) {
            System.err.println("❌ Error: " + e.getMessage());
            e.printStackTrace();
        } finally {
            client.close();
        }
    }
}
```

---

## Mock Server Setup

For testing without a real EZTest server, you can use a mock HTTP server.

### Using WireMock

Add to `pom.xml`:

```xml
<dependency>
    <groupId>com.github.tomakehurst</groupId>
    <artifactId>wiremock-jre8</artifactId>
    <version>2.35.0</version>
    <scope>test</scope>
</dependency>
```

Create `MockServerTest.java`:

```java
import com.eztest.sdk.core.EZTestClient;
import com.eztest.sdk.core.EZTestConfig;
import com.eztest.sdk.models.*;
import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.client.WireMock;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.junit.jupiter.api.Assertions.*;

public class MockServerTest {
    private WireMockServer wireMockServer;
    private EZTestClient client;
    
    @BeforeEach
    void setUp() {
        wireMockServer = new WireMockServer(8089);
        wireMockServer.start();
        
        EZTestConfig config = new EZTestConfig(
            "http://localhost:8089",
            "test-api-key",
            "test-project-id"
        );
        client = new EZTestClient(config);
    }
    
    @AfterEach
    void tearDown() {
        wireMockServer.stop();
        if (client != null) {
            client.close();
        }
    }
    
    @Test
    void testCreateTestCase() {
        // Setup mock response
        wireMockServer.stubFor(post(urlEqualTo("/api/projects/test-project-id/testcases"))
            .withHeader("Authorization", equalTo("Bearer test-api-key"))
            .willReturn(aResponse()
                .withStatus(201)
                .withHeader("Content-Type", "application/json")
                .withBody("{\"data\":{\"id\":\"tc_123\"},\"message\":\"Created\"}")));
        
        // Test
        CreateTestCaseRequest request = new CreateTestCaseRequest("Test Case");
        String testCaseId = client.createTestCase(request);
        
        assertNotNull(testCaseId);
        assertEquals("tc_123", testCaseId);
    }
}
```

---

## Testing Checklist

### Configuration Testing

- [ ] Test EZTestConfig with valid parameters
- [ ] Test EZTestConfig with null/empty parameters (should throw exception)
- [ ] Test EZTestConfig with custom timeouts
- [ ] Test configuration from system properties
- [ ] Test configuration from environment variables

### Client Testing

- [ ] Test EZTestClient creation
- [ ] Test createTestCase with valid request
- [ ] Test createTestRun with valid request
- [ ] Test startTestRun
- [ ] Test recordTestResult with all statuses
- [ ] Test completeTestRun
- [ ] Test error handling (network errors, API errors)
- [ ] Test client.close()

### JSON Import Testing

- [ ] Test importFromFile with valid JSON
- [ ] Test importFromJson with valid JSON string
- [ ] Test importFromStream with valid InputStream
- [ ] Test with missing required fields
- [ ] Test with invalid JSON format
- [ ] Test status mapping (PASS/FAIL/SKIP)
- [ ] Test duration conversion (ms to seconds)

### HTML Import Testing

- [ ] Test importFromFile with ExtentReports HTML
- [ ] Test importFromFile with TestNG HTML
- [ ] Test importFromFile with generic HTML
- [ ] Test format detection
- [ ] Test parsing of test results
- [ ] Test parsing of durations
- [ ] Test status extraction

### TestNG Listener Testing

- [ ] Test listener initialization
- [ ] Test onStart (creates test run)
- [ ] Test onTestStart (maps test cases)
- [ ] Test onTestSuccess (records PASSED)
- [ ] Test onTestFailure (records FAILED with error)
- [ ] Test onTestSkipped (records SKIPPED)
- [ ] Test onFinish (completes test run)
- [ ] Test with @EZTestCase annotation
- [ ] Test without annotation (should skip)

---

## Troubleshooting Tests

### Common Issues

#### 1. Connection Refused

**Error**: `java.net.ConnectException: Connection refused`

**Solution**: 
- Verify EZTest server is running
- Check server URL is correct
- Check firewall/network settings

#### 2. Authentication Failed

**Error**: `401 Unauthorized` or `403 Forbidden`

**Solution**:
- Verify API key is correct
- Check API key has required permissions
- Verify project ID exists

#### 3. Test Cases Not Created

**Error**: Test cases not appearing in EZTest

**Solution**:
- Check API key has `testcases:create` permission
- Verify project ID is correct
- Check logs for error messages
- Verify test case titles are unique

#### 4. JSON Parsing Errors

**Error**: `JsonProcessingException` or parsing errors

**Solution**:
- Validate JSON format
- Check required fields are present
- Verify JSON structure matches expected format

#### 5. HTML Parsing Errors

**Error**: No test results found

**Solution**:
- Verify HTML structure
- Check if format is supported
- Try with a simpler HTML structure
- Check logs for parsing details

---

## Test Data

### Sample Test Data Files

Create these files in your test directory:

1. **test-report.json** - Valid JSON report
2. **test-report-invalid.json** - Invalid JSON for error testing
3. **test-report.html** - Valid HTML report
4. **test-report-extent.html** - ExtentReports format
5. **test-report-testng.html** - TestNG format

---

## Continuous Integration

### GitHub Actions Example

```yaml
name: SDK Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up JDK 11
        uses: actions/setup-java@v2
        with:
          java-version: '11'
          distribution: 'temurin'
      - name: Run tests
        run: |
          cd sdk/selenium-java
          mvn test
        env:
          EZTEST_SERVER_URL: ${{ secrets.EZTEST_SERVER_URL }}
          EZTEST_API_KEY: ${{ secrets.EZTEST_API_KEY }}
          EZTEST_PROJECT_ID: ${{ secrets.EZTEST_PROJECT_ID }}
```

---

## Next Steps

1. Set up your test environment
2. Create sample test data files
3. Run unit tests
4. Test JSON import with sample data
5. Test HTML import with sample data
6. Test TestNG listener with real tests
7. Set up CI/CD pipeline

For more examples, see the `src/test/java` directory and example files in the SDK.

