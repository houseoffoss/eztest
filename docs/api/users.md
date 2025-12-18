# Users API

API endpoints for user management.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users` | List users (admin) |
| `GET` | `/api/users/profile` | Get current user |
| `PUT` | `/api/users/profile` | Update profile |
| `PUT` | `/api/users/profile/password` | Change password |
| `GET` | `/api/users/:id` | Get user (admin) |
| `PUT` | `/api/users/:id` | Update user (admin) |
| `DELETE` | `/api/users/:id` | Delete user (admin) |

---

## GET /api/users

List all users. **Admin only.**

**Required Permission:** `users:read` + ADMIN role

**Request:**
```http
GET /api/users?page=1&limit=10
Cookie: next-auth.session-token=...
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number |
| `limit` | number | Items per page |
| `search` | string | Search name/email |
| `role` | string | Filter by role |

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "user_abc123",
      "email": "john@example.com",
      "name": "John Doe",
      "role": {
        "id": "role_tester",
        "name": "TESTER"
      },
      "avatar": null,
      "createdAt": "2024-01-15T10:30:00Z",
      "deletedAt": null,
      "_count": {
        "projects": 5
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

---

## GET /api/users/profile

Get current user's profile.

**Request:**
```http
GET /api/users/profile
Cookie: next-auth.session-token=...
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "user_abc123",
    "email": "john@example.com",
    "name": "John Doe",
    "role": {
      "id": "role_tester",
      "name": "TESTER"
    },
    "avatar": "https://...",
    "bio": "QA Engineer with 5 years experience",
    "phone": "+1 555-0123",
    "location": "San Francisco, CA",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T14:00:00Z"
  }
}
```

---

## PUT /api/users/profile

Update current user's profile.

**Request:**
```http
PUT /api/users/profile
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "name": "John M. Doe",
  "bio": "Senior QA Engineer",
  "phone": "+1 555-0124",
  "location": "New York, NY"
}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | Display name |
| `bio` | string | No | Bio/description |
| `phone` | string | No | Phone number |
| `location` | string | No | Location |
| `avatar` | string | No | Avatar URL |

**Response (200 OK):**
```json
{
  "data": {
    "id": "user_abc123",
    "name": "John M. Doe",
    "bio": "Senior QA Engineer",
    "phone": "+1 555-0124",
    "location": "New York, NY",
    "updatedAt": "2024-01-21T11:00:00Z"
  },
  "message": "Profile updated successfully"
}
```

---

## PUT /api/users/profile/password

Change current user's password.

**Request:**
```http
PUT /api/users/profile/password
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword456"
}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `currentPassword` | string | Yes | Current password |
| `newPassword` | string | Yes | New password (min 8 chars) |

**Response (200 OK):**
```json
{
  "message": "Password changed successfully"
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | invalid_password | Current password incorrect |
| 400 | weak_password | New password too short |

---

## GET /api/users/:id

Get user by ID. **Admin only.**

**Required Permission:** `users:read` + ADMIN role

**Request:**
```http
GET /api/users/user_abc123
Cookie: next-auth.session-token=...
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "user_abc123",
    "email": "john@example.com",
    "name": "John Doe",
    "role": {
      "id": "role_tester",
      "name": "TESTER"
    },
    "avatar": null,
    "bio": "QA Engineer",
    "phone": "+1 555-0123",
    "location": "San Francisco, CA",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T14:00:00Z",
    "deletedAt": null,
    "projects": [
      {
        "id": "proj_123",
        "name": "E-Commerce",
        "key": "ECOM"
      }
    ]
  }
}
```

---

## PUT /api/users/:id

Update a user. **Admin only.**

**Required Permission:** `users:update` + ADMIN role

**Request:**
```http
PUT /api/users/user_abc123
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "name": "John Doe Updated",
  "roleId": "role_project_manager"
}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | Display name |
| `roleId` | string | No | New role ID |
| `bio` | string | No | Bio |
| `phone` | string | No | Phone |
| `location` | string | No | Location |

**Response (200 OK):**
```json
{
  "data": {
    "id": "user_abc123",
    "name": "John Doe Updated",
    "role": {
      "id": "role_project_manager",
      "name": "PROJECT_MANAGER"
    },
    "updatedAt": "2024-01-21T11:00:00Z"
  },
  "message": "User updated successfully"
}
```

---

## DELETE /api/users/:id

Delete (soft delete) a user. **Admin only.**

**Required Permission:** `users:delete` + ADMIN role

**Request:**
```http
DELETE /api/users/user_abc123
Cookie: next-auth.session-token=...
```

**Response (200 OK):**
```json
{
  "message": "User archived successfully"
}
```

> **Note:** Users are soft-deleted (archived). Their `deletedAt` field is set, but data is preserved.

---

## GET /api/users/account

Get user account settings.

**Request:**
```http
GET /api/users/account
Cookie: next-auth.session-token=...
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "user_abc123",
    "email": "john@example.com",
    "emailVerified": true,
    "twoFactorEnabled": false,
    "createdAt": "2024-01-15T10:30:00Z",
    "lastLoginAt": "2024-01-21T09:00:00Z"
  }
}
```

---

## GET /api/roles

List available roles.

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
      "id": "role_admin",
      "name": "ADMIN",
      "permissions": [
        "users:read",
        "users:create",
        "users:update",
        "users:delete",
        "projects:read",
        "projects:create",
        // ... more permissions
      ]
    },
    {
      "id": "role_tester",
      "name": "TESTER",
      "permissions": [
        "projects:read",
        "testcases:read",
        "testcases:create",
        // ... more permissions
      ]
    }
  ]
}
```

---

## Examples

### cURL

```bash
# Get profile
curl http://localhost:3000/api/users/profile \
  -H "Cookie: next-auth.session-token=..."

# Update profile
curl -X PUT http://localhost:3000/api/users/profile \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{"name": "New Name", "bio": "Updated bio"}'

# Change password
curl -X PUT http://localhost:3000/api/users/profile/password \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "currentPassword": "OldPass123",
    "newPassword": "NewPass456"
  }'
```

---

## Related Documentation

- [Authentication API](./authentication.md)
- [Authentication Feature](../features/authentication/README.md)
- [API Overview](./README.md)
