# Member Management Access Control Implementation

## Overview

This document outlines the two-phase implementation of member management access control in the project members feature.

## Phase 1: Admin-Only Access (✅ Completed)

**Requirement**: Only ADMIN users can manage project members.

**Implementation**:
- Restricted the `projects:manage_members` permission to the ADMIN role only
- Updated API endpoints to check for admin permission using `hasPermission` middleware
- Hidden add/remove member buttons in UI for non-admin users
- See [TESTRUNS_REUSABLE_COMPONENTS.md](./TESTRUNS_REUSABLE_COMPONENTS.md) for initial implementation details

## Phase 2: Project Manager Access (✅ Completed)

**Requirement**: If a user is added as a PROJECT_MANAGER member to a project, they can manage members within that specific project.

### Key Implementation Details

#### 1. New Middleware: `hasProjectMemberAccess`
**Location**: `lib/rbac/hasProjectMemberAccess.ts`

**Logic**:
- Checks if user has the required permission (`projects:manage_members`)
- For ADMIN role: Allows access to any project
- For other roles (PROJECT_MANAGER): Checks project membership using `projectId_userId` composite key
- Returns 403 if not a member of the project

```typescript
// Permission check: User must have projects:manage_members
if (!hasPermission) return 403;

// Project membership check for non-admins
if (user.role !== 'ADMIN') {
  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: user.id } }
  });
  if (!membership) return 403;
}
```

#### 2. Permission Model Update
**Location**: `prisma/seed-rbac.ts`

**Changes**:
- Re-added `projects:manage_members` permission to PROJECT_MANAGER role
- Comment updated to: "(for their projects only)"
- TESTER and VIEWER roles do not have this permission

```typescript
// PROJECT_MANAGER permissions now include:
permissions: [
  'projects:read',
  'projects:manage_members',  // Can add/remove members from their projects
  // ... other permissions
]
```

#### 3. API Endpoint Updates

**POST /api/projects/[id]/members** (Add Member)
```typescript
export const POST = hasProjectMemberAccess(
  async (request, context) => {
    const { id } = context.params;
    return projectController.addProjectMember(request, id);
  },
  'projects',
  'manage_members'
);
```

**DELETE /api/projects/[id]/members/[memberId]** (Remove Member)
```typescript
export const DELETE = hasProjectMemberAccess(
  async (request, context) => {
    const { id, memberId } = context.params;
    return projectController.removeProjectMember(request, id, memberId);
  },
  'projects',
  'manage_members'
);
```

**GET /api/projects/[id]/members** (List Members)
- Continues to use `hasPermission` middleware
- Anyone with `projects:read` permission can view members
- No project membership check required for reading

#### 4. Frontend Component Updates

**File**: `app/projects/[id]/members/page.tsx`
- Changed permission check to include both ADMIN and PROJECT_MANAGER roles:
```typescript
const isAdminOrManager = 
  session?.user?.roleName === 'ADMIN' || 
  session?.user?.roleName === 'PROJECT_MANAGER';
```

**Components Updated**:
- `frontend/components/members/ProjectMembers.tsx` - Main component
- `frontend/components/members/subcomponents/MembersHeader.tsx` - Header with add button
- `frontend/components/members/subcomponents/MembersCard.tsx` - Member list

**UI Changes**:
- Add Member button now visible for PROJECT_MANAGER members
- Updated help text: "Project managers and admins can manage members"
- Delete button now available for PROJECT_MANAGER members

## Access Control Matrix

| Role | Can Add Members | Can Remove Members | Scope |
|------|---|---|---|
| ADMIN | ✅ Yes | ✅ Yes | All projects |
| PROJECT_MANAGER | ✅ Yes | ✅ Yes | Only if project member |
| TESTER | ❌ No | ❌ No | N/A |
| VIEWER | ❌ No | ❌ No | N/A |

## Database Schema

**ProjectMember Table**:
```typescript
model ProjectMember {
  id        String    @id @default(cuid())
  projectId String    // Foreign key to Project
  userId    String    // Foreign key to User
  role      String    // Project-specific role (ADMIN, PROJECT_MANAGER, VIEWER, etc.)
  joinedAt  DateTime  @default(now())
  
  @@unique([projectId, userId])  // Ensures one membership per user per project
}
```

**Composite Key Usage**:
```typescript
// Efficient lookup of single project membership
const membership = await prisma.projectMember.findUnique({
  where: {
    projectId_userId: {
      projectId: "proj_123",
      userId: "user_456"
    }
  }
});
```

## Testing Checklist

- [ ] ADMIN can add/remove members to any project
- [ ] ADMIN can manage members for projects they're not members of
- [ ] PROJECT_MANAGER can add/remove members to projects they're members of
- [ ] PROJECT_MANAGER cannot add/remove members to projects they're NOT members of (API returns 403)
- [ ] TESTER cannot add/remove members (API returns 403, no UI buttons)
- [ ] VIEWER cannot add/remove members (API returns 403, no UI buttons)
- [ ] Non-members can view members list if they have `projects:read` permission
- [ ] Add Member button appears for ADMIN and PROJECT_MANAGER members
- [ ] Delete buttons appear for ADMIN and PROJECT_MANAGER members
- [ ] Correct error messages on unauthorized access

## Security Considerations

1. **Server-Side Validation**: The `hasProjectMemberAccess` middleware enforces access control at the API level, not relying on frontend validation alone
2. **Composite Key Lookup**: Using the unique composite key `(projectId, userId)` ensures efficient and secure membership verification
3. **Role Check First**: Permission is checked before project membership to fail fast
4. **ADMIN Override**: Admin users bypass project membership checks but still need the permission
5. **Scope Tracking**: The `scopeInfo` distinguishes between admin access ("all") and member access ("project")

## Migration Notes

When deploying Phase 2:

1. **No database changes required**: The ProjectMember table already exists with the composite key
2. **Seed file execution**: Run `npm run seed` to update role permissions
3. **Frontend updates**: Deploy updated component files
4. **API updates**: Deploy new middleware and route changes
5. **No breaking changes**: Existing ADMIN access continues to work unchanged

## Related Files

- `lib/rbac/hasPermission.ts` - Original permission middleware (still used for GET)
- `lib/rbac/hasProjectMemberAccess.ts` - NEW project membership middleware
- `lib/rbac/index.ts` - Exports both middleware functions
- `backend/utils/baseInterceptor.ts` - Base middleware wrapper
- `backend/controllers/project/controller.ts` - Project controller methods
