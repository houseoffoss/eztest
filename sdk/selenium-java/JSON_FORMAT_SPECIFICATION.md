# JSON Report Format Specification

This document describes the exact JSON format that the EZTest SDK accepts for importing test reports.

---

## Supported Format

The SDK accepts JSON reports in the **ExtentSparkReporter-compatible format**. This format is designed to be flexible and can accept additional fields (unknown fields are ignored).

---

## JSON Structure

The JSON must have the following top-level structure:

```json
{
  "report_meta": { ... },    // Required: Report metadata
  "summary": { ... },        // Required: Test execution summary
  "results": [ ... ]         // Required: Array of test results
}
```

---

## Field Specifications

### 1. `report_meta` (Required)

Report metadata section containing information about the test execution environment and configuration.

```json
{
  "report_meta": {
    "project_name": "string",           // Optional: Project name
    "generated_at": "string",           // Optional: Report generation timestamp
    "report_source": "string",          // Optional: Source tool (e.g., "ExtentSparkReporter")
    "environment": { ... },             // Optional: Environment details
    "user_config": { ... }              // Optional: User configuration
  }
}
```

#### `environment` (Optional)

```json
{
  "environment": {
    "os": "string",                     // Optional: Operating system (e.g., "Windows 11")
    "java_version": "string",           // Optional: Java version (e.g., "21")
    "browser": "string",                // Optional: Browser name (e.g., "Chrome")
    "environment_url": "string"         // Optional: Test environment URL
  }
}
```

#### `user_config` (Optional)

```json
{
  "user_config": {
    "triggered_by": "string",          // Optional: Who triggered the test (e.g., "Jenkins_User")
    "build_id": "string",              // Optional: Build identifier (e.g., "v1.0.234")
    "execution_profile": "string"      // Optional: Execution profile (e.g., "Regression")
  }
}
```

---

### 2. `summary` (Required)

Test execution summary with overall statistics.

```json
{
  "summary": {
    "total_tests": 0,                   // Optional: Total number of tests (Integer)
    "passed": 0,                        // Optional: Number of passed tests (Integer)
    "failed": 0,                        // Optional: Number of failed tests (Integer)
    "skipped": 0,                       // Optional: Number of skipped tests (Integer)
    "total_duration_ms": 0,             // Optional: Total duration in milliseconds (Long)
    "start_time": "string",             // Optional: Test execution start time
    "end_time": "string"                // Optional: Test execution end time
  }
}
```

**Note:** All fields in `summary` are optional, but at least one should be present for meaningful import.

---

### 3. `results` (Required)

Array of individual test results. **Must contain at least one test result.**

```json
{
  "results": [
    {
      "test_id": "string",              // Optional: Test case identifier (e.g., "TC09")
      "test_name": "string",            // Required: Test name (e.g., "TC09_NavigationCheck")
      "class_name": "string",           // Optional: Full class name
      "status": "string",               // Required: Test status ("PASS", "FAIL", "SKIP", etc.)
      "start_time": "string",           // Optional: Test start time
      "end_time": "string",             // Optional: Test end time
      "duration_ms": 0,                 // Optional: Test duration in milliseconds (Long)
      "tags": ["string"],               // Optional: Array of tags
      "error_message": "string",        // Optional: Error message (for failed tests)
      "stack_trace": "string"           // Optional: Stack trace (for failed tests)
    }
  ]
}
```

**Status Values:**
- `"PASS"` or `"PASSED"` → Mapped to `PASSED` in EZTest
- `"FAIL"` or `"FAILED"` → Mapped to `FAILED` in EZTest
- `"SKIP"` or `"SKIPPED"` → Mapped to `SKIPPED` in EZTest
- Any other value → Mapped to `SKIPPED` (with warning logged)

---

## Complete Example

Here's a complete example of a valid JSON report:

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
      "environment_url": "https://staging.houseoffoss.com"
    },
    "user_config": {
      "triggered_by": "Jenkins_User",
      "build_id": "v1.0.234",
      "execution_profile": "Regression"
    }
  },
  "summary": {
    "total_tests": 1,
    "passed": 1,
    "failed": 0,
    "skipped": 0,
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
      "tags": ["Smoke", "Navigation"]
    },
    {
      "test_id": "TC10",
      "test_name": "TC10_LoginTest",
      "class_name": "testcases.TC10_Login_Test",
      "status": "FAIL",
      "start_time": "2026-01-12T21:36:00 IST",
      "end_time": "2026-01-12T21:36:30 IST",
      "duration_ms": 30000,
      "tags": ["Smoke", "Login"],
      "error_message": "Element not found: login button",
      "stack_trace": "org.openqa.selenium.NoSuchElementException: ..."
    }
  ]
}
```

---

## Minimal Valid Example

The SDK is flexible and can work with minimal JSON. Here's the minimum required structure:

```json
{
  "report_meta": {},
  "summary": {},
  "results": [
    {
      "test_name": "My Test",
      "status": "PASS"
    }
  ]
}
```

**Note:** While this is technically valid, providing more fields will result in better test case creation and metadata in EZTest.

---

## Field Requirements Summary

| Section | Field | Required | Type | Notes |
|---------|-------|----------|------|-------|
| Root | `report_meta` | ✅ Yes | Object | Can be empty `{}` |
| Root | `summary` | ✅ Yes | Object | Can be empty `{}` |
| Root | `results` | ✅ Yes | Array | Must have at least 1 item |
| `results[]` | `test_name` | ✅ Yes | String | Test name |
| `results[]` | `status` | ✅ Yes | String | "PASS", "FAIL", "SKIP", etc. |
| `results[]` | `test_id` | ❌ No | String | Used for test case lookup |
| `results[]` | `class_name` | ❌ No | String | Added to description |
| `results[]` | `duration_ms` | ❌ No | Long | Converted to seconds |
| `results[]` | `tags` | ❌ No | Array | Added to comments |
| `results[]` | `error_message` | ❌ No | String | For failed tests |
| `results[]` | `results[]` | `stack_trace` | ❌ No | String | For failed tests |

---

## How Unknown Fields Are Handled

The SDK uses `@JsonIgnoreProperties(ignoreUnknown = true)`, which means:

✅ **Additional fields are ignored** - You can add extra fields to your JSON without breaking the import

✅ **Missing optional fields are OK** - All fields except `test_name` and `status` in results are optional

❌ **Missing required fields will cause errors** - The `results` array must have at least one item, and each result must have `test_name` and `status`

---

## Data Type Notes

- **Strings**: All string fields accept any text value
- **Integers**: `total_tests`, `passed`, `failed`, `skipped` should be integers (0 or positive)
- **Long**: `total_duration_ms` and `duration_ms` should be long integers (milliseconds)
- **Arrays**: `tags` and `results` are arrays (can be empty `[]`)
- **Timestamps**: Time fields (`start_time`, `end_time`, `generated_at`) are strings and can be in any format (the SDK doesn't parse them, just stores them)

---

## How Test Cases Are Created/Mapped

When importing a JSON report:

1. **For each test result:**
   - SDK first tries to find existing test case by `test_id` (if provided)
   - If not found, tries to find by title (`test_id + " - " + test_name` or just `test_name`)
   - If still not found, creates a new test case

2. **Test case title:**
   - If `test_id` is provided: `"{test_id} - {test_name}"`
   - If `test_id` is not provided: `"{test_name}"`

3. **Test case description includes:**
   - Class name (if provided)
   - Tags (if provided)
   - Environment info (browser, OS) from `report_meta.environment`

4. **Test case priority:**
   - `HIGH` if tags contain "critical" or "high" (case-insensitive)
   - `MEDIUM` otherwise

---

## Sample Files

- **Complete example**: See [samples/sample-report.json](../samples/sample-report.json)
- **Usage example**: See [samples/JsonReportImportExample.java](../samples/JsonReportImportExample.java)

---

## Troubleshooting

### Error: "Report is empty or has no results"

**Cause:** The `results` array is empty or missing.

**Solution:** Ensure your JSON has a `results` array with at least one test result.

### Error: "Error parsing JSON report"

**Cause:** Invalid JSON syntax or structure.

**Solution:**
- Validate your JSON using a JSON validator
- Ensure all required top-level fields (`report_meta`, `summary`, `results`) are present
- Check that `results` is an array, not an object

### Warning: "Unknown status: X. Defaulting to SKIPPED"

**Cause:** A test result has a status value that doesn't match "PASS", "FAIL", or "SKIP".

**Solution:** Use one of the supported status values: `"PASS"`, `"PASSED"`, `"FAIL"`, `"FAILED"`, `"SKIP"`, or `"SKIPPED"`.

---

## Questions?

- See [USAGE_GUIDE.md](USAGE_GUIDE.md) for usage examples
- See [README.md](README.md) for general SDK documentation
- Check [samples/](../samples/) directory for working examples

