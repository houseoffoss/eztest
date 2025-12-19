# hasPermission Wrapper - Clean Permission Checking Pattern

## Overview

The `hasPermission` wrapper is a higher-order function that simplifies API route permission checking by combining authentication, authorization, scope determination, and error handling in a single, clean pattern.

## Location

- **Implementation**: `lib/rbac/hasPermission.ts`
- **Export**: `lib/rbac/index.ts`

## Features

The wrapper automatically handles:
1. **Authentication** - Gets the current session user
2. **Authorization** - Checks if user has the required permission
3. **Scope Determination** - Sets 'all' for ADMIN, 'project' for others
4. **Request Enhancement** - Attaches userInfo and scopeInfo to request
5. **Error Handling** - Wraps with baseInterceptor for consistent error responses

## Usage Pattern

### Basic Syntax

```typescript
import { hasPermission } from '@/lib/rbac';

export const GET = hasPermission(
  async (request, context) => {
    // Your route logic here
    return response;
  },
  'module',   // e.g., 'projects', 'testcases'
  'action'    // e.g., 'read', 'create', 'update', 'delete'
);
```

### Before (Old Pattern - Verbose)

```typescript
import { getSessionUser } from '@/lib/auth/getSessionUser';
import { hasPermission } from '@/lib/rbac/hasPermission';
import { baseInterceptor } from '@/backend/utils/baseInterceptor';
import { NextRequest, NextResponse } from 'next/server';

export const GET = baseInterceptor(async (request: NextRequest) => {
  const user = await getSessionUser();
  
  if (!hasPermission(user, 'projects:read')) {
    return NextResponse.json(
      { error: 'Forbidden: Missing projects:read permission' },
      { status: 403 }
    );
  }

  const scope = user!.role.name === 'ADMIN' ? 'all' : 'project';

  const customRequest = Object.assign(request, {
    scopeInfo: { access: true, scope_name: scope },
    userInfo: {
      id: user!.id,
      email: user!.email,
      name: user!.name,
      role: user!.role.name,
    },
  });
  
  return projectController.listProjects(customRequest);
});
```

### After (New Pattern - Clean)

```typescript
import { hasPermission } from '@/lib/rbac';
import { projectController } from '@/backend/controllers/project/controller';

export const GET = hasPermission(
  async (request) => {
    return projectController.listProjects(request);
  },
  'projects',
  'read'
);
```

## Examples

### Example 1: Simple GET Route

```typescript
import { hasPermission } from '@/lib/rbac';
import { projectController } from '@/backend/controllers/project/controller';

/**
 * GET /api/projects
 * List all projects accessible to the current user
 * Required permission: projects:read
 */
export const GET = hasPermission(
  async (request) => {
    return projectController.listProjects(request);
  },
  'projects',
  'read'
);
```

### Example 2: POST Route with Body Processing

```typescript
import { hasPermission } from '@/lib/rbac';
import { projectController } from '@/backend/controllers/project/controller';

/**
 * POST /api/projects
 * Create a new project
 * Required permission: projects:create
 */
export const POST = hasPermission(
  async (request) => {
    return projectController.createProject(request);
  },
  'projects',
  'create'
);
```

### Example 3: Dynamic Route with Parameters

```typescript
import { hasPermission } from '@/lib/rbac';
import { projectController } from '@/backend/controllers/project/controller';

/**
 * GET /api/projects/[id]
 * Get project details with optional stats
 * Required permission: projects:read
 */
export const GET = hasPermission(
  async (request, context) => {
    const { id } = await context!.params;
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('stats') === 'true';
    
    return projectController.getProject(request, id, includeStats);
  },
  'projects',
  'read'
);
```

### Example 4: PUT Route with Dynamic ID

```typescript
import { hasPermission } from '@/lib/rbac';
import { projectController } from '@/backend/controllers/project/controller';

/**
 * PUT /api/projects/[id]
 * Update project information
 * Required permission: projects:update
 */
export const PUT = hasPermission(
  async (request, context) => {
    const { id } = await context!.params;
    return projectController.updateProject(request, id);
  },
  'projects',
  'update'
);
```

### Example 5: DELETE Route

```typescript
import { hasPermission } from '@/lib/rbac';
import { projectController } from '@/backend/controllers/project/controller';

/**
 * DELETE /api/projects/[id]
 * Delete a project
 * Required permission: projects:delete
 */
export const DELETE = hasPermission(
  async (request, context) => {
    const { id } = await context!.params;
    return projectController.deleteProject(request, id);
  },
  'projects',
  'delete'
);
```

## Request Enhancement

The wrapper automatically attaches the following to the request object:

### userInfo
```typescript
{
  id: string;        // User ID
  email: string;     // User email
  name: string;      // User name
  role: string;      // Role name: "ADMIN", "PROJECT_MANAGER", "TESTER", "VIEWER"
}
```

### scopeInfo
```typescript
{
  access: boolean;     // Always true (since permission was granted)
  scope_name: string;  // "all" for ADMIN, "project" for others
}
```

## Controller Access

Controllers and services can access this enhanced request:

```typescript
export const getProjects = async (request: CustomRequest) => {
  const { userInfo, scopeInfo } = request;
  
  // Use userInfo.id, userInfo.role, etc.
  // Use scopeInfo.scope_name for filtering
  
  if (scopeInfo.scope_name === 'all') {
    // Admin - access all projects
    return await projectService.getAllProjects();
  } else {
    // Non-admin - filter by user membership
    return await projectService.getProjectsByUserId(userInfo.id);
  }
};
```

## Permission Format

Permissions are constructed as: `module:action`

### Common Modules
- `projects`
- `testcases`
- `testruns`
- `testresults`
- `members`
- `settings`

### Common Actions
- `read` - View/retrieve data
- `create` - Create new records
- `update` - Modify existing records
- `delete` - Remove records
- `manage` - Full management access

### Examples
- `projects:read` - View projects
- `projects:create` - Create projects
- `testcases:update` - Update test cases
- `members:delete` - Remove members

## Error Responses

The wrapper automatically returns proper HTTP status codes:

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Forbidden: Insufficient permissions"
}
```

## Benefits

1. **Cleaner Code** - Reduces boilerplate from ~30 lines to ~7 lines per route
2. **Consistency** - Ensures all routes follow the same permission checking pattern
3. **Maintainability** - Changes to auth logic only need to be made in one place
4. **Type Safety** - Full TypeScript support with CustomRequest types
5. **Error Handling** - Automatic error handling via baseInterceptor
6. **Scope Management** - Automatic scope determination based on user role

## Migration Guide

To migrate existing routes to the new pattern:

1. **Replace imports:**
   ```typescript
   // Old
   import { getSessionUser } from '@/lib/auth/getSessionUser';
   import { hasPermission } from '@/lib/rbac/hasPermission';
   import { baseInterceptor } from '@/backend/utils/baseInterceptor';
   
   // New
   import { hasPermission } from '@/lib/rbac';
   ```

2. **Remove manual checks:**
   - Remove `getSessionUser()` call
   - Remove permission checking if statement
   - Remove scope determination logic
   - Remove manual request object construction

3. **Wrap handler with hasPermission:**
   ```typescript
   export const GET = hasPermission(
     async (request, context) => {
       // Your existing logic
     },
     'module',
     'action'
   );
   ```

4. **Update parameter extraction:**
   ```typescript
   // Old
   const { id } = context.params;
   
   // New (Next.js 15 - params are async)
   const { id } = await context!.params;
   ```

## Updated Routes

The following routes have been migrated to the new pattern:

1. `/app/api/projects/route.ts` - GET, POST
2. `/app/api/projects/[id]/route.ts` - GET, PUT, DELETE
3. `/app/api/testcases/[id]/route.ts` - GET, PUT, DELETE

## Technical Details

### Implementation
```typescript
export function hasPermission(
  apiMethod: BaseApiMethod<CustomRequest>,
  module: string,
  action: string
): BaseApiMethod<CustomRequest> {
  return baseInterceptor<CustomRequest>(async (request: NextRequest, context) => {
    // 1. Authenticate
    const user = await getSessionUser();
    if (!user) return 401;
    
    // 2. Authorize
    const permissionName = `${module}:${action}`;
    const hasAccess = checkPermission(user, permissionName);
    if (!hasAccess) return 403;
    
    // 3. Determine scope
    const scope = user.role.name === 'ADMIN' ? 'all' : 'project';
    
    // 4. Enhance request
    const customRequest = request as CustomRequest;
    customRequest.userInfo = { id, email, name, role };
    customRequest.scopeInfo = { access: true, scope_name: scope };
    
    // 5. Execute handler
    return apiMethod(customRequest, context);
  });
}
```

### Type Definitions
```typescript
interface CustomRequest extends NextRequest {
  scopeInfo: ScopeInfo;
  userInfo: UserInfo;
}

interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: string;
  orgId?: string;
}

interface ScopeInfo {
  access: boolean;
  scope_name: string;
}
```

## Related Documentation

- [RBAC Implementation](./AUTHORIZATION.md)
- [Permission System](./AUTHORIZATION_IMPLEMENTATION.md)
- [Base Interceptor](./CODE_PATTERNS.md)
- [Project API](./PROJECT_API.md)
