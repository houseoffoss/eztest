# Test Runs

Complete guide to executing tests and tracking results.

## Overview

Test runs are execution instances where you run test cases and record results. Features include:

- **Flexible Selection** - Include any test cases
- **Environment Tracking** - Specify execution environment
- **Real-time Progress** - Track execution status
- **Result Recording** - Pass, Fail, Blocked, Skipped
- **Reports** - Generate and email reports

---

## Table of Contents

- [Creating Test Runs](#creating-test-runs)
- [Executing Tests](#executing-tests)
- [Recording Results](#recording-results)
- [Test Run Status](#test-run-status)
- [Reports](#reports)
- [Uploading TestNG XML Results](#xml-upload)
- [Best Practices](#best-practices)

---

## <a id="creating-test-runs"></a>Creating Test Runs

### Required Permissions

- `testruns:create` permission
- Project membership

### Create a Test Run

1. Navigate to your project
2. Go to **Test Runs** tab
3. Click **"Create Test Run"**

### Test Run Fields

| Field | Required | Description |
|-------|----------|-------------|
| **Name** | Yes | Descriptive run name |
| **Description** | No | Additional details |
| **Environment** | No | Execution environment |
| **Assigned To** | No | Person responsible |

### Select Test Cases

Choose test cases to include:

**Option 1: Select Individually**
- Check individual test cases

**Option 2: Select by Suite**
- Check entire suites

**Option 3: Select by Filter**
- Filter by priority, status, module
- Select all filtered results

### Environment Options

Common environments:
- Development
- Staging
- QA
- UAT
- Production

---

## <a id="executing-tests"></a>Executing Tests

### Start Test Run

1. Open the test run
2. Click **"Start"** button
3. Status changes to **IN_PROGRESS**
4. Start time is recorded

### Execution Interface

The execution view shows:

| Element | Description |
|---------|-------------|
| **Test List** | All test cases in the run |
| **Progress Bar** | Overall completion percentage |
| **Current Test** | Active test case details |
| **Steps** | Test steps with actions |
| **Result Buttons** | Pass, Fail, Blocked, Skip |

### Execute Each Test

1. **Read the test case** - Title, description, preconditions
2. **Follow each step** - Execute the action
3. **Verify results** - Compare with expected result
4. **Record outcome** - Select result status
5. **Add comments** - Document observations
6. **Proceed** - Move to next test

---

## <a id="recording-results"></a>Recording Results

### Result Statuses

| Status | Icon | Description | When to Use |
|--------|------|-------------|-------------|
| **Passed** | ✅ | All steps successful | Test meets expectations |
| **Failed** | ❌ | One or more steps failed | Defect found |
| **Blocked** | 🚫 | Cannot execute | Environment issue, dependency |
| **Skipped** | ⏭️ | Intentionally not run | Not applicable, time constraints |
| **Retest** | 🔄 | Needs re-execution | After bug fix |

### Recording a Result

1. Select the test case
2. Review test steps
3. Click result status button
4. Add optional details:
   - **Comment** - Execution notes
   - **Duration** - Actual time spent
   - **Error Message** - For failures
   - **Attachments** - Screenshots, logs

### Example: Recording a Failure

```
Status: Failed
Comment: Step 4 failed - After clicking 'Submit', page shows 
         "500 Server Error" instead of success message.
Duration: 5 minutes
Error: HTTP 500 Internal Server Error

[Attached: screenshot.png, error_log.txt]
```

### Bulk Result Entry

For multiple similar results:
1. Select multiple test cases
2. Choose **Bulk Update**
3. Set common status
4. Apply

---

## <a id="test-run-status"></a>Test Run Status

### Status Lifecycle

```
PLANNED → IN_PROGRESS → COMPLETED
                     ↘
                      CANCELLED
```

| Status | Description | Actions |
|--------|-------------|---------|
| **Planned** | Created but not started | Edit, Start, Delete |
| **In Progress** | Currently executing | Record results, Complete |
| **Completed** | All tests executed | View report, Reopen |
| **Cancelled** | Aborted | View partial results |

### Complete Test Run

1. All test cases have results (or mark as skipped)
2. Click **"Complete"** button
3. End time is recorded
4. Generate final report

### Reopen Test Run

If you need to modify results:
1. Open completed run
2. Click **"Reopen"**
3. Make changes
4. Complete again

---

## <a id="reports"></a>Reports

### Summary Report

Automatically generated showing:

| Metric | Description |
|--------|-------------|
| **Total Tests** | Number of test cases |
| **Passed** | Count and percentage |
| **Failed** | Count and percentage |
| **Blocked** | Count and percentage |
| **Skipped** | Count and percentage |
| **Duration** | Total execution time |

### Detailed Report

For each test case:
- Result status
- Execution time
- Comments
- Error messages

### Email Reports

Send reports to stakeholders:

1. Open completed test run
2. Click **"Send Report"**
3. Enter recipient emails
4. Add optional message
5. Click **"Send"**

### Export Options

| Format | Use Case |
|--------|----------|
| **PDF** | Formal documentation |
| **CSV** | Data analysis |
| **Email** | Quick sharing |

---

## <a id="best-practices"></a>Best Practices

### Planning Test Runs

1. **Define scope** - What features/tests to include
2. **Set environment** - Where to execute
3. **Assign owner** - Who is responsible
4. **Estimate time** - Based on test count and complexity

### Execution Tips

1. **Follow the steps** - Don't skip or assume
2. **Document everything** - Notes help debugging
3. **Attach evidence** - Screenshots for failures
4. **Report defects immediately** - Link to failed tests

### Naming Conventions

| ✅ Good | ❌ Avoid |
|---------|---------|
| "Sprint 23 - Smoke Tests" | "Test Run 1" |
| "Release 2.1 - Regression" | "Testing" |
| "UAT - Payment Module" | "Run" |

### Run Organization

| Type | Frequency | Scope |
|------|-----------|-------|
| **Smoke Test** | Daily/Per Build | Critical paths only |
| **Regression** | Per Release | Full test suite |
| **UAT** | Per Feature | User acceptance criteria |
| **Performance** | As needed | Load/stress tests |

---

## <a id="xml-upload"></a>Uploading TestNG XML Results

### Overview

EzTest supports importing test execution results from TestNG XML report files. This allows you to:

> **🔗 Automation Integration:** For automatic uploads from Maven/TestNG projects, see the [TestNG Maven Integration Guide](../../integrations/testng-maven-integration.md).

- Import automated test results from CI/CD pipelines
- Bulk import test execution data
- Automatically match test methods with test cases
- Create test runs from automation reports

### How It Works

1. **Generate TestNG XML** - Run your automated tests and generate TestNG XML report
2. **Upload XML File** - Use the upload dialog to select your XML file
3. **Match Test Cases** - System matches test method names with test case IDs
4. **Create Test Run** - New test run is created with imported results
5. **View Results** - Results are immediately available in the test run

---

### Required XML Format

EzTest expects **TestNG XML format** with the following structure:

#### Basic Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<testng-results>
  <suite name="YourSuiteName">
    <test name="YourTestName">
      <class name="com.example.YourTestClass">
        <test-method 
          name="TC001" 
          status="PASS" 
          is-config="false"
          started-at="2026-01-13T21:38:37 IST"
          finished-at="2026-01-13T21:38:40 IST"
          duration-ms="3000" 
        />
      </class>
    </test>
  </suite>
</testng-results>
```

#### Complete Example

```xml
<?xml version="1.0" encoding="UTF-8"?>
<testng-results>
  <suite name="LoginTestSuite">
    <test name="LoginTests">
      <class name="com.example.LoginTest">
        <!-- Test Method 1: Passed -->
        <test-method 
          name="TC001" 
          status="PASS" 
          is-config="false"
          started-at="2026-01-13T21:38:37 IST"
          finished-at="2026-01-13T21:38:40 IST"
          duration-ms="3000" 
        />
        
        <!-- Test Method 2: Failed -->
        <test-method 
          name="TC002" 
          status="FAIL" 
          is-config="false"
          started-at="2026-01-13T21:38:41 IST"
          finished-at="2026-01-13T21:38:45 IST"
          duration-ms="4000" 
        />
        
        <!-- Test Method 3: Skipped -->
        <test-method 
          name="TC003" 
          status="SKIP" 
          is-config="false"
          duration-ms="0" 
        />
        
        <!-- Configuration Method (ignored) -->
        <test-method 
          name="setup" 
          status="PASS" 
          is-config="true"
          duration-ms="500" 
        />
      </class>
    </test>
  </suite>
</testng-results>
```

---

### Required Attributes

Each `<test-method>` element **must** have:

| Attribute | Required | Description | Example |
|-----------|----------|-------------|---------|
| `name` | ✅ **Yes** | Test case ID (must match test case `tcId` in EzTest) | `"TC001"` |
| `status` | ✅ **Yes** | Test result: `PASS`, `FAIL`, or `SKIP` | `"PASS"` |

### Optional Attributes

| Attribute | Required | Description | Example |
|-----------|----------|-------------|---------|
| `is-config` | No | Whether this is a configuration method (beforeSuite, afterSuite, etc.). Default: `"false"` | `"false"` |
| `started-at` | No | Test start timestamp | `"2026-01-13T21:38:37 IST"` |
| `finished-at` | No | Test end timestamp | `"2026-01-13T21:38:40 IST"` |
| `duration-ms` | No | Test duration in milliseconds | `"3000"` |

---

### Status Mapping

TestNG status values are mapped to EzTest statuses:

| TestNG Status | EzTest Status | Description |
|---------------|---------------|-------------|
| `PASS` | `PASSED` | Test executed successfully |
| `FAIL` | `FAILED` | Test failed |
| `SKIP` | `SKIPPED` | Test was skipped |
| Any other value | `FAILED` | Unknown status defaults to failed (conservative approach) |

---

### Date Format

Timestamps support multiple formats:

**Supported Formats:**
- `"2026-01-13T21:38:37 IST"` (with timezone abbreviation)
- `"2026-01-13T21:38:37Z"` (UTC)
- `"2026-01-13T21:38:37+05:30"` (with timezone offset)
- `"2026-01-13T21:38:37"` (local time)

**Supported Timezone Abbreviations:**
- IST, GMT, UTC, PST, EST, CST, EDT, PDT, CDT, MDT, MST
- AKST, AKDT, HST, HAST, HADT, SST, SDT, CHST

**Note:** Dates are converted to ISO 8601 format in the database.

---

### Test Case Matching

The system matches test methods with test cases using the `name` attribute:

1. **Extract `name`** from `<test-method name="TC001">`
2. **Find test case** with matching `tcId` in the project
3. **Import result** if match found
4. **Skip** if no match found (reported in import summary)

**Important:** The `name` attribute must exactly match the test case `tcId` in EzTest.

**Example:**
```xml
<!-- XML -->
<test-method name="TC_LOGIN_001" status="PASS" />

<!-- Matches EzTest test case with tcId = "TC_LOGIN_001" -->
```

---

### Configuration Methods

TestNG configuration methods are automatically ignored:

```xml
<!-- These are IGNORED (is-config="true") -->
<test-method name="beforeSuite" is-config="true" status="PASS" />
<test-method name="afterSuite" is-config="true" status="PASS" />
<test-method name="beforeMethod" is-config="true" status="PASS" />
<test-method name="afterMethod" is-config="true" status="PASS" />
<test-method name="beforeClass" is-config="true" status="PASS" />
<test-method name="afterClass" is-config="true" status="PASS" />
```

Only test methods with `is-config="false"` (or missing `is-config`) are imported.

---

### Upload Process

#### Step 1: Access Upload Dialog

1. Navigate to your project
2. Go to **Test Runs** tab
3. Click **"Upload TestNG XML"** button

#### Step 2: Select Environment

Choose the execution environment:
- Development
- Staging
- QA
- UAT
- Production
- (Or custom environment)

**Note:** Environment is required for XML uploads.

#### Step 3: Upload XML File

1. Click **"Choose File"** or drag and drop
2. Select your TestNG XML file (`.xml` extension)
3. System validates file format

#### Step 4: Preview Test Run Name

The system generates a test run name from the filename:
- **Filename:** `sprint1-tests.xml`
- **Generated Name:** `sprint1-tests_2026-01-13`

You can see the preview before uploading.

#### Step 5: Check Matching

Before import, the system checks:
- How many test methods are in the XML
- How many match existing test cases
- Shows match count

**If no matches found:**
- Upload is blocked
- Error message displayed
- Check that test case IDs match

#### Step 6: Import Results

1. Click **"Upload"** button
2. System creates test run
3. Imports all matching test results
4. Shows import summary

---

### Import Summary

After upload, you'll see:

| Metric | Description |
|--------|-------------|
| **Success** | Number of test results imported successfully |
| **Failed** | Number of test results that failed to import |
| **Skipped** | Number of test methods that didn't match any test case |

**Example Summary:**
```
✅ Success: 45
⚠️ Skipped: 5 (test cases not found)
❌ Failed: 0
```

**Skipped Items:**
- Test methods that don't match any test case `tcId`
- Reason: "Test case ID 'TC999' not found in project"

**Failed Items:**
- Test methods that matched but failed to import
- Error message displayed

---

### Best Practices

#### 1. Test Case ID Naming

**✅ Good:**
- Use consistent naming: `TC001`, `TC002`, `TC_LOGIN_001`
- Match TestNG method names with EzTest `tcId`
- Use descriptive IDs: `TC_USER_LOGIN_VALID`

**❌ Avoid:**
- Random names: `test1`, `testMethod`, `loginTest`
- Inconsistent formats
- Special characters that might cause issues

#### 2. XML File Structure

**✅ Good:**
- Well-formed XML
- All required attributes present
- Proper nesting structure

**❌ Avoid:**
- Malformed XML
- Missing `name` or `status` attributes
- Invalid date formats

#### 3. TestNG Configuration

**Generate XML with:**
```java
// TestNG configuration
@Listeners({TestListenerAdapter.class})
public class YourTestClass {
    @Test
    public void TC001() {
        // Your test code
    }
}
```

**Ensure:**
- Test method names match test case IDs
- XML report is generated after test execution
- Configuration methods are marked with `is-config="true"`

#### 4. File Naming

**✅ Good:**
- Descriptive names: `sprint1-regression-tests.xml`
- Include date: `smoke-tests-2026-01-13.xml`
- Include environment: `qa-tests-staging.xml`

**❌ Avoid:**
- Generic names: `test.xml`, `results.xml`
- No context about what the file contains

---

### Limitations

1. **Test Case Matching**
   - Only test methods with matching `tcId` are imported
   - Test cases must exist in the project before import
   - Case-sensitive matching

2. **Nested Structures**
   - Supports nested `<suite>`, `<test>`, `<class>` structures
   - All `<test-method>` elements are extracted regardless of nesting level

3. **File Size**
   - Recommended: < 10 MB
   - Very large files may take longer to process

4. **Date Parsing**
   - Supports common timezone abbreviations
   - Dates without timezone are parsed as local time
   - Invalid dates are ignored (test still imported)

5. **Status Values**
   - Only `PASS`, `FAIL`, `SKIP` are standard
   - Unknown statuses default to `FAILED`

---

### Troubleshooting

#### Issue: "No matching items found"

**Problem:** No test methods match existing test cases.

**Solutions:**
1. Check test case IDs in EzTest match XML `name` attributes
2. Verify you're uploading to the correct project
3. Ensure test cases exist before importing

#### Issue: "Invalid file type"

**Problem:** File is not recognized as XML.

**Solutions:**
1. Ensure file has `.xml` extension
2. Check file is valid XML (open in text editor)
3. Verify XML structure is correct

#### Issue: "Failed to parse XML"

**Problem:** XML is malformed or invalid.

**Solutions:**
1. Validate XML structure
2. Check for unclosed tags
3. Verify XML encoding (should be UTF-8)
4. Test XML in an XML validator

#### Issue: "Test methods skipped"

**Problem:** Test methods don't match test case IDs.

**Solutions:**
1. Review skipped items list in import summary
2. Create missing test cases in EzTest
3. Update TestNG test method names to match `tcId`
4. Re-upload XML file

---

### API Endpoints

#### Check XML Matches

**Endpoint:** `POST /api/projects/:id/testruns/check-xml`

**Request:**
```http
POST /api/projects/proj_123/testruns/check-xml
Content-Type: multipart/form-data

file: [XML file]
```

**Response:**
```json
{
  "data": {
    "matchCount": 45,
    "totalTestMethods": 50
  }
}
```

#### Upload XML

**Endpoint:** `POST /api/testruns/:id/upload-xml`

**Request:**
```http
POST /api/testruns/run_123/upload-xml
Content-Type: multipart/form-data

file: [XML file]
```

**Response:**
```json
{
  "data": {
    "success": 45,
    "failed": 0,
    "skipped": 5,
    "errors": [],
    "skippedItems": [
      {
        "testMethodName": "TC999",
        "reason": "Test case ID 'TC999' not found in project"
      }
    ],
    "imported": [
      {
        "testCaseId": "tc_123",
        "testCaseTcId": "TC001",
        "testMethodName": "TC001",
        "status": "PASSED"
      }
    ]
  }
}
```

---

## API Reference

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/projects/:id/testruns` | List test runs |
| `POST` | `/api/projects/:id/testruns` | Create test run |
| `GET` | `/api/testruns/:id` | Get test run |
| `PUT` | `/api/testruns/:id` | Update test run |
| `DELETE` | `/api/testruns/:id` | Delete test run |
| `POST` | `/api/testruns/:id/start` | Start execution |
| `POST` | `/api/testruns/:id/complete` | Complete run |
| `POST` | `/api/testruns/:id/results` | Record result |
| `POST` | `/api/projects/:id/testruns/check-xml` | Check XML matches |
| `POST` | `/api/testruns/:id/upload-xml` | Upload XML results |

### Example: Create Test Run

```bash
curl -X POST http://localhost:3000/api/projects/proj-id/testruns \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sprint 1 - Smoke Tests",
    "environment": "Staging",
    "testCaseIds": ["tc-id-1", "tc-id-2"]
  }'
```

---

## Related Documentation

- [Test Cases](../test-cases/README.md)
- [Defects](../defects/README.md)
- [API Reference](../../api/test-runs.md)

