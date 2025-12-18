# Test Runs API

API endpoints for test run management and execution.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/projects/:id/testruns` | List test runs |
| `POST` | `/api/projects/:id/testruns` | Create test run |
| `GET` | `/api/testruns/:id` | Get test run |
| `PUT` | `/api/testruns/:id` | Update test run |
| `DELETE` | `/api/testruns/:id` | Delete test run |
| `POST` | `/api/testruns/:id/start` | Start execution |
| `POST` | `/api/testruns/:id/complete` | Complete test run |
| `GET` | `/api/testruns/:id/results` | Get results |
| `POST` | `/api/testruns/:id/results` | Record result |

---

## GET /api/projects/:id/testruns

List test runs in a project.

**Request:**
```http
GET /api/projects/proj_abc123/testruns?status=IN_PROGRESS
Cookie: next-auth.session-token=...
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number |
| `limit` | number | Items per page |
| `status` | string | PLANNED, IN_PROGRESS, COMPLETED, CANCELLED |
| `assignedTo` | string | Filter by assignee ID |
| `environment` | string | Filter by environment |

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "run_abc123",
      "name": "Sprint 1 - Smoke Tests",
      "description": "Basic smoke tests",
      "status": "IN_PROGRESS",
      "environment": "Staging",
      "assignedTo": {
        "id": "user_xyz",
        "name": "John Doe"
      },
      "startedAt": "2024-01-15T10:30:00Z",
      "completedAt": null,
      "createdAt": "2024-01-15T09:00:00Z",
      "_count": {
        "results": 10
      },
      "stats": {
        "total": 20,
        "passed": 8,
        "failed": 2,
        "blocked": 0,
        "skipped": 0,
        "pending": 10
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 12,
    "pages": 2
  }
}
```

---

## POST /api/projects/:id/testruns

Create a new test run.

**Required Permission:** `testruns:create`

**Request:**
```http
POST /api/projects/proj_abc123/testruns
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "name": "Sprint 1 - Smoke Tests",
  "description": "Basic smoke tests for Sprint 1",
  "environment": "Staging",
  "assignedToId": "user_xyz",
  "testCaseIds": ["tc_1", "tc_2", "tc_3"]
}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Test run name |
| `description` | string | No | Description |
| `environment` | string | No | Execution environment |
| `assignedToId` | string | No | Assigned user ID |
| `testCaseIds` | array | Yes | Test case IDs to include |
| `testSuiteIds` | array | No | Include all tests from suites |

**Response (201 Created):**
```json
{
  "data": {
    "id": "run_abc123",
    "name": "Sprint 1 - Smoke Tests",
    "status": "PLANNED",
    "environment": "Staging",
    "createdAt": "2024-01-15T09:00:00Z",
    "_count": {
      "results": 0
    }
  },
  "message": "Test run created successfully"
}
```

---

## GET /api/testruns/:id

Get test run details.

**Request:**
```http
GET /api/testruns/run_abc123
Cookie: next-auth.session-token=...
```

**Response (200 OK):**
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
    "startedAt": "2024-01-15T10:30:00Z",
    "completedAt": null,
    "createdAt": "2024-01-15T09:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "results": [
      {
        "id": "result_1",
        "testCase": {
          "id": "tc_1",
          "tcId": "tc1",
          "title": "Verify login"
        },
        "status": "PASSED",
        "duration": 120,
        "executedAt": "2024-01-15T10:35:00Z"
      }
    ],
    "stats": {
      "total": 20,
      "passed": 8,
      "failed": 2,
      "blocked": 0,
      "skipped": 0,
      "pending": 10,
      "passRate": 80
    }
  }
}
```

---

## PUT /api/testruns/:id

Update a test run.

**Required Permission:** `testruns:update`

**Request:**
```http
PUT /api/testruns/run_abc123
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "name": "Sprint 1 - Full Regression",
  "environment": "QA",
  "assignedToId": "user_new"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "run_abc123",
    "name": "Sprint 1 - Full Regression",
    "environment": "QA",
    "updatedAt": "2024-01-16T11:00:00Z"
  },
  "message": "Test run updated successfully"
}
```

---

## POST /api/testruns/:id/start

Start test run execution.

**Request:**
```http
POST /api/testruns/run_abc123/start
Cookie: next-auth.session-token=...
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "run_abc123",
    "status": "IN_PROGRESS",
    "startedAt": "2024-01-15T10:30:00Z"
  },
  "message": "Test run started"
}
```

---

## POST /api/testruns/:id/complete

Complete a test run.

**Request:**
```http
POST /api/testruns/run_abc123/complete
Cookie: next-auth.session-token=...
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "run_abc123",
    "status": "COMPLETED",
    "completedAt": "2024-01-15T14:30:00Z",
    "stats": {
      "total": 20,
      "passed": 15,
      "failed": 3,
      "blocked": 1,
      "skipped": 1,
      "passRate": 75
    }
  },
  "message": "Test run completed"
}
```

---

## GET /api/testruns/:id/results

Get all results for a test run.

**Request:**
```http
GET /api/testruns/run_abc123/results
Cookie: next-auth.session-token=...
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "result_1",
      "testRunId": "run_abc123",
      "testCase": {
        "id": "tc_1",
        "tcId": "tc1",
        "title": "Verify login"
      },
      "status": "PASSED",
      "duration": 120,
      "comment": "All steps passed",
      "executedBy": {
        "id": "user_xyz",
        "name": "John Doe"
      },
      "executedAt": "2024-01-15T10:35:00Z",
      "attachments": []
    },
    {
      "id": "result_2",
      "testRunId": "run_abc123",
      "testCase": {
        "id": "tc_2",
        "tcId": "tc2",
        "title": "Verify registration"
      },
      "status": "FAILED",
      "duration": 180,
      "comment": "Step 3 failed",
      "errorMessage": "Email validation error",
      "executedBy": {
        "id": "user_xyz",
        "name": "John Doe"
      },
      "executedAt": "2024-01-15T10:40:00Z",
      "attachments": [
        {
          "id": "att_1",
          "filename": "error-screenshot.png",
          "mimeType": "image/png"
        }
      ]
    }
  ]
}
```

---

## POST /api/testruns/:id/results

Record a test result.

**Request:**
```http
POST /api/testruns/run_abc123/results
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "testCaseId": "tc_1",
  "status": "PASSED",
  "duration": 120,
  "comment": "All steps executed successfully"
}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `testCaseId` | string | Yes | Test case ID |
| `status` | string | Yes | PASSED, FAILED, BLOCKED, SKIPPED, RETEST |
| `duration` | number | No | Duration in seconds |
| `comment` | string | No | Execution notes |
| `errorMessage` | string | No | Error details (for failures) |
| `stackTrace` | string | No | Stack trace |

**Response (201 Created):**
```json
{
  "data": {
    "id": "result_1",
    "testRunId": "run_abc123",
    "testCaseId": "tc_1",
    "status": "PASSED",
    "duration": 120,
    "comment": "All steps executed successfully",
    "executedAt": "2024-01-15T10:35:00Z"
  },
  "message": "Result recorded successfully"
}
```

---

## POST /api/testruns/:id/send-report

Send test run report via email.

**Request:**
```http
POST /api/testruns/run_abc123/send-report
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "recipients": ["manager@example.com", "team@example.com"],
  "subject": "Sprint 1 Test Results",
  "message": "Please review the test results for Sprint 1."
}
```

**Response (200 OK):**
```json
{
  "message": "Report sent successfully"
}
```

---

## Examples

### cURL

```bash
# Create test run
curl -X POST http://localhost:3000/api/projects/proj_123/testruns \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "name": "Sprint 1 Tests",
    "environment": "Staging",
    "testCaseIds": ["tc_1", "tc_2"]
  }'

# Start test run
curl -X POST http://localhost:3000/api/testruns/run_123/start \
  -H "Cookie: next-auth.session-token=..."

# Record result
curl -X POST http://localhost:3000/api/testruns/run_123/results \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "testCaseId": "tc_1",
    "status": "PASSED",
    "duration": 120
  }'
```

---

## Related Documentation

- [Test Runs Feature](../features/test-runs/README.md)
- [API Overview](./README.md)
