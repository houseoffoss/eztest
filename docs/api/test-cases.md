# Test Cases API

API endpoints for test case management.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/projects/:id/testcases` | List test cases |
| `POST` | `/api/projects/:id/testcases` | Create test case |
| `GET` | `/api/testcases/:id` | Get test case |
| `PUT` | `/api/testcases/:id` | Update test case |
| `DELETE` | `/api/testcases/:id` | Delete test case |
| `POST` | `/api/testcases/:id/defects` | Link defects to test case |
| `GET` | `/api/testcases/:id/steps` | Get test steps |
| `POST` | `/api/testcases/:id/steps` | Create/update steps |
| `GET` | `/api/testcases/:id/history` | Get change history |

---

## GET /api/projects/:id/testcases

List test cases in a project.

**Request:**
```http
GET /api/projects/proj_abc123/testcases?status=ACTIVE&priority=HIGH
Cookie: next-auth.session-token=...
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10) |
| `search` | string | Search title/description |
| `status` | string | ACTIVE, DRAFT, DEPRECATED |
| `priority` | string | CRITICAL, HIGH, MEDIUM, LOW |
| `suiteId` | string | Filter by test suite |
| `moduleId` | string | Filter by module |

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "tc_abc123",
      "tcId": "TC-1",
      "title": "Verify user can login",
      "description": "Test user login functionality",
      "priority": "HIGH",
      "status": "ACTIVE",
      "estimatedTime": 10,
      "createdAt": "2024-01-15T10:30:00Z",
      "createdBy": {
        "id": "user_xyz",
        "name": "John Doe"
      },
      "suite": {
        "id": "suite_123",
        "name": "Authentication"
      },
      "_count": {
        "steps": 5,
        "results": 3
      }
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

## POST /api/projects/:id/testcases

Create a new test case.

**Required Permission:** `testcases:create`

**Request:**
```http
POST /api/projects/proj_abc123/testcases
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "title": "Verify user can login with valid credentials",
  "description": "Test that users can login successfully",
  "priority": "HIGH",
  "status": "ACTIVE",
  "suiteId": "suite_123",
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

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Test case title |
| `description` | string | No | Detailed description |
| `priority` | string | No | CRITICAL, HIGH, MEDIUM, LOW |
| `status` | string | No | ACTIVE, DRAFT, DEPRECATED |
| `suiteId` | string | No | Parent test suite ID |
| `moduleId` | string | No | Module ID |
| `estimatedTime` | number | No | Estimated minutes |
| `preconditions` | string | No | Prerequisites |
| `postconditions` | string | No | Post-execution state |
| `expectedResult` | string | No | Overall expected result |
| `testData` | string | No | Input values or test data |
| `steps` | array | No | Test steps array |

**Response (201 Created):**
```json
{
  "data": {
    "id": "tc_abc123",
    "tcId": "TC-1",
    "title": "Verify user can login with valid credentials",
    "priority": "HIGH",
    "status": "ACTIVE",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "message": "Test case created successfully"
}
```

---

## GET /api/testcases/:id

Get test case details.

**Request:**
```http
GET /api/testcases/tc_abc123
Cookie: next-auth.session-token=...
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "tc_abc123",
    "tcId": "TC-1",
    "projectId": "proj_abc123",
    "title": "Verify user can login with valid credentials",
    "description": "Test that users can login successfully",
    "priority": "HIGH",
    "status": "ACTIVE",
    "estimatedTime": 10,
    "preconditions": "User account exists",
    "postconditions": "User is logged in",
    "expectedResult": "User redirected to dashboard",
    "testData": "username: testuser, password: Test123!",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "createdBy": {
      "id": "user_xyz",
      "name": "John Doe"
    },
    "suite": {
      "id": "suite_123",
      "name": "Authentication"
    },
    "module": null,
    "steps": [
      {
        "id": "step_1",
        "stepNumber": 1,
        "action": "Navigate to login page",
        "expectedResult": "Login form displayed"
      },
      {
        "id": "step_2",
        "stepNumber": 2,
        "action": "Enter valid credentials",
        "expectedResult": "Fields accept input"
      },
      {
        "id": "step_3",
        "stepNumber": 3,
        "action": "Click login button",
        "expectedResult": null
      }
    ],
    "attachments": [],
    "_count": {
      "results": 3,
      "defects": 1
    }
  }
}
```

---

## PUT /api/testcases/:id

Update a test case.

**Required Permission:** `testcases:update`

**Request:**
```http
PUT /api/testcases/tc_abc123
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "title": "Verify user can login with valid email and password",
  "priority": "CRITICAL",
  "status": "ACTIVE"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "tc_abc123",
    "tcId": "TC-1",
    "title": "Verify user can login with valid email and password",
    "priority": "CRITICAL",
    "status": "ACTIVE",
    "updatedAt": "2024-01-16T11:00:00Z"
  },
  "message": "Test case updated successfully"
}
```

---

## DELETE /api/testcases/:id

Delete a test case.

**Required Permission:** `testcases:delete`

**Request:**
```http
DELETE /api/testcases/tc_abc123
Cookie: next-auth.session-token=...
```

**Response (204 No Content):**
```
(empty body)
```

---

## GET /api/testcases/:id/steps

Get test steps for a test case.

**Request:**
```http
GET /api/testcases/tc_abc123/steps
Cookie: next-auth.session-token=...
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "step_1",
      "testCaseId": "tc_abc123",
      "stepNumber": 1,
      "action": "Navigate to login page",
      "expectedResult": "Login form displayed",
      "attachments": []
    },
    {
      "id": "step_2",
      "testCaseId": "tc_abc123",
      "stepNumber": 2,
      "action": "Enter valid credentials",
      "expectedResult": "Fields accept input",
      "attachments": []
    }
  ]
}
```

---

## POST /api/testcases/:id/steps

Create or update test steps (replaces all steps).

**Request:**
```http
POST /api/testcases/tc_abc123/steps
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "steps": [
    {
      "stepNumber": 1,
      "action": "Navigate to login page",
      "expectedResult": "Login form displayed"
    },
    {
      "stepNumber": 2,
      "action": "Enter valid email",
      "expectedResult": "Email field accepts input"
    },
    {
      "stepNumber": 3,
      "action": "Enter valid password",
      "expectedResult": "Password field shows masked input"
    },
    {
      "stepNumber": 4,
      "action": "Click Login button",
      "expectedResult": "User redirected to dashboard"
    },
    {
      "stepNumber": 5,
      "action": "Verify dashboard loads",
      "expectedResult": null
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "step_1",
      "stepNumber": 1,
      "action": "Navigate to login page",
      "expectedResult": "Login form displayed"
    }
    // ... more steps
  ],
  "message": "Steps updated successfully"
}
```

---

## POST /api/testcases/:id/defects

Link defects to a test case.

**Required Permission:** `testcases:update`

**Request:**
```http
POST /api/testcases/tc_abc123/defects
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "defectIds": ["defect_123", "defect_456"]
}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `defectIds` | array | Yes | Array of defect IDs to link |

**Response (200 OK):**
```json
{
  "data": {
    "id": "tc_abc123",
    "defects": [
      {
        "id": "defect_123",
        "defectId": "DEF-1",
        "title": "Login button not responding"
      },
      {
        "id": "defect_456",
        "defectId": "DEF-2",
        "title": "Password field validation error"
      }
    ]
  },
  "message": "Defects linked successfully"
}
```

---

## GET /api/testcases/:id/history

Get change history for a test case.

**Request:**
```http
GET /api/testcases/tc_abc123/history
Cookie: next-auth.session-token=...
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "hist_1",
      "action": "created",
      "changes": {},
      "user": {
        "id": "user_xyz",
        "name": "John Doe"
      },
      "timestamp": "2024-01-15T10:30:00Z"
    },
    {
      "id": "hist_2",
      "action": "updated",
      "changes": {
        "priority": {
          "from": "MEDIUM",
          "to": "HIGH"
        }
      },
      "user": {
        "id": "user_abc",
        "name": "Jane Smith"
      },
      "timestamp": "2024-01-16T11:00:00Z"
    }
  ]
}
```

---

## Test Case Attachments

### GET /api/testcases/:id/attachments

Get attachments for a test case.

### POST /api/testcases/:id/attachments

Upload attachment to test case.

See [Attachments API](./attachments.md) for details.

---

## Examples

### cURL

```bash
# Create test case
curl -X POST http://localhost:3000/api/projects/proj_123/testcases \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "title": "Verify login",
    "priority": "HIGH",
    "steps": [
      {"stepNumber": 1, "action": "Go to login", "expectedResult": "Form shows"}
    ]
  }'

# Get test case
curl http://localhost:3000/api/testcases/tc_abc123 \
  -H "Cookie: next-auth.session-token=..."
```

---

## Related Documentation

- [Test Cases Feature](../features/test-cases/README.md)
- [API Overview](./README.md)

