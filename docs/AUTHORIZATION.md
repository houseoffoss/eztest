# Authorization System Documentation

## Overview

The EZTest authorization system provides a flexible, role-based access control (RBAC) with scope-based permissions. This system allows fine-grained control over who can perform which actions on what resources.

## Architecture

### Core Components

1. **Role** - User roles (e.g., admin, project_manager, tester, viewer)
2. **Module** - Application modules (e.g., projects, test cases, test runs)
3. **Action** - Operations that can be performed (e.g., read, write, update, delete)
4. **Scope** - Access boundaries (e.g., all, project, own)
5. **RolePrivilege** - Junction table mapping roles to their permissions

### Database Schema

```prisma
model Role {
  id          String   @id @default(cuid())
  name        String   @unique
  keyword     String   @unique
  description String?
  privileges  RolePrivilege[]
}

model Module {
  id          String   @id @default(cuid())
  name        String   @unique
  keyword     String   @unique
  description String?
  privileges  RolePrivilege[]
}

model Action {
  id          String   @id @default(cuid())
  name        String   @unique
  keyword     String   @unique
  score       Int      // Lower score = higher privilege
  description String?
  privileges  RolePrivilege[]
}

model Scope {
  id          String   @id @default(cuid())
  name        String   @unique
  keyword     String   @unique
  score       Int      // Lower score = broader scope
  description String?
  privileges  RolePrivilege[]
}

model RolePrivilege {
  id             String   @id @default(cuid())
  role_name      String
  module_keyword String
  action_keyword String
  scope_keyword  String
  
  role           Role     @relation(...)
  module         Module   @relation(...)
  action         Action   @relation(...)
  scope          Scope    @relation(...)
  
  @@unique([role_name, module_keyword])
}
```

## How It Works

### Permission Scoring System

#### Action Scores (Lower = More Permissive)
- `1` - Read (`r`)
- `2` - Write/Create (`w`)
- `3` - Update (`u`)
- `4` - Delete (`d`)

#### Scope Scores (Lower = Broader Access)
- `1` - All resources (`all`)
- `2` - Project-level resources (`project`)
- `3` - Own resources only (`own`)

### Permission Check Logic

When a user attempts an action, the system:

1. Looks up the required action score for the operation
2. Finds the user's role privilege for that module
3. Compares the user's action score with the required score
4. Grants access if `user_action_score <= required_action_score`

**Example:**
- User has role: `tester` with action `w` (write, score 2) on module `tc` (test cases)
- Attempting operation requires action `r` (read, score 1)
- Check: `2 <= 1` → **FALSE** → Access Denied

Wait, this seems wrong! Let me reconsider...

Actually, if a user has WRITE permission (score 2), they should also have READ permission (score 1). The logic should be **reversed**: higher privilege should have lower score, and we check if the user's score is less than or equal to the required score.

Let me correct this:

### Corrected Permission Check Logic

The system grants access if: `user_action_score >= required_action_score`

This means:
- User with DELETE (4) can also UPDATE (3), WRITE (2), and READ (1)
- User with WRITE (2) can also READ (1)
- User with READ (1) can only read

## Usage in API Routes

### Basic Usage

```typescript
import { hasPermission } from '@/lib/auth';

export const GET = hasPermission(
  async (request, context) => {
    // Your API logic here
    // Access user info: request.userInfo
    // Access scope info: request.scopeInfo
    
    return NextResponse.json({ data: 'success' });
  },
  'prn', // module keyword (projects)
  'r'    // action keyword (read)
);
```

### Available Module Keywords

- `prn` - Projects
- `tc` - Test Cases
- `tr` - Test Runs
- `usr` - Users

### Available Action Keywords

- `r` - Read
- `w` - Write/Create
- `u` - Update
- `d` - Delete

### Available Scope Keywords

- `all` - All resources in the system
- `project` - Resources within user's projects
- `own` - Only user's own resources

### Complete API Route Example

```typescript
import { hasPermission } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET endpoint with read permission
export const GET = hasPermission(
  async (request, context) => {
    const userId = request.userInfo.id;
    const scope = request.scopeInfo.scope_name;
    
    // Filter data based on scope
    let projects;
    if (scope === 'all') {
      projects = await prisma.project.findMany();
    } else if (scope === 'project') {
      projects = await prisma.project.findMany({
        where: {
          members: {
            some: { userId }
          }
        }
      });
    } else {
      projects = await prisma.project.findMany({
        where: { createdById: userId }
      });
    }
    
    return NextResponse.json({ data: projects });
  },
  'prn',
  'r'
);

// POST endpoint with write permission
export const POST = hasPermission(
  async (request, context) => {
    const body = await request.json();
    const userId = request.userInfo.id;
    
    const project = await prisma.project.create({
      data: {
        ...body,
        createdById: userId
      }
    });
    
    return NextResponse.json({ data: project });
  },
  'prn',
  'w'
);

// PUT endpoint with update permission
export const PUT = hasPermission(
  async (request, context) => {
    const { id } = context.params;
    const body = await request.json();
    
    const project = await prisma.project.update({
      where: { id },
      data: body
    });
    
    return NextResponse.json({ data: project });
  },
  'prn',
  'u'
);

// DELETE endpoint with delete permission
export const DELETE = hasPermission(
  async (request, context) => {
    const { id } = context.params;
    
    await prisma.project.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  },
  'prn',
  'd'
);
```

## Request Object Extensions

The `hasPermission` wrapper adds the following properties to the request object:

### `request.userInfo`

```typescript
interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: string;
  orgId?: string;
}
```

### `request.scopeInfo`

```typescript
interface ScopeInfo {
  access: boolean;
  scope_name: string;
}
```

## Error Handling

The system throws the following exceptions:

- `UnauthorizedException` (401) - User is not authenticated or lacks permission
- `BadRequestException` (400) - Invalid request or malformed data
- `ForbiddenException` (403) - User is authenticated but forbidden from action
- `NotFoundException` (404) - Resource not found
- `ValidationException` (422) - Validation error with details
- `InternalServerException` (500) - Server error

Example:

```typescript
import { UnauthorizedException, NotFoundException } from '@/backend/utils/exceptions';

export const GET = hasPermission(
  async (request, context) => {
    const { id } = context.params;
    
    const project = await prisma.project.findUnique({
      where: { id }
    });
    
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    
    // Additional authorization check
    if (request.scopeInfo.scope_name === 'own' && 
        project.createdById !== request.userInfo.id) {
      throw new UnauthorizedException('Cannot access other user\'s projects');
    }
    
    return NextResponse.json({ data: project });
  },
  'prn',
  'r'
);
```

## Default Role Permissions

### Admin
- **Projects**: Full access (delete permission, all scope)
- **Test Cases**: Full access (delete permission, all scope)
- **Test Runs**: Full access (delete permission, all scope)
- **Users**: Full access (delete permission, all scope)

### Project Manager
- **Projects**: Update permission, project scope
- **Test Cases**: Update permission, project scope
- **Test Runs**: Update permission, project scope

### Tester
- **Projects**: Read permission, project scope
- **Test Cases**: Write permission, project scope
- **Test Runs**: Write permission, project scope

### Viewer
- **Projects**: Read permission, project scope
- **Test Cases**: Read permission, project scope
- **Test Runs**: Read permission, project scope

## Database Migration

After adding the authorization models to your schema, run:

```bash
# Generate Prisma Client
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name add_authorization_system

# Seed the database with initial roles and permissions
npm run db:seed
```

## Seeding Authorization Data

The seed file (`prisma/seed-auth.ts`) creates:
- 4 actions (read, write, update, delete)
- 3 scopes (all, project, own)
- 4 modules (projects, test cases, test runs, users)
- 4 roles (admin, project_manager, tester, viewer)
- Role privileges for each role

Import and run the seed function:

```typescript
import { seedAuthorizationSystem } from './seed-auth';

async function main() {
  await seedAuthorizationSystem();
  // ... other seed functions
}

main();
```

## Extending the System

### Adding a New Module

1. Add module to database:

```typescript
await prisma.module.create({
  data: {
    name: 'Reports',
    keyword: 'rpt',
    description: 'Report generation module'
  }
});
```

2. Add privileges for each role:

```typescript
await prisma.rolePrivilege.create({
  data: {
    role_name: 'admin',
    module_keyword: 'rpt',
    action_keyword: 'd',
    scope_keyword: 'all'
  }
});
```

3. Use in API routes:

```typescript
export const GET = hasPermission(
  async (request, context) => {
    // Generate report logic
  },
  'rpt', // new module keyword
  'r'
);
```

### Adding a New Role

1. Create role:

```typescript
await prisma.role.create({
  data: {
    name: 'Auditor',
    keyword: 'auditor',
    description: 'Read-only access to all resources'
  }
});
```

2. Define privileges:

```typescript
// Read access to all modules with 'all' scope
for (const module of ['prn', 'tc', 'tr', 'usr']) {
  await prisma.rolePrivilege.create({
    data: {
      role_name: 'auditor',
      module_keyword: module,
      action_keyword: 'r',
      scope_keyword: 'all'
    }
  });
}
```

## Migration from Old System

To migrate from the old authentication system:

1. **Update user roles**: Map existing `UserRole` enum values to new role keywords
2. **Update API routes**: Replace `authenticateRequest()` and `requireRoles()` with `hasPermission()`
3. **Test thoroughly**: Ensure all endpoints maintain correct access control

### Example Migration

**Before:**
```typescript
export async function GET() {
  const auth = await authenticateRequest();
  if (auth.error) return auth.error;
  
  return projectController.listProjects(auth.session.user.id);
}
```

**After:**
```typescript
export const GET = hasPermission(
  async (request, context) => {
    return projectController.listProjects(request.userInfo.id);
  },
  'prn',
  'r'
);
```

## Best Practices

1. **Use appropriate action levels**: Don't grant more permissions than necessary
2. **Leverage scopes**: Use `project` or `own` scope when `all` is not needed
3. **Validate in business logic**: Double-check permissions in controllers when needed
4. **Log access attempts**: Monitor authorization failures for security
5. **Keep privileges updated**: Regularly review and update role privileges

## Troubleshooting

### "Unauthorized" errors

1. Check if user is authenticated
2. Verify user's role is assigned correctly
3. Confirm RolePrivilege exists for role + module combination
4. Check if action score comparison is correct

### Permission seems too restrictive

1. Review the user's role privileges
2. Check action scores (remember: higher score = more permission)
3. Verify scope is appropriate for the operation

### Permission seems too permissive

1. Audit role privileges
2. Ensure action keywords are correct
3. Consider using more restrictive scope

## Security Considerations

1. **Always validate user identity**: The `hasPermission` wrapper handles this
2. **Check resource ownership**: Use scope info to filter queries
3. **Don't trust client data**: Always verify permissions server-side
4. **Audit sensitive operations**: Log admin actions for compliance
5. **Regular privilege review**: Periodically audit and update role privileges
