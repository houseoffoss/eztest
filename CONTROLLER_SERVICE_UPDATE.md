# Controller and Service Authorization Update

## Overview
Updated all controllers and services to work seamlessly with the new `hasPermission` authorization system. Removed redundant permission checks and implemented scope-based filtering.

## Key Changes

### 1. Controllers Updated
All controllers now:
- Accept `CustomRequest` instead of individual parameters (`userId`, `userRole`)
- Use `request.userInfo` and `request.scopeInfo` directly
- Remove redundant permission checks (handled by route wrappers)
- Focus on business logic rather than authorization

#### ProjectController Changes
**Before:**
```typescript
async listProjects(userId: string, userRole: UserRole) {
  const projects = await projectService.getAllProjects(userId, userRole);
  return NextResponse.json({ data: projects });
}
```

**After:**
```typescript
async listProjects(request: CustomRequest) {
  const projects = await projectService.getAllProjects(
    request.userInfo.id,
    request.scopeInfo.scope_name
  );
  return NextResponse.json({ data: projects });
}
```

**Methods Updated:**
- `listProjects(request)` - Uses scope for filtering
- `createProject(request)` - Uses request.userInfo.id
- `getProject(request, projectId, includeStats)` - Removed access check
- `updateProject(request, projectId)` - Removed permission check
- `deleteProject(request, projectId)` - Removed permission check
- `getProjectMembers(request, projectId)` - Removed access check
- `addProjectMember(request, projectId)` - Removed permission check
- `removeProjectMember(request, projectId, memberId)` - Removed permission check

#### TestCaseController Changes
**Before:**
```typescript
async getTestCaseById(testCaseId: string, userId: string, userRole: UserRole) {
  const hasAccess = await testCaseService.hasTestCaseAccess(testCaseId, userId, userRole);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }
  const testCase = await testCaseService.getTestCaseById(testCaseId);
  return NextResponse.json({ data: testCase });
}
```

**After:**
```typescript
async getTestCaseById(request: CustomRequest, testCaseId: string) {
  const testCase = await testCaseService.getTestCaseById(
    testCaseId,
    request.userInfo.id,
    request.scopeInfo.scope_name
  );
  return NextResponse.json({ data: testCase });
}
```

**Methods Updated:**
- `getProjectTestCases(request, projectId)` - Already correct
- `createTestCase(request, projectId)` - Uses request.userInfo.id
- `getTestCaseById(request, testCaseId)` - Removed access check
- `updateTestCase(request, testCaseId)` - Removed permission check
- `deleteTestCase(request, testCaseId)` - Removed permission check
- `updateTestSteps(request, testCaseId)` - Removed permission check

### 2. Services Updated
All services now:
- Use **scope-based filtering** (`'all'`, `'project'`, `'own'`) instead of `UserRole`
- Remove deprecated permission check methods
- Apply scope filtering in Prisma queries

#### ProjectService Changes

**Scope-Based Filtering:**
```typescript
async getAllProjects(userId: string, scope: string) {
  let whereClause: Record<string, unknown> = {
    isDeleted: false,
  };

  if (scope === 'own') {
    // Only projects created by this user
    whereClause = { ...whereClause, createdById: userId };
  } else if (scope === 'project') {
    // Only projects user is a member of
    whereClause = { ...whereClause, members: { some: { userId: userId } } };
  }
  // 'all' scope: no additional filtering (admin access)

  return await prisma.project.findMany({ where: whereClause, ... });
}
```

**Methods Updated:**
- `getAllProjects(userId, scope)` - Scope-based filtering
- `getProjectById(projectId, userId, scope, includeStats)` - Scope filtering added
- `deleteProject(projectId, userId, scope)` - Scope validation before deletion

**Methods Removed:**
- ❌ `hasProjectAccess()` - Replaced by scope filtering
- ❌ `canModifyProject()` - Replaced by route permission checks
- ❌ `canManageMembers()` - Replaced by route permission checks

**Methods Retained:**
- ✅ `getUserProjectRole()` - Kept for internal use

#### TestCaseService Changes

**Scope-Based Filtering:**
```typescript
async getTestCaseById(testCaseId: string, userId: string, scope: string) {
  let whereClause: Record<string, unknown> = { id: testCaseId };

  if (scope === 'own') {
    whereClause = { ...whereClause, createdById: userId };
  } else if (scope === 'project') {
    whereClause = {
      ...whereClause,
      project: { members: { some: { userId: userId } } }
    };
  }
  // 'all' scope: no additional filtering

  const testCase = await prisma.testCase.findFirst({ where: whereClause, ... });
  if (!testCase) {
    throw new Error('Test case not found or access denied');
  }
  return testCase;
}
```

**Methods Updated:**
- `getTestCaseById(testCaseId, userId, scope)` - Scope filtering added
- `updateTestCase(testCaseId, userId, scope, data)` - Scope validation added
- `deleteTestCase(testCaseId, userId, scope)` - Scope validation added
- `updateTestSteps(testCaseId, userId, scope, steps)` - Scope validation added

**Methods Removed:**
- ❌ `hasTestCaseAccess()` - Replaced by scope filtering
- ❌ `canModifyTestCase()` - Replaced by route permission checks

### 3. Routes Updated
All route handlers updated to pass `CustomRequest` directly:

**Before:**
```typescript
export const GET = hasPermission(
  async (request, { params }) => {
    const { id } = await params;
    return projectController.getProject(
      id,
      request.userInfo.id,
      request.userInfo.role,
      false
    );
  },
  'prn',
  'r'
);
```

**After:**
```typescript
export const GET = hasPermission(
  async (request, { params }) => {
    const { id } = await params;
    return projectController.getProject(request, id, false);
  },
  'prn',
  'r'
);
```

**Routes Updated:**
- ✅ `GET /api/projects` - Pass `request` only
- ✅ `POST /api/projects` - Pass `request` only
- ✅ `GET /api/projects/[id]` - Pass `request, id, includeStats`
- ✅ `PUT /api/projects/[id]` - Pass `request, id`
- ✅ `DELETE /api/projects/[id]` - Pass `request, id`
- ✅ `GET /api/projects/[id]/members` - Pass `request, id`
- ✅ `POST /api/projects/[id]/members` - Pass `request, id`
- ✅ `DELETE /api/projects/[id]/members/[memberId]` - Pass `request, id, memberId`
- ✅ `GET /api/projects/[id]/testcases` - Already correct
- ✅ `POST /api/projects/[id]/testcases` - Pass `request, projectId`
- ✅ `GET /api/testcases/[id]` - Pass `request, testCaseId`
- ✅ `PUT /api/testcases/[id]` - Pass `request, testCaseId`
- ✅ `DELETE /api/testcases/[id]` - Pass `request, testCaseId`
- ✅ `PUT /api/testcases/[id]/steps` - Pass `request, testCaseId`

## Scope Behavior

### Scope: 'all' (Admin Access)
- No filtering applied
- Returns all resources regardless of ownership or membership
- Typically granted to users with 'ADMIN' role

### Scope: 'project' (Team Member Access)
- Filters by project membership
- User must be a member of the project to access resources
- For modifications, may require specific project role (OWNER/ADMIN/TESTER)

### Scope: 'own' (Personal Access)
- Filters by resource creator
- User can only access resources they created
- Most restrictive scope

## Benefits

### 1. **Cleaner Code**
- Controllers focus on business logic
- No repetitive permission checks
- Consistent patterns across all endpoints

### 2. **Better Separation of Concerns**
- Authorization: Handled by routes (`hasPermission` wrapper)
- Business Logic: Handled by controllers
- Data Access: Handled by services with scope filtering

### 3. **More Secure**
- Single source of truth for authorization (route wrappers)
- Scope-based filtering prevents data leaks
- Database-level filtering ensures security

### 4. **Easier Maintenance**
- Changes to authorization logic only in one place
- Scope definitions centralized in RolePrivilege table
- Easy to add new scopes or modify existing ones

## Testing Checklist

- [ ] Test with 'admin' role (scope: 'all')
  - Should see all projects/test cases
  - Should be able to modify/delete any resource
  
- [ ] Test with 'project_manager' role (scope: 'project')
  - Should see only projects they're members of
  - Should be able to modify resources in their projects
  
- [ ] Test with 'tester' role (scope: 'own')
  - Should see only resources they created
  - Should only be able to modify their own resources
  
- [ ] Test with 'viewer' role (scope: 'project')
  - Should see projects they're members of
  - Should NOT be able to modify (write permission denied)

## Next Steps

1. **Run database migration** (if not already done):
   ```bash
   npx prisma migrate dev --name add_authorization_system
   ```

2. **Seed authorization data**:
   ```bash
   npm run db:seed
   ```

3. **Test API endpoints** with different user roles

4. **Monitor logs** for any authorization issues

5. **Update frontend** to handle 401/403 responses appropriately

## Migration Impact

### Breaking Changes
- ❌ Controller method signatures changed (accept `CustomRequest` instead of individual params)
- ❌ Service method signatures changed (accept `scope: string` instead of `userRole: UserRole`)

### No Breaking Changes
- ✅ API routes - Same endpoints, same responses
- ✅ Frontend - No changes needed to API calls
- ✅ Database - Only additions (new authorization tables)

## Files Modified

### Controllers
- `backend/controllers/project/controller.ts`
- `backend/controllers/testcase/controller.ts`

### Services
- `backend/services/project/services.ts`
- `backend/services/testcase/services.ts`

### Routes (Parameter Updates)
- `app/api/projects/route.ts`
- `app/api/projects/[id]/route.ts`
- `app/api/projects/[id]/members/route.ts`
- `app/api/projects/[id]/members/[memberId]/route.ts`
- `app/api/projects/[id]/testcases/route.ts`
- `app/api/testcases/[id]/route.ts`
- `app/api/testcases/[id]/steps/route.ts`

## Verification

All TypeScript compilation errors: ✅ **RESOLVED**
```
No errors found.
```

All files use consistent patterns: ✅ **CONFIRMED**
- Controllers use `CustomRequest`
- Services use scope-based filtering
- Routes pass `request` as first parameter
