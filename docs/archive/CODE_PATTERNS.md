# Code Patterns & Best Practices

## TypeScript Conventions

### Naming Conventions

```typescript
// Classes & Types: PascalCase
class UserManager {}
interface UserProfile {}
type AuthToken = string;

// Functions & Variables: camelCase
function getUserData() {}
const userName = 'John';
let counter = 0;

// Constants: UPPER_SNAKE_CASE
const MAX_RETRIES = 3;
const DEFAULT_TIMEOUT = 5000;

// Boolean variables/functions: is/has/can prefix
const isActive = true;
const hasPermission = false;
const canDelete = true;
```

### Type Definitions

```typescript
// Explicit types on public APIs
export function createUser(name: string, email: string): Promise<User> {
  // Implementation
}

// Use interfaces for object contracts
interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

// Use type for unions and literals
type UserRole = 'ADMIN' | 'USER' | 'VIEWER';

// Extend interfaces for large objects
interface BaseEntity {
  id: string;
  createdAt: Date;
}

interface User extends BaseEntity {
  name: string;
  email: string;
}
```

---

## React Component Patterns

### Server Components (Default)

```typescript
// app/dashboard/page.tsx - Server by default
import { getServerSession } from 'next-auth';

export default async function Dashboard() {
  const session = await getServerSession();

  return (
    <div>
      <h1>Dashboard</h1>
      {/* Server component content */}
    </div>
  );
}
```

**Benefits:**
- Direct database access
- No JavaScript sent to client
- Secure by default
- Better SEO

### Client Components

```typescript
// components/Counter.tsx - Explicit 'use client'
'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

**Use When:**
- Need interactivity (onClick, onChange, etc.)
- Using React hooks
- Browser-only APIs

### Composition Pattern

```typescript
// Compose server and client components
export default async function Dashboard() {
  const data = await fetchData();

  return (
    <div>
      <ServerContent data={data} />
      <ClientComponent />  {/* Client boundaries only where needed */}
    </div>
  );
}

function ServerContent({ data }) {
  return <div>{data.title}</div>;
}

'use client';
function ClientComponent() {
  const [state, setState] = useState();
  return <div>{state}</div>;
}
```

---

## Form Patterns

### Server Action Pattern (Recommended Future)

```typescript
// app/projects/create/page.tsx
'use client';

import { createProject } from '@/app/actions/projects';

export function CreateProjectForm() {
  async function handleSubmit(formData: FormData) {
    // Server action
    const result = await createProject(formData);
  }

  return (
    <form action={handleSubmit}>
      <input name="name" required />
      <button type="submit">Create</button>
    </form>
  );
}
```

### Current API Route Pattern

```typescript
'use client';

import { useState } from 'react';

export function CreateProjectForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const response = await fetch('/api/projects', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create');
      }

      const result = await response.json();
      // Handle success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required />
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create'}
      </button>
    </form>
  );
}
```

---

## API Route Patterns

### GET Handler

```typescript
// app/api/projects/route.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // 1. Authenticate
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // 3. Fetch data
    const projects = await prisma.project.findMany({
      where: { createdById: session.user.id },
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: 'desc' },
    });

    // 4. Return response
    return Response.json({
      data: projects,
      page,
      limit,
    });
  } catch (error) {
    console.error('GET /api/projects error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### POST Handler

```typescript
// app/api/projects/route.ts
export async function POST(request: Request) {
  try {
    // 1. Authenticate
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body = await request.json();

    // 3. Validate input
    if (!body.name || body.name.length < 3) {
      return Response.json(
        { error: 'Project name must be at least 3 characters' },
        { status: 400 }
      );
    }

    // 4. Check authorization
    if (session.user.role !== 'PROJECT_MANAGER' && session.user.role !== 'ADMIN') {
      return Response.json(
        { error: 'Only project managers can create projects' },
        { status: 403 }
      );
    }

    // 5. Create resource
    const project = await prisma.project.create({
      data: {
        name: body.name,
        key: body.key || body.name.substring(0, 4).toUpperCase(),
        createdById: session.user.id,
      },
    });

    // 6. Return response
    return Response.json(
      { data: project },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/projects error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### DELETE Handler

```typescript
// app/api/projects/[id]/route.ts
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify resource ownership
    const project = await prisma.project.findUnique({
      where: { id: params.id },
    });

    if (!project) {
      return Response.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    if (project.createdById !== session.user.id && session.user.role !== 'ADMIN') {
      return Response.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Delete resource
    await prisma.project.delete({
      where: { id: params.id },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('DELETE /api/projects/[id] error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## Database Query Patterns

### Safe Query with Relations

```typescript
// Good: Select what you need
const project = await prisma.project.findUnique({
  where: { id: projectId },
  include: {
    members: {
      select: {
        userId: true,
        role: true,
        user: {
          select: { name: true, email: true }
        }
      }
    }
  }
});

// Avoid: N+1 queries
const project = await prisma.project.findUnique({ where: { id } });
const members = await prisma.projectMember.findMany({
  where: { projectId: project.id }
});
```

### Transactions for Multiple Operations

```typescript
// Use transaction for consistency
const result = await prisma.$transaction(async (tx) => {
  // Create project
  const project = await tx.project.create({
    data: { name, createdById }
  });

  // Add creator as owner
  await tx.projectMember.create({
    data: {
      projectId: project.id,
      userId: createdById,
      role: 'OWNER'
    }
  });

  return project;
});
```

### Pagination Pattern

```typescript
const page = Math.max(1, parseInt(query.page) || 1);
const limit = Math.min(100, parseInt(query.limit) || 10);
const skip = (page - 1) * limit;

const [items, total] = await Promise.all([
  prisma.project.findMany({
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' }
  }),
  prisma.project.count()
]);

return {
  data: items,
  pagination: {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit)
  }
};
```

---

## Error Handling Patterns

### Validation Errors

```typescript
interface ValidationError {
  field: string;
  message: string;
}

function validateProject(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.name) {
    errors.push({ field: 'name', message: 'Name is required' });
  }
  if (data.name?.length < 3) {
    errors.push({ field: 'name', message: 'Name must be at least 3 characters' });
  }

  return errors;
}

// In API route
const errors = validateProject(body);
if (errors.length > 0) {
  return Response.json(
    { error: 'Validation failed', fields: errors },
    { status: 422 }
  );
}
```

### Custom Error Classes

```typescript
class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
  }
}

class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(404, 'NOT_FOUND', `${resource} with id ${id} not found`);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, 'UNAUTHORIZED', message);
  }
}

// Usage
throw new NotFoundError('Project', projectId);
```

### Error Middleware

```typescript
export function handleError(error: any): Response {
  if (error instanceof AppError) {
    return Response.json(
      {
        error: error.code,
        message: error.message,
      },
      { status: error.statusCode }
    );
  }

  console.error('Unexpected error:', error);
  return Response.json(
    { error: 'INTERNAL_ERROR', message: 'Internal server error' },
    { status: 500 }
  );
}
```

---

## Authentication Patterns

### Protected API Route

```typescript
async function requireAuth(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new UnauthorizedError();
  }
  return session;
}

export async function GET(request: Request) {
  try {
    const session = await requireAuth(request);
    // Use session.user
  } catch (error) {
    return handleError(error);
  }
}
```

### Role-Based Access

```typescript
function requireRole(session: Session, ...roles: UserRole[]) {
  if (!roles.includes(session.user.role)) {
    throw new AppError(403, 'FORBIDDEN', 'Insufficient permissions');
  }
}

// Usage
export async function POST(request: Request) {
  const session = await requireAuth(request);
  requireRole(session, 'ADMIN', 'PROJECT_MANAGER');
  // Authorized
}
```

### Resource Ownership Check

```typescript
async function requireOwnership(userId: string, resourceId: string, model: any) {
  const resource = await prisma[model].findUnique({
    where: { id: resourceId }
  });

  if (!resource || resource.createdById !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'You do not have permission');
  }

  return resource;
}

// Usage
const testCase = await requireOwnership(session.user.id, testCaseId, 'testCase');
```

---

## Component Composition Patterns

### Props Interface Pattern

```typescript
interface CardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function Card({
  title,
  description,
  icon,
  onClick,
  className = '',
  children,
}: CardProps) {
  return (
    <div className={`card ${className}`} onClick={onClick}>
      {icon && <div className="icon">{icon}</div>}
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {children}
    </div>
  );
}
```

### Render Props Pattern

```typescript
interface RenderPropsProps {
  isLoading: boolean;
  error?: Error;
  data?: any;
  children: (state: { isLoading: boolean; error?: Error; data?: any }) => React.ReactNode;
}

export function DataFetcher({ isLoading, error, data, children }: RenderPropsProps) {
  return <>{children({ isLoading, error, data })}</>;
}

// Usage
<DataFetcher isLoading={loading} error={error} data={data}>
  {({ isLoading, data }) => (
    <>
      {isLoading && <Spinner />}
      {data && <div>{data.name}</div>}
    </>
  )}
</DataFetcher>
```

---

## Testing Patterns (Future)

### Mock Data Pattern

```typescript
export const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'TESTER',
};

export const mockProject = {
  id: 'proj-1',
  name: 'Test Project',
  key: 'TEST',
  createdById: mockUser.id,
};
```

### Test Utilities Pattern

```typescript
async function createTestUser(overrides = {}) {
  return prisma.user.create({
    data: {
      email: `test-${Date.now()}@example.com`,
      name: 'Test User',
      password: 'hashedpassword',
      ...overrides,
    },
  });
}

async function createTestProject(userId: string, overrides = {}) {
  return prisma.project.create({
    data: {
      name: 'Test Project',
      key: 'TEST',
      createdById: userId,
      ...overrides,
    },
  });
}
```

---

## Documentation Patterns

### Function Documentation

```typescript
/**
 * Creates a new project with the creator as owner.
 *
 * @param name - Project name (required)
 * @param description - Project description (optional)
 * @param createdById - User ID of creator
 * @returns Created project object
 * @throws {ValidationError} If name is invalid
 * @throws {UnauthorizedError} If user cannot create projects
 *
 * @example
 * const project = await createProject('My Project', 'Description', userId);
 */
export async function createProject(
  name: string,
  description: string | undefined,
  createdById: string
): Promise<Project> {
  // Implementation
}
```

### Inline Comments

```typescript
// Only comment WHY, not WHAT
// Good
const maxRetries = 3; // Limit retries to prevent infinite loops

// Bad
const maxRetries = 3; // Set max retries to 3
```

---

## State Management Patterns

### URL-Based State

```typescript
// Prefer URL search params for pagination, filters
// app/projects/page.tsx?page=2&status=ACTIVE

const { searchParams } = new URL(request.url);
const page = searchParams.get('page') || '1';
const status = searchParams.get('status');
```

### React Context (Future)

```typescript
// For global state
const AuthContext = React.createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

