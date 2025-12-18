# Authentication & Security

Comprehensive guide to EzTest's authentication and security features.

## Overview

EzTest provides enterprise-grade security with:

- **Email/Password Authentication** - Secure credential-based login
- **JWT Sessions** - Stateless session management
- **Role-Based Access Control (RBAC)** - Granular permissions
- **Password Security** - bcrypt hashing with salt
- **Password Reset** - Email-based recovery flow
- **OTP Verification** - Two-factor authentication for sensitive actions

---

## Table of Contents

- [User Authentication](#user-authentication)
- [Session Management](#session-management)
- [Role-Based Access Control](#role-based-access-control)
- [Password Management](#password-management)
- [Security Best Practices](#security-best-practices)

---

## <a id="user-authentication"></a>User Authentication

### Registration

New users can register with:

| Field | Requirements |
|-------|-------------|
| **Email** | Valid email format, unique |
| **Password** | Minimum 8 characters |
| **Name** | Required, 1-100 characters |

**Registration Flow:**

```
1. User submits registration form
2. Server validates input
3. Password hashed with bcrypt (10 salt rounds)
4. User created with default TESTER role
5. OTP sent to email for verification (if enabled)
6. User redirected to login
```

### Login

**Login Flow:**

```
1. User enters email and password
2. Server finds user by email
3. bcrypt compares password with hash
4. If valid, JWT token generated
5. Session created (30-day expiry)
6. User redirected to dashboard
```

### Logout

Clicking logout:
- Clears the session cookie
- Invalidates the JWT token
- Redirects to login page

---

## <a id="session-management"></a>Session Management

### JWT Configuration

EzTest uses JSON Web Tokens (JWT) for session management:

| Setting | Value | Description |
|---------|-------|-------------|
| **Strategy** | JWT | Token-based authentication |
| **Max Age** | 30 days | Session expiration |
| **Update Age** | 24 hours | Token refresh interval |
| **Signing Algorithm** | HS256 | HMAC SHA-256 |

### Session Data

The JWT token contains:

```json
{
  "id": "user-id",
  "email": "user@example.com",
  "name": "User Name",
  "role": "TESTER",
  "permissions": ["testcases:read", "testcases:create", ...]
}
```

### Token Storage

- **HTTP-only cookie** - Cannot be accessed by JavaScript
- **Secure flag** - HTTPS only in production
- **SameSite** - Strict CSRF protection

---

## <a id="role-based-access-control"></a>Role-Based Access Control

### System Roles

EzTest provides four system-level roles:

| Role | Description | Typical Use |
|------|-------------|-------------|
| **ADMIN** | Full system access | System administrators |
| **PROJECT_MANAGER** | Create/manage projects | Team leads, managers |
| **TESTER** | Execute tests, report defects | QA engineers |
| **VIEWER** | Read-only access | Stakeholders, observers |

### Permission Categories

Permissions are organized by resource:

| Resource | Permissions |
|----------|-------------|
| **Users** | `users:read`, `users:create`, `users:update`, `users:delete` |
| **Projects** | `projects:read`, `projects:create`, `projects:update`, `projects:delete` |
| **Test Cases** | `testcases:read`, `testcases:create`, `testcases:update`, `testcases:delete` |
| **Test Suites** | `testsuites:read`, `testsuites:create`, `testsuites:update`, `testsuites:delete` |
| **Test Runs** | `testruns:read`, `testruns:create`, `testruns:update`, `testruns:delete` |
| **Defects** | `defects:read`, `defects:create`, `defects:update`, `defects:delete` |

### Permission Matrix

<table>
<thead>
<tr>
<th style="text-align: left;">Permission</th>
<th style="text-align: center;">Admin</th>
<th style="text-align: center;">Project Manager</th>
<th style="text-align: center;">Tester</th>
<th style="text-align: center;">Viewer</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;"><code>users:read</code></td>
<td style="text-align: center;">✅</td>
<td style="text-align: center;">✅</td>
<td style="text-align: center;">✅</td>
<td style="text-align: center;">✅</td>
</tr>
<tr>
<td style="text-align: left;"><code>users:create</code></td>
<td style="text-align: center;">✅</td>
<td style="text-align: center;">❌</td>
<td style="text-align: center;">❌</td>
<td style="text-align: center;">❌</td>
</tr>
<tr>
<td style="text-align: left;"><code>users:update</code></td>
<td style="text-align: center;">✅</td>
<td style="text-align: center;">❌</td>
<td style="text-align: center;">❌</td>
<td style="text-align: center;">❌</td>
</tr>
<tr>
<td style="text-align: left;"><code>users:delete</code></td>
<td style="text-align: center;">✅</td>
<td style="text-align: center;">❌</td>
<td style="text-align: center;">❌</td>
<td style="text-align: center;">❌</td>
</tr>
<tr>
<td style="text-align: left;"><code>projects:read</code></td>
<td style="text-align: center;">✅</td>
<td style="text-align: center;">✅</td>
<td style="text-align: center;">✅</td>
<td style="text-align: center;">✅</td>
</tr>
<tr>
<td style="text-align: left;"><code>projects:create</code></td>
<td style="text-align: center;">✅</td>
<td style="text-align: center;">✅</td>
<td style="text-align: center;">❌</td>
<td style="text-align: center;">❌</td>
</tr>
<tr>
<td style="text-align: left;"><code>projects:update</code></td>
<td style="text-align: center;">✅</td>
<td style="text-align: center;">✅</td>
<td style="text-align: center;">❌</td>
<td style="text-align: center;">❌</td>
</tr>
<tr>
<td style="text-align: left;"><code>projects:delete</code></td>
<td style="text-align: center;">✅</td>
<td style="text-align: center;">❌</td>
<td style="text-align: center;">❌</td>
<td style="text-align: center;">❌</td>
</tr>
<tr>
<td style="text-align: left;"><code>testcases:read</code></td>
<td style="text-align: center;">✅</td>
<td style="text-align: center;">✅</td>
<td style="text-align: center;">✅</td>
<td style="text-align: center;">✅</td>
</tr>
<tr>
<td style="text-align: left;"><code>testcases:create</code></td>
<td style="text-align: center;">✅</td>
<td style="text-align: center;">✅</td>
<td style="text-align: center;">✅</td>
<td style="text-align: center;">❌</td>
</tr>
<tr>
<td style="text-align: left;"><code>testcases:update</code></td>
<td style="text-align: center;">✅</td>
<td style="text-align: center;">✅</td>
<td style="text-align: center;">✅</td>
<td style="text-align: center;">❌</td>
</tr>
<tr>
<td style="text-align: left;"><code>testcases:delete</code></td>
<td style="text-align: center;">✅</td>
<td style="text-align: center;">✅</td>
<td style="text-align: center;">❌</td>
<td style="text-align: center;">❌</td>
</tr>
<tr>
<td style="text-align: left;"><code>testruns:read</code></td>
<td style="text-align: center;">✅</td>
<td style="text-align: center;">✅</td>
<td style="text-align: center;">✅</td>
<td style="text-align: center;">✅</td>
</tr>
<tr>
<td style="text-align: left;"><code>testruns:create</code></td>
<td style="text-align: center;">✅</td>
<td style="text-align: center;">✅</td>
<td style="text-align: center;">✅</td>
<td style="text-align: center;">❌</td>
</tr>
<tr>
<td style="text-align: left;"><code>testruns:update</code></td>
<td style="text-align: center;">✅</td>
<td style="text-align: center;">✅</td>
<td style="text-align: center;">✅</td>
<td style="text-align: center;">❌</td>
</tr>
<tr>
<td style="text-align: left;"><code>testruns:delete</code></td>
<td style="text-align: center;">✅</td>
<td style="text-align: center;">✅</td>
<td style="text-align: center;">❌</td>
<td style="text-align: center;">❌</td>
</tr>
<tr>
<td style="text-align: left;"><code>defects:read</code></td>
<td style="text-align: center;">✅</td>
<td style="text-align: center;">✅</td>
<td style="text-align: center;">✅</td>
<td style="text-align: center;">✅</td>
</tr>
<tr>
<td style="text-align: left;"><code>defects:create</code></td>
<td style="text-align: center;">✅</td>
<td style="text-align: center;">✅</td>
<td style="text-align: center;">✅</td>
<td style="text-align: center;">❌</td>
</tr>
<tr>
<td style="text-align: left;"><code>defects:update</code></td>
<td style="text-align: center;">✅</td>
<td style="text-align: center;">✅</td>
<td style="text-align: center;">✅</td>
<td style="text-align: center;">❌</td>
</tr>
<tr>
<td style="text-align: left;"><code>defects:delete</code></td>
<td style="text-align: center;">✅</td>
<td style="text-align: center;">✅</td>
<td style="text-align: center;">❌</td>
<td style="text-align: center;">❌</td>
</tr>
</tbody>
</table>

### Checking Permissions

In the frontend, use the `HasPermission` component:

```tsx
import { HasPermission } from '@/components/auth/HasPermission';

// Show content only if user has permission
<HasPermission permission="testcases:create">
  <Button>Create Test Case</Button>
</HasPermission>

// Multiple permissions (any)
<HasPermission permissions={["testcases:update", "testcases:delete"]} requireAll={false}>
  <EditMenu />
</HasPermission>
```

### Project-Level Roles

Projects have additional membership roles:

| Role | Access Level |
|------|--------------|
| **OWNER** | Full control, can delete project |
| **ADMIN** | Manage members, full content access |
| **TESTER** | Create/execute tests |
| **VIEWER** | Read-only |

---

## <a id="password-management"></a>Password Management

### Password Requirements

| Requirement | Value |
|-------------|-------|
| Minimum length | 8 characters |
| Recommended | Mix of upper, lower, numbers, symbols |

### Password Hashing

EzTest uses bcrypt for password security:

```
1. Generate random salt (10 rounds)
2. Hash password with salt
3. Store hash in database
4. Never store plain password
```

### Password Reset Flow

```
1. User clicks "Forgot Password"
2. User enters email address
3. Server generates unique token (expires in 1 hour)
4. Email sent with reset link
5. User clicks link, enters new password
6. Server validates token and updates password
7. Token marked as used (one-time use)
```

### Change Password

Logged-in users can change password:

1. Navigate to **Settings > Security**
2. Enter current password
3. Enter new password (twice)
4. Click "Update Password"

---

## <a id="security-best-practices"></a>Security Best Practices

### For Administrators

1. **Use strong NEXTAUTH_SECRET** - Minimum 32 characters
2. **Enable HTTPS** - Always in production
3. **Regular password rotation** - Enforce password changes
4. **Audit user access** - Review roles periodically
5. **Limit admin accounts** - Follow least privilege principle

### For Users

1. **Use strong passwords** - Unique, complex passwords
2. **Don't share accounts** - Each user should have their own
3. **Log out on shared devices** - Clear sessions
4. **Report suspicious activity** - Contact administrators

### Configuration Checklist

- [ ] `NEXTAUTH_SECRET` is strong and unique
- [ ] `NEXTAUTH_URL` matches your domain
- [ ] HTTPS enabled in production
- [ ] Database connection uses SSL
- [ ] Default admin password changed
- [ ] Unused accounts disabled

---

## Related Documentation

- [User Management](./user-management.md)
- [API Authentication](../../api/authentication.md)
- [Security Architecture](../../architecture/security.md)
