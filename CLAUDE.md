# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start Commands

### Development

```bash
# Install dependencies
npm install

# Setup database
npx prisma migrate deploy    # Apply migrations
npx prisma db seed          # Seed sample data (optional)

# Run development server (uses Turbopack for fast builds)
npm run dev                 # Starts on http://localhost:3000

# With Docker (includes PostgreSQL)
docker-compose -f docker-compose.dev.yml up
```

### Building & Production

```bash
npm run build               # Build for production
npm start                   # Start production server

# Docker build and run
docker-compose up           # Builds and runs both app and database
```

### Code Quality & Testing

```bash
npm run lint                # Run ESLint
npm run lint -- --fix       # Auto-fix linting issues

# E2E Tests (Playwright)
npm test                    # Run all tests (headed mode)
npm test -- --ui           # Interactive test explorer
npm test -- --debug        # Step through with debugger
npm test -- auth.signin.spec.ts  # Run specific test file
```

### Database

```bash
npx prisma studio          # Open interactive Prisma Studio
npx prisma migrate dev --name <migration_name>  # Create new migration
npx prisma generate        # Regenerate Prisma client
npx prisma db seed         # Seed database
```

## Architecture Overview

**Tech Stack:** Next.js 15 (App Router) + React 19 + TypeScript + Prisma + PostgreSQL 16

### System Architecture

```
┌─────────────────────────────┐
│   Browser (React 19)        │
└─────────────┬───────────────┘
              │ HTTPS
┌─────────────▼───────────────┐
│   Next.js 15 Server         │
│   • App Router              │
│   • API Routes              │
│   • NextAuth (JWT sessions) │
│   • Server Actions          │
└─────────────┬───────────────┘
    ┌─────────┼──────────┐
    ▼         ▼          ▼
┌────────┐ ┌────────┐ ┌──────┐
│Prisma  │ │NextAuth│ │AWS S3│
│  ORM   │ │ (Auth) │ │(files)
└────┬───┘ └────────┘ └──────┘
     ▼
┌─────────────┐
│ PostgreSQL  │
└─────────────┘
```

## Directory Structure

### Frontend

- **`frontend/components/`** - Feature-specific React components
  - `testcase/` - Test case UI and dialogs
  - `defect/` - Defect management UI
  - `testrun/` - Test run UI
  - `testsuite/` - Test suite UI
  - `common/` - Shared feature components

- **`frontend/reusable-components/`** - Composite components used across features
  - `dialogs/`, `forms/`, `cards/`, `tables/`, `inputs/`, etc.

- **`frontend/reusable-elements/`** - Base UI elements (buttons, badges, inputs, etc.)
  - Built with Radix UI + Tailwind CSS
  - Located in `components/ui/` for shadcn-style components

- **`frontend/lib/`** - Frontend utilities (date formatting, API calls, etc.)

- **`frontend/context/`** - React Context for global state (timezone, theme, etc.)

- **`hooks/`** - Custom React hooks

### Backend

- **`app/api/`** - REST API route handlers (Next.js App Router)
  - Organized by resource: `projects/`, `testcases/`, `defects/`, `testruns/`, etc.
  - Each resource has CRUD operations following Next.js conventions

- **`backend/controllers/`** - Request/response handlers
  - Validates input, calls services, formats responses
  - One controller directory per resource type

- **`backend/services/`** - Business logic layer
  - Data operations, validations, transformations
  - Reusable logic called by controllers
  - One service file per resource type

- **`backend/validators/`** - Input validation (Zod schemas)
  - Validates request data before processing

- **`backend/utils/`** - Utility functions used by services/controllers

### Core Infrastructure

- **`lib/auth.ts`** - NextAuth.js configuration
  - Credentials provider, JWT callback, session handling
  - User permissions loaded into JWT

- **`lib/auth-utils.ts`** - Auth-related utilities
  - `getSessionUser()` - Get current session user
  - `apiKeyAuth()` - API key authentication for programmatic access

- **`lib/rbac/`** - Role-Based Access Control
  - Permission checking functions
  - Project member access validation

- **`lib/prisma.ts`** - Prisma client singleton

- **`lib/s3/`** - AWS S3 file storage utilities

- **`lib/email-service.ts`** - Email sending via Nodemailer

- **`lib/file-parser.ts`** - File parsing (CSV, Excel, XML)

- **`prisma/`** - Database schema and migrations
  - `schema.prisma` - Database models
  - `migrations/` - Historical migrations
  - `seed.ts` - Initial data seeding

- **`types/`** - TypeScript type definitions

- **`app/`** - Next.js App Router pages and layouts
  - `app/auth/` - Authentication pages (login, register, password reset)
  - `app/dashboard/` - Main dashboard
  - `app/projects/[id]/` - Project detail pages
  - `app/admin/` - Admin panel

## Key Architectural Patterns

### Request Flow

```
Client Request
    ↓
Next.js Middleware (auth check)
    ↓
API Route Handler (app/api/**/route.ts)
    ↓
Controller (validates, parses)
    ↓
Service (business logic)
    ↓
Prisma (database)
    ↓
Response to Client
```

### Authentication & Authorization

- **Method:** NextAuth.js with JWT sessions
- **Password Hashing:** bcryptjs (v3.0.2)
- **Session Storage:** JWT in httpOnly cookie (stateless)
- **Permissions:** Loaded into JWT on login, available on every request
- **RBAC:** Role-based with fine-grained permissions stored in database

**Usage:**
```typescript
// In API routes (server-side only)
import { getSessionUser } from '@/lib/auth/getSessionUser';
const user = await getSessionUser();

// Check permissions
import { hasPermission } from '@/lib/rbac';
if (!hasPermission(user, 'view_test_cases')) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
}
```

### API Key Authentication

For programmatic access (API clients, integrations):
- Hashed keys stored in database with bcrypt
- Prefix for UI display (e.g., "ez_abc12345")
- Per-project scope or global access

**Usage:**
```typescript
const apiKey = request.headers.get('x-api-key');
const user = await apiKeyAuth(apiKey);
```

### Data Validation

Uses Zod for runtime validation:
```typescript
import { z } from 'zod';

const createTestCaseSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  // ... other fields
});

const data = createTestCaseSchema.parse(req.body);
```

### File Attachments

- **Storage:** AWS S3 (optional) or local directory
- **Multipart Uploads:** For large files (chunked uploads)
- **Attached To:** Test cases, test steps, defects, comments
- **Config:** See `lib/attachment-config.ts` for size limits and endpoints

## Database Schema (Key Entities)

### User Management
- `User` - Users with roles and permissions
- `Role` - Roles with permission sets
- `PasswordResetToken` - For password reset flow
- `OtpVerification` - 2FA/email verification OTP
- `ApiKey` - API authentication tokens

### Core Entities
- `Project` - Test projects
- `TestCase` - Individual test cases
- `TestStep` - Steps within test cases
- `TestSuite` - Suites grouping test cases
- `Module` - Organizational structure within projects
- `TestRun` - Execution instances of test suites
- `TestResult` - Results per test case in a run

### Defect Management
- `Defect` - Issues/bugs reported from tests
- `DefectComment` - Comments on defects
- `DefectWatcher` - Users monitoring a defect
- `TestCaseDefect` - M2M relationship between tests and defects

### Attachments
- `Attachment` - Generic file storage
- `DefectAttachment` - Files attached to defects
- `CommentAttachment` - Files in comments

### Configuration
- `DropdownOption` - Dynamic dropdown values (replaces enums)

**Key Point:** Enums have been replaced with `DropdownOption` table for dynamic management.

## Component Organization

### Frontend Component Hierarchy

1. **Page Components** (`app/**/page.tsx`)
   - Server components that fetch data
   - Render layout + feature components

2. **Feature Components** (`frontend/components/**/`)
   - Combine multiple reusable components
   - Often have subcomponents for organization
   - Example: `TestCaseDetail.tsx` contains test case info, steps, attachments

3. **Reusable Components** (`frontend/reusable-components/**/`)
   - Dialog, form, card, table components
   - Combine multiple reusable elements

4. **Base Elements** (`frontend/reusable-elements/**/` or `components/ui/`)
   - Buttons, inputs, badges, etc.
   - Radix UI + Tailwind CSS
   - Usually accept className for styling

### Client vs Server Components

- Use Server Components by default for data fetching
- Use Client Components (`"use client"`) for:
  - Interactive forms and dialogs
  - Client-side state (useState, useContext)
  - Event handlers
  - Browser APIs

**Pattern:**
```typescript
// page.tsx (Server Component)
const data = await fetch(...);
return <TestCaseDetail data={data} />;

// TestCaseDetail.tsx ("use client")
export default function TestCaseDetail({ data }) {
  const [isEditing, setIsEditing] = useState(false);
  // Interactive logic...
}
```

## Common Development Tasks

### Adding a New API Endpoint

1. Create route file: `app/api/resources/route.ts`
2. Create controller: `backend/controllers/resource/index.ts`
3. Create service: `backend/services/resource/index.ts`
4. Add validation in controller or separate `validators/` file
5. Use Prisma in service for database operations

**Template:**
```typescript
// app/api/resources/route.ts
import { resourceController } from '@/backend/controllers/resource';

export async function GET(request: Request) {
  return resourceController.list(request);
}

export async function POST(request: Request) {
  return resourceController.create(request);
}
```

### Adding a New Page

1. Create directory: `app/section/[id]/`
2. Create `page.tsx` with data fetching
3. Create feature component in `frontend/components/`
4. Use layout.tsx for shared UI

### Adding a Dialog/Modal

1. Create in `frontend/reusable-components/dialogs/`
2. Use Radix Dialog primitive
3. Accept `open`, `onOpenChange` props
4. Handle form submission with server action or API call

### Working with Forms

- Use `<form>` with server actions or fetch
- Validate with Zod schemas
- Show errors using `InlineError` component
- Use form state from middleware/headers for state management

### Styling

- **Tailwind CSS v4** - All styling
- **Glass Morphism Theme** - Primary design pattern
- **Colors:** Use Tailwind defaults (gray, blue, orange, green, red)
- **Spacing/Typography:** Consistent with Tailwind scale

## Testing & Debugging

### E2E Tests (Playwright)

Tests are located in `automation/tests/` and use Playwright for browser automation testing.

**Running Tests:**
```bash
# Default: run all tests in headed mode (browser visible) with single worker
npm test

# Run with UI explorer (interactive mode to select/run tests)
npm test -- --ui

# Run in debug mode (step through with debugger)
npm test -- --debug

# Run specific test file
npm test -- auth.signin.spec.ts

# Run tests matching a pattern/tag
npm test -- --grep "signin"

# Run in CI mode (headless, parallel workers)
cd automation && playwright test

# View HTML report of latest test run
cd automation && npx playwright show-report
```

**Test Configuration:**
- Tests run on `http://localhost:3001` (Playwright config)
- Dev server is automatically started via webServer config in `automation/playwright.config.ts`
- Screenshots captured on failure, traces on first retry
- Works with Chromium (Firefox and Safari commented out)

**Writing Tests (Examples):**
```typescript
import { test, expect } from '@playwright/test';

test('user can sign in', async ({ page }) => {
  await page.goto('/signin');
  await page.fill('input[name="email"]', 'user@example.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');

  // Wait for redirect and verify
  await page.waitForURL('/dashboard');
  await expect(page).toHaveTitle(/Dashboard/);
});

// Common assertions
await expect(locator).toBeVisible();
await expect(locator).toContainText('Expected text');
await expect(locator).toHaveAttribute('href', '/path');
await expect(page).toHaveURL(/dashboard/);
```

**Test Helpers:**
- `automation/tests/helpers.ts` - Shared utilities (auth flows, common actions)
- Use helpers for repetitive actions like login

### Database Debugging

```bash
npx prisma studio    # Visual database explorer
```

### Environment Variables

Copy `.env.example` to `.env` and configure:
- `DATABASE_URL` - PostgreSQL connection
- `NEXTAUTH_SECRET` - Auth secret (generate: `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Application URL (http://localhost:3000 for dev server)
- AWS S3 credentials (if using attachments)
- SMTP settings (if using email)

**Note:** E2E tests expect the dev server to run on port 3001, which is handled automatically by Playwright webServer config.

### Automated Test Generation

When you commit code changes, a post-commit hook automatically:
- Detects new API routes, components, and features
- Analyzes what changed
- Suggests tests that should be written
- Stores the diff for Claude Code analysis

**Workflow:**
1. Make and commit your feature changes → hook runs automatically
2. See suggestions for test coverage in the commit output
3. Ask Claude Code to generate tests from the commit
4. Review and verify the generated tests
5. Run `npm test` to validate

📖 **Full guide:** [Automated Test Generation](./docs/TESTING_AUTOMATION.md)

### Docker Development

Use `docker-compose.dev.yml` for local PostgreSQL without Docker app containers:
```bash
docker-compose -f docker-compose.dev.yml up
```

Then run `npm run dev` locally.

## Utility Scripts

The `scripts/` directory contains helpful utilities for development and maintenance:

- **`test.js`** - Smart Playwright test runner wrapper
  - Used by `npm test` command
  - Defaults to headed mode for development
  - Passes arguments through to Playwright (--ui, --debug, etc.)

- **`generate-tests.sh`** - Analyze commits and suggest tests
  - Runs automatically via post-commit hook
  - Shows which files changed and what tests might be needed
  - Part of automated test generation workflow

- **`check-deployment.sh`** - Deployment validation script
  - Used in CI/CD pipelines

- **`add-modules.ts`** - Database utility for adding modules

- **`check-permissions.ts`** - RBAC debugging utility

See `scripts/README.md` for more details.

## Code Conventions

### File Naming
- Components: PascalCase (e.g., `TestCaseDialog.tsx`)
- Utilities/Hooks: camelCase (e.g., `useTestCase.ts`)
- Pages: camelCase or `page.tsx` for Next.js routes

### Imports
- Use `@/` alias for absolute imports
- Group imports: React → libraries → local modules

### API Responses
Use consistent format:
```typescript
{
  status: 'success' | 'error',
  data: {...},
  message?: string,
  error?: string
}
```

### Error Handling
- Validate input with Zod
- Return 400 for bad requests
- Return 403 for unauthorized
- Return 404 for not found
- Return 500 for server errors with user-friendly message

## Performance Considerations

- Server Components for data fetching (reduce client JS)
- Prisma for type-safe DB queries
- Pagination for large lists
- Images optimized with Next.js Image component
- Database indexes on frequently queried fields

## Useful Documentation Links

- [Architecture Deep Dive](./docs/architecture/) - System design and patterns
- [API Documentation](./docs/api/) - Endpoint specifications
- [Database Schema](./docs/architecture/database.md) - Entity relationships
- [Security](./docs/architecture/security.md) - Auth and RBAC details
