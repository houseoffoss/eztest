# JSON Report Format Specification

This document describes the exact JSON format that the EZTest SDK accepts for importing automation test reports.

---

## Supported Format

The SDK accepts JSON reports in the **automation report format**. This is a minimal, schema-based format designed for easy integration with automation frameworks.

---

## JSON Structure

The JSON must have the following top-level structure:

```json
{
  "testRunName": "string",      // Required: Test run name
  "environment": "string",       // Required: Environment name
  "description": "string",       // Optional: Test run description
  "results": [ ... ]            // Required: Array of test results
}
```

---

## Field Specifications

### 1. `testRunName` (Required)

Name of the test run. This will be used to find or create a test run in EZTest.

```json
{
  "testRunName": "CI/CD Pipeline - Build #123"
}
```

**Notes:**
- Must be a non-empty string
- Used to identify the test run
- If a test run with the same name and environment exists, it will be reused

---

### 2. `environment` (Required)

Environment name where the tests were executed (e.g., "Staging", "Production", "Development").

```json
{
  "environment": "Staging"
}
```

**Notes:**
- Must be a non-empty string
- Used together with `testRunName` to identify the test run
- Maps to `TestRun.environment` in the database

---

### 3. `description` (Optional)

Optional description for the test run.

```json
{
  "description": "Automated regression tests from Jenkins"
}
```

**Notes:**
- Optional field
- If not provided, a default description will be used
- Maps to `TestRun.description` in the database

---

### 4. `results` (Required)

Array of individual test results. **Must contain at least one test result.**

```json
{
  "results": [
    {
      "testCaseId": "string",        // Required: Test case database ID (must exist)
      "status": "string",            // Required: Test status
      "duration": 0,                 // Optional: Duration in seconds (Integer)
      "comment": "string",           // Optional: Execution comment
      "errorMessage": "string",      // Optional: Error message (for failed tests)
      "stackTrace": "string"         // Optional: Stack trace (for failed tests)
    }
  ]
}
```

#### `testCaseId` (Required)

Test case identifier. Can be either:
- **tcId format**: Human-readable test case ID like `"TC-1"`, `"TC-2"`, etc. (recommended)
- **Database ID**: UUID format like `"cmk7yjgvz0001wk530v7u5f80"`

**Examples:**
```json
{
  "testCaseId": "TC-1"  // Recommended: Use tcId format
}
```

or

```json
{
  "testCaseId": "cmk7yjgvz0001wk530v7u5f80"  // Database UUID (also supported)
}
```

**Notes:**
- The test case must exist in your project
- If using tcId format (e.g., "TC-1"), it will be matched case-insensitively
- If the test case is not found, that result will be skipped and an error will be reported

Test case identifier. Can be either:
- **tcId format**: Human-readable test case ID like `"TC-1"`, `"TC-2"`, etc. (recommended)
- **Database ID**: UUID format like `"cmk7yjgvz0001wk530v7u5f80"`

**Examples:**
```json
{
  "testCaseId": "TC-1"  // Recommended: Use tcId format
}
```

or

```json
{
  "testCaseId": "cmk7yjgvz0001wk530v7u5f80"  // Database UUID (also supported)
}
```

**Notes:**
- Must be a non-empty string
- Test case must already exist in the project
- If using tcId format (e.g., "TC-1"), it will be matched case-insensitively within the project
- If the test case doesn't exist, an error will be returned for that result
- The system will first try to match by tcId format, then fall back to database ID

#### `status` (Required)

Test execution status. Must be one of the following values:

- `"PASSED"` - Test passed successfully
- `"FAILED"` - Test failed
- `"BLOCKED"` - Test was blocked
- `"SKIPPED"` - Test was skipped
- `"RETEST"` - Test needs retesting

```json
{
  "status": "PASSED"
}
```

**Notes:**
- Must match one of the allowed values exactly (case-sensitive)
- Maps to `TestResult.status` in the database

#### `duration` (Optional)

Test execution duration in **seconds** (not milliseconds).

```json
{
  "duration": 120
}
```

**Notes:**
- Optional field
- Must be a non-negative number
- Value is in seconds (e.g., 120 = 120 seconds = 2 minutes)
- Maps to `TestResult.duration` in the database

#### `comment` (Optional)

Optional comment about the test execution.

```json
{
  "comment": "Test executed successfully"
}
```

**Notes:**
- Optional field
- Maps to `TestResult.comment` in the database

#### `errorMessage` (Optional)

Error message for failed tests.

```json
{
  "errorMessage": "Timeout waiting for login button"
}
```

**Notes:**
- Optional field
- Typically used for `FAILED` status tests
- Maps to `TestResult.errorMessage` in the database

#### `stackTrace` (Optional)

Stack trace for failed tests.

```json
{
  "stackTrace": "java.lang.TimeoutException: Element not found\n  at org.openqa.selenium.support.ui.WebDriverWait.until(WebDriverWait.java:95)"
}
```

**Notes:**
- Optional field
- Typically used for `FAILED` status tests
- Can contain multi-line text
- Maps to `TestResult.stackTrace` in the database

---

## Complete Example

Here's a complete example of a valid automation report JSON:

```json
{
  "testRunName": "CI/CD Pipeline - Build #123",
  "environment": "Staging",
  "description": "Automated regression tests from Jenkins",
  "results": [
    {
      "testCaseId": "TC-1",
      "status": "PASSED",
      "duration": 120,
      "comment": "Test executed successfully"
    },
    {
      "testCaseId": "TC-2",
      "status": "FAILED",
      "duration": 95,
      "comment": "Test failed due to timeout",
      "errorMessage": "Timeout waiting for login button",
      "stackTrace": "java.lang.TimeoutException: Element not found\n  at org.openqa.selenium.support.ui.WebDriverWait.until(WebDriverWait.java:95)"
    },
    {
      "testCaseId": "TC-3",
      "status": "SKIPPED",
      "duration": 0,
      "comment": "Test was skipped due to missing test data"
    }
  ]
}
```

---

## Minimal Valid Example

The minimum required structure:

```json
{
  "testRunName": "Daily Smoke Tests",
  "environment": "Staging",
  "results": [
    {
      "testCaseId": "TC-1",
      "status": "PASSED"
    }
  ]
}
```

**Note:** While this is technically valid, providing more fields (like `duration`, `comment`, `errorMessage`) will result in better test result tracking in EZTest.

---

## Field Requirements Summary

| Section | Field | Required | Type | Notes |
|---------|-------|----------|------|-------|
| Root | `testRunName` | ✅ Yes | String | Test run name |
| Root | `environment` | ✅ Yes | String | Environment name |
| Root | `description` | ❌ No | String | Test run description |
| Root | `results` | ✅ Yes | Array | Must have at least 1 item |
| `results[]` | `testCaseId` | ✅ Yes | String | Test case database ID (must exist) |
| `results[]` | `status` | ✅ Yes | String | PASSED, FAILED, BLOCKED, SKIPPED, RETEST |
| `results[]` | `duration` | ❌ No | Integer | Duration in seconds |
| `results[]` | `comment` | ❌ No | String | Execution comment |
| `results[]` | `errorMessage` | ❌ No | String | Error message (for failed tests) |
| `results[]` | `stackTrace` | ❌ No | String | Stack trace (for failed tests) |

---

## How Test Cases Are Mapped

When importing an automation report:

1. **For each test result:**
   - SDK finds test case by `testCaseId` (database ID)
   - Test case must already exist in the project
   - If test case doesn't exist, an error is returned for that result
   - If test case belongs to a different project, an error is returned

2. **Test Run:**
   - SDK finds or creates test run by `testRunName` + `environment`
   - If found, reuses existing test run
   - If not found, creates new test run with:
     - Name: `testRunName`
     - Environment: `environment`
     - Description: `description` or default
     - Status: IN_PROGRESS (auto-started when results are recorded)

3. **Test Results:**
   - All results are recorded in a single API call
   - Test run is auto-completed when all results are processed

---

## Data Type Notes

- **Strings**: All string fields accept any text value
- **Integers**: `duration` should be a non-negative integer (seconds)
- **Arrays**: `results` is an array (must have at least 1 item)
- **Status Values**: Must match exactly: `PASSED`, `FAILED`, `BLOCKED`, `SKIPPED`, `RETEST` (case-sensitive)

---

## Schema Mapping

| JSON Field | Database Field | Notes |
|------------|---------------|-------|
| `testRunName` | `TestRun.name` | Direct mapping |
| `environment` | `TestRun.environment` | Direct mapping |
| `description` | `TestRun.description` | Direct mapping |
| `results[].testCaseId` | `TestCase.id` | Required, must exist in project |
| `results[].status` | `TestResult.status` | Direct mapping |
| `results[].duration` | `TestResult.duration` | In seconds |
| `results[].comment` | `TestResult.comment` | Direct mapping |
| `results[].errorMessage` | `TestResult.errorMessage` | Direct mapping |
| `results[].stackTrace` | `TestResult.stackTrace` | Direct mapping |

---

## Sample Files

- **Complete example**: See [samples/automation-report-example.json](../samples/automation-report-example.json)
- **Usage example**: See [samples/JsonReportImportExample.java](../samples/JsonReportImportExample.java)

---

## Troubleshooting

### Error: "Test run name is required"

**Cause:** The `testRunName` field is missing or empty.

**Solution:** Ensure your JSON has a non-empty `testRunName` field.

### Error: "Environment is required"

**Cause:** The `environment` field is missing or empty.

**Solution:** Ensure your JSON has a non-empty `environment` field.

### Error: "Automation report is empty or has no results"

**Cause:** The `results` array is empty or missing.

**Solution:** Ensure your JSON has a `results` array with at least one test result.

### Error: "Error parsing automation report JSON"

**Cause:** Invalid JSON syntax or structure.

**Solution:**
- Validate your JSON using a JSON validator
- Ensure all required fields (`testRunName`, `environment`, `results`) are present
- Check that `results` is an array, not an object
- Verify that each result has `testCaseId` and `status` fields

### Error: "Validation failed"

**Cause:** A field has an invalid value (e.g., invalid status value).

**Solution:**
- Check that `status` is one of: `PASSED`, `FAILED`, `BLOCKED`, `SKIPPED`, `RETEST`
- Ensure `duration` is a non-negative number
- Verify all required string fields are non-empty

---

## Questions?

- See [USAGE_GUIDE.md](USAGE_GUIDE.md) for usage examples
- See [README.md](README.md) for general SDK documentation
- See [HOW_TO_IMPORT_JSON.md](HOW_TO_IMPORT_JSON.md) for step-by-step import guide
- Check [samples/](../samples/) directory for working examples
