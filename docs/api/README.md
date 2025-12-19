# API Reference

Internal API documentation for EZTest developers.

## Overview

EZTest provides internal REST APIs built with Next.js API routes. These APIs are used by the web UI and are not designed for standalone or external use.

> **Note:** These APIs are for internal application use only. Users interact with EZTest through the web interface, not directly via API calls.

---

## Base URL

```
Development: http://localhost:3000/api
Production:  https://your-domain.com/api
```

---

## Authentication

### Session-Based

All API operations use session cookies automatically managed by NextAuth.js. Authentication is handled through the web UI.

```bash
# Session cookie is sent automatically by the browser
curl http://localhost:3000/api/projects \
  -H "Cookie: next-auth.session-token=..."
```

### Public Endpoints

These endpoints don't require authentication:

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/register` | User registration |
| `POST /api/auth/[...nextauth]` | Login/logout |
| `GET /api/health` | Health check |

---

## Response Format

### Success Response (2xx)

```json
{
  "data": {
    "id": "abc123",
    "name": "Example"
  },
  "message": "Operation successful"
}
```

### List Response

```json
{
  "data": [
    { "id": "abc123", "name": "Item 1" },
    { "id": "def456", "name": "Item 2" }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

### Error Response (4xx/5xx)

```json
{
  "error": "validation_error",
  "message": "Invalid request data",
  "statusCode": 400,
  "details": {
    "email": "Invalid email format"
  }
}
```

---

## HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 204 | No Content | Successful, no body |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Not authenticated |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable | Validation error |
| 500 | Server Error | Internal error |

---

## API Sections

### Core Resources

| Resource | Documentation | Description |
|----------|---------------|-------------|
| **Authentication** | [View →](./authentication.md) | Login, register, password reset, OTP |
| **Projects** | [View →](./projects.md) | Project management |
| **Test Cases** | [View →](./test-cases.md) | Test case CRUD |
| **Test Suites** | [View →](./test-suites.md) | Test organization |
| **Test Runs** | [View →](./test-runs.md) | Test execution |
| **Defects** | [View →](./defects.md) | Bug tracking |
| **Users** | [View →](./users.md) | User management |
| **Modules** | [View →](./modules.md) | Module organization |
| **Attachments** | [View →](./attachments.md) | File uploads |
| **Comments** | [View →](./comments.md) | Comment management |

---

## Quick Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register user |
| `POST` | `/api/auth/callback/credentials` | Login |
| `POST` | `/api/auth/signout` | Logout |
| `POST` | `/api/auth/forgot-password` | Request reset |
| `POST` | `/api/auth/reset-password` | Reset password |
| `GET` | `/api/auth/permissions` | Get permissions |

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/projects` | List projects |
| `POST` | `/api/projects` | Create project |
| `GET` | `/api/projects/:id` | Get project |
| `PUT` | `/api/projects/:id` | Update project |
| `DELETE` | `/api/projects/:id` | Delete project |
| `GET` | `/api/projects/:id/members` | List members |
| `POST` | `/api/projects/:id/members` | Add member |

### Test Cases

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/projects/:id/testcases` | List test cases |
| `POST` | `/api/projects/:id/testcases` | Create test case |
| `GET` | `/api/testcases/:id` | Get test case |
| `PUT` | `/api/testcases/:id` | Update test case |
| `DELETE` | `/api/testcases/:id` | Delete test case |
| `GET` | `/api/testcases/:id/steps` | Get steps |
| `POST` | `/api/testcases/:id/steps` | Add step |

### Test Suites

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/projects/:id/testsuites` | List suites |
| `POST` | `/api/projects/:id/testsuites` | Create suite |
| `GET` | `/api/testsuites/:id` | Get suite |
| `PUT` | `/api/testsuites/:id` | Update suite |
| `DELETE` | `/api/testsuites/:id` | Delete suite |
| `POST` | `/api/testsuites/move` | Move suite |
| `GET` | `/api/testsuites/:id/available-testcases` | Get available test cases |
| `POST` | `/api/testsuites/:id/testcases` | Add test cases to suite |
| `GET` | `/api/testsuites/:id/testcases/check` | Check test cases in suite |
| `POST` | `/api/projects/:id/testsuites/:suiteId/add-module` | Add module to suite |
| `POST` | `/api/projects/:id/testsuites/:suiteId/remove-module` | Remove module from suite |
| `PUT` | `/api/projects/:id/testsuites/:suiteId/update-module` | Update suite module |

### Modules

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

### Attachments

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/attachments/upload` | Initialize upload |
| `POST` | `/api/attachments/upload/part` | Upload part (multipart) |
| `POST` | `/api/attachments/upload/complete` | Complete upload |
| `POST` | `/api/attachments/upload/abort` | Abort upload |
| `GET` | `/api/attachments/:id` | Get attachment |
| `GET` | `/api/testcases/:id/attachments` | Get test case attachments |
| `POST` | `/api/testcases/:id/attachments` | Link attachments |
| `GET` | `/api/teststeps/:stepId/attachments` | Get test step attachments |
| `POST` | `/api/teststeps/:stepId/attachments` | Associate attachments |
| `GET` | `/api/defects/:id/attachments` | Get defect attachments |
| `POST` | `/api/defects/:id/attachments` | Link attachments |
| `GET` | `/api/comments/:commentId/attachments` | Get comment attachments |
| `POST` | `/api/comments/:commentId/attachments` | Create comment attachment |

### Comments

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/projects/:id/defects/:defectId/comments` | Create defect comment |
| `GET` | `/api/comments/:commentId/attachments` | Get comment attachments |
| `POST` | `/api/comments/:commentId/attachments` | Create comment attachment |

### OTP

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/otp/send` | Send OTP |
| `POST` | `/api/auth/otp/verify` | Verify OTP |
| `POST` | `/api/auth/otp/resend` | Resend OTP |

### Roles

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/roles` | Get all roles |

### Health & Status

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/email/status` | Email service status |

---

## Utility Endpoints

### GET /api/health

Health check endpoint for monitoring and load balancers.

**Authentication:** Not required (public endpoint)

**Request:**
```http
GET /api/health
```

**Response (200 OK):**
```json
{
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**Response (503 Service Unavailable):**
```json
{
  "data": null,
  "error": "Health check failed"
}
```

---

### GET /api/email/status

Check if email service is configured and available.

**Authentication:** Not required (public endpoint)

**Request:**
```http
GET /api/email/status
```

**Response (200 OK):**
```json
{
  "data": {
    "available": true,
    "message": "Email service is configured"
  }
}
```

**Response (200 OK - Not Configured):**
```json
{
  "data": {
    "available": false,
    "message": "Email service is not configured"
  }
}
```

---

### GET /api/roles

Get all system roles.

**Required Permission:** `users:read`

**Request:**
```http
GET /api/roles
Cookie: next-auth.session-token=...
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "role_123",
      "name": "ADMIN",
      "description": "System administrator",
      "permissions": [
        {
          "id": "perm_123",
          "name": "users:read"
        }
      ]
    },
    {
      "id": "role_124",
      "name": "PROJECT_MANAGER",
      "description": "Project manager role"
    }
  ]
}
```

**Error Responses:**

- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Insufficient permissions

### Test Runs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/projects/:id/testruns` | List test runs |
| `POST` | `/api/projects/:id/testruns` | Create test run |
| `GET` | `/api/testruns/:id` | Get test run |
| `PUT` | `/api/testruns/:id` | Update test run |
| `DELETE` | `/api/testruns/:id` | Delete test run |
| `POST` | `/api/testruns/:id/start` | Start run |
| `POST` | `/api/testruns/:id/complete` | Complete run |
| `POST` | `/api/testruns/:id/results` | Record result |

### Defects

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/projects/:id/defects` | List defects |
| `POST` | `/api/projects/:id/defects` | Create defect |
| `GET` | `/api/defects/:id` | Get defect |
| `PUT` | `/api/defects/:id` | Update defect |
| `DELETE` | `/api/defects/:id` | Delete defect |
| `POST` | `/api/defects/bulk-status` | Bulk status update |
| `POST` | `/api/defects/bulk-assign` | Bulk assign |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users` | List users |
| `GET` | `/api/users/profile` | Get current user |
| `PUT` | `/api/users/profile` | Update profile |
| `PUT` | `/api/users/profile/password` | Change password |
| `GET` | `/api/users/:id` | Get user |
| `PUT` | `/api/users/:id` | Update user (admin) |
| `DELETE` | `/api/users/:id` | Delete user (admin) |

---

## Pagination

### Request

```bash
GET /api/projects?page=2&limit=10
```

### Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `page` | 1 | Page number |
| `limit` | 10 | Items per page |

### Response

```json
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

---

## Filtering

### Query Parameters

```bash
GET /api/projects/:id/testcases?status=ACTIVE&priority=HIGH
```

### Common Filters

| Filter | Values | Description |
|--------|--------|-------------|
| `status` | ACTIVE, DRAFT, DEPRECATED | Test case status |
| `priority` | CRITICAL, HIGH, MEDIUM, LOW | Priority level |
| `suiteId` | UUID | Filter by suite |
| `assignedTo` | UUID | Filter by assignee |

---

## Sorting

```bash
GET /api/projects?sort=name&order=asc
```

| Parameter | Values | Description |
|-----------|--------|-------------|
| `sort` | Field name | Sort field |
| `order` | asc, desc | Sort direction |

---

## Searching

```bash
GET /api/projects/:id/testcases?search=login
```

Searches in:
- Title
- Description
- Test case ID

---

## Error Handling

### Common Errors

**401 Unauthorized**
```json
{
  "error": "unauthorized",
  "message": "Authentication required",
  "statusCode": 401
}
```

**403 Forbidden**
```json
{
  "error": "forbidden",
  "message": "Insufficient permissions for this operation",
  "statusCode": 403
}
```

**404 Not Found**
```json
{
  "error": "not_found",
  "message": "Resource not found",
  "statusCode": 404
}
```

**422 Validation Error**
```json
{
  "error": "validation_error",
  "message": "Invalid request data",
  "statusCode": 422,
  "details": {
    "email": "Invalid email format",
    "password": "Password must be at least 8 characters"
  }
}
```

---

## Rate Limiting

Currently not implemented. Future enhancement:

| Limit | Value |
|-------|-------|
| Per user | 100 requests/minute |
| Per IP | 1000 requests/minute |

---

## SDKs & Libraries

Coming soon:
- JavaScript/TypeScript
- Python
- Go

---

## Examples

### cURL

```bash
# Create project
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{"name": "My Project", "key": "MYP"}'
```

### JavaScript (fetch)

```javascript
const response = await fetch('/api/projects', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'My Project',
    key: 'MYP'
  }),
  credentials: 'include' // Include session cookie
});

const data = await response.json();
```

### TypeScript Example

```typescript
interface Project {
  id: string;
  name: string;
  key: string;
  description?: string;
}

async function createProject(data: Partial<Project>): Promise<Project> {
  const response = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  const result = await response.json();
  return result.data;
}
```

---

## Related Documentation

- [Authentication Feature](../features/authentication/README.md)
- [Projects Feature](../features/projects/README.md)
- [Architecture](../architecture/README.md)
