# Architecture Overview

Technical architecture documentation for EzTest.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Browser                         │
│                   (React 19 Components)                      │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
┌────────────────────────▼────────────────────────────────────┐
│                   Next.js 15 Server                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  App Router (pages, layouts, API routes)             │   │
│  │  Server Components & Server Actions                  │   │
│  │  NextAuth Middleware & Route Handlers                │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
   ┌─────────┐   ┌─────────────┐   ┌──────────────┐
   │ Prisma  │   │ NextAuth.js │   │   AWS S3     │
   │  ORM    │   │  (Auth)     │   │ (Attachments)│
   └────┬────┘   └─────────────┘   └──────────────┘
        │
        ▼
   ┌──────────────────┐
   │  PostgreSQL 16   │
   │   (Database)     │
   └──────────────────┘
```

---

## Documentation Sections

| Section | Description |
|---------|-------------|
| [Database Schema](./database.md) | Data models and relationships |
| [Security](./security.md) | Security implementation |
| [Code Patterns](./patterns.md) | Coding patterns and conventions |

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.1.0 | UI framework |
| Next.js | 15.5.6 | Full-stack framework |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Styling |
| Radix UI | Latest | Accessible components |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js API Routes | 15.x | REST API |
| Prisma | 5.22.0 | Database ORM |
| NextAuth.js | 4.24.11 | Authentication |
| bcryptjs | 3.0.2 | Password hashing |
| Zod | 4.1.12 | Validation |

### Infrastructure

| Technology | Version | Purpose |
|------------|---------|---------|
| PostgreSQL | 16 | Database |
| Docker | Latest | Containerization |
| AWS S3 | - | File storage |
| Nodemailer | 6.10.1 | Email |

---

## Core Modules

### Authentication (`lib/auth.ts`)

Handles user authentication:
- Credentials provider
- JWT session management
- Permission loading
- Session callbacks

### Database (`prisma/schema.prisma`)

Database models:
- User management
- Project structure
- Test management
- Defect tracking
- RBAC system

### API (`app/api/`)

RESTful API structure:
- Route handlers
- Request validation
- Response formatting
- Error handling

### Services (`backend/services/`)

Business logic layer:
- Data operations
- Validation
- Transformations
- External integrations

### Controllers (`backend/controllers/`)

API endpoint handlers:
- Request parsing
- Service calls
- Response formatting
- Error handling

---

## Data Flow

### Request Flow

```
1. Client Request
       │
       ▼
2. Next.js Middleware (auth check)
       │
       ▼
3. API Route Handler
       │
       ▼
4. Controller (validation, parsing)
       │
       ▼
5. Service (business logic)
       │
       ▼
6. Prisma (database query)
       │
       ▼
7. Response to Client
```

### Authentication Flow

```
1. Login Form Submit
       │
       ▼
2. NextAuth Credentials Provider
       │
       ▼
3. User Lookup (Prisma)
       │
       ▼
4. Password Verification (bcrypt)
       │
       ▼
5. JWT Token Generation
       │
       ▼
6. Session Cookie Set
       │
       ▼
7. Redirect to Dashboard
```

---

## Directory Structure

```
eztest/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Auth pages
│   ├── dashboard/         # Dashboard
│   └── projects/          # Project pages
│
├── backend/               # Backend logic
│   ├── controllers/       # Route handlers
│   ├── services/          # Business logic
│   ├── validators/        # Input validation
│   └── utils/             # Utilities
│
├── components/            # React components
│   ├── common/            # Feature components
│   ├── design/            # Design system
│   ├── layout/            # Layout components
│   └── pages/             # Page components
│
├── elements/              # Base UI elements
│
├── lib/                   # Shared libraries
│   ├── auth.ts           # Auth config
│   ├── prisma.ts         # Prisma client
│   └── utils.ts          # Utilities
│
├── prisma/                # Database
│   ├── schema.prisma     # Schema
│   ├── migrations/       # Migrations
│   └── seed.ts           # Seed data
│
├── types/                 # TypeScript types
│
└── docs/                  # Documentation
```

---

## Key Design Decisions

### 1. Next.js App Router

**Decision:** Use App Router instead of Pages Router

**Rationale:**
- Server Components for better performance
- Simplified data fetching
- Built-in layouts
- Future-proof architecture

### 2. Prisma ORM

**Decision:** Use Prisma for database access

**Rationale:**
- Type-safe queries
- Auto-generated client
- Migration support
- Great developer experience

### 3. JWT Sessions

**Decision:** Use JWT instead of database sessions

**Rationale:**
- Stateless authentication
- Reduced database load
- Easy horizontal scaling
- Contains user permissions

### 4. Service Layer

**Decision:** Separate services from controllers

**Rationale:**
- Separation of concerns
- Reusable business logic
- Easier testing
- Cleaner code

### 5. Glass Morphism UI

**Decision:** Use glass morphism design

**Rationale:**
- Modern aesthetic
- Visual depth
- Consistent theme
- Accessibility-friendly

---

## Performance Considerations

### Server Components

- Default rendering on server
- Reduced client JavaScript
- Faster initial load
- Better SEO

### Database

- Indexed foreign keys
- Connection pooling
- Query optimization
- Pagination by default

### Caching

- JWT session caching
- Prisma query caching
- Static asset caching
- API response caching (planned)

---

## Scalability

### Horizontal Scaling

- Stateless Next.js servers
- Load balancer ready
- Shared database
- External file storage

### Database Scaling

- PostgreSQL replication
- Connection pooling
- Read replicas (future)
- Query optimization

---

## Security Overview

- bcrypt password hashing
- JWT token encryption
- HTTPS enforcement
- CSRF protection
- Input validation
- Role-based access control

See [Security Documentation](./security.md) for details.

---

## Related Documentation

- [Architecture Overview](./README.md)
- [Database Schema](./database.md)
- [Security](./security.md)
- [Code Patterns](./patterns.md)
