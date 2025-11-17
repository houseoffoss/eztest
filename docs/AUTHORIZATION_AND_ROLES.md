# Authorization and Role-Based Access Control (RBAC)

**Complete guide to authentication, authorization, and role-based permissions in EZTest**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
4. [Database Schema](#database-schema)
5. [Roles and Permissions](#roles-and-permissions)
6. [Implementation Guide](#implementation-guide)
7. [API Usage Examples](#api-usage-examples)
8. [Testing Permissions](#testing-permissions)

---

## Overview

EZTest uses a modern RBAC (Role-Based Access Control) system with:
- **NextAuth.js** for authentication
- **PostgreSQL + Prisma** for data storage
- **Permission-based authorization** using role-permission mappings
- **4 roles**: ADMIN, PROJECT_MANAGER, TESTER, VIEWER
- **27 permissions** across different modules

### Key Features
✅ Users have one role (ADMIN, PROJECT_MANAGER, TESTER, VIEWER)  
✅ Roles have multiple permissions (e.g., `projects:read`, `testcases:create`)  
✅ Simple permission checking: `hasPermission(user, 'projects:create')`  
✅ Project membership tracking separate from roles  
✅ ADMIN has full system access

---

## Authentication

### Technology Stack
- **NextAuth.js v4.24.11** - Authentication framework
- **Credentials Provider** - Email/password authentication
- **bcryptjs** - Password hashing
- **Session-based** - JWT tokens with database sessions

### User Session Structure

```typescript
interface Session {
  user: {
    id: string;
    email: string;
    name: string;
    roleName: string; // "ADMIN", "PROJECT_MANAGER", "TESTER", "VIEWER"
    avatar?: string;
  }
}
```

### Configuration

Located in `lib/auth.ts`:

```typescript
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import * as bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { role: true },
        });

        if (!user) {
          throw new Error('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Invalid email or password');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          roleName: user.role.name,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.roleName = user.roleName;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.roleName = token.roleName as string;
      }
      return session;
    },
  },
};
```

---

## Role-Based Access Control (RBAC)

### Architecture

EZTest uses a **3-table RBAC system**:

```
User ──> Role ──> RolePermission ──> Permission
```

- **User** has one **Role** (via `roleId` foreign key)
- **Role** has many **Permissions** (via `RolePermission` join table)
- **Permissions** define what actions can be performed

### Why This Architecture?

✅ **Flexible** - Easy to add/remove permissions without code changes  
✅ **Scalable** - Can add new roles dynamically  
✅ **Maintainable** - Permissions stored in database, not hardcoded  
✅ **Auditable** - Clear permission tracking  
✅ **Standard** - Industry-standard RBAC pattern

---

## Database Schema

### Prisma Schema

```prisma
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String
  password    String
  roleId      String
  role        Role     @relation(fields: [roleId], references: [id])
  avatar      String?
  bio         String?
  phone       String?
  location    String?
  deletedAt   DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  createdProjects  Project[]        @relation("ProjectCreator")
  projectMembers   ProjectMember[]
  createdTestCases TestCase[]       @relation("TestCaseCreator")
  assignedTestCases TestCase[]      @relation("TestCaseAssignee")
}

model Role {
  id          String         @id @default(cuid())
  name        String         @unique // "ADMIN", "PROJECT_MANAGER", "TESTER", "VIEWER"
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
  
  users       User[]
  permissions RolePermission[]
}

model Permission {
  id          String         @id @default(cuid())
  name        String         @unique // "projects:create", "testcases:read"
  description String?
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
  
  roles       RolePermission[]
}

model RolePermission {
  id           String     @id @default(cuid())
  roleId       String
  permissionId String
  createdAt    DateTime   @default(now())
  
  role         Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)
  
  @@unique([roleId, permissionId])
}

model ProjectMember {
  id        String   @id @default(cuid())
  projectId String
  userId    String
  joinedAt  DateTime @default(now())
  
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([projectId, userId])
}
```

---

## Roles and Permissions

### 🎭 Role Overview

| Role | Permissions | Use Case |
|------|-------------|----------|
| **ADMIN** | 27 (all) | System administrators, full access |
| **PROJECT_MANAGER** | 22 | Team leads, manage projects and members |
| **TESTER** | 21 | QA engineers, create/execute tests |
| **VIEWER** | 5 | Stakeholders, read-only access |

### 1. ADMIN Role

**Total Permissions: 27 (Full Access)**

✅ **User Management:**
- Add users to the EZTest application with any role
- **Edit and change user roles** (`users:manage_roles`)
- View, create, update, and delete users
- **Remove users from the application** (`users:delete`)

✅ **Project Access:**
- Access **all projects** regardless of project membership
- Create, read, update, and delete any project
- Add and remove users to/from any project as members

✅ **Test Management:**
- Full access to test cases, test runs, test suites, and requirements
- Can perform all operations across all projects

**Permissions:**
```
projects: read, create, update, delete, manage_members
testcases: read, create, update, delete
testruns: read, create, update, delete, execute
testsuites: read, create, update, delete
requirements: read, create, update, delete
users: read, create, update, delete, manage_roles
```

### 2. PROJECT_MANAGER Role

**Total Permissions: 22**

✅ **Project Management:**
- View, create, and edit projects (where they are a member)
- **Add and remove members from projects** (`projects:manage_members`)

✅ **Test Management:**
- Full access to test cases (create, read, update, delete)
- Full access to test runs (create, read, update, delete, execute)
- Full access to test suites (create, read, update, delete)
- Full access to requirements (create, read, update, delete)

✅ **User Access:**
- Read-only access to view user information

❌ **Cannot:**
- Delete projects
- Create, update, or delete users in the system
- Assign roles to users

**Permissions:**
```
projects: read, create, update, manage_members
testcases: read, create, update, delete
testruns: read, create, update, delete, execute
testsuites: read, create, update, delete
requirements: read, create, update, delete
users: read
```

### 3. TESTER Role

**Total Permissions: 21**

✅ **Same as PROJECT_MANAGER EXCEPT cannot add/remove members**

✅ **Project Management:**
- View, create, and edit projects (where they are a member)

✅ **Test Management:**
- Full access to test cases (create, read, update, delete)
- Full access to test runs (create, read, update, delete, execute)
- Full access to test suites (create, read, update, delete)
- Full access to requirements (create, read, update, delete)

✅ **User Access:**
- Read-only access to view user information

❌ **Cannot:**
- **Add or remove members from projects**
- Delete projects
- Create, update, or delete users
- Assign roles to users

**Permissions:**
```
projects: read, create, update
testcases: read, create, update, delete
testruns: read, create, update, delete, execute
testsuites: read, create, update, delete
requirements: read, create, update, delete
users: read
```

**Key Difference from PROJECT_MANAGER:** Missing `projects:manage_members` permission

### 4. VIEWER Role

**Total Permissions: 5 (Read-Only)**

✅ **Can View:**
- Projects (read-only)
- Test cases (read-only)
- Test runs (read-only)
- Test suites (read-only)
- Requirements (read-only)

❌ **Cannot:**
- Create, update, or delete anything
- Add members to projects
- Execute tests

**Permissions:**
```
projects: read
testcases: read
testruns: read
testsuites: read
requirements: read
```

### Permission Comparison Matrix

| Permission | ADMIN | PROJECT_MANAGER | TESTER | VIEWER |
|-----------|-------|-----------------|--------|--------|
| **Projects** |
| projects:read | ✅ | ✅ | ✅ | ✅ |
| projects:create | ✅ | ✅ | ✅ | ❌ |
| projects:update | ✅ | ✅ | ✅ | ❌ |
| projects:delete | ✅ | ❌ | ❌ | ❌ |
| projects:manage_members | ✅ | ✅ | ❌ | ❌ |
| **Test Cases** |
| testcases:read | ✅ | ✅ | ✅ | ✅ |
| testcases:create | ✅ | ✅ | ✅ | ❌ |
| testcases:update | ✅ | ✅ | ✅ | ❌ |
| testcases:delete | ✅ | ✅ | ✅ | ❌ |
| **Test Runs** |
| testruns:read | ✅ | ✅ | ✅ | ✅ |
| testruns:create | ✅ | ✅ | ✅ | ❌ |
| testruns:update | ✅ | ✅ | ✅ | ❌ |
| testruns:delete | ✅ | ✅ | ✅ | ❌ |
| testruns:execute | ✅ | ✅ | ✅ | ❌ |
| **Users** |
| users:read | ✅ | ✅ | ✅ | ❌ |
| users:create | ✅ | ❌ | ❌ | ❌ |
| users:update | ✅ | ❌ | ❌ | ❌ |
| users:manage_roles | ✅ | ❌ | ❌ | ❌ |
| users:delete | ✅ | ❌ | ❌ | ❌ |

### Capability Summary

| Capability | ADMIN | PROJECT_MANAGER | TESTER | VIEWER |
|-----------|-------|-----------------|--------|--------|
| Access all projects | ✅ | ❌ | ❌ | ❌ |
| Create projects | ✅ | ✅ | ✅ | ❌ |
| Edit projects | ✅ | ✅ | ✅ | ❌ |
| Delete projects | ✅ | ❌ | ❌ | ❌ |
| Add/remove project members | ✅ | ✅ | ❌ | ❌ |
| Remove users from app | ✅ | ❌ | ❌ | ❌ |
| Edit user roles | ✅ | ❌ | ❌ | ❌ |
| Create test cases | ✅ | ✅ | ✅ | ❌ |
| Edit test cases | ✅ | ✅ | ✅ | ❌ |
| Delete test cases | ✅ | ✅ | ✅ | ❌ |
| Execute tests | ✅ | ✅ | ✅ | ❌ |
| View only | ❌ | ❌ | ❌ | ✅ |

---

## Implementation Guide

### 1. Seeding RBAC Data

**Location:** `prisma/seed-rbac.ts`

Run the seed to create roles and permissions:

```bash
npm run db:seed
```

This creates:
- 4 roles (ADMIN, PROJECT_MANAGER, TESTER, VIEWER)
- 27 permissions
- Role-permission mappings
- Default admin user (admin@eztest.local)

### 2. Getting User with Permissions

**Location:** `lib/auth/getSessionUser.ts`

```typescript
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.email) return null;

  return prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      role: {
        include: {
          permissions: {
            include: { permission: true }
          }
        }
      }
    }
  });
}
```

**Returns:**
```typescript
{
  id: "user-id",
  email: "admin@eztest.local",
  name: "Admin User",
  role: {
    name: "ADMIN",
    permissions: [
      { permission: { name: "projects:read" } },
      { permission: { name: "projects:create" } },
      // ... all permissions
    ]
  }
}
```

### 3. Checking Permissions

**Location:** `lib/rbac/hasPermission.ts`

```typescript
type UserWithPermissions = {
  role: {
    permissions: Array<{
      permission: {
        name: string;
      };
    }>;
  };
} | null;

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  user: UserWithPermissions,
  permission: string
): boolean {
  if (!user) return false;
  
  return user.role.permissions.some(
    (rp) => rp.permission.name === permission
  );
}

/**
 * Check if user has ANY of the specified permissions
 */
export function hasAnyPermission(
  user: UserWithPermissions,
  permissions: string[]
): boolean {
  if (!user) return false;
  
  return permissions.some(permission =>
    user.role.permissions.some(
      (rp) => rp.permission.name === permission
    )
  );
}

/**
 * Check if user has ALL specified permissions
 */
export function hasAllPermissions(
  user: UserWithPermissions,
  permissions: string[]
): boolean {
  if (!user) return false;
  
  return permissions.every(permission =>
    user.role.permissions.some(
      (rp) => rp.permission.name === permission
    )
  );
}
```

### 4. Project Membership

**Important:** Except for ADMIN, users must be project members to access a project.

```typescript
async function checkProjectAccess(userId: string, projectId: string) {
  const membership = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId
      }
    }
  });

  return !!membership;
}
```

---

## API Usage Examples

### Example 1: Simple Permission Check

```typescript
import { getSessionUser } from '@/lib/auth/getSessionUser';
import { hasPermission } from '@/lib/rbac/hasPermission';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const user = await getSessionUser();

  // Check permission
  if (!hasPermission(user, 'projects:create')) {
    return NextResponse.json(
      { error: 'Forbidden: Missing projects:create permission' },
      { status: 403 }
    );
  }

  // User has permission, proceed with logic
  // ...
}
```

### Example 2: Multiple Permission Check

```typescript
export async function PUT(request: NextRequest) {
  const user = await getSessionUser();

  // User needs either update OR delete permission
  if (!hasAnyPermission(user, ['projects:update', 'projects:delete'])) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }

  // Proceed...
}
```

### Example 3: Combined Permission + Membership Check

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser();

  // 1. Check permission
  if (!hasPermission(user, 'testcases:read')) {
    return NextResponse.json(
      { error: 'Forbidden: Missing testcases:read permission' },
      { status: 403 }
    );
  }

  // 2. Check project membership (skip for ADMIN)
  if (user!.role.name !== 'ADMIN') {
    const isMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: params.id,
          userId: user!.id
        }
      }
    });

    if (!isMember) {
      return NextResponse.json(
        { error: 'Not a member of this project' },
        { status: 403 }
      );
    }
  }

  // Proceed...
}
```

### Example 4: Using baseInterceptor

```typescript
import { baseInterceptor } from '@/backend/utils/baseInterceptor';

export const POST = baseInterceptor(async (request: NextRequest) => {
  const user = await getSessionUser();
  
  if (!hasPermission(user, 'projects:manage_members')) {
    return NextResponse.json(
      { error: 'Only ADMIN and PROJECT_MANAGER can add/remove members' },
      { status: 403 }
    );
  }

  // Controller returns plain object
  return projectController.addMember(request);
  // baseInterceptor converts to NextResponse automatically
});
```

### Example 5: Role-Specific Logic

```typescript
export async function GET(request: NextRequest) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let projects;
  
  if (user.role.name === 'ADMIN') {
    // ADMIN sees all projects
    projects = await prisma.project.findMany();
  } else {
    // Others see only projects they're members of
    projects = await prisma.project.findMany({
      where: {
        members: {
          some: {
            userId: user.id
          }
        }
      }
    });
  }

  return NextResponse.json({ data: projects });
}
```

---

## Testing Permissions

### Test Script

Create `scripts/check-permissions.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRolePermissions() {
  const roles = await prisma.role.findMany({
    include: {
      permissions: {
        include: {
          permission: true
        }
      }
    }
  });

  console.log('\n📋 Role Permissions Summary:\n');
  
  roles.forEach(role => {
    console.log(`\n${role.name} (${role.permissions.length} permissions):`);
    
    const grouped: Record<string, string[]> = {};
    role.permissions.forEach(rp => {
      const [category] = rp.permission.name.split(':');
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(rp.permission.name);
    });
    
    Object.entries(grouped).forEach(([category, perms]) => {
      console.log(`  ${category}:`);
      perms.forEach(p => console.log(`    - ${p}`));
    });
  });

  await prisma.$disconnect();
}

checkRolePermissions().catch(console.error);
```

Run:
```bash
npx tsx scripts/check-permissions.ts
```

### Manual Testing

1. **Create test users:**
```sql
-- In Prisma Studio or SQL
INSERT INTO "User" (id, email, name, password, roleId)
VALUES 
  ('user1', 'pm@test.com', 'Project Manager', '$hashed', 'pm-role-id'),
  ('user2', 'tester@test.com', 'Tester', '$hashed', 'tester-role-id');
```

2. **Test API endpoints:**
```bash
# Login as PROJECT_MANAGER
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email": "pm@test.com", "password": "password"}'

# Try creating a project (should work)
curl -X POST http://localhost:3000/api/projects \
  -H "Cookie: next-auth.session-token=..." \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Project", "key": "TEST"}'

# Try deleting a project (should fail - no permission)
curl -X DELETE http://localhost:3000/api/projects/project-id \
  -H "Cookie: next-auth.session-token=..."
```

---

## Summary

### Key Points

✅ **Simple RBAC**: 3 tables (Role, Permission, RolePermission)  
✅ **4 Roles**: ADMIN (27), PROJECT_MANAGER (22), TESTER (21), VIEWER (5)  
✅ **Easy Checks**: `hasPermission(user, 'projects:create')`  
✅ **Project Membership**: Separate from roles, tracked in ProjectMember  
✅ **ADMIN Bypass**: ADMIN can access all projects without membership

### Best Practices

1. **Always check permissions** before performing actions
2. **Use baseInterceptor** for consistent error handling
3. **Check project membership** for non-ADMIN users
4. **Use specific permissions** (not role checks) for flexibility
5. **Document permission requirements** in route comments

### Common Patterns

**Permission Check Pattern:**
```typescript
const user = await getSessionUser();
if (!hasPermission(user, 'resource:action')) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

**Membership Check Pattern:**
```typescript
if (user.role.name !== 'ADMIN') {
  const isMember = await checkProjectMembership(userId, projectId);
  if (!isMember) return forbiddenResponse();
}
```

---

**Last Updated:** November 17, 2025  
**Version:** 1.0  
**Maintainer:** EZTest Development Team
