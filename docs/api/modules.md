# Modules API

API endpoints for module management within projects.

## Overview

Modules are used to organize test cases within a project. They provide an additional layer of organization beyond test suites, allowing test cases to be grouped by functional areas or components.

---

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/projects/:id/modules` | List modules |
| `POST` | `/api/projects/:id/modules` | Create module |
| `GET` | `/api/projects/:id/modules/:moduleId` | Get module |
| `PUT` | `/api/projects/:id/modules/:moduleId` | Update module |
| `DELETE` | `/api/projects/:id/modules/:moduleId` | Delete module |
| `POST` | `/api/projects/:id/modules/reorder` | Reorder modules |
| `GET` | `/api/projects/:id/modules/:moduleId/testcases` | Get module test cases |
| `POST` | `/api/projects/:id/testcases/:tcId/add-to-module` | Add test case to module |
| `POST` | `/api/projects/:id/testcases/:tcId/remove-from-module` | Remove test case from module |

---

## GET /api/projects/:id/modules

List all modules in a project.

**Required Permission:** `testcases:read`

**Request:**
```http
GET /api/projects/proj_abc123/modules
Cookie: next-auth.session-token=...
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "mod_abc123",
      "name": "User Authentication",
      "description": "Authentication and authorization modules",
      "order": 1,
      "projectId": "proj_abc123",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z",
      "_count": {
        "testCases": 15
      }
    },
    {
      "id": "mod_abc124",
      "name": "Payment Processing",
      "description": "Payment gateway integration",
      "order": 2,
      "projectId": "proj_abc123",
      "createdAt": "2024-01-15T10:35:00Z",
      "updatedAt": "2024-01-15T10:35:00Z",
      "_count": {
        "testCases": 8
      }
    }
  ]
}
```

---

## POST /api/projects/:id/modules

Create a new module.

**Required Permission:** `testcases:create`

**Request:**
```http
POST /api/projects/proj_abc123/modules
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "name": "Shopping Cart",
  "description": "Cart management functionality",
  "order": 3
}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Module name (1-100 characters, unique per project) |
| `description` | string | No | Module description |
| `order` | number | No | Display order (default: last) |

**Response (201 Created):**
```json
{
  "data": {
    "id": "mod_abc125",
    "name": "Shopping Cart",
    "description": "Cart management functionality",
    "order": 3,
    "projectId": "proj_abc123",
    "createdAt": "2024-01-15T10:40:00Z",
    "updatedAt": "2024-01-15T10:40:00Z"
  }
}
```

**Error Responses:**

- `400 Bad Request` - Missing name or validation failed
- `403 Forbidden` - Insufficient permissions
- `409 Conflict` - Module name already exists in project

---

## GET /api/projects/:id/modules/:moduleId

Get a single module by ID.

**Required Permission:** `testcases:read`

**Request:**
```http
GET /api/projects/proj_abc123/modules/mod_abc123
Cookie: next-auth.session-token=...
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "mod_abc123",
    "name": "User Authentication",
    "description": "Authentication and authorization modules",
    "order": 1,
    "projectId": "proj_abc123",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "testCases": [
      {
        "id": "tc_abc123",
        "tcId": "tc1",
        "title": "Verify user login",
        "priority": "HIGH",
        "status": "ACTIVE"
      }
    ],
    "_count": {
      "testCases": 15
    }
  }
}
```

**Error Responses:**

- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Module not found

---

## PUT /api/projects/:id/modules/:moduleId

Update a module.

**Required Permission:** `testcases:update`

**Request:**
```http
PUT /api/projects/proj_abc123/modules/mod_abc123
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "name": "Updated Module Name",
  "description": "Updated description",
  "order": 2
}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | Module name (1-100 characters) |
| `description` | string | No | Module description |
| `order` | number | No | Display order |

**Response (200 OK):**
```json
{
  "data": {
    "id": "mod_abc123",
    "name": "Updated Module Name",
    "description": "Updated description",
    "order": 2,
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

**Error Responses:**

- `400 Bad Request` - Validation failed
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Module not found
- `409 Conflict` - Module name already exists

---

## DELETE /api/projects/:id/modules/:moduleId

Delete a module.

**Required Permission:** `testcases:delete`

**Request:**
```http
DELETE /api/projects/proj_abc123/modules/mod_abc123
Cookie: next-auth.session-token=...
```

**Response (200 OK):**
```json
{
  "message": "Module deleted successfully"
}
```

> **Note:** Deleting a module removes the module assignment from all test cases but does not delete the test cases themselves.

**Error Responses:**

- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Module not found

---

## POST /api/projects/:id/modules/reorder

Reorder modules within a project.

**Required Permission:** `testcases:update`

**Request:**
```http
POST /api/projects/proj_abc123/modules/reorder
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "updates": [
    {
      "id": "mod_abc123",
      "order": 1
    },
    {
      "id": "mod_abc124",
      "order": 2
    },
    {
      "id": "mod_abc125",
      "order": 3
    }
  ]
}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `updates` | array | Yes | Array of objects with `id` and `order` |

**Response (200 OK):**
```json
{
  "message": "Modules reordered successfully"
}
```

**Error Responses:**

- `400 Bad Request` - Invalid updates array
- `403 Forbidden` - Insufficient permissions

---

## GET /api/projects/:id/modules/:moduleId/testcases

Get all test cases in a module.

**Required Permission:** `testcases:read`

**Request:**
```http
GET /api/projects/proj_abc123/modules/mod_abc123/testcases
Cookie: next-auth.session-token=...
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10) |

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "tc_abc123",
      "tcId": "tc1",
      "title": "Verify user login",
      "priority": "HIGH",
      "status": "ACTIVE",
      "moduleId": "mod_abc123",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "pages": 2
  }
}
```

---

## POST /api/projects/:id/testcases/:tcId/add-to-module

Add a test case to a module.

**Required Permission:** `testcases:update`

**Request:**
```http
POST /api/projects/proj_abc123/testcases/tc_abc123/add-to-module
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "moduleId": "mod_abc123"
}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `moduleId` | string | Yes | Module ID to assign |

**Response (200 OK):**
```json
{
  "data": {
    "id": "tc_abc123",
    "moduleId": "mod_abc123",
    "updatedAt": "2024-01-15T11:00:00Z"
  },
  "message": "Test case added to module successfully"
}
```

**Error Responses:**

- `400 Bad Request` - Missing module ID
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Test case or module not found

---

## POST /api/projects/:id/testcases/:tcId/remove-from-module

Remove a test case from its module.

**Required Permission:** `testcases:update`

**Request:**
```http
POST /api/projects/proj_abc123/testcases/tc_abc123/remove-from-module
Cookie: next-auth.session-token=...
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "tc_abc123",
    "moduleId": null,
    "updatedAt": "2024-01-15T11:00:00Z"
  },
  "message": "Test case removed from module successfully"
}
```

**Error Responses:**

- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Test case not found

---

## Related Documentation

- [Test Cases API](./test-cases.md) - Test case management
- [Test Suites API](./test-suites.md) - Test suite organization
