# Authentication API

API endpoints for user authentication and authorization.

## Overview

EzTest uses NextAuth.js for authentication with:
- Email/password credentials
- JWT-based sessions
- Role-based access control

---

## Endpoints

### POST /api/auth/register

Register a new user account.

**Request:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "name": "John Doe"
}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Valid email address |
| `password` | string | Yes | Min 8 characters |
| `name` | string | Yes | User's full name |

**Response (201 Created):**
```json
{
  "data": {
    "id": "cuid_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "TESTER",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "message": "User registered successfully"
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | invalid_email | Invalid email format |
| 400 | weak_password | Password too short |
| 409 | email_exists | Email already registered |
| 500 | server_error | Internal error |

---

### POST /api/auth/callback/credentials

Login with email and password. Handled by NextAuth.js.

**Request (Form):**
```http
POST /api/auth/callback/credentials
Content-Type: application/x-www-form-urlencoded

email=user@example.com&password=SecurePassword123&csrfToken=xxx
```

**Request (JSON):**
```bash
curl -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123"
  }'
```

**Success Response:**
- Sets `next-auth.session-token` cookie
- Redirects to `/dashboard`

**Error Response:**
- Redirects to `/auth/login?error=CredentialsSignin`

---

### POST /api/auth/signout

Logout the current user.

**Request:**
```http
POST /api/auth/signout
```

**Response:**
- Clears session cookie
- Redirects to `/auth/login`

---

### POST /api/auth/forgot-password

Request a password reset email.

**Request:**
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "If an account exists, a password reset email has been sent"
}
```

> **Security Note:** Same response for valid and invalid emails to prevent enumeration.

---

### POST /api/auth/reset-password

Reset password using token from email.

**Request:**
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "password": "NewSecurePassword456"
}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `token` | string | Yes | Token from reset email |
| `password` | string | Yes | New password (min 8 chars) |

**Response (200 OK):**
```json
{
  "message": "Password reset successfully"
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | invalid_token | Token invalid or expired |
| 400 | weak_password | Password too short |
| 404 | user_not_found | User doesn't exist |

---

### POST /api/auth/change-password

Change password for authenticated user.

**Request:**
```http
POST /api/auth/change-password
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
| 401 | unauthorized | Not authenticated |

---

### GET /api/auth/permissions

Get permissions for the current user.

**Request:**
```http
GET /api/auth/permissions
Cookie: next-auth.session-token=...
```

**Response (200 OK):**
```json
{
  "data": {
    "role": "TESTER",
    "permissions": [
      "projects:read",
      "testcases:read",
      "testcases:create",
      "testcases:update",
      "testruns:read",
      "testruns:create",
      "testruns:update",
      "defects:read",
      "defects:create",
      "defects:update"
    ]
  }
}
```

---

### OTP Verification

#### POST /api/auth/otp/send

Send OTP to email.

**Request:**
```http
POST /api/auth/otp/send
Content-Type: application/json

{
  "email": "user@example.com",
  "type": "login"
}
```

**Response (200 OK):**
```json
{
  "message": "OTP sent successfully"
}
```

#### POST /api/auth/otp/verify

Verify OTP code.

**Request:**
```http
POST /api/auth/otp/verify
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456",
  "type": "login"
}
```

**Response (200 OK):**
```json
{
  "verified": true,
  "message": "OTP verified successfully"
}
```

#### POST /api/auth/otp/resend

Resend OTP code.

**Request:**
```http
POST /api/auth/otp/resend
Content-Type: application/json

{
  "email": "user@example.com",
  "type": "login"
}
```

---

## Session Management

### Session Object

The session contains:

```typescript
interface Session {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    permissions: string[];
  };
  expires: string; // ISO date
}
```

### Token Configuration

| Setting | Value |
|---------|-------|
| Strategy | JWT |
| Max Age | 30 days |
| Update Age | 24 hours |
| Algorithm | HS256 |

### Getting Session (Frontend)

```typescript
import { useSession } from 'next-auth/react';

function Component() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') return <Loading />;
  if (!session) return <Login />;
  
  return <div>Welcome, {session.user.name}</div>;
}
```

### Getting Session (API)

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Use session.user
}
```

---

## Permissions

### Permission Format

```
resource:action
```

Examples:
- `projects:read`
- `testcases:create`
- `users:delete`

### Checking Permissions (Frontend)

```tsx
import { HasPermission } from '@/components/auth/HasPermission';

<HasPermission permission="testcases:create">
  <Button>Create Test Case</Button>
</HasPermission>
```

### Checking Permissions (API)

```typescript
import { checkPermission } from '@/lib/permissions';

if (!checkPermission(session.user.permissions, 'testcases:create')) {
  return Response.json({ error: 'Forbidden' }, { status: 403 });
}
```

---

## Security Headers

Recommended headers for API responses:

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
```

---

## OTP (One-Time Password) Endpoints

EzTest supports OTP verification for sensitive actions like password reset and account changes.

### POST /api/auth/otp/send

Send an OTP to the user's email.

**Request:**
```http
POST /api/auth/otp/send
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "email": "user@example.com",
  "purpose": "password_reset"
}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | User email address |
| `purpose` | string | Yes | OTP purpose: `password_reset`, `email_verification`, `account_change` |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "expiresIn": 600
}
```

**Error Responses:**

- `400 Bad Request` - Invalid email or purpose
- `404 Not Found` - User not found
- `429 Too Many Requests` - Rate limit exceeded

---

### POST /api/auth/otp/verify

Verify an OTP code.

**Request:**
```http
POST /api/auth/otp/verify
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "email": "user@example.com",
  "otp": "123456",
  "purpose": "password_reset"
}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | User email address |
| `otp` | string | Yes | 6-digit OTP code |
| `purpose` | string | Yes | OTP purpose |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "token": "verification_token_abc123"
}
```

**Error Responses:**

- `400 Bad Request` - Invalid OTP or expired
- `401 Unauthorized` - Invalid or expired OTP
- `404 Not Found` - OTP not found

---

### POST /api/auth/otp/resend

Resend an OTP to the user's email.

**Request:**
```http
POST /api/auth/otp/resend
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "email": "user@example.com",
  "purpose": "password_reset"
}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | User email address |
| `purpose` | string | Yes | OTP purpose |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP resent successfully",
  "expiresIn": 600
}
```

**Error Responses:**

- `400 Bad Request` - Invalid email or purpose
- `429 Too Many Requests` - Rate limit exceeded (max 3 resends per hour)

---

## OTP Flow

### Password Reset with OTP

1. **Request Password Reset:**
   ```http
   POST /api/auth/forgot-password
   { "email": "user@example.com" }
   ```

2. **Send OTP:**
   ```http
   POST /api/auth/otp/send
   {
     "email": "user@example.com",
     "purpose": "password_reset"
   }
   ```

3. **Verify OTP:**
   ```http
   POST /api/auth/otp/verify
   {
     "email": "user@example.com",
     "otp": "123456",
     "purpose": "password_reset"
   }
   ```

4. **Reset Password:**
   ```http
   POST /api/auth/reset-password
   {
     "token": "verification_token_abc123",
     "password": "newPassword123"
   }
   ```

---

## Related Documentation

- [Authentication Feature](../features/authentication/README.md)
- [API Overview](./README.md)
