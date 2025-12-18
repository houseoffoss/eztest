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
