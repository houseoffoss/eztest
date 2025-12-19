# Defects API

API endpoints for defect tracking and management.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/projects/:id/defects` | List defects |
| `POST` | `/api/projects/:id/defects` | Create defect |
| `GET` | `/api/defects/:id` | Get defect |
| `PUT` | `/api/defects/:id` | Update defect |
| `DELETE` | `/api/defects/:id` | Delete defect |
| `POST` | `/api/defects/bulk-status` | Bulk status update |
| `POST` | `/api/defects/bulk-assign` | Bulk assign |
| `POST` | `/api/defects/bulk-delete` | Bulk delete |

---

## GET /api/projects/:id/defects

List defects in a project.

**Request:**
```http
GET /api/projects/proj_abc123/defects?status=NEW&severity=HIGH
Cookie: next-auth.session-token=...
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number |
| `limit` | number | Items per page |
| `search` | string | Search title/description |
| `status` | string | NEW, IN_PROGRESS, FIXED, TESTED, CLOSED |
| `severity` | string | CRITICAL, HIGH, MEDIUM, LOW |
| `priority` | string | CRITICAL, HIGH, MEDIUM, LOW |
| `assignedTo` | string | Filter by assignee ID |

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "def_abc123",
      "defectId": "DEF-001",
      "title": "Login fails with valid credentials",
      "description": "Users cannot login...",
      "severity": "HIGH",
      "priority": "CRITICAL",
      "status": "NEW",
      "environment": "Staging",
      "assignedTo": {
        "id": "user_xyz",
        "name": "John Doe"
      },
      "createdBy": {
        "id": "user_abc",
        "name": "Jane Smith"
      },
      "createdAt": "2024-01-15T10:30:00Z",
      "_count": {
        "testCases": 2,
        "comments": 3,
        "attachments": 2
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 8,
    "pages": 1
  }
}
```

---

## POST /api/projects/:id/defects

Create a new defect.

**Required Permission:** `defects:create`

**Request:**
```http
POST /api/projects/proj_abc123/defects
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "title": "Login fails with valid credentials",
  "description": "## Steps to Reproduce\n1. Go to login page\n2. Enter valid credentials\n3. Click Login\n\n## Expected\nUser redirected to dashboard\n\n## Actual\n500 Internal Server Error",
  "severity": "HIGH",
  "priority": "CRITICAL",
  "environment": "Staging",
  "assignedToId": "user_xyz",
  "testCaseIds": ["tc_1"]
}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Defect title |
| `description` | string | No | Detailed description |
| `severity` | string | No | CRITICAL, HIGH, MEDIUM, LOW |
| `priority` | string | No | CRITICAL, HIGH, MEDIUM, LOW |
| `status` | string | No | Default: NEW |
| `environment` | string | No | Where found |
| `assignedToId` | string | No | Assigned user ID |
| `testRunId` | string | No | Related test run |
| `testCaseIds` | array | No | Linked test cases |
| `dueDate` | string | No | ISO date |

**Response (201 Created):**
```json
{
  "data": {
    "id": "def_abc123",
    "defectId": "DEF-001",
    "title": "Login fails with valid credentials",
    "severity": "HIGH",
    "priority": "CRITICAL",
    "status": "NEW",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "message": "Defect created successfully"
}
```

---

## GET /api/defects/:id

Get defect details.

**Request:**
```http
GET /api/defects/def_abc123
Cookie: next-auth.session-token=...
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "def_abc123",
    "defectId": "DEF-001",
    "projectId": "proj_abc123",
    "title": "Login fails with valid credentials",
    "description": "## Steps to Reproduce...",
    "severity": "HIGH",
    "priority": "CRITICAL",
    "status": "IN_PROGRESS",
    "environment": "Staging",
    "dueDate": "2024-01-20T00:00:00Z",
    "progressPercentage": 50,
    "assignedTo": {
      "id": "user_xyz",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "createdBy": {
      "id": "user_abc",
      "name": "Jane Smith"
    },
    "testRun": {
      "id": "run_123",
      "name": "Sprint 1 Tests"
    },
    "testCases": [
      {
        "id": "tc_1",
        "tcId": "tc1",
        "title": "Verify login",
        "linkedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "comments": [
      {
        "id": "com_1",
        "content": "Working on this",
        "user": {
          "id": "user_xyz",
          "name": "John Doe"
        },
        "createdAt": "2024-01-15T14:00:00Z"
      }
    ],
    "attachments": [
      {
        "id": "att_1",
        "filename": "error-screenshot.png",
        "originalName": "error-screenshot.png",
        "mimeType": "image/png",
        "size": 245000
      }
    ],
    "resolvedAt": null,
    "closedAt": null,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T14:00:00Z"
  }
}
```

---

## PUT /api/defects/:id

Update a defect.

**Required Permission:** `defects:update`

**Request:**
```http
PUT /api/defects/def_abc123
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "status": "FIXED",
  "progressPercentage": 100
}
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "def_abc123",
    "defectId": "DEF-001",
    "status": "FIXED",
    "progressPercentage": 100,
    "updatedAt": "2024-01-16T11:00:00Z"
  },
  "message": "Defect updated successfully"
}
```

---

## DELETE /api/defects/:id

Delete a defect.

**Required Permission:** `defects:delete`

**Request:**
```http
DELETE /api/defects/def_abc123
Cookie: next-auth.session-token=...
```

**Response (204 No Content):**
```
(empty body)
```

---

## POST /api/defects/bulk-status

Update status for multiple defects.

**Request:**
```http
POST /api/defects/bulk-status
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "defectIds": ["def_1", "def_2", "def_3"],
  "status": "CLOSED"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "updated": 3
  },
  "message": "Defects updated successfully"
}
```

---

## POST /api/defects/bulk-assign

Assign multiple defects to a user.

**Request:**
```http
POST /api/defects/bulk-assign
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "defectIds": ["def_1", "def_2"],
  "assignedToId": "user_xyz"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "updated": 2
  },
  "message": "Defects assigned successfully"
}
```

---

## POST /api/defects/bulk-delete

Delete multiple defects.

**Required Permission:** `defects:delete`

**Request:**
```http
POST /api/defects/bulk-delete
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "defectIds": ["def_1", "def_2", "def_3"]
}
```

**Response (200 OK):**
```json
{
  "data": {
    "deleted": 3
  },
  "message": "Defects deleted successfully"
}
```

---

## Defect Comments

### GET /api/projects/:projectId/defects/:defectId/comments

Get comments for a defect.

### POST /api/projects/:projectId/defects/:defectId/comments

Add comment to a defect.

**Request:**
```http
POST /api/projects/proj_123/defects/def_123/comments
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "content": "Fixed in commit abc123. Ready for testing."
}
```

---

## Statistics

### GET /api/projects/:id/defects/statistics

Get defect statistics for a project.

**Response (200 OK):**
```json
{
  "data": {
    "total": 25,
    "byStatus": {
      "NEW": 5,
      "IN_PROGRESS": 8,
      "FIXED": 4,
      "TESTED": 3,
      "CLOSED": 5
    },
    "bySeverity": {
      "CRITICAL": 2,
      "HIGH": 8,
      "MEDIUM": 10,
      "LOW": 5
    },
    "trends": {
      "opened": 12,
      "closed": 8,
      "period": "last_7_days"
    }
  }
}
```

---

## Examples

### cURL

```bash
# Create defect
curl -X POST http://localhost:3000/api/projects/proj_123/defects \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "title": "Login button not working",
    "severity": "HIGH",
    "priority": "HIGH"
  }'

# Update status
curl -X PUT http://localhost:3000/api/defects/def_123 \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{"status": "FIXED"}'
```

---

## Related Documentation

- [Defects Feature](../features/defects/README.md)
- [API Overview](./README.md)
