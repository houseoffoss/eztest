# API Documentation

## Overview

EZTest provides a RESTful API built with Next.js API routes. All endpoints follow REST conventions and return JSON responses.

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

All endpoints except `/api/auth/*` and `/api/health` require authentication.

### Authentication Methods

1. **Session Cookie** (Automatic)
   - NextAuth.js sets HTTP-only cookie on login
   - Automatically included in all requests
   - Managed by browser

2. **JWT Token** (Manual)
   - Can be extracted from session
   - Include in `Authorization: Bearer <token>`
   - For external integrations

### Example Request

```bash
# Automatic (session cookie)
curl -X GET http://localhost:3000/api/projects \
  -H "Cookie: next-auth.session-token=..."

# Manual (JWT bearer token)
curl -X GET http://localhost:3000/api/projects \
  -H "Authorization: Bearer eyJhbGc..."
```

## Response Format

All responses follow a consistent format:

### Success Response (2xx)

```json
{
  "data": {
    "id": "123",
    "name": "Example",
    ...
  },
  "message": "Operation successful"
}
```

### Error Response (4xx/5xx)

```json
{
  "error": "Error message",
  "message": "Detailed error description",
  "statusCode": 400
}
```

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 204 | No Content - Successful, no body |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Not authenticated |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error - Server error |

## Current API Endpoints

### Authentication

#### POST /api/auth/register

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "name": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "data": {
    "id": "cuid123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "TESTER",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses:**
```json
// Invalid email format
{
  "error": "invalid_email",
  "message": "Please provide a valid email address"
}

// Password too short
{
  "error": "weak_password",
  "message": "Password must be at least 8 characters"
}

// Email already exists
{
  "error": "email_exists",
  "message": "An account with this email already exists"
}
```

**Status Codes:**
- 201: User created successfully
- 400: Invalid input
- 409: Email already exists
- 500: Server error

---

#### POST /api/auth/login

Login with credentials.

**Note**: Handled by NextAuth.js at `/api/auth/callback/credentials`

**Request (via form):**
```html
<form action="/api/auth/callback/credentials" method="POST">
  <input name="email" type="email" />
  <input name="password" type="password" />
  <input name="csrfToken" value="..." hidden />
  <button type="submit">Sign In</button>
</form>
```

**Redirect on Success:**
```
Redirects to /dashboard
Sets session cookie
```

---

#### POST /api/auth/signout

Logout current user.

**Request:**
```bash
POST /api/auth/signout
```

**Response:**
```
Redirects to /auth/login
Clears session cookie
```

---

### Health Check

#### GET /api/health

Check API health status (no authentication required).

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 12345
}
```

---

## Future API Endpoints

### Projects

#### GET /api/projects
Get all projects for current user.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search project name/key

**Response:**
```json
{
  "data": [
    {
      "id": "proj123",
      "name": "Project Name",
      "key": "PROJ",
      "description": "...",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10
}
```

---

#### POST /api/projects
Create a new project.

**Request Body:**
```json
{
  "name": "New Project",
  "key": "NEW",
  "description": "Project description"
}
```

**Response (201 Created):**
```json
{
  "data": {
    "id": "proj123",
    "name": "New Project",
    "key": "NEW",
    "description": "Project description",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

#### GET /api/projects/:id
Get project details.

**Response:**
```json
{
  "data": {
    "id": "proj123",
    "name": "Project Name",
    "key": "PROJ",
    "description": "...",
    "members": [
      {
        "id": "mem123",
        "user": { "name": "John", "email": "john@example.com" },
        "role": "OWNER",
        "joinedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

#### PUT /api/projects/:id
Update project details.

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

**Response:**
```json
{
  "data": {
    "id": "proj123",
    "name": "Updated Name",
    "description": "Updated description",
    "updatedAt": "2024-01-15T10:45:00Z"
  }
}
```

---

#### DELETE /api/projects/:id
Delete a project.

**Authorization:** Project owner or admin

**Response (204 No Content):**
```
(empty body)
```

---

### Test Cases

#### GET /api/projects/:projectId/test-cases
Get test cases in a project.

**Query Parameters:**
- `suiteId`: Filter by test suite
- `status`: Filter by status (ACTIVE, DRAFT, DEPRECATED)
- `priority`: Filter by priority
- `page`: Pagination
- `limit`: Items per page

**Response:**
```json
{
  "data": [
    {
      "id": "tc123",
      "title": "Test Case Title",
      "description": "...",
      "status": "ACTIVE",
      "priority": "HIGH",
      "estimatedTime": 30,
      "steps": [
        {
          "id": "step1",
          "stepNumber": 1,
          "action": "Click login",
          "expectedResult": "Login form appears"
        }
      ],
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

#### POST /api/projects/:projectId/test-cases
Create a test case.

**Request Body:**
```json
{
  "title": "User Login Test",
  "description": "Verify user can login",
  "priority": "HIGH",
  "status": "ACTIVE",
  "estimatedTime": 30,
  "suiteId": "suite123",
  "preconditions": "User account exists",
  "postconditions": "User is logged in",
  "steps": [
    {
      "stepNumber": 1,
      "action": "Navigate to login page",
      "expectedResult": "Login form is displayed"
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "data": {
    "id": "tc123",
    "title": "User Login Test",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

#### GET /api/test-cases/:id
Get test case details.

**Response:**
```json
{
  "data": {
    "id": "tc123",
    "title": "Test Case Title",
    "description": "...",
    "status": "ACTIVE",
    "priority": "HIGH",
    "steps": [...],
    "comments": [...],
    "attachments": [...],
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

#### PUT /api/test-cases/:id
Update test case.

**Request Body:**
```json
{
  "title": "Updated Title",
  "status": "DRAFT",
  "priority": "MEDIUM"
}
```

---

#### DELETE /api/test-cases/:id
Delete test case.

**Response (204 No Content):**
```
(empty body)
```

---

### Test Runs

#### GET /api/projects/:projectId/test-runs
Get test runs in a project.

**Query Parameters:**
- `status`: Filter by status
- `assignedTo`: Filter by assigned user
- `environment`: Filter by environment
- `page`: Pagination

**Response:**
```json
{
  "data": [
    {
      "id": "run123",
      "name": "Sprint 2.1 Testing",
      "status": "IN_PROGRESS",
      "environment": "Staging",
      "assignedTo": { "id": "user123", "name": "John" },
      "resultsCount": 45,
      "passCount": 40,
      "failCount": 5,
      "startedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

#### POST /api/projects/:projectId/test-runs
Create a test run.

**Request Body:**
```json
{
  "name": "Sprint 2.1 Testing",
  "description": "Test run for sprint 2.1",
  "environment": "Staging",
  "assignedToId": "user123",
  "testCaseIds": ["tc1", "tc2", "tc3"]
}
```

---

#### POST /api/test-runs/:id/results
Record test result.

**Request Body:**
```json
{
  "testCaseId": "tc123",
  "status": "PASSED",
  "duration": 120,
  "comment": "Test executed successfully",
  "attachments": ["screenshot.png"]
}
```

**Response (201 Created):**
```json
{
  "data": {
    "id": "result123",
    "status": "PASSED",
    "executedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### Users & Permissions

#### GET /api/users/profile
Get current user profile.

**Response:**
```json
{
  "data": {
    "id": "user123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "TESTER",
    "avatar": "https://...",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

#### POST /api/projects/:projectId/members
Add member to project.

**Request Body:**
```json
{
  "userId": "user123",
  "role": "TESTER"
}
```

---

#### DELETE /api/projects/:projectId/members/:userId
Remove member from project.

**Authorization:** Project owner

**Response (204 No Content):**
```
(empty body)
```

---

## Error Handling

### Common Error Responses

#### 401 Unauthorized
```json
{
  "error": "unauthorized",
  "message": "Authentication required"
}
```

#### 403 Forbidden
```json
{
  "error": "forbidden",
  "message": "Insufficient permissions for this operation"
}
```

#### 404 Not Found
```json
{
  "error": "not_found",
  "message": "Resource not found"
}
```

#### 422 Unprocessable Entity
```json
{
  "error": "validation_error",
  "message": "Invalid request data",
  "fields": {
    "email": "Invalid email format",
    "password": "Password too short"
  }
}
```

#### 500 Server Error
```json
{
  "error": "server_error",
  "message": "An unexpected error occurred"
}
```

---

## Rate Limiting

Currently no rate limiting implemented.

**Future Enhancement:**
- 100 requests per minute per user
- 1000 requests per minute per IP

---

## Pagination

All list endpoints support pagination:

**Query Parameters:**
```
?page=1&limit=10
```

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 245,
    "pages": 25
  }
}
```

---

## Filtering & Search

Supported on list endpoints:

**Query Parameters:**
```
?search=query           // Search by name/title
?status=ACTIVE          // Filter by status
?priority=HIGH          // Filter by priority
?startDate=2024-01-01   // Filter by date range
&endDate=2024-12-31
```

---

## Sorting

**Query Parameters:**
```
?sort=name              // Sort by field
?order=asc              // asc or desc
```

---

## Batch Operations

#### POST /api/test-cases/batch/update
Update multiple test cases.

**Request Body:**
```json
{
  "ids": ["tc1", "tc2", "tc3"],
  "update": {
    "status": "DEPRECATED"
  }
}
```

---

## Webhook Support (Future)

Subscribe to events:
- test.case.created
- test.run.completed
- test.result.failed

---

## SDK/Client Libraries (Future)

- JavaScript/TypeScript
- Python
- Go

---

## Migration Guide

For API changes or deprecations, see [MIGRATION.md](#) (future document)

