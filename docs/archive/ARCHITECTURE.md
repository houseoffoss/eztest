# Architecture Overview

## System Architecture

EZTest follows a modern full-stack JavaScript architecture with clear separation between frontend and backend layers.

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Browser                         │
│                   (React 19 Components)                      │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS/HTTP
┌────────────────────────▼────────────────────────────────────┐
│                   Next.js 15 Server                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  App Router (pages, layouts, API routes)           │  │
│  │  Server Components & Server Actions                │  │
│  │  NextAuth Middleware & Route Handlers              │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
   ┌─────────┐   ┌─────────────┐   ┌──────────────┐
   │ Prisma  │   │ NextAuth.js │   │   File I/O   │
   │  ORM    │   │  (Auth)     │   │  (Uploads)   │
   └────┬────┘   └─────────────┘   └──────────────┘
        │
        ▼
   ┌──────────────────┐
   │  PostgreSQL 16   │
   │   (Database)     │
   └──────────────────┘
```

## Architectural Layers

### 1. **Client Layer** (Browser)
- React 19 components with Hooks
- Radix UI components and primitives
- Tailwind CSS styling
- Client-side state management (React Context)

### 2. **Application Layer** (Next.js Server)
- **App Router** - File-based routing with App Directory
- **Server Components** - Default rendering strategy for better performance
- **API Routes** - RESTful API endpoints under `/app/api`
- **Middleware** - Authentication and authorization checks
- **Authentication** - NextAuth.js for user sessions and JWT tokens

### 3. **Data Access Layer** (Prisma ORM)
- Type-safe database queries
- Automatic migrations
- Relationship handling
- Transaction support

### 4. **Database Layer** (PostgreSQL)
- Normalized schema with 10+ models
- Referential integrity with cascading deletes
- Indexed queries for performance
- ACID compliance

## Core Modules

### Authentication Module (`lib/auth.ts`)
```
CredentialsProvider
    ↓
bcryptjs (password validation)
    ↓
Prisma (user lookup)
    ↓
JWT Token Generation
    ↓
Session Management (30-day expiry)
```

**Features:**
- Email/password authentication
- JWT-based sessions
- Role-based access control
- Secure password hashing

### Middleware (`middleware.ts`)
```
Request
    ↓
URL Pattern Matching
    ↓
Public Route Check (/auth/*, /, /ui, /api/auth/*)
    ↓
Protected Route → Require Token
    ↓
Allow/Redirect
```

**Flow:**
1. Check if route is public
2. If protected, verify JWT token
3. Redirect unauthenticated users to login
4. Pass authorized requests through

### Database Layer (`prisma/schema.prisma`)
**11 Core Models:**
- `User` - User accounts and roles
- `Project` - Test projects
- `ProjectMember` - Team membership
- `TestSuite` - Test organization hierarchy
- `TestCase` - Individual test cases
- `TestStep` - Test case steps
- `TestRun` - Test execution batches
- `TestResult` - Individual test results
- `Requirement` - Requirements tracking
- `Comment` - Collaboration annotations
- `Attachment` - File attachments

## Data Flow Patterns

### User Registration Flow
```
POST /api/auth/register
    ↓
Parse request body
    ↓
Hash password (bcryptjs)
    ↓
Create user in database (Prisma)
    ↓
Return success/error
```

### Authentication Flow
```
Login Form
    ↓
POST /api/auth/callback/credentials
    ↓
CredentialsProvider authorize()
    ↓
Lookup user by email
    ↓
Verify password hash
    ↓
Generate JWT token
    ↓
Set session (30-day duration)
    ↓
Redirect to dashboard
```

### Protected Route Access
```
Request to /dashboard
    ↓
Middleware checks authorization
    ↓
getServerSession() retrieves session
    ↓
If no session → redirect to /auth/login
    ↓
If session exists → render protected page
```

## Key Design Patterns

### 1. **Server Component with Data Fetching**
```typescript
// Server Component - renders on server, no JS sent to client
export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  // Use session data
}
```

### 2. **Middleware Pattern**
```typescript
// Check auth before route access
export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  { /* auth config */ }
);
```

### 3. **Prisma Data Queries**
```typescript
// Type-safe queries with auto-completion
const user = await prisma.user.findUnique({
  where: { email: credentials.email }
});
```

### 4. **Role-Based Authorization**
```typescript
// Check user role in session
if (session.user.role !== 'ADMIN') {
  return new Response('Unauthorized', { status: 403 });
}
```

## Request/Response Lifecycle

### Typical Request Flow
```
1. Browser sends request
         ↓
2. Middleware intercepts request
         ↓
3. Checks authentication status
         ↓
4. Routes to appropriate handler (component or API)
         ↓
5. Handler queries database if needed
         ↓
6. Response sent back to browser
         ↓
7. Browser renders updated UI
```

### API Request Flow
```
1. POST /api/auth/register
         ↓
2. Parse JSON body
         ↓
3. Validate input
         ↓
4. Hash password with bcryptjs
         ↓
5. Create user via Prisma
         ↓
6. Return JSON response
```

## Performance Considerations

### 1. **Server-Side Rendering**
- Server Components reduce JavaScript sent to client
- Faster initial page load
- Better SEO

### 2. **Database Indexing**
- Indexed on frequently queried fields (email, projectId, status)
- Improves query performance
- Foreign key relationships use cascading deletes

### 3. **Caching**
- NextAuth.js caches session tokens
- Prisma client is singleton for connection pooling
- Static assets served through CDN

### 4. **Query Optimization**
- Use Prisma relations to avoid N+1 queries
- Index strategically on foreign keys
- Pagination for large datasets

## Security Architecture

### 1. **Password Security**
- Bcryptjs for password hashing (10 salt rounds)
- Never store plain passwords
- Compare with hash during authentication

### 2. **Session Security**
- JWT tokens with 30-day expiry
- NEXTAUTH_SECRET for token signing
- Secure HTTP-only cookies

### 3. **Route Protection**
- Middleware enforces authentication
- Protected routes check session
- Role-based access control on sensitive operations

### 4. **Input Validation**
- Validate email format
- Require strong passwords (at least 8 characters recommended)
- Sanitize user inputs before database queries

## Scalability Considerations

### Horizontal Scaling
- Stateless Next.js servers can run behind load balancer
- Shared PostgreSQL database for consistency
- File uploads to external storage (future enhancement)

### Database Scaling
- PostgreSQL connection pooling
- Query optimization through indexes
- Consider read replicas for reporting

### Caching Strategy
- Client-side caching for API responses
- Session caching with NextAuth.js
- Database query caching with Prisma

## Future Architecture Enhancements

- **API Rate Limiting** - Prevent abuse of endpoints
- **Audit Logging** - Track all user actions
- **WebSocket Support** - Real-time collaboration
- **File Storage** - External S3/cloud storage
- **Search** - Full-text search capabilities
- **Caching Layer** - Redis for performance

