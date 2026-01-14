# EZTest SDK - API JSON Formats Reference

This document provides sample JSON formats for all API endpoints used by the SDK.

---

## 1. API Key Management

### Create API Key
**Endpoint:** `POST /api/apikeys`

**Request:**
```json
{
  "name": "My SDK Key",
  "projectId": "clxyz123abc456def789",
  "expiresAt": "2026-12-31T23:59:59Z"
}
```

**Response:**
```json
{
  "data": {
    "key": "eztest_abc123...",
    "apiKey": {
      "id": "key_xyz",
      "name": "My SDK Key",
      "keyPrefix": "eztest_abc",
      "projectId": "clxyz123abc456def789",
      "isActive": true,
      "createdAt": "2026-01-14T10:30:00Z"
    }
  },
  "message": "API key created successfully. Please save the key securely - it will not be shown again."
}
```

---

## 2. Test Case Management

### Create Test Case
**Endpoint:** `POST /api/projects/{projectId}/testcases`

**Request:**
```json
{
  "title": "Verify user can login with valid credentials",
  "description": "Test that users can login successfully",
  "priority": "HIGH",
  "status": "ACTIVE",
  "suiteId": "suite_123",
  "moduleId": "module_456",
  "estimatedTime": 10,
  "preconditions": "User account exists",
  "postconditions": "User is logged in",
  "expectedResult": "User redirected to dashboard",
  "testData": "username: testuser, password: Test123!",
  "steps": [
    {
      "stepNumber": 1,
      "action": "Navigate to login page",
      "expectedResult": "Login form displayed"
    },
    {
      "stepNumber": 2,
      "action": "Enter valid credentials",
      "expectedResult": "Fields accept input"
    }
  ]
}
```

**Response:**
```json
{
  "data": {
    "id": "tc_abc123",
    "tcId": "TC-1",
    "title": "Verify user can login with valid credentials",
    "priority": "HIGH",
    "status": "ACTIVE",
    "createdAt": "2026-01-14T10:30:00Z"
  },
  "statusCode": 201
}
```

### Update Test Case
**Endpoint:** `PUT /api/testcases/{id}`

**Request:**
```json
{
  "title": "Updated test case title",
  "description": "Updated description",
  "priority": "CRITICAL",
  "status": "ACTIVE",
  "estimatedTime": 15,
  "preconditions": "Updated preconditions",
  "postconditions": "Updated postconditions",
  "expectedResult": "Updated expected result",
  "testData": "Updated test data",
  "moduleId": "module_789",
  "suiteId": "suite_456"
}
```

**Response:**
```json
{
  "data": {
    "id": "tc_abc123",
    "tcId": "TC-1",
    "title": "Updated test case title",
    "priority": "CRITICAL",
    "status": "ACTIVE",
    "updatedAt": "2026-01-14T11:00:00Z"
  }
}
```

### Get Test Case by ID
**Endpoint:** `GET /api/testcases/{id}`

**Response:**
```json
{
  "data": {
    "id": "tc_abc123",
    "tcId": "TC-1",
    "projectId": "proj_abc123",
    "title": "Verify user can login",
    "description": "Test user login functionality",
    "priority": "HIGH",
    "status": "ACTIVE",
    "estimatedTime": 10,
    "preconditions": "User account exists",
    "postconditions": "User is logged in",
    "expectedResult": "User redirected to dashboard",
    "testData": "username: testuser, password: Test123!",
    "createdAt": "2026-01-14T10:30:00Z",
    "updatedAt": "2026-01-14T10:30:00Z"
  }
}
```

### Get Test Case History (Execution History)
**Endpoint:** `GET /api/testcases/{id}/history`

**Response:**
```json
{
  "data": [
    {
      "id": "result_1",
      "testCaseId": "tc_abc123",
      "testRunId": "run_xyz",
      "status": "PASSED",
      "duration": 120,
      "comment": "Test executed successfully",
      "errorMessage": null,
      "stackTrace": null,
      "executedAt": "2026-01-14T10:35:00Z",
      "executedBy": {
        "id": "user_xyz",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "testRun": {
        "id": "run_xyz",
        "name": "Sprint 1 - Smoke Tests",
        "environment": "Staging",
        "status": "COMPLETED"
      }
    },
    {
      "id": "result_2",
      "testCaseId": "tc_abc123",
      "testRunId": "run_abc",
      "status": "FAILED",
      "duration": 95,
      "comment": "Test failed due to timeout",
      "errorMessage": "Timeout waiting for element",
      "stackTrace": "java.lang.TimeoutException: ...",
      "executedAt": "2026-01-13T15:20:00Z",
      "executedBy": {
        "id": "user_abc",
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "testRun": {
        "id": "run_abc",
        "name": "Regression Test Run",
        "environment": "Production",
        "status": "COMPLETED"
      }
    }
  ]
}
```

### Search Test Cases
**Endpoint:** `GET /api/projects/{projectId}/testcases?search={term}&status=ACTIVE&priority=HIGH`

**Response:**
```json
{
  "data": [
    {
      "id": "tc_abc123",
      "tcId": "TC-1",
      "title": "Verify user can login",
      "priority": "HIGH",
      "status": "ACTIVE"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

---

## 3. Test Run Management

### Create Test Run
**Endpoint:** `POST /api/projects/{projectId}/testruns`

**Request:**
```json
{
  "name": "Sprint 1 - Smoke Tests",
  "description": "Basic smoke tests for Sprint 1",
  "environment": "Staging",
  "assignedToId": "user_xyz",
  "testCaseIds": ["tc_1", "tc_2", "tc_3"]
}
```

**Response:**
```json
{
  "data": {
    "id": "run_abc123",
    "name": "Sprint 1 - Smoke Tests",
    "status": "PLANNED",
    "environment": "Staging",
    "createdAt": "2026-01-14T09:00:00Z",
    "_count": {
      "results": 0
    }
  },
  "statusCode": 201
}
```

### Update Test Run
**Endpoint:** `PATCH /api/testruns/{id}`

**Request:**
```json
{
  "name": "Updated Test Run Name",
  "description": "Updated description",
  "status": "IN_PROGRESS",
  "assignedToId": "user_abc",
  "environment": "Production"
}
```

**Response:**
```json
{
  "data": {
    "id": "run_abc123",
    "name": "Updated Test Run Name",
    "status": "IN_PROGRESS",
    "environment": "Production",
    "updatedAt": "2026-01-14T11:00:00Z"
  }
}
```

### Start Test Run
**Endpoint:** `POST /api/testruns/{id}/start`

**Response:**
```json
{
  "data": {
    "id": "run_abc123",
    "status": "IN_PROGRESS",
    "startedAt": "2026-01-14T10:30:00Z"
  }
}
```

### Complete Test Run
**Endpoint:** `POST /api/testruns/{id}/complete`

**Response:**
```json
{
  "data": {
    "id": "run_abc123",
    "status": "COMPLETED",
    "completedAt": "2026-01-14T11:00:00Z",
    "emailAvailable": true,
    "emailStatusMessage": "Email service is available. You can send report to recipients."
  }
}
```

### Get Test Run by ID
**Endpoint:** `GET /api/testruns/{id}`

**Response:**
```json
{
  "data": {
    "id": "run_abc123",
    "projectId": "proj_abc123",
    "name": "Sprint 1 - Smoke Tests",
    "description": "Basic smoke tests for Sprint 1",
    "status": "IN_PROGRESS",
    "environment": "Staging",
    "assignedTo": {
      "id": "user_xyz",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "createdBy": {
      "id": "user_abc",
      "name": "Jane Smith"
    },
    "startedAt": "2026-01-14T10:30:00Z",
    "completedAt": null,
    "createdAt": "2026-01-14T09:00:00Z",
    "updatedAt": "2026-01-14T10:30:00Z",
    "stats": {
      "total": 20,
      "passed": 8,
      "failed": 2,
      "blocked": 0,
      "skipped": 0,
      "pending": 10
    }
  }
}
```

---

## 4. Test Result Management

### Record Test Result
**Endpoint:** `POST /api/testruns/{id}/results`

**Request:**
```json
{
  "testCaseId": "tc_abc123",
  "status": "PASSED",
  "duration": 120,
  "comment": "Test executed successfully",
  "errorMessage": null,
  "stackTrace": null
}
```

**For Failed Test:**
```json
{
  "testCaseId": "tc_abc123",
  "status": "FAILED",
  "duration": 95,
  "comment": "Test failed due to timeout",
  "errorMessage": "Timeout waiting for element",
  "stackTrace": "java.lang.TimeoutException: Element not found\n  at com.example.TestClass.testMethod(TestClass.java:45)"
}
```

**Response:**
```json
{
  "data": {
    "id": "result_1",
    "testCaseId": "tc_abc123",
    "testRunId": "run_abc123",
    "status": "PASSED",
    "duration": 120,
    "executedAt": "2026-01-14T10:35:00Z"
  },
  "statusCode": 201
}
```

---

## 5. Automation Report Import

### Import Automation Report
**Endpoint:** `POST /api/projects/{projectId}/automation-report`

**Request:**
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
      "comment": "Test failed due to timeout",
      "errorMessage": "Timeout waiting for login button",
      "stackTrace": "java.lang.TimeoutException: Element not found\n  at org.openqa.selenium.support.ui.WebDriverWait.until(WebDriverWait.java:95)"
    },
    {
      "testCaseId": "tc_ghi789",
      "status": "SKIPPED",
      "duration": 0,
      "comment": "Test was skipped due to missing test data"
    }
  ]
}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `testRunName` | string | Yes | Name of the test run |
| `environment` | string | Yes | Environment name (e.g., "Staging", "Production") |
| `description` | string | No | Test run description |
| `results` | array | Yes | Array of test results (min 1) |
| `results[].testCaseId` | string | Yes | Test case database ID (must exist) |
| `results[].status` | string | Yes | PASSED, FAILED, BLOCKED, SKIPPED, RETEST |
| `results[].duration` | number | No | Duration in seconds |
| `results[].comment` | string | No | Execution comment |
| `results[].errorMessage` | string | No | Error message (for failed tests) |
| `results[].stackTrace` | string | No | Stack trace (for failed tests) |

**Response (201 Created):**
```json
{
  "data": {
    "testRunId": "run_abc123",
    "testRunName": "CI/CD Pipeline - Build #123",
    "environment": "Staging",
    "processedCount": 3,
    "errorCount": 0,
    "results": [
      {
        "testCaseId": "tc_abc123",
        "status": "PASSED",
        "resultId": "result_1"
      },
      {
        "testCaseId": "tc_def456",
        "status": "FAILED",
        "resultId": "result_2"
      },
      {
        "testCaseId": "tc_ghi789",
        "status": "SKIPPED",
        "resultId": "result_3"
      }
    ]
  },
  "message": "Successfully imported automation report",
  "statusCode": 201
}
```

**Minimal Example:**
```json
{
  "testRunName": "Daily Smoke Tests",
  "environment": "Staging",
  "results": [
    {
      "testCaseId": "tc_abc123",
      "status": "PASSED"
    }
  ]
}
```

**Notes:**
- Single API call that handles everything: creates/finds test run and records all test results
- Test run is auto-created by `testRunName` + `environment` if it doesn't exist
- Test cases must already exist in the project (identified by `testCaseId`)
- If a test case doesn't exist, an error will be returned for that result
- Test run is auto-completed when all results are processed
- This is the recommended method for importing automation reports

---

## 6. Test Result Status Values

The API accepts the following status values for test results:

- `PASSED` - Test passed successfully
- `FAILED` - Test failed
- `BLOCKED` - Test was blocked and could not be executed
- `SKIPPED` - Test was skipped
- `RETEST` - Test needs to be retested

---

## 7. Test Case Status Values

- `ACTIVE` - Test case is active and ready for execution
- `DRAFT` - Test case is in draft state
- `DEPRECATED` - Test case is deprecated and should not be used

---

## 8. Test Case Priority Values

- `CRITICAL` - Critical priority
- `HIGH` - High priority
- `MEDIUM` - Medium priority (default)
- `LOW` - Low priority

---

## 9. Test Run Status Values

- `PLANNED` - Test run is planned but not started
- `IN_PROGRESS` - Test run is currently executing
- `COMPLETED` - Test run has been completed
- `CANCELLED` - Test run was cancelled

---

## 10. Duration Format

**Important:** Duration is always in **seconds** (not milliseconds).

- API expects: `duration: 120` (120 seconds)
- SDK converts: Milliseconds → Seconds automatically
- Example: 120000 ms → 120 seconds

---

## 11. Test Case ID vs Display ID

- **Database ID (`id`)**: Unique database identifier (e.g., `"tc_abc123"`)
- **Display ID (`tcId`)**: Human-readable ID (e.g., `"TC-1"`, `"TC-2"`)

The SDK can search by both:
- `getTestCaseById("tc_abc123")` - Search by database ID
- `findTestCaseByTcId("TC-1")` - Search by display ID
- `findOrCreateTestCase(dbId, tcId, title)` - Search by all three

---

## 12. Authentication

All API requests require authentication via API key:

**Header:**
```
Authorization: Bearer {api-key}
Content-Type: application/json
```

**Example:**
```http
GET /api/testcases/tc_abc123
Authorization: Bearer eztest_abc123def456ghi789
Content-Type: application/json
```

---

## 13. Error Responses

**404 Not Found:**
```json
{
  "error": "Test case not found",
  "statusCode": 404
}
```

**400 Validation Error:**
```json
{
  "error": "Validation failed",
  "statusCode": 400,
  "issues": [
    {
      "path": ["title"],
      "message": "Title is required"
    }
  ]
}
```

**401 Unauthorized:**
```json
{
  "error": "Unauthorized",
  "statusCode": 401
}
```

---

## Summary

The SDK now supports:
- ✅ Create test case
- ✅ Update test case
- ✅ Get test case by ID
- ✅ Get test case history (execution history)
- ✅ Check if test case exists
- ✅ Find test case by tcId (display ID)
- ✅ Create test run
- ✅ Update test run
- ✅ Start test run
- ✅ Complete test run
- ✅ Record test result
- ✅ Import automation report (single API call)
- ✅ All formats match the API exactly

