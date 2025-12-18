# Development Workflows

## Local Development Setup

### Prerequisites

- **Node.js**: 18+ (LTS recommended)
- **npm**: 8+ or yarn
- **PostgreSQL**: 14+ (local or via Docker)
- **Git**: Latest version
- **Editor**: VS Code recommended with extensions:
  - Prettier
  - ESLint
  - Prisma
  - Tailwind CSS IntelliSense

### Initial Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/houseoffoss/eztest.git
   cd eztest.houseoffoss.com
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your local settings
   ```

4. **Start PostgreSQL**
   ```bash
   # Using Docker (recommended)
   docker-compose up -d postgres

   # Or locally installed PostgreSQL
   # Make sure service is running
   ```

5. **Initialize Database**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Apply migrations
   npx prisma db push

   # Seed database (optional)
   npm run db:seed
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   ```

7. **Access Application**
   - Open http://localhost:3000
   - Login with seeded credentials (if using seed)

---

## Development Modes

### Fast Development (Default)

```bash
npm run dev
```

Uses **Turbopack** for faster builds:
- ~0.5s rebuild time
- Hot Module Replacement (HMR)
- Instant file changes

### Docker Development

```bash
docker-compose -f docker-compose.dev.yml up -d
```

Advantages:
- Isolated environment
- Matches production setup
- No local dependencies
- Hot reload enabled

**View Logs:**
```bash
docker-compose -f docker-compose.dev.yml logs app --follow
```

### Debug Mode

```bash
NODE_OPTIONS='--inspect' npm run dev
```

Access Chrome DevTools at `chrome://inspect`

---

## Common Development Tasks

### Database Changes

#### Add/Modify Model

1. **Edit Schema**
   ```bash
   # Edit prisma/schema.prisma
   nano prisma/schema.prisma
   ```

2. **Create Migration**
   ```bash
   npx prisma migrate dev --name <migration_name>
   ```

3. **Apply Changes**
   - Restart dev server

#### Inspect Database

```bash
# Open Prisma Studio (visual database browser)
npx prisma studio
```

Access at http://localhost:5555

### Running Tests

Currently no test suite configured. Future enhancement:

```bash
npm run test                    # Run all tests
npm run test:watch             # Watch mode
npm run test:coverage          # Coverage report
npm run test -- --testPathPattern=<pattern>  # Specific tests
```

### Linting & Formatting

```bash
# Check for linting errors
npm run lint

# Format code (auto-fix)
npm run lint -- --fix

# Format with Prettier
npx prettier --write .
```

**Auto-format on Save:**
Add to `.vscode/settings.json`:
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### Building for Production

```bash
# Full build process
npm run build

# This will:
# 1. Compile TypeScript
# 2. Optimize components
# 3. Generate static assets
# 4. Output to .next/ directory
```

**Troubleshooting Build:**
```bash
# Clean build cache
rm -rf .next/

# Rebuild
npm run build
```

---

## Code Organization

### Creating New Pages

1. **Create Directory**
   ```
   app/new-feature/
   ```

2. **Create Layout (optional)**
   ```typescript
   // app/new-feature/layout.tsx
   export default function Layout({ children }) {
     return (
       <div className="...">
         {children}
       </div>
     );
   }
   ```

3. **Create Page**
   ```typescript
   // app/new-feature/page.tsx
   export default function Page() {
     return <div>New Feature</div>;
   }
   ```

### Creating New API Routes

1. **Create Route File**
   ```typescript
   // app/api/features/route.ts
   import { NextRequest, NextResponse } from 'next/server';

   export async function GET(request: NextRequest) {
     // GET handler
     return NextResponse.json({ data: [] });
   }

   export async function POST(request: NextRequest) {
     // POST handler
     const body = await request.json();
     return NextResponse.json({ created: true }, { status: 201 });
   }
   ```

2. **Test Endpoint**
   ```bash
   curl http://localhost:3000/api/features
   ```

### Creating New Components

1. **Component File**
   ```typescript
   // components/features/FeatureCard.tsx
   interface Props {
     title: string;
     description: string;
   }

   export function FeatureCard({ title, description }: Props) {
     return (
       <div>
         <h3>{title}</h3>
         <p>{description}</p>
       </div>
     );
   }
   ```

2. **Export from Index**
   ```typescript
   // components/features/index.ts
   export { FeatureCard } from './FeatureCard';
   ```

3. **Use in Pages**
   ```typescript
   import { FeatureCard } from '@/components/features';
   ```

### Database Queries

**Server Component**
```typescript
import { prisma } from '@/lib/prisma';

export default async function DashboardPage() {
  const projects = await prisma.project.findMany({
    where: { createdById: userId },
    include: { members: true }
  });

  return (
    <div>
      {projects.map(project => (
        <div key={project.id}>{project.name}</div>
      ))}
    </div>
  );
}
```

**API Route**
```typescript
import { prisma } from '@/lib/prisma';

export async function GET() {
  const projects = await prisma.project.findMany();
  return Response.json(projects);
}
```

---

## Development Patterns

### Server vs Client Components

```typescript
// app/page.tsx (SERVER by default)
import { prisma } from '@/lib/prisma';

export default async function Page() {
  const data = await prisma.project.findMany();
  return <div>{data.length} projects</div>;
}
```

```typescript
// app/components/Counter.tsx (CLIENT - use 'use client')
'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### Error Handling

**Server Component**
```typescript
export default async function Page() {
  try {
    const data = await prisma.project.findUnique({...});
    return <div>{data?.name}</div>;
  } catch (error) {
    console.error('Failed to fetch:', error);
    return <div>Error loading data</div>;
  }
}
```

**API Route**
```typescript
export async function GET() {
  try {
    const data = await prisma.project.findMany();
    return Response.json(data);
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch' },
      { status: 500 }
    );
  }
}
```

### Form Handling

```typescript
'use client';

export function CreateProjectForm() {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const response = await fetch('/api/projects', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to create');
    }

    const result = await response.json();
    console.log('Created:', result);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required />
      <button type="submit">Create</button>
    </form>
  );
}
```

---

## Debugging

### Browser DevTools

1. **React DevTools**
   - Install extension
   - Inspect components
   - View props/state

2. **Network Tab**
   - Monitor API calls
   - Check request/response
   - Measure performance

### Console Logging

```typescript
// In server component
console.log('Server-side log:', data);

// In client component
console.log('Client-side log:', value);

// Watch logs in terminal (dev server)
```

### Node Debugger

```bash
# Start with inspector
node --inspect-brk node_modules/.bin/next dev

# Then open chrome://inspect
```

### Prisma Debug

```bash
# Enable query logging
export DEBUG="prisma:*"
npm run dev
```

### Database Inspection

```bash
# Interactive database browser
npx prisma studio
```

---

## Git Workflow

### Branch Strategy

```
main
  ↓
feature/feature-name (create PR)
  ↓
Code review
  ↓
Merge to main
```

### Commit Messages

Follow conventional commits:

```
feat: Add user authentication
fix: Resolve login redirect issue
docs: Update README
refactor: Simplify database queries
test: Add test cases for auth
chore: Update dependencies
```

### Creating Pull Request

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make Changes**
   ```bash
   # Edit files
   npm run lint -- --fix
   ```

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: Add new feature"
   ```

4. **Push Branch**
   ```bash
   git push origin feature/my-feature
   ```

5. **Create Pull Request**
   - Open on GitHub
   - Describe changes
   - Link issues

---

## Performance Optimization

### Code Splitting

Next.js automatically splits code at route boundaries:

```typescript
// Lazy load heavy components
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('@/components/Heavy'));
```

### Image Optimization

```typescript
import Image from 'next/image';

export function Avatar({ src, alt }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={40}
      height={40}
      priority={false}
    />
  );
}
```

### Database Query Optimization

```typescript
// ✓ Good: Select specific fields
await prisma.user.findMany({
  select: { id: true, name: true, email: true },
});

// ✗ Avoid: Select all fields
await prisma.user.findMany();

// ✓ Good: Use relations efficiently
await prisma.project.findMany({
  include: {
    members: {
      select: { user: true, role: true }
    }
  }
});
```

---

## Environment Variables Management

### Development Variables

```env
# .env.development
NODE_ENV=development
DEBUG=true
DATABASE_URL=postgresql://dev:dev@localhost:5432/eztest_dev
NEXTAUTH_SECRET=development-secret-key
```

### Local Overrides

```env
# .env.local (gitignored)
# Override any .env values here
DATABASE_URL=postgresql://custom:password@localhost:5432/custom_db
```

---

## Hot Reload & Fast Refresh

Features enabled in development:

1. **File Editing**
   - Changes reflect instantly
   - Component state preserved
   - No full page reload

2. **Error Recovery**
   - Shows error overlay
   - Fix error and refresh
   - Automatic recovery

3. **Type Checking**
   - TypeScript errors shown
   - ESLint warnings displayed
   - Real-time feedback

---

## Troubleshooting Development

### Dev Server Won't Start

```bash
# Check port is available
lsof -i :3000

# Kill process on port
lsof -ti :3000 | xargs kill -9

# Try again
npm run dev
```

### Database Connection Issues

```bash
# Verify PostgreSQL is running
psql -U <user> -d <database>

# Check .env DATABASE_URL
cat .env | grep DATABASE_URL

# Reset database
npx prisma db push --force-reset
```

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next
npm run dev
```

### TypeScript Errors

```bash
# Rebuild TypeScript
npx tsc --noEmit

# Generate types
npx prisma generate
```

---

## Performance Monitoring

### Build Time

```bash
# Analyze build
npm run build
# Check .next/ folder size

# Profile build
ANALYZE=true npm run build
```

### Runtime Performance

Use browser DevTools:
1. Performance tab
2. Record session
3. Analyze frame rate
4. Check main thread

### API Performance

```bash
# Monitor API response times
curl -w "Time: %{time_total}s" http://localhost:3000/api/projects
```

---

## Development Best Practices

1. **Use TypeScript** - Catch errors early
2. **Write Tests** - Plan for future test suite
3. **Follow ESLint** - Maintain code quality
4. **Document Code** - Add comments for complex logic
5. **Use Server Components** - Default to server components
6. **Optimize Images** - Use Next.js Image
7. **Cache Appropriately** - Balance freshness and performance
8. **Handle Errors** - Graceful error handling
9. **Validate Input** - Validate on server
10. **Monitor Performance** - Use DevTools

