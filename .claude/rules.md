# Claude Code Rules for EzTest

Guidelines for Claude Code working with the EzTest test management platform.

## Project Identity

**EzTest** is a self-hosted, lightweight test management platform built with:
- **Frontend:** React 19 + Next.js 15 (App Router)
- **Backend:** Next.js API Routes + Prisma ORM
- **Database:** PostgreSQL 16
- **Auth:** NextAuth.js with JWT sessions
- **Styling:** Tailwind CSS v4 + Radix UI + Glass Morphism
- **Attachments:** AWS S3 (with local fallback)

## Command Quick Reference

```bash
# Development
npm run dev                    # Start dev server (Turbopack)
npx prisma migrate dev         # Create/apply migrations
npx prisma db seed            # Seed sample data
npx prisma studio            # Visual DB explorer

# Building
npm run build                  # Production build
npm start                      # Run production server

# Quality
npm run lint                   # Run ESLint
npm run lint -- --fix          # Auto-fix issues

# Database
npx prisma generate           # Regenerate Prisma client
npx prisma db push            # Push schema changes
```

## Code Organization Rules

### Frontend
- **Feature Components:** `frontend/components/{feature}/` - Organized by feature (testcase, defect, testrun, testsuite, etc.)
- **Reusable Components:** `frontend/reusable-components/` - Composite components used across features
- **Base Elements:** `frontend/reusable-elements/` or `components/ui/` - Primitive UI elements
- **Hooks:** `hooks/` - Custom React hooks
- **Context:** `frontend/context/` - Global state (theme, timezone, etc.)
- **Lib:** `frontend/lib/` - Frontend utilities (API calls, formatting, etc.)

### Backend
- **API Routes:** `app/api/{resource}/route.ts` - RESTful endpoints
- **Controllers:** `backend/controllers/{resource}/index.ts` - Request/response handling
- **Services:** `backend/services/{resource}/index.ts` - Business logic
- **Validators:** `backend/validators/` - Zod schemas for input validation
- **Utils:** `backend/utils/` - Shared utilities

### Core Libraries
- **Auth:** `lib/auth.ts` - NextAuth.js config + `lib/auth/getSessionUser.ts`, `lib/auth/apiKeyAuth.ts`
- **RBAC:** `lib/rbac/` - Permission checking functions
- **Database:** `lib/prisma.ts` - Prisma client singleton
- **S3:** `lib/s3/` - AWS S3 file operations
- **Email:** `lib/email-service.ts` - Nodemailer wrapper
- **Files:** `lib/file-parser.ts` - CSV/Excel/XML parsing

## Architecture Patterns

### Request Flow
```
Client Request
    ↓ (API Route Handler)
Next.js Middleware (auth validation)
    ↓ (Parse request)
Controller (input validation, response formatting)
    ↓ (Call business logic)
Service (data operations with Prisma)
    ↓ (Execute query)
PostgreSQL Database
    ↓ (Format response)
JSON Response to Client
```

### Authentication Pattern
- **Login:** Credentials provider → bcrypt password check → JWT creation
- **Session:** JWT stored in httpOnly cookie (stateless)
- **Permissions:** Loaded into JWT on login, checked on each request
- **RBAC:** Fine-grained role-based permissions stored in database

### Server vs Client Components
- **Server Components (default):** Data fetching, auth checks, database queries
- **Client Components ("use client"):** Interactive elements, useState, useContext, dialogs, forms
- **Never:** Auth logic in client components

## Data & Validation

### Prisma Usage
- ORM for all database operations
- Type-safe queries
- Always use `include` for relations
- Use transactions for multi-step operations
- Migrations for schema changes

### Validation Pattern
```typescript
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Name required'),
  description: z.string().optional(),
});

try {
  const data = schema.parse(req.body);
} catch (error) {
  return NextResponse.json({ error: error.errors }, { status: 400 });
}
```

### Database Schema Rules
- Models in `prisma/schema.prisma`
- Key entities: User, Project, TestCase, TestStep, TestSuite, Module, TestRun, Defect, Attachment
- **Important:** Enums replaced with `DropdownOption` table (dynamic values)
- Always index frequently queried fields

## API Response Format

```typescript
// Success (200/201)
{
  status: 'success',
  data: { /* resource */ },
  message?: 'Optional message'
}

// Error (4xx/5xx)
{
  status: 'error',
  error: 'Error code/description',
  message: 'User-friendly message'
}
```

## Security Rules

### Authorization Checks (Always Server-Side)
```typescript
import { getSessionUser } from '@/lib/auth/getSessionUser';
import { hasPermission } from '@/lib/rbac';

const user = await getSessionUser();
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
if (!hasPermission(user, 'action_name')) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

### API Key Auth (Programmatic Access)
```typescript
import { apiKeyAuth } from '@/lib/auth/apiKeyAuth';
const user = await apiKeyAuth(request.headers.get('x-api-key'));
```

### Input Validation (Always)
- Use Zod for runtime validation
- Never trust client input
- Validate file types and sizes

### Sensitive Data
- Never log passwords or tokens
- Use environment variables for secrets
- Never commit `.env` file

## File Attachments

### Storage Tiers
- **Production:** AWS S3 with multipart upload
- **Development:** Local filesystem or S3

### Multipart Upload Flow
1. POST `/api/attachments/upload` - Initiate upload
2. POST `/api/attachments/upload/part` - Upload chunks
3. POST `/api/attachments/upload/complete` - Finalize

### Attachment Models
- `Attachment` - Generic file storage
- `DefectAttachment` - Files on defects (with fieldName, uploadedBy)
- `CommentAttachment` - Files in comments
- `TestCaseAttachment` - Files on test cases
- `TestStepAttachment` - Files on test steps

## Component Patterns

### Dialog Pattern
```typescript
'use client';

interface MyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: () => Promise<void>;
}

export function MyDialog({ open, onOpenChange, onSubmit }: MyDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit() {
    setIsLoading(true);
    try {
      await onSubmit?.();
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {/* Form content */}
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Submit'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
```

### Form Pattern
```typescript
'use client';

export function MyForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/resource', {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(formData)),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrors(result.error);
        return;
      }

      // Success
    } catch (error) {
      setErrors({ submit: String(error) });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(new FormData(e.currentTarget)); }}>
      {/* Form fields */}
    </form>
  );
}
```

## Styling

- **Framework:** Tailwind CSS v4
- **Components:** Radix UI primitives
- **Design:** Glass Morphism (frosted glass effect)
- **Colors:** Tailwind defaults (gray, blue, orange, green, red)
- **Spacing:** Tailwind scale (4px base unit)

## Testing & Debugging

### Local Development Setup
```bash
# 1. Install dependencies
npm install

# 2. Setup database
cp .env.example .env
npx prisma migrate dev
npx prisma db seed

# 3. Start dev server
npm run dev
```

### Database Debugging
- `npx prisma studio` - Visual database explorer
- Check migrations in `prisma/migrations/`
- Review schema in `prisma/schema.prisma`

### Environment Variables
Required:
- `DATABASE_URL` - PostgreSQL connection
- `NEXTAUTH_SECRET` - JWT secret (generate: `openssl rand -base64 32`)
- `NEXTAUTH_URL` - App URL

Optional:
- AWS S3 credentials
- SMTP settings for email
- Firebase analytics

## Common Task Workflows

### Adding a New API Endpoint
1. Create route: `app/api/resource/route.ts`
2. Create controller: `backend/controllers/resource/index.ts`
3. Create service: `backend/services/resource/index.ts`
4. Add validation schema in controller
5. Implement business logic in service using Prisma

### Adding a New Feature Component
1. Create in `frontend/components/{feature}/`
2. Create subcomponents in `subcomponents/`
3. Use reusable components from `frontend/reusable-components/`
4. Keep client/server component boundaries clear

### Modifying Database
1. Update `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name description`
3. Update services if query logic changes
4. Test with local database

### Working with Transactions
```typescript
await prisma.$transaction(async (tx) => {
  await tx.model1.update({...});
  await tx.model2.create({...});
  // All-or-nothing execution
});
```

## Code Quality Standards

### TypeScript
- Strict mode enabled
- Type all function parameters and returns
- Use interfaces for object shapes
- Avoid `any` type

### Naming Conventions
- **Components:** PascalCase (`TestCaseDialog.tsx`)
- **Utilities:** camelCase (`formatDate.ts`, `useTestCase.ts`)
- **Variables:** camelCase
- **Constants:** UPPER_SNAKE_CASE
- **Files:** Match content (component name = file name)

### Imports
```typescript
// Use @ alias for all project imports
import { Button } from '@/components/ui/button';
import { testCaseService } from '@/backend/services/testcase';

// Group: React → Libraries → Aliases
import { useState } from 'react';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
```

### Error Handling
- HTTP 400: Bad request (validation error)
- HTTP 401: Unauthenticated
- HTTP 403: Unauthorized (permission denied)
- HTTP 404: Not found
- HTTP 500: Server error (with user-friendly message)

## Performance Considerations

- Server Components for data fetching (reduce client JS)
- Pagination for lists (default 10-20 items)
- Lazy load heavy components
- Optimize images with Next.js Image
- Cache Prisma queries where appropriate
- Database indexes on foreign keys and frequently queried fields

## Anti-Patterns to Avoid

1. ❌ Auth logic in client components → ✅ Always server-side with lib/auth
2. ❌ Skipping input validation → ✅ Use Zod for all external input
3. ❌ Hardcoded config values → ✅ Use environment variables
4. ❌ Data fetching in client components → ✅ Server components or API routes
5. ❌ Missing database indexes → ✅ Index foreign keys and common queries
6. ❌ Direct database modifications → ✅ Use Prisma migrations
7. ❌ Committing `.env` file → ✅ Use `.env.example`
8. ❌ Ignoring TypeScript errors → ✅ Enable strict mode
9. ❌ Large component files → ✅ Break into smaller components
10. ❌ Unhandled promises → ✅ Always await async operations

## Git & Version Control

- Branch naming: `feature/name` or `fix/issue-name`
- Commit messages: Clear and descriptive
- Never force push to main
- Create PRs for code review
- Keep migrations in version control

## Documentation References

- **CLAUDE.md** - Detailed development guide
- **.cursorrules** - Cursor IDE specific rules
- **docs/architecture/** - System design documentation
- **docs/api/** - API endpoint specifications
- **.env.example** - Environment configuration template

## Getting Help

When unsure about:
- **Architecture:** See `docs/architecture/`
- **API Endpoints:** See `docs/api/`
- **Database Models:** See `prisma/schema.prisma`
- **Code Patterns:** See existing feature implementations
- **Development Setup:** See `.env.example` and CLAUDE.md
