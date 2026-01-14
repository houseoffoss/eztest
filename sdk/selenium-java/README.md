# EZTest Selenium Java SDK

SDK for automatically syncing Selenium test executions with EZTest.

## Overview

The EZTest Selenium Java SDK allows you to automatically sync your Selenium test executions with EZTest test management system.

> 📚 **For complete documentation, see [DOCUMENTATION.md](DOCUMENTATION.md)**  
> 🔑 **Quick Setup**: [API_KEY_SETUP.md](API_KEY_SETUP.md) | [GET_PROJECT_ID.md](GET_PROJECT_ID.md) | [HOW_TO_IMPORT_JSON.md](HOW_TO_IMPORT_JSON.md)

The SDK:

- Creates and manages test runs in EZTest
- Registers or maps automated test cases
- Records test execution results (pass/fail/skip)
- Tags tests as AUTOMATION with tool=SELENIUM and language=JAVA
- Generates unique execution run IDs for each test suite execution

## Architecture

This SDK is designed to be **logically independent** from the EZTest application:

- ✅ **No database access** - All communication via HTTPS REST APIs only
- ✅ **No backend dependencies** - Does not import any EZTest backend/frontend code
- ✅ **Independently buildable** - Has its own `pom.xml`
- ✅ **Portable** - Can be moved to a separate repository without refactoring
- ✅ **Safe failures** - API errors do not interrupt test execution

## Requirements

- Java 11 or higher
- Maven 3.6+
- TestNG (for test execution listeners)

## Installation

### Maven

Add the SDK as a dependency to your `pom.xml`:

```xml
<dependency>
    <groupId>com.eztest</groupId>
    <artifactId>eztest-selenium-java-sdk</artifactId>
    <version>1.0.0</version>
</dependency>
```

### Building from Source

```bash
cd sdk/selenium-java
mvn clean install
```

## Configuration

The SDK requires three configuration parameters:

1. **Server URL** - Base URL of your EZTest instance (e.g., `https://eztest.example.com` or `http://localhost:3000`)
2. **API Key** - API key from EZTest (create via `/api/apikeys` endpoint or web interface)
3. **Project ID** - The EZTest project ID to associate tests with

> 📋 **For complete environment variable documentation, see [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md)**  
> 🔑 **For API key setup instructions, see [API_KEY_SETUP.md](API_KEY_SETUP.md)**

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `EZTEST_SERVER_URL` | EZTest server base URL | `https://eztest.example.com` |
| `EZTEST_API_KEY` | API key for authentication | `your-api-key-here` |
| `EZTEST_PROJECT_ID` | Project ID in EZTest | `proj_abc123` |

### Optional Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `EZTEST_ENVIRONMENT` | Environment name for test runs | `AUTOMATION` |
| `EZTEST_CONNECT_TIMEOUT_MS` | Connection timeout (ms) | `30000` |
| `EZTEST_READ_TIMEOUT_MS` | Read timeout (ms) | `60000` |

### Configuration Methods

#### 1. Environment Variables (Recommended)

**Windows (PowerShell):**
```powershell
$env:EZTEST_SERVER_URL = "https://eztest.example.com"
$env:EZTEST_API_KEY = "your-api-key"
$env:EZTEST_PROJECT_ID = "proj_abc123"
```

**Linux/Mac:**
```bash
export EZTEST_SERVER_URL=https://eztest.example.com
export EZTEST_API_KEY=your-api-key
export EZTEST_PROJECT_ID=proj_abc123
```

#### 2. System Properties

```bash
java -Deztest.server.url=https://eztest.example.com \
     -Deztest.api.key=your-api-key \
     -Deztest.project.id=proj_abc123 \
     -cp ... YourTestClass
```

#### 3. Programmatic Configuration

```java
import com.eztest.sdk.core.EZTestConfig;
import com.eztest.sdk.core.EZTestClient;
import com.eztest.sdk.listeners.EZTestTestNGListener;

EZTestConfig config = new EZTestConfig(
    "https://eztest.example.com",
    "your-api-key",
    "proj_abc123"
);

EZTestTestNGListener listener = new EZTestTestNGListener();
listener.initialize(config);
```

## Usage

### Basic Setup with TestNG

#### 1. Add the Listener

**Option A: Via testng.xml**

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
        </classes>
    </test>
</suite>
```

**Option B: Via @Listeners Annotation**

```java
import com.eztest.sdk.listeners.EZTestTestNGListener;
import org.testng.annotations.Listeners;

@Listeners(EZTestTestNGListener.class)
public class LoginTests {
    // Your test methods
}
```

#### 2. Annotate Your Test Methods

Use the `@EZTestCase` annotation to mark tests that should be synced with EZTest:

```java
import com.eztest.sdk.annotations.EZTestCase;
import org.testng.annotations.Test;

public class LoginTests {
    
    @EZTestCase(
        testCaseId = "tc_abc123",  // Existing test case ID (optional)
        title = "Verify user login with valid credentials",
        description = "Tests that users can login successfully with valid credentials",
        priority = "HIGH"
    )
    @Test
    public void testValidLogin() {
        // Your test implementation
        // Results will be automatically synced to EZTest
    }
    
    @EZTestCase(
        title = "Verify login fails with invalid password",
        priority = "MEDIUM"
    )
    @Test
    public void testInvalidPassword() {
        // If testCaseId is not provided, SDK will create/map the test case
        // using the title
    }
}
```

### Advanced Usage

#### Programmatic Client Usage

You can also use the `EZTestClient` directly for more control:

```java
import com.eztest.sdk.core.EZTestConfig;
import com.eztest.sdk.core.EZTestClient;
import com.eztest.sdk.models.*;

EZTestConfig config = new EZTestConfig(
    "https://eztest.example.com",
    "your-api-key",
    "proj_abc123"
);

EZTestClient client = new EZTestClient(config);

// Create a test case
CreateTestCaseRequest testCaseRequest = new CreateTestCaseRequest("My Test Case");
testCaseRequest.setDescription("Test case description");
testCaseRequest.setPriority("HIGH");
String testCaseId = client.createTestCase(testCaseRequest);

// Create a test run
CreateTestRunRequest testRunRequest = new CreateTestRunRequest(
    "My Test Run",
    Arrays.asList(testCaseId)
);
String testRunId = client.createTestRun(testRunRequest);

// Start the test run
client.startTestRun(testRunId);

// Record a test result
RecordTestResultRequest resultRequest = new RecordTestResultRequest(
    testCaseId,
    TestResultStatus.PASSED
);
resultRequest.setDuration(120L); // Duration in seconds
resultRequest.setComment("Test passed successfully");
client.recordTestResult(testRunId, resultRequest);

// Complete the test run
client.completeTestRun(testRunId);

// Close the client
client.close();
```

## How It Works

1. **Test Suite Start**: When your TestNG suite starts, the listener creates a test run in EZTest
2. **Test Case Mapping**: For each test method with `@EZTestCase` annotation:
   - If `testCaseId` is provided, it uses that ID
   - Otherwise, it creates a new test case using the annotation's `title` and other properties
3. **Test Execution**: As tests run, the listener records:
   - Test start time
   - Test result (PASSED/FAILED/SKIPPED)
   - Duration
   - Error messages and stack traces (for failures)
4. **Test Suite Finish**: When the suite completes, the test run is marked as completed in EZTest

## Features

- ✅ **Automatic Test Run Management** - Creates and manages test runs automatically
- ✅ **Smart Test Case Mapping** - Finds existing test cases by ID or title, creates only if not found
- ✅ **Execution History** - Records results against existing test cases, building execution history
- ✅ **Result Recording** - Records pass/fail/skip status with durations
- ✅ **Error Handling** - Captures error messages and stack traces
- ✅ **Safe Failure** - API errors are logged but don't interrupt test execution
- ✅ **Non-blocking** - REST API calls don't block test execution

### Smart Test Case Lookup

The SDK intelligently handles test case mapping:

1. **By ID**: If `testCaseId` is provided in annotation or report → Searches by ID first
2. **By Title**: If not found or ID not provided → Searches by title/name
3. **Use Existing**: If found → Uses existing test case and records result (builds execution history)
4. **Create New**: If not found → Creates new test case, then records result

This prevents duplicate test cases and ensures execution results are properly linked to existing test cases, building a complete execution history over time.

## Logging

The SDK uses SLF4J for logging. Make sure to include an SLF4J implementation in your project:

```xml
<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>slf4j-simple</artifactId>
    <version>2.0.7</version>
</dependency>
```

Or use Logback:

```xml
<dependency>
    <groupId>ch.qos.logback</groupId>
    <artifactId>logback-classic</artifactId>
    <version>1.4.8</version>
</dependency>
```

## API Endpoints Used

The SDK communicates with the following EZTest REST API endpoints:

- `POST /api/projects/{projectId}/testcases` - Create test case
- `POST /api/projects/{projectId}/testruns` - Create test run
- `POST /api/testruns/{testRunId}/start` - Start test run
- `POST /api/testruns/{testRunId}/results` - Record test result
- `POST /api/testruns/{testRunId}/complete` - Complete test run

All requests use API key authentication via the `Authorization: Bearer <api-key>` header.

## Importing Test Reports

The SDK supports importing test reports from both JSON and HTML formats.

### JSON Report Import

The SDK supports importing automation test reports from JSON format and syncing them with EZTest.

> 📋 **For complete JSON format specification, see [JSON_FORMAT_SPECIFICATION.md](JSON_FORMAT_SPECIFICATION.md)**

### Supported JSON Format

The SDK accepts JSON reports in **automation report format**. The JSON structure is:

```json
{
  "testRunName": "CI/CD Pipeline - Build #123",
  "environment": "Staging",
  "description": "Automated regression tests from Jenkins",
  "results": [
    {
      "testCaseId": "tc_abc123",
      "status": "PASSED",
      "duration": 120,
      "comment": "Test executed successfully"
    },
    {
      "testCaseId": "tc_def456",
      "status": "FAILED",
      "duration": 95,
      "errorMessage": "Timeout waiting for login button",
      "stackTrace": "java.lang.TimeoutException: Element not found"
    }
  ]
}
```

### Usage

> 📋 **See [samples/JsonReportImportExample.java](samples/JsonReportImportExample.java) for a complete working example!**

```java
import com.eztest.sdk.core.EZTestClient;
import com.eztest.sdk.core.EZTestConfig;
import com.eztest.sdk.core.EZTestReportImporter;

// Configure EZTest client (or use environment variables)
EZTestConfig config = new EZTestConfig(
    "https://eztest.example.com",
    "your-api-key",
    "proj_abc123"
);

EZTestClient client = new EZTestClient(config);
EZTestReportImporter importer = new EZTestReportImporter(client);

// Import from file
String testRunId = importer.importFromFile("path/to/report.json");

// Or import from JSON string
String jsonReport = "..."; // Your JSON report string
String testRunId = importer.importFromJson(jsonReport);

// Or import from InputStream
InputStream inputStream = ...;
String testRunId = importer.importFromStream(inputStream);

if (testRunId != null) {
    System.out.println("Report imported successfully. Test run ID: " + testRunId);
} else {
    System.err.println("Failed to import report");
}

// Close the client when done
client.close();
```

**Sample Files:**
- Sample JSON report: [samples/automation-report-example.json](samples/automation-report-example.json)
- Complete example: [samples/JsonReportImportExample.java](samples/JsonReportImportExample.java)

### What Gets Imported

When importing an automation report:

1. **Test Run**: Creates or finds test run by name and environment
   - Uses `testRunName` and `environment` from the report
   - Auto-starts the test run when results are recorded
   - Auto-completes when all results are processed

2. **Test Cases**: Uses existing test cases for each result
   - **Required**: Each result must have a `testCaseId` (database ID)
   - Test case must already exist in the project
   - If test case doesn't exist, an error is returned for that result

3. **Test Results**: Records all test results with:
   - Status (PASSED, FAILED, BLOCKED, SKIPPED, RETEST)
   - Duration (in seconds)
   - Comments, error messages, and stack traces (if provided)

### Status Mapping

The importer maps report status values to EZTest statuses:
- `PASS` or `PASSED` → `PASSED`
- `FAIL` or `FAILED` → `FAILED`
- `SKIP` or `SKIPPED` → `SKIPPED`
- Unknown status → `SKIPPED` (with warning logged)

## Limitations

- The SDK requires TestNG for the listener functionality
- Test case creation requires appropriate API permissions
- API key authentication must be supported by your EZTest instance
- JSON import will create new test cases if they don't exist (searches by `test_id` first, then by title)

## Troubleshooting

### Tests not syncing to EZTest

1. Check that configuration is properly set (server URL, API key, project ID)
2. Verify API key has appropriate permissions
3. Check logs for error messages
4. Verify network connectivity to EZTest server

### Test cases not being created

1. Ensure `@EZTestCase` annotation is present on test methods
2. Check that API key has `testcases:create` permission
3. Verify test case titles are unique within the project

### API connection errors

1. Verify server URL is correct and accessible
2. Check firewall/network settings
3. Verify SSL certificates if using HTTPS
4. Check timeout settings (default: 30s connect, 60s read)

## Contributing

This SDK is designed to be portable and independent. When making changes:

- Do not add dependencies on EZTest backend/frontend code
- Do not add database access
- Maintain REST API-only communication
- Keep the SDK independently buildable

## License

See LICENSE file in the parent directory.

