# Coding Standards

Code style and best practices for EZTest development.

## General Principles

1. **Readability** - Code should be easy to read and understand
2. **Consistency** - Follow existing patterns
3. **Simplicity** - Prefer simple solutions
4. **Type Safety** - Use TypeScript properly

---

## TypeScript

### Use Strict Types

```typescript
// ✅ Good - explicit types
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<User> {
  return prisma.user.findUnique({ where: { id } });
}

// ❌ Bad - implicit any
function getUser(id) {
  return prisma.user.findUnique({ where: { id } });
}
```

### Avoid `any`

```typescript
// ✅ Good
function process(data: Record<string, unknown>) {}

// ❌ Bad
function process(data: any) {}
```

### Use Interfaces for Objects

```typescript
// ✅ Good
interface CreateProjectInput {
  name: string;
  key: string;
  description?: string;
}

// Use for props
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}
```

### Type Imports

```typescript
// ✅ Good - separate type imports
import type { User, Project } from '@/types';
import { prisma } from '@/lib/prisma';
```

---

## React Components

### Function Components

```tsx
// ✅ Good
interface StatCardProps {
  title: string;
  value: number;
  icon?: React.ReactNode;
}

export function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div className="stat-card">
      {icon}
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
  );
}
```

### Use Hooks Properly

```tsx
// ✅ Good - hooks at top level
function MyComponent() {
  const [state, setState] = useState(null);
  const data = useMemo(() => process(state), [state]);
  
  useEffect(() => {
    // effect
  }, []);

  return <div>{/* ... */}</div>;
}

// ❌ Bad - conditional hooks
function MyComponent({ condition }) {
  if (condition) {
    const [state, setState] = useState(null); // Error!
  }
}
```

### Event Handlers

```tsx
// ✅ Good - named handlers
function Form() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // handle
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // handle
  };

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleChange} />
    </form>
  );
}
```

---

## File Organization

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `StatCard.tsx` |
| Hooks | camelCase with use | `useFormState.ts` |
| Utilities | camelCase | `formatDate.ts` |
| Types | PascalCase | `User.ts` |
| Constants | UPPER_SNAKE | `constants.ts` |

### Import Order

```typescript
// 1. External packages
import { useState } from 'react';
import { NextRequest } from 'next/server';

// 2. Internal modules (absolute)
import { prisma } from '@/lib/prisma';
import { Button } from '@/elements/button';

// 3. Relative imports
import { helper } from './utils';

// 4. Types
import type { User } from '@/types';

// 5. Styles
import './styles.css';
```

### Component File Structure

```tsx
// 1. Imports
import { useState } from 'react';

// 2. Types
interface Props {
  // ...
}

// 3. Constants
const DEFAULT_VALUE = 10;

// 4. Helper functions (if small)
function formatValue(value: number) {
  return value.toLocaleString();
}

// 5. Component
export function MyComponent({ prop }: Props) {
  // hooks
  const [state, setState] = useState();

  // handlers
  const handleClick = () => {};

  // render
  return <div>...</div>;
}
```

---

## CSS / Tailwind

### Use Tailwind Classes

```tsx
// ✅ Good - Tailwind
<div className="bg-white rounded-lg shadow-md p-4">

// ❌ Avoid - inline styles
<div style={{ backgroundColor: 'white', borderRadius: '8px' }}>
```

### Organize Classes

```tsx
// ✅ Good - logical grouping
<div className="
  flex items-center justify-between
  bg-white rounded-lg shadow-md
  p-4 mb-4
  hover:shadow-lg transition-shadow
">
```

### Use cn() for Conditional Classes

```tsx
import { cn } from '@/lib/utils';

<button
  className={cn(
    "px-4 py-2 rounded",
    variant === "primary" && "bg-blue-500 text-white",
    variant === "secondary" && "bg-gray-200 text-gray-800",
    disabled && "opacity-50 cursor-not-allowed"
  )}
>
```

---

## API Routes

### Structure

```typescript
// app/api/resource/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest) {
  try {
    // 1. Auth check
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse input
    const { searchParams } = new URL(request.url);

    // 3. Business logic
    const data = await service.list();

    // 4. Return response
    return NextResponse.json({ data });

  } catch (error) {
    // 5. Error handling
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Error Responses

```typescript
// Consistent error format
return NextResponse.json({
  error: 'error_code',
  message: 'Human readable message',
  details: { field: ['error'] } // optional
}, { status: 400 });
```

---

## Database / Prisma

### Query Patterns

```typescript
// ✅ Good - select specific fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
  },
});

// ❌ Avoid - selecting everything
const users = await prisma.user.findMany();
```

### Include Relations Carefully

```typescript
// ✅ Good - specific includes
const project = await prisma.project.findUnique({
  where: { id },
  include: {
    members: {
      select: { user: { select: { id: true, name: true } } }
    },
  },
});

// ❌ Avoid - deep/excessive includes
const project = await prisma.project.findUnique({
  where: { id },
  include: {
    members: { include: { user: true } },
    testCases: { include: { steps: true, results: true } },
    // ... too much
  },
});
```

---

## Comments

### When to Comment

```typescript
// ✅ Good - explain WHY
// We use a 10-minute delay to prevent brute force attacks
const OTP_EXPIRY_MINUTES = 10;

// ✅ Good - complex logic
// Calculate pass rate excluding skipped tests
const passRate = passed / (total - skipped) * 100;

// ❌ Bad - obvious
// Get the user
const user = await getUser(id);
```

### JSDoc for Public APIs

```typescript
/**
 * Creates a new test case in the project.
 * 
 * @param projectId - The project to add the test case to
 * @param data - Test case data
 * @returns The created test case
 * @throws {ValidationError} If data is invalid
 */
export async function createTestCase(
  projectId: string,
  data: CreateTestCaseInput
): Promise<TestCase> {
  // ...
}
```

---

## Error Handling

### Always Catch Errors

```typescript
// ✅ Good
try {
  const result = await riskyOperation();
  return { success: true, data: result };
} catch (error) {
  console.error('Operation failed:', error);
  return { success: false, error: 'Operation failed' };
}
```

### Custom Error Classes

```typescript
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Usage
throw new ValidationError('Invalid email', 'email');
```

---

## Testing (Future)

### Test File Location

```
component.tsx
component.test.tsx
```

### Test Naming

```typescript
describe('StatCard', () => {
  it('renders title and value', () => {});
  it('displays icon when provided', () => {});
  it('handles zero value', () => {});
});
```

---

## ESLint Rules

The project uses ESLint with Next.js config. Key rules:

- No unused variables
- No `any` types
- React hooks rules
- Import order

Run linter:

```bash
npm run lint
```

---

## Code Review Checklist

Before submitting PR:

- [ ] Types are proper (no `any`)
- [ ] Error handling is present
- [ ] Code is readable
- [ ] No console.log in production code
- [ ] ESLint passes
- [ ] Follows existing patterns
