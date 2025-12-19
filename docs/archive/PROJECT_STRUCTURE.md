# Project Structure

## Directory Organization

```
eztest.houseoffoss.com/
├── docs/                          # Technical documentation
│   ├── INDEX.md                   # Documentation index
│   ├── ARCHITECTURE.md            # System architecture overview
│   ├── DATABASE.md                # Database schema & models
│   ├── AUTHENTICATION.md          # Auth & authorization
│   ├── API.md                     # API endpoints reference
│   ├── PROJECT_STRUCTURE.md       # This file
│   ├── DEVELOPMENT.md             # Development workflows
│   ├── ENVIRONMENT.md             # Environment configuration
│   ├── CODE_PATTERNS.md           # Code conventions
│   ├── DEPLOYMENT.md              # Deployment guide
│   └── TROUBLESHOOTING.md         # Common issues & solutions
│
├── app/                           # Next.js App Router
│   ├── api/                       # API routes
│   │   ├── auth/
│   │   │   ├── register/
│   │   │   │   └── route.ts       # User registration endpoint
│   │   │   └── [...]nextauth]/
│   │   │       └── route.ts       # NextAuth.js handler
│   │   └── health/
│   │       └── route.ts           # Health check endpoint
│   │
│   ├── auth/                      # Authentication pages
│   │   ├── login/
│   │   │   └── page.tsx           # Login page
│   │   ├── register/
│   │   │   └── page.tsx           # Registration page
│   │   └── error/
│   │       └── page.tsx           # Auth error page
│   │
│   ├── dashboard/                 # Protected dashboard
│   │   └── page.tsx               # Dashboard page
│   │
│   ├── ui/                        # UI component showcase
│   │   └── page.tsx               # Component library display
│   │
│   ├── layout.tsx                 # Root layout component
│   ├── page.tsx                   # Home page
│   └── globals.css                # Global styles & theme
│
├── components/                    # Reusable React components
│   └── (component files)          # Radix UI & custom components
│
├── lib/                           # Utility functions & core logic
│   ├── auth.ts                    # NextAuth configuration
│   ├── prisma.ts                  # Prisma client singleton
│   └── utils.ts                   # Helper functions
│
├── types/                         # TypeScript type definitions
│   └── (type files)               # App-specific types
│
├── prisma/                        # Database configuration
│   ├── schema.prisma              # Prisma data model
│   ├── seed.ts                    # Database seeding script
│   └── migrations/                # Migration files
│
├── public/                        # Static assets
│   ├── favicon.ico
│   └── (other assets)
│
├── uploads/                       # User file uploads
│   └── (uploaded files)           # Temporary/local storage
│
├── middleware.ts                  # NextAuth middleware
├── next.config.ts                 # Next.js configuration
├── tsconfig.json                  # TypeScript configuration
├── components.json                # Radix UI configuration
├── tailwind.config.ts             # Tailwind CSS configuration
├── postcss.config.mjs             # PostCSS configuration
├── eslint.config.mjs              # ESLint configuration
│
├── docker-compose.yml             # Production docker setup
├── docker-compose.dev.yml         # Development docker setup
├── Dockerfile                     # Production image
├── Dockerfile.dev                 # Development image
├── docker-entrypoint.sh           # Docker startup script
│
├── package.json                   # Project dependencies
├── package-lock.json              # Lock file
├── README.md                      # Project README
├── DOCKER.md                      # Docker documentation
└── .env.example                   # Environment template

```

## Key Directories Explained

### `app/` - Next.js App Router

The main application code following Next.js 15 App Router conventions.

**Structure:**
- Pages created as `page.tsx` files
- Layouts created as `layout.tsx` files
- API routes in `api/` subdirectory with `route.ts`
- Nested routes via nested directories

**Example Route Mapping:**
```
app/page.tsx                      → /
app/auth/login/page.tsx           → /auth/login
app/dashboard/page.tsx            → /dashboard
app/api/auth/register/route.ts    → /api/auth/register
```

### `lib/` - Core Application Logic

Shared utilities and configuration.

**Files:**
- `auth.ts` - NextAuth.js configuration and providers
- `prisma.ts` - Prisma client singleton for database access
- `utils.ts` - Helper functions (formatting, validation, etc.)

### `prisma/` - Database Configuration

**Files:**
- `schema.prisma` - Prisma data model with all entities
- `seed.ts` - Populates database with initial data
- `migrations/` - Automatic migration history

### `types/` - TypeScript Definitions

Application-specific TypeScript types and interfaces.

**Usage:**
```typescript
import type { User } from '@/types/user';
```

### `components/` - Reusable Components

React components built with Radix UI.

**Organization:**
```
components/
├── ui/                  # Radix UI components
├── auth/                # Auth-related components
├── dashboard/           # Dashboard components
└── common/              # Shared components
```

## File Naming Conventions

### Components

```
MyComponent.tsx         ✓ PascalCase for components
my-component.tsx        ✗ Avoid kebab-case

components/
├── FormInput.tsx       ✓ Component files
├── FormInput.test.tsx  ✓ Test files
└── index.ts            ✓ Barrel exports
```

### Pages

```
app/
├── page.tsx            ✓ Index page
├── layout.tsx          ✓ Layout component
└── loading.tsx         ✓ Loading state
```

### API Routes

```
app/api/
├── auth/
│   └── route.ts        ✓ Handler (GET, POST, etc.)
├── projects/
│   ├── route.ts        ✓ List endpoint
│   └── [id]/
│       └── route.ts    ✓ Detail endpoint
```

### Utilities & Configuration

```
lib/
├── auth.ts             ✓ Feature file
├── utils.ts            ✓ General utilities
└── validation.ts       ✓ Validation functions
```

## Import Paths

### Path Aliases (configured in tsconfig.json)

```typescript
// Absolute imports with @/
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { Button } from '@/elements/button';

// Instead of relative
import { prisma } from '../../../lib/prisma';  // ✗ Avoid
```

### Import Organization

```typescript
// 1. External imports
import { useState } from 'react';
import { getServerSession } from 'next-auth';

// 2. Internal imports
import { prisma } from '@/lib/prisma';
import { Button } from '@/elements/button';

// 3. Type imports
import type { User } from '@/types/user';
```

## Environment Files

### `.env` (Git ignored)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/eztest
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
```

### `.env.example` (Version controlled)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/eztest
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### `.env.development` (Development only)
```env
NODE_ENV=development
DEBUG=true
DATABASE_URL=postgresql://eztest:eztest@localhost:5432/eztest
```

## Build Artifacts

### `.next/` - Build output
- Generated during `npm run build`
- Contains optimized bundles
- Should not be committed

### `node_modules/` - Dependencies
- Generated from `package.json`
- Should not be committed
- Use `npm install` to regenerate

## Configuration Files

| File | Purpose |
|------|---------|
| `tsconfig.json` | TypeScript configuration |
| `next.config.ts` | Next.js settings |
| `tailwind.config.ts` | Tailwind CSS customization |
| `postcss.config.mjs` | CSS processing |
| `components.json` | Radix UI configuration |
| `eslint.config.mjs` | Linting rules |
| `.dockerignore` | Docker build exclusions |
| `.gitignore` | Git exclusions |

## Docker Files

### `docker-compose.yml`
Production-ready setup with:
- Next.js app container
- PostgreSQL database
- Volume mounting
- Environment configuration

### `Dockerfile`
Production image with:
- Multi-stage build
- Optimized dependencies
- Lean final image

### `docker-compose.dev.yml`
Development setup with:
- Hot reload capability
- Debug logging
- Local volume mounts

### `Dockerfile.dev`
Development image with:
- Turbopack for faster builds
- Source maps
- Development dependencies

## Static Assets

### `public/`
```
public/
├── favicon.ico        # Browser icon
└── logo.svg          # Logo assets
```

Served at root URL:
```
/favicon.ico  → public/favicon.ico
```

## Data & Uploads

### `uploads/`
Temporary storage for user uploads:
- Profile pictures
- Test screenshots
- Attachment files

**Note**: For production, use external storage (S3, etc.)

## Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview & quick start |
| `DOCKER.md` | Docker deployment guide |
| `docs/` | Technical documentation |

## Git Configuration

### `.gitignore`
Excludes from version control:
```
node_modules/
.next/
.env
.env.local
uploads/
dist/
```

### `.git/`
Git repository metadata (auto-created)

## NPM Scripts

Defined in `package.json`:

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
npm run db:seed  # Seed database
```

## Module Dependencies

### Production (`dependencies`)
```json
{
  "next": "15.5.6",
  "react": "19.1.0",
  "prisma": "^6.17.1",
  "next-auth": "^4.24.11"
}
```

### Development (`devDependencies`)
```json
{
  "typescript": "^5",
  "tailwindcss": "^4",
  "prisma": "^6.17.1"
}
```

## Environment Setup

### Local Development

1. Clone repository
2. Copy `.env.example` to `.env`
3. Update `DATABASE_URL`
4. Run `npm install`
5. Run `npx prisma db push`
6. Run `npm run dev`

### Docker Development

1. Copy `.env.example` to `.env`
2. Run `docker-compose -f docker-compose.dev.yml up -d`
3. Access at `http://localhost:3000`

## Performance Considerations

### Code Splitting
- Next.js automatically code-splits at route level
- Reduces initial bundle size
- Lazy load heavy components

### Image Optimization
- Store images in `public/`
- Use Next.js `<Image>` component
- Automatic optimization & WebP conversion

### Caching
- Static pages cached at build time
- Dynamic pages cached per request
- Set `revalidate` for ISR

## Security Patterns

### File Permissions
```
.env              600  (read/write owner only)
Dockerfile        644  (readable by all)
public/           755  (readable, executable)
```

### No Secrets in Code
- Use environment variables
- Never commit `.env` files
- Rotate secrets regularly

## Extension Points

### Adding New Features

1. **New Page**: Create in `app/` directory
2. **New API Endpoint**: Add to `app/api/`
3. **New Component**: Add to `components/`
4. **New Database Model**: Update `prisma/schema.prisma`
5. **New Utility**: Add to `lib/`

### Plugin/Extension Architecture

Current structure supports:
- Custom components via `components/`
- Custom API routes via `app/api/`
- Custom middleware modifications
- Custom Prisma models

## Troubleshooting Paths

- Module not found? Check imports use `@/` aliases
- Type errors? Run `npm run build`
- Database issues? Check `.env` DATABASE_URL
- Auth issues? Check `lib/auth.ts` configuration

