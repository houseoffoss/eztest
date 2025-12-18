# Admin-Only Project Member Management

## Overview

This document describes the implementation that restricts project member management to ADMIN users only. Non-admin users (PROJECT_MANAGER, TESTER, VIEWER) cannot add or remove members from projects.

## Changes Made

### 1. Permission Model (Backend)
**File:** `prisma/seed-rbac.ts`

- **Removed** `projects:manage_members` permission from:
  - PROJECT_MANAGER role
  - TESTER role
  
- **Retained** `projects:manage_members` permission for:
  - ADMIN role (only)

**Impact:**
- Only ADMIN users have the `projects:manage_members` permission
- API endpoint `/api/projects/[id]/members` with POST/DELETE methods now enforces this permission
- PROJECT_MANAGER and TESTER cannot call add/remove member endpoints (will receive 403 Forbidden)

### 2. Frontend Implementation

#### File: `app/projects/[id]/members/page.tsx`
- Added `useSession()` hook to get current user's role
- Added `isAdmin` check: `const isAdmin = session?.user?.roleName === 'ADMIN'`
- Conditionally render "Add Member" button - only visible to ADMIN users
- Conditionally render "Remove Member" (trash icon) button - only visible to ADMIN users
- Added helpful message: "Waiting for admin to add members" when no members and user is not admin
- Added note in page header: "(Admin only can manage members)" for non-admin users

#### File: `frontend/components/members/ProjectMembers.tsx`
- Added `useSession()` hook
- Added `isAdmin` prop passed to subcomponents
- Passes `isAdmin` to `MembersHeader` and `MembersCard` components

#### File: `frontend/components/members/subcomponents/MembersHeader.tsx`
- Updated to accept `isAdmin` prop
- Conditionally renders "Add Member" button
- Displays note for non-admin users

#### File: `frontend/components/members/subcomponents/MembersCard.tsx`
- Updated to accept `isAdmin` prop
- Conditionally renders "Add First Member" button
- Conditionally renders remove (trash) buttons for members
- Displays appropriate empty state message based on admin status

## User Experience

### For ADMIN Users:
- ✅ Can view all project members
- ✅ Can add new members to projects
- ✅ Can remove members from projects
- ✅ See full UI with Add and Remove buttons

### For PROJECT_MANAGER Users:
- ✅ Can view all project members
- ❌ Cannot add new members (button hidden, API will reject)
- ❌ Cannot remove members (button hidden, API will reject)
- ℹ️ See message: "(Admin only can manage members)"
- ℹ️ Empty state shows: "Waiting for admin to add members"

### For TESTER Users:
- ✅ Can view all project members
- ❌ Cannot add new members (button hidden, API will reject)
- ❌ Cannot remove members (button hidden, API will reject)
- ℹ️ Same restrictions as PROJECT_MANAGER

### For VIEWER Users:
- ✅ Can view all project members
- ❌ Cannot add new members (button hidden, API will reject)
- ❌ Cannot remove members (button hidden, API will reject)
- ℹ️ Same restrictions as PROJECT_MANAGER

## Project Visibility

**Current behavior (unchanged):**
- Projects are only visible to:
  - Users who are project members
  - ADMIN users (see all projects)

**Non-members cannot see projects** unless:
- They are added as a member (by ADMIN)
- They are an ADMIN user

## API Security

The backend enforces these rules via the `hasPermission` middleware:

```typescript
// POST /api/projects/[id]/members - Add member
export const POST = hasPermission(
  async (request, context) => {
    const { id } = context.params;
    return projectController.addProjectMember(request, id);
  },
  'projects',
  'manage_members'  // Only ADMIN has this permission
);

// DELETE /api/projects/[id]/members/[memberId] - Remove member
export const DELETE = hasPermission(
  async (request, context) => {
    const { id, memberId } = context.params;
    return projectController.removeProjectMember(request, id, memberId);
  },
  'projects',
  'manage_members'  // Only ADMIN has this permission
);
```

Even if a non-admin user tries to access these endpoints directly, they will receive a **403 Forbidden** response.

## Testing

To verify this implementation:

1. **As ADMIN User:**
   - Navigate to project members page
   - Verify "Add Member" button is visible
   - Verify remove buttons (trash icons) are visible on each member

2. **As PROJECT_MANAGER/TESTER/VIEWER User:**
   - Navigate to project members page
   - Verify "Add Member" button is NOT visible
   - Verify remove buttons (trash icons) are NOT visible
   - Verify message indicates admin-only access

3. **API Testing:**
   - Try to POST to `/api/projects/[id]/members` as non-admin
   - Expect: 403 Forbidden response
   - Try to DELETE `/api/projects/[id]/members/[memberId]` as non-admin
   - Expect: 403 Forbidden response

## Database Seed

Before these changes take effect in production, run:

```bash
npx prisma db seed
```

This will:
1. Update the ADMIN role with all permissions (including manage_members)
2. Update PROJECT_MANAGER role (remove manage_members permission)
3. Update TESTER role (remove manage_members permission)
4. Leave VIEWER role unchanged

## Summary

✅ **Admin-Only Control:** Only ADMIN users can add/remove project members
✅ **Project Isolation:** Non-members cannot see projects (except ADMINs)
✅ **API Security:** Backend enforces permissions via hasPermission middleware
✅ **UX Clarity:** Frontend hides buttons and shows helpful messages
✅ **Safe Defaults:** Non-admin users cannot modify project membership
