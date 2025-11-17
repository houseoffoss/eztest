# RBAC Permissions Reference

## Overview

This document provides a comprehensive reference of all roles and permissions in the EZTest application.

## Permission Modules

### Projects
- `projects:read` - View projects
- `projects:create` - Create new projects
- `projects:update` - Update project details
- `projects:delete` - Delete projects
- `projects:manage_members` - Add/remove project members

### Test Suites
- `testsuites:read` - View test suites
- `testsuites:create` - Create new test suites
- `testsuites:update` - Update test suites
- `testsuites:delete` - Delete test suites

### Test Cases
- `testcases:read` - View test cases
- `testcases:create` - Create new test cases
- `testcases:update` - Update test cases
- `testcases:delete` - Delete test cases

### Test Plans
- `testplans:read` - View test plans
- `testplans:create` - Create new test plans
- `testplans:update` - Update test plans
- `testplans:delete` - Delete test plans

### Test Runs
- `testruns:read` - View test runs
- `testruns:create` - Create new test runs
- `testruns:update` - Update test runs
- `testruns:delete` - Delete test runs
- `testruns:execute` - Execute tests and log results

### Users
- `users:read` - View users
- `users:create` - Create new users
- `users:update` - Update user details
- `users:delete` - Delete users
- `users:manage_roles` - Assign roles to users

### Requirements
- `requirements:read` - View requirements
- `requirements:create` - Create new requirements
- `requirements:update` - Update requirements
- `requirements:delete` - Delete requirements

## Roles

### ADMIN (31 permissions)
Full system access with all permissions.

**Permissions:**
- **Projects:** read, create, update, delete, manage_members
- **Test Suites:** read, create, update, delete
- **Test Cases:** read, create, update, delete
- **Test Plans:** read, create, update, delete
- **Test Runs:** read, create, update, delete, execute
- **Users:** read, create, update, delete, manage_roles
- **Requirements:** read, create, update, delete

### PROJECT_MANAGER (26 permissions)
Can manage projects and all testing resources, but cannot delete projects or manage user roles.

**Permissions:**
- **Projects:** read, create, update, manage_members
- **Test Suites:** read, create, update, delete
- **Test Cases:** read, create, update, delete
- **Test Plans:** read, create, update, delete
- **Test Runs:** read, create, update, delete, execute
- **Users:** read
- **Requirements:** read, create, update, delete

**Key Differences from ADMIN:**
- ❌ Cannot delete projects (`projects:delete`)
- ❌ Cannot create, update, delete users
- ❌ Cannot manage user roles (`users:manage_roles`)

### TESTER (25 permissions)
Full access to testing resources but cannot manage project members.

**Permissions:**
- **Projects:** read, create, update
- **Test Suites:** read, create, update, delete
- **Test Cases:** read, create, update, delete
- **Test Plans:** read, create, update, delete
- **Test Runs:** read, create, update, delete, execute
- **Users:** read
- **Requirements:** read, create, update, delete

**Key Differences from PROJECT_MANAGER:**
- ❌ Cannot manage project members (`projects:manage_members`)
- ❌ Cannot delete projects (`projects:delete`)

### VIEWER (6 permissions)
Read-only access to all resources.

**Permissions:**
- **Projects:** read
- **Test Suites:** read
- **Test Cases:** read
- **Test Plans:** read
- **Test Runs:** read
- **Requirements:** read

**Key Characteristics:**
- ✅ Can view all projects, test suites, test cases, test plans, test runs, and requirements
- ❌ Cannot create, update, or delete anything
- ❌ Cannot execute tests

## Permission Matrix

| Permission | ADMIN | PROJECT_MANAGER | TESTER | VIEWER |
|------------|-------|-----------------|--------|--------|
| **Projects** |
| projects:read | ✅ | ✅ | ✅ | ✅ |
| projects:create | ✅ | ✅ | ✅ | ❌ |
| projects:update | ✅ | ✅ | ✅ | ❌ |
| projects:delete | ✅ | ❌ | ❌ | ❌ |
| projects:manage_members | ✅ | ✅ | ❌ | ❌ |
| **Test Suites** |
| testsuites:read | ✅ | ✅ | ✅ | ✅ |
| testsuites:create | ✅ | ✅ | ✅ | ❌ |
| testsuites:update | ✅ | ✅ | ✅ | ❌ |
| testsuites:delete | ✅ | ✅ | ✅ | ❌ |
| **Test Cases** |
| testcases:read | ✅ | ✅ | ✅ | ✅ |
| testcases:create | ✅ | ✅ | ✅ | ❌ |
| testcases:update | ✅ | ✅ | ✅ | ❌ |
| testcases:delete | ✅ | ✅ | ✅ | ❌ |
| **Test Plans** |
| testplans:read | ✅ | ✅ | ✅ | ✅ |
| testplans:create | ✅ | ✅ | ✅ | ❌ |
| testplans:update | ✅ | ✅ | ✅ | ❌ |
| testplans:delete | ✅ | ✅ | ✅ | ❌ |
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
| users:delete | ✅ | ❌ | ❌ | ❌ |
| users:manage_roles | ✅ | ❌ | ❌ | ❌ |
| **Requirements** |
| requirements:read | ✅ | ✅ | ✅ | ✅ |
| requirements:create | ✅ | ✅ | ✅ | ❌ |
| requirements:update | ✅ | ✅ | ✅ | ❌ |
| requirements:delete | ✅ | ✅ | ✅ | ❌ |

## Usage in Code

### Checking Permissions in API Routes

```typescript
import { hasPermission } from '@/lib/rbac/hasPermission';

// Wrap route handlers with hasPermission
export const GET = hasPermission(
  async (request, context) => {
    const { id } = await context!.params;
    return controller.getTestSuite(id, request.userInfo.id);
  },
  'testsuites',
  'read'
);

export const PATCH = hasPermission(
  async (request, context) => {
    const { id } = await context!.params;
    const body = await request.json();
    return controller.updateTestSuite(id, body, request.userInfo.id);
  },
  'testsuites',
  'update'
);
```

### Inline Permission Checks

```typescript
import { checkPermission } from '@/lib/rbac/checkPermission';

// Check permission within a route handler
if (!checkPermission(request.userInfo, 'projects:manage_members')) {
  return NextResponse.json(
    { error: 'You do not have permission to manage project members' },
    { status: 403 }
  );
}
```

## Adding New Permissions

To add new permissions:

1. **Update `prisma/seed-rbac.ts`**:
   ```typescript
   const permissions = [
     // ... existing permissions
     { name: 'newmodule:read', description: 'View new module items' },
     { name: 'newmodule:create', description: 'Create new module items' },
     // ... other CRUD operations
   ];
   ```

2. **Assign to appropriate roles**:
   ```typescript
   const pmPermissions = permissionRecords.filter((perm) =>
     [
       // ... existing permissions
       'newmodule:read',
       'newmodule:create',
       // ...
     ].includes(perm.name)
   );
   ```

3. **Run migration and seed**:
   ```bash
   npx prisma migrate dev --name add_newmodule_permissions
   npx prisma db seed
   ```

4. **Use in API routes**:
   ```typescript
   export const GET = hasPermission(
     async (request, context) => {
       // handler logic
     },
     'newmodule',
     'read'
   );
   ```

## Testing Permissions

Use the verification script to check permissions:

```bash
npx tsx verify-permissions.ts
```

This will display:
- All permissions grouped by module
- Permissions assigned to each role
- Total permission count per role
