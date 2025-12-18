# Projects API

API endpoints for project management.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/projects` | List projects |
| `POST` | `/api/projects` | Create project |
| `GET` | `/api/projects/:id` | Get project |
| `PUT` | `/api/projects/:id` | Update project |
| `DELETE` | `/api/projects/:id` | Delete project |
| `GET` | `/api/projects/:id/members` | List members |
| `POST` | `/api/projects/:id/members` | Add member |
| `DELETE` | `/api/projects/:id/members/:memberId` | Remove member |

---

## GET /api/projects

List all accessible projects.

**Request:**
```http
GET /api/projects
Cookie: next-auth.session-token=...
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10) |
| `search` | string | Search by name or key |

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "proj_abc123",
      "name": "E-Commerce Platform",
      "key": "ECOM",
      "description": "Main shopping application",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z",
      "_count": {
        "testCases": 45,
        "testRuns": 12,
        "defects": 8
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  }
}
```

---

## POST /api/projects

Create a new project.

**Required Permission:** `projects:create`

**Request:**
```http
POST /api/projects
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "name": "E-Commerce Platform",
  "key": "ECOM",
  "description": "Main shopping application"
}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Project name |
| `key` | string | Yes | Unique 3-10 char identifier |
| `description` | string | No | Project description |

**Response (201 Created):**
```json
{
  "data": {
    "id": "proj_abc123",
    "name": "E-Commerce Platform",
    "key": "ECOM",
    "description": "Main shopping application",
    "createdAt": "2024-01-15T10:30:00Z",
    "createdBy": {
      "id": "user_xyz789",
      "name": "John Doe"
    }
  },
  "message": "Project created successfully"
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | invalid_key | Key format invalid |
| 409 | key_exists | Key already in use |
| 403 | forbidden | No permission |

---

## GET /api/projects/:id

Get project details.

**Request:**
```http
GET /api/projects/proj_abc123
Cookie: next-auth.session-token=...
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "proj_abc123",
    "name": "E-Commerce Platform",
    "key": "ECOM",
    "description": "Main shopping application",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "createdBy": {
      "id": "user_xyz789",
      "name": "John Doe"
    },
    "members": [
      {
        "id": "mem_123",
        "user": {
          "id": "user_xyz789",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "joinedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "_count": {
      "testCases": 45,
      "testSuites": 8,
      "testRuns": 12,
      "defects": 8,
      "members": 5
    }
  }
}
```

---

## PUT /api/projects/:id

Update a project.

**Required Permission:** `projects:update` + Project membership

**Request:**
```http
PUT /api/projects/proj_abc123
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "name": "E-Commerce Platform v2",
  "description": "Updated shopping application"
}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | New project name |
| `description` | string | No | New description |

> **Note:** Project key cannot be changed after creation.

**Response (200 OK):**
```json
{
  "data": {
    "id": "proj_abc123",
    "name": "E-Commerce Platform v2",
    "key": "ECOM",
    "description": "Updated shopping application",
    "updatedAt": "2024-01-16T11:00:00Z"
  },
  "message": "Project updated successfully"
}
```

---

## DELETE /api/projects/:id

Delete a project.

**Required Permission:** `projects:delete` + Project owner

**Request:**
```http
DELETE /api/projects/proj_abc123
Cookie: next-auth.session-token=...
```

**Response (204 No Content):**
```
(empty body)
```

> **Warning:** Deletes all test suites, test cases, test runs, defects, and attachments in the project.

---

## GET /api/projects/:id/members

List project members.

**Request:**
```http
GET /api/projects/proj_abc123/members
Cookie: next-auth.session-token=...
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "mem_123",
      "user": {
        "id": "user_xyz789",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": null
      },
      "joinedAt": "2024-01-15T10:30:00Z"
    },
    {
      "id": "mem_456",
      "user": {
        "id": "user_abc111",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "avatar": "https://..."
      },
      "joinedAt": "2024-01-16T09:00:00Z"
    }
  ]
}
```

---

## POST /api/projects/:id/members

Add a member to the project.

**Required Permission:** Project admin or owner

**Request:**
```http
POST /api/projects/proj_abc123/members
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "email": "jane@example.com"
}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | User's email address |

**Response (201 Created):**
```json
{
  "data": {
    "id": "mem_456",
    "user": {
      "id": "user_abc111",
      "name": "Jane Smith",
      "email": "jane@example.com"
    },
    "joinedAt": "2024-01-16T09:00:00Z"
  },
  "message": "Member added successfully"
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 404 | user_not_found | Email not registered |
| 409 | already_member | User already a member |
| 403 | forbidden | No permission to add |

---

## DELETE /api/projects/:id/members/:memberId

Remove a member from the project.

**Required Permission:** Project admin or owner

**Request:**
```http
DELETE /api/projects/proj_abc123/members/mem_456
Cookie: next-auth.session-token=...
```

**Response (204 No Content):**
```
(empty body)
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | cannot_remove_owner | Cannot remove project owner |
| 404 | member_not_found | Member doesn't exist |

---

## Examples

### cURL

```bash
# Create project
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "name": "My Project",
    "key": "MYP",
    "description": "Test project"
  }'

# List projects
curl http://localhost:3000/api/projects \
  -H "Cookie: next-auth.session-token=..."

# Get project
curl http://localhost:3000/api/projects/proj_abc123 \
  -H "Cookie: next-auth.session-token=..."
```

### JavaScript

```javascript
// Create project
const createProject = async () => {
  const response = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'My Project',
      key: 'MYP',
      description: 'Test project'
    }),
    credentials: 'include'
  });
  return response.json();
};

// List projects
const listProjects = async () => {
  const response = await fetch('/api/projects', {
    credentials: 'include'
  });
  return response.json();
};
```

---

## Related Documentation

- [Projects Feature](../features/projects/README.md)
- [API Overview](./README.md)
