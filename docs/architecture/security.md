# Security Architecture

Security implementation documentation for EZTest.

## Overview

EZTest implements multiple security layers:

1. **Authentication** - User identity verification
2. **Authorization** - Permission-based access control
3. **Data Protection** - Encryption and hashing
4. **Input Validation** - Request sanitization
5. **Session Security** - Secure token management

---

## Authentication

### Password Security

**Hashing Algorithm:** bcrypt with 10 salt rounds

```typescript
import bcrypt from 'bcryptjs';

// Hash password
const hashedPassword = await bcrypt.hash(password, 10);

// Verify password
const isValid = await bcrypt.compare(password, hashedPassword);
```

**Requirements:**
- Minimum 8 characters
- Stored as hash (never plain text)
- Compared using timing-safe comparison

### Session Management

**Strategy:** JWT (JSON Web Tokens)

**Configuration:**
| Setting | Value |
|---------|-------|
| Algorithm | HS256 |
| Max Age | 30 days |
| Update Age | 24 hours |
| Storage | HTTP-only cookie |

**Token Contents:**
```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "name": "User Name",
  "role": "TESTER",
  "permissions": ["..."],
  "iat": 1234567890,
  "exp": 1237159890
}
```

### Cookie Security

| Attribute | Value | Purpose |
|-----------|-------|---------|
| `httpOnly` | true | Prevent XSS access |
| `secure` | true (prod) | HTTPS only |
| `sameSite` | lax | CSRF protection |
| `path` | / | Site-wide |

---

## Authorization

### Role-Based Access Control (RBAC)

**System Roles:**

| Role | Description |
|------|-------------|
| ADMIN | Full system access |
| PROJECT_MANAGER | Create/manage projects |
| TESTER | Execute tests, report defects |
| VIEWER | Read-only access |

### Permission Model

Permissions follow the pattern: `resource:action`

```
projects:read
projects:create
projects:update
projects:delete

testcases:read
testcases:create
testcases:update
testcases:delete
```

### Permission Check Flow

```
1. Request arrives
       │
       ▼
2. Extract JWT from cookie
       │
       ▼
3. Verify JWT signature
       │
       ▼
4. Load user permissions from token
       │
       ▼
5. Check required permission
       │
       ▼
6. Allow or deny (403)
```

### Implementation

```typescript
// API Route protection
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  if (!session.user.permissions.includes('projects:read')) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // Proceed with authorized request
}
```

### Frontend Permission Check

```tsx
import { HasPermission } from '@/components/auth/HasPermission';

<HasPermission permission="testcases:create">
  <Button>Create Test Case</Button>
</HasPermission>
```

---

## Data Protection

### Database

- Passwords never stored in plain text
- Sensitive data encrypted at rest (PostgreSQL)
- SSL/TLS connections in production
- Connection string in environment variables

### File Storage (S3)

- Presigned URLs with expiration
- Server-side encryption (SSE-S3)
- Access control via IAM policies
- CORS restrictions

### Environment Variables

```bash
# Never commit these to version control
NEXTAUTH_SECRET=<32+ character secret>
DATABASE_URL=<connection string>
AWS_ACCESS_KEY_ID=<aws key>
AWS_SECRET_ACCESS_KEY=<aws secret>
```

---

## Input Validation

### Zod Schemas

```typescript
import { z } from 'zod';

const createProjectSchema = z.object({
  name: z.string().min(1).max(255),
  key: z.string().min(2).max(10).regex(/^[A-Z0-9]+$/),
  description: z.string().max(1000).optional(),
});

// Validate request
const result = createProjectSchema.safeParse(body);
if (!result.success) {
  return Response.json({ 
    error: 'Validation error',
    details: result.error.issues 
  }, { status: 422 });
}
```

### SQL Injection Prevention

Prisma ORM uses parameterized queries:

```typescript
// Safe - Prisma parameterizes automatically
const user = await prisma.user.findUnique({
  where: { email: userInput }
});

// Never use raw queries with user input
// prisma.$queryRaw`SELECT * FROM users WHERE email = ${userInput}`
```

### XSS Prevention

- React escapes output by default
- Avoid `dangerouslySetInnerHTML`
- Content-Security-Policy headers
- HTTP-only cookies

---

## API Security

### Rate Limiting (Planned)

```typescript
// Future implementation
const rateLimit = {
  perUser: '100/minute',
  perIP: '1000/minute',
};
```

### CORS Configuration

```typescript
// next.config.ts
const corsConfig = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
};
```

### Request Headers

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

---

## Security Checklist

### Configuration

- [ ] Strong `NEXTAUTH_SECRET` (32+ chars)
- [ ] HTTPS enabled in production
- [ ] Database SSL connection
- [ ] Environment variables not committed
- [ ] CORS properly configured

### Authentication

- [ ] Password hashing with bcrypt
- [ ] JWT token expiration
- [ ] Secure cookie settings
- [ ] Session invalidation on logout

### Authorization

- [ ] Permission checks on all routes
- [ ] Role validation
- [ ] Resource ownership verification
- [ ] Project membership checks

### Data

- [ ] Input validation with Zod
- [ ] Parameterized database queries
- [ ] Sensitive data encryption
- [ ] Secure file upload handling

---

## Security Best Practices

### For Developers

1. **Never commit secrets** - Use environment variables
2. **Validate all input** - Use Zod schemas
3. **Check permissions** - Verify access on every request
4. **Use Prisma** - Avoid raw SQL queries
5. **Log security events** - Track suspicious activity

### For Operators

1. **Rotate secrets regularly** - Change NEXTAUTH_SECRET
2. **Monitor access** - Review user activity
3. **Update dependencies** - Keep packages current
4. **Backup database** - Regular encrypted backups
5. **Review logs** - Check for anomalies

### For Users

1. **Use strong passwords** - Unique, complex
2. **Don't share accounts** - Individual logins
3. **Report issues** - Contact admins
4. **Log out properly** - Clear sessions

---

## Incident Response

### If Credentials Exposed

1. Rotate affected secrets immediately
2. Invalidate all sessions
3. Reset affected passwords
4. Review access logs
5. Notify affected users

### If Vulnerability Found

1. Assess severity
2. Apply fix or workaround
3. Update dependencies if needed
4. Notify users if data affected
5. Document in security log

---

## Related Documentation

- [Architecture Overview](./README.md)
- [Authentication Feature](../features/authentication/README.md)
- [Configuration](../getting-started/configuration.md)
