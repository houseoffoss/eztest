# Test Suites API

API endpoints for test suite management and organization.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/projects/:id/testsuites` | List test suites |
| `POST` | `/api/projects/:id/testsuites` | Create test suite |
| `GET` | `/api/testsuites/:id` | Get test suite |
| `PUT` | `/api/testsuites/:id` | Update test suite |
| `DELETE` | `/api/testsuites/:id` | Delete test suite |
| `POST` | `/api/testsuites/move` | Move test cases to suite |
| `GET` | `/api/testsuites/:id/available-testcases` | Get available test cases |
| `POST` | `/api/testsuites/:id/testcases` | Add test cases to suite |
| `GET` | `/api/testsuites/:id/testcases/check` | Check test cases in suite |
| `POST` | `/api/projects/:id/testsuites/:suiteId/add-module` | Add module to suite |
| `POST` | `/api/projects/:id/testsuites/:suiteId/remove-module` | Remove module from suite |
| `PUT` | `/api/projects/:id/testsuites/:suiteId/update-module` | Update suite module |

---

## GET /api/projects/:id/testsuites

List all test suites in a project.

**Required Permission:** `testsuites:read`

**Request:**
```http
GET /api/projects/proj_abc123/testsuites
Cookie: next-auth.session-token=...
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "suite_123",
      "name": "Authentication Tests",
      "description": "Test cases for authentication flows",
      "parentId": null,
      "order": 1,
      "projectId": "proj_abc123",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z",
      "_count": {
        "testCases": 15,
        "children": 2
      },
      "children": [
        {
          "id": "suite_124",
          "name": "Login Tests",
          "parentId": "suite_123",
          "order": 1
        }
      ]
    }
  ],
  "message": "Test suites fetched successfully"
}
```

---

## POST /api/projects/:id/testsuites

Create a new test suite.

**Required Permission:** `testsuites:create`

**Request:**
```http
POST /api/projects/proj_abc123/testsuites
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "name": "Payment Tests",
  "description": "Test cases for payment processing",
  "parentId": "suite_123",
  "order": 2
}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Suite name (1-100 characters) |
| `description` | string | No | Suite description |
| `parentId` | string | No | Parent suite ID for nesting |
| `order` | number | No | Display order |

**Response (200 OK):**
```json
{
  "data": {
    "id": "suite_125",
    "name": "Payment Tests",
    "description": "Test cases for payment processing",
    "parentId": "suite_123",
    "order": 2,
    "projectId": "proj_abc123",
    "createdAt": "2024-01-15T10:35:00Z",
    "updatedAt": "2024-01-15T10:35:00Z"
  },
  "message": "Test suite created successfully"
}
```

**Error Responses:**

- `400 Bad Request` - Missing or invalid name
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Project or parent suite not found

---

## GET /api/testsuites/:id

Get a single test suite by ID.

**Required Permission:** `testsuites:read`

**Request:**
```http
GET /api/testsuites/suite_123
Cookie: next-auth.session-token=...
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "suite_123",
    "name": "Authentication Tests",
    "description": "Test cases for authentication flows",
    "parentId": null,
    "order": 1,
    "projectId": "proj_abc123",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "parent": {
      "id": "suite_122",
      "name": "Main Suite"
    },
    "children": [
      {
        "id": "suite_124",
        "name": "Login Tests"
      }
    ],
    "testCases": [
      {
        "id": "tc_abc123",
        "tcId": "tc1",
        "title": "Verify login with valid credentials"
      }
    ],
    "_count": {
      "testCases": 15,
      "children": 2
    }
  }
}
```

**Error Responses:**

- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Test suite not found

---

## PUT /api/testsuites/:id

Update a test suite.

**Required Permission:** `testsuites:update`

**Request:**
```http
PUT /api/testsuites/suite_123
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "name": "Updated Suite Name",
  "description": "Updated description",
  "parentId": "suite_122",
  "order": 3
}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | Suite name (1-100 characters) |
| `description` | string | No | Suite description |
| `parentId` | string | No | Parent suite ID (null to remove parent) |
| `order` | number | No | Display order |

**Response (200 OK):**
```json
{
  "data": {
    "id": "suite_123",
    "name": "Updated Suite Name",
    "description": "Updated description",
    "parentId": "suite_122",
    "order": 3,
    "updatedAt": "2024-01-15T11:00:00Z"
  },
  "message": "Test suite updated successfully"
}
```

**Error Responses:**

- `400 Bad Request` - Invalid data
- `403 Forbidden` - Insufficient permissions or access denied
- `404 Not Found` - Test suite not found

---

## DELETE /api/testsuites/:id

Delete a test suite.

**Required Permission:** `testsuites:delete`

**Request:**
```http
DELETE /api/testsuites/suite_123
Cookie: next-auth.session-token=...
```

**Response (200 OK):**
```json
{
  "message": "Test suite deleted successfully"
}
```

> **Warning:** Deleting a test suite will also delete all child suites and remove test cases from the suite (but not delete the test cases themselves).

**Error Responses:**

- `403 Forbidden` - Insufficient permissions or access denied
- `404 Not Found` - Test suite not found

---

## POST /api/testsuites/move

Move test cases to a different suite.

**Required Permission:** `testsuites:update`

**Request:**
```http
POST /api/testsuites/move
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "testCaseIds": ["tc_abc123", "tc_abc124"],
  "suiteId": "suite_125"
}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `testCaseIds` | string[] | Yes | Array of test case IDs to move |
| `suiteId` | string | No | Target suite ID (null to remove from suite) |

**Response (200 OK):**
```json
{
  "data": {
    "count": 2,
    "testCases": [
      {
        "id": "tc_abc123",
        "suiteId": "suite_125"
      },
      {
        "id": "tc_abc124",
        "suiteId": "suite_125"
      }
    ]
  },
  "message": "2 test cases moved successfully"
}
```

**Error Responses:**

- `400 Bad Request` - No test cases provided or invalid IDs
- `403 Forbidden` - Insufficient permissions

---

## GET /api/testsuites/:id/available-testcases

Get available test cases that can be added to a suite.

**Required Permission:** `testsuites:read`

**Request:**
```http
GET /api/testsuites/suite_123/available-testcases
Cookie: next-auth.session-token=...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "modules": [
      {
        "id": "mod_123",
        "name": "User Module",
        "testCases": [
          {
            "id": "tc_abc123",
            "tcId": "tc1",
            "title": "Test case title",
            "inSuite": false
          }
        ]
      }
    ],
    "unassignedTestCases": [
      {
        "id": "tc_abc124",
        "tcId": "tc2",
        "title": "Another test case",
        "inSuite": false
      }
    ]
  }
}
```

---

## POST /api/testsuites/:id/testcases

Add test cases to a test suite.

**Required Permission:** `testsuites:update`

**Request:**
```http
POST /api/testsuites/suite_123/testcases
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "testCaseIds": ["tc_abc123", "tc_abc124"]
}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `testCaseIds` | string[] | Yes | Array of test case IDs to add |

**Response (200 OK):**
```json
{
  "data": {
    "suiteId": "suite_123",
    "addedCount": 2,
    "testCases": [
      {
        "id": "tc_abc123",
        "suiteId": "suite_123"
      }
    ]
  },
  "message": "Test cases added to suite successfully"
}
```

---

## GET /api/testsuites/:id/testcases/check

Check which test cases are in a suite.

**Required Permission:** `testsuites:read`

**Request:**
```http
GET /api/testsuites/suite_123/testcases/check?testCaseIds=tc_abc123,tc_abc124
Cookie: next-auth.session-token=...
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `testCaseIds` | string | Yes | Comma-separated test case IDs |

**Response (200 OK):**
```json
{
  "data": {
    "suiteId": "suite_123",
    "results": [
      {
        "testCaseId": "tc_abc123",
        "inSuite": true
      },
      {
        "testCaseId": "tc_abc124",
        "inSuite": false
      }
    ]
  }
}
```

---

## POST /api/projects/:id/testsuites/:suiteId/add-module

Add a module to all test cases in a suite.

**Required Permission:** `testsuites:update`

**Request:**
```http
POST /api/projects/proj_abc123/testsuites/suite_123/add-module
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "moduleId": "mod_123"
}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `moduleId` | string | Yes | Module ID to assign to all test cases in suite |

**Response (200 OK):**
```json
{
  "data": {
    "id": "suite_123",
    "name": "Authentication Tests",
    "testCases": [
      {
        "id": "tc_abc123",
        "moduleId": "mod_123"
      }
    ]
  },
  "message": "Module added to suite successfully"
}
```

> **Note:** This operation assigns the module to all test cases currently in the suite.

**Error Responses:**

- `400 Bad Request` - Module ID missing
- `404 Not Found` - Test suite or module not found

---

## POST /api/projects/:id/testsuites/:suiteId/remove-module

Remove a module from all test cases in a suite.

**Required Permission:** `testsuites:update`

**Request:**
```http
POST /api/projects/proj_abc123/testsuites/suite_123/remove-module
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "moduleId": "mod_123"
}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `moduleId` | string | Yes | Module ID to remove from test cases |

**Response (200 OK):**
```json
{
  "data": {
    "id": "suite_123",
    "message": "Module removed from suite successfully"
  }
}
```

---

## PUT /api/projects/:id/testsuites/:suiteId/update-module

Update the module assigned to all test cases in a suite.

**Required Permission:** `testsuites:update`

**Request:**
```http
PUT /api/projects/proj_abc123/testsuites/suite_123/update-module
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "oldModuleId": "mod_123",
  "newModuleId": "mod_124"
}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `oldModuleId` | string | No | Current module ID (optional) |
| `newModuleId` | string | Yes | New module ID to assign |

**Response (200 OK):**
```json
{
  "data": {
    "id": "suite_123",
    "testCases": [
      {
        "id": "tc_abc123",
        "moduleId": "mod_124"
      }
    ]
  },
  "message": "Module updated in suite successfully"
}
```

---

## Related Documentation

- [Test Suites Feature](../features/test-suites/README.md) - Feature guide
- [Test Cases API](./test-cases.md) - Test case endpoints
- [Modules API](./modules.md) - Module management
