# Code Patterns & Conventions

Coding patterns, conventions, and best practices for EzTest development.

## Project Structure

### Directory Organization

```
eztest/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── [resource]/    # REST endpoints
│   │       └── route.ts
│   └── [page]/            # Page components
│       └── page.tsx
│
├── backend/               # Backend logic
│   ├── controllers/       # Request handlers
│   ├── services/          # Business logic
│   ├── validators/        # Input validation
│   └── utils/             # Utilities
│
├── components/            # React components
│   ├── common/            # Shared components
│   ├── design/            # Design system
│   └── layout/            # Layout components
│
├── lib/                   # Shared utilities
│   ├── auth.ts           # Auth config
│   └── prisma.ts         # Prisma client
│
└── types/                 # TypeScript types
```

---

## API Patterns

### Route Handler Structure

```typescript
// app/api/[resource]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ResourceController } from '@/backend/controllers/resource/controller';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await ResourceController.list(request, session);
    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Controller Pattern

```typescript
// backend/controllers/resource/controller.ts
import { ResourceService } from '@/backend/services/resource/services';
import { resourceValidator } from '@/backend/validators/resource.validator';

export class ResourceController {
  static async list(request: NextRequest, session: Session) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    return ResourceService.list({ page, limit, userId: session.user.id });
  }

  static async create(request: NextRequest, session: Session) {
    const body = await request.json();
    
    // Validate input
    const validation = resourceValidator.create.safeParse(body);
    if (!validation.success) {
      throw new ValidationError(validation.error);
    }

    return ResourceService.create(validation.data, session.user.id);
  }
}
```

### Service Pattern

```typescript
// backend/services/resource/services.ts
import { prisma } from '@/lib/prisma';

export class ResourceService {
  static async list(params: ListParams) {
    const { page, limit, userId } = params;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.resource.findMany({
        where: { /* filters */ },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.resource.count({ where: { /* filters */ } }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async create(data: CreateInput, userId: string) {
    return prisma.resource.create({
      data: {
        ...data,
        createdById: userId,
      },
    });
  }
}
```

---

## Component Patterns

### Page Component

```tsx
// app/[page]/page.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/design';

export default async function ResourcePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/login');

  const data = await fetchData();

  return (
    <div className="container py-6">
      <PageHeader title="Resources" subtitle="Manage your resources">
        <CreateButton />
      </PageHeader>
      
      <ResourceList data={data} />
    </div>
  );
}
```

### Client Component

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/elements/button';

interface Props {
  initialData: Resource[];
}

export function ResourceList({ initialData }: Props) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/resources');
      const result = await response.json();
      setData(result.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button onClick={handleRefresh} disabled={loading}>
        {loading ? 'Loading...' : 'Refresh'}
      </Button>
      {/* Render list */}
    </div>
  );
}
```

### Reusable Component

```tsx
// components/design/StatCard.tsx
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ title, value, icon, className }: StatCardProps) {
  return (
    <div className={cn(
      "bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg",
      className
    )}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        {icon && (
          <div className="text-muted-foreground">{icon}</div>
        )}
      </div>
    </div>
  );
}
```

---

## Data Fetching

### Server-Side (Recommended)

```tsx
// Server Component
async function getData() {
  const response = await fetch(`${process.env.API_URL}/api/resources`, {
    cache: 'no-store', // or 'force-cache'
  });
  return response.json();
}

export default async function Page() {
  const data = await getData();
  return <ResourceList data={data} />;
}
```

### Client-Side

```tsx
'use client';

import { useEffect, useState } from 'react';

export function ResourceList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/resources')
      .then(res => res.json())
      .then(result => setData(result.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  return <List data={data} />;
}
```

---

## Validation

### Zod Schemas

```typescript
// backend/validators/project.validator.ts
import { z } from 'zod';

export const projectValidator = {
  create: z.object({
    name: z.string().min(1, 'Name is required').max(255),
    key: z.string()
      .min(2, 'Key must be at least 2 characters')
      .max(10, 'Key must be at most 10 characters')
      .regex(/^[A-Z0-9]+$/, 'Key must be uppercase alphanumeric'),
    description: z.string().max(1000).optional(),
  }),

  update: z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().max(1000).optional(),
  }),
};
```

### Form Validation

```tsx
'use client';

import { useState } from 'react';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
});

export function MyForm() {
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    const result = formSchema.safeParse(data);
    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      return;
    }

    // Submit valid data
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" />
      {errors.name && <span className="text-red-500">{errors.name}</span>}
      {/* More fields */}
    </form>
  );
}
```

---

## Error Handling

### API Error Response

```typescript
// Standardized error response
interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  details?: Record<string, string[]>;
}

// Usage
return NextResponse.json({
  error: 'validation_error',
  message: 'Invalid request data',
  statusCode: 422,
  details: {
    email: ['Invalid email format'],
  },
}, { status: 422 });
```

### Try-Catch Pattern

```typescript
export async function POST(request: NextRequest) {
  try {
    // Operation
    return NextResponse.json({ data: result });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({
        error: 'validation_error',
        message: error.message,
      }, { status: 422 });
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json({
        error: 'not_found',
        message: error.message,
      }, { status: 404 });
    }

    console.error('Unexpected error:', error);
    return NextResponse.json({
      error: 'server_error',
      message: 'An unexpected error occurred',
    }, { status: 500 });
  }
}
```

---

## TypeScript Conventions

### Type Definitions

```typescript
// types/index.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description?: string;
}

// Partial types for updates
export type UpdateProjectInput = Partial<Omit<Project, 'id'>>;
```

### Generic Patterns

```typescript
// Paginated response
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// API response
interface ApiResponse<T> {
  data: T;
  message?: string;
}
```

---

## Naming Conventions

### Files

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `StatCard.tsx` |
| Pages | page.tsx | `page.tsx` |
| API Routes | route.ts | `route.ts` |
| Services | camelCase | `services.ts` |
| Validators | kebab-case | `project.validator.ts` |
| Types | PascalCase | `User.ts` |

### Variables

| Type | Convention | Example |
|------|------------|---------|
| Constants | UPPER_SNAKE | `MAX_FILE_SIZE` |
| Functions | camelCase | `handleSubmit` |
| Components | PascalCase | `DataTable` |
| Props interfaces | PascalCase + Props | `StatCardProps` |

---

## Related Documentation

- [Architecture Overview](./README.md)
- [UI Components](../ui/README.md)
