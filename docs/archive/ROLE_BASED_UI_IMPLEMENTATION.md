# Role-Based UI Implementation - Complete Guide

## Overview
This document provides a comprehensive overview of the role-based authorization UI implementation across the EZTest application, including button visibility, user selection, and member management.

## Completed Implementations

### 1. Permission Checking Hook (`hooks/usePermissions.ts`)

**Purpose**: Client-side permission checking hook for React components

**Key Features**:
- ✅ Gets permissions directly from NextAuth session (no API call)
- ✅ Provides `hasPermission()` and `hasAnyPermission()` helper methods
- ✅ Instant access to permissions (no loading delay)
- ✅ Returns user role and loading state
- ✅ Full TypeScript support

**How It Works**:
Permissions are stored in the NextAuth session during login and fetched fresh from the database. The hook reads them directly from `session.user.permissions[]` without making any API calls.

**Usage**:
```tsx
const { permissions, role, isLoading, hasPermission, hasAnyPermission } = usePermissions();

if (hasPermission('projects:create')) {
  // Render "Create Project" button
}
```

**Permissions Available**:
- `projects:create` - Create new projects
- `projects:read` - View projects
- `projects:update` - Update project details
- `projects:delete` - Delete projects
- `projects:manage_members` - Add/remove project members
- `users:read` - View user information
- `testsuites:*` - Test suite operations
- `testcases:*` - Test case operations
- `testruns:*` - Test run operations

### 2. Session-Based Permissions (`lib/auth.ts` & `types/next-auth.d.ts`)

**Purpose**: Store and manage permissions in NextAuth session

**How It Works**:
- Permissions fetched once during JWT callback (at login)
- Stored in JWT token and extended to session
- Available on `session.user.permissions[]`
- No API calls needed during component rendering

**Implementation**:
```typescript
// JWT callback fetches permissions from database
const dbUser = await prisma.user.findUnique({
  where: { id: user.id },
  include: {
    role: {
      include: {
        permissions: {
          include: { permission: { select: { name: true } } }
        }
      }
    }
  }
});

token.permissions = dbUser?.role.permissions?.map(rp => rp.permission.name) || [];
```

**Session Type Extensions**:
```typescript
interface Session {
  user: {
    id: string;
    roleName: string;
    permissions: string[];  // ← New field
  } & DefaultSession['user'];
}
```

**Benefits**:
- ✅ Zero API calls for permission checks
- ✅ Instant access to permissions
- ✅ No loading delays in components
- ✅ Fresh permissions on each login
- ✅ Secure JWT-backed storage

### 3. Project List Page (`frontend/components/project/ProjectList.tsx`)

**Updates**:
- ✅ Integrated `usePermissions` hook
- ✅ Conditionally renders "New Project" button based on `projects:create` permission
- ✅ VIEWER role hidden from "Create Project" action

**Button Visibility Logic**:
```tsx
{hasPermission('projects:create') && (
  <Button onClick={() => setCreateDialogOpen(true)} variant="glass-primary">
    <Plus className="w-4 h-4 mr-2" />
    New Project
  </Button>
)}
```

### 4. Project Card Component (`frontend/components/project/subcomponents/ProjectCard.tsx`)

**Purpose**: Individual project display with role-based dropdown menu

**Props**:
- `canUpdate: boolean` - Show "Settings" option
- `canDelete: boolean` - Show "Delete" option
- `canManageMembers: boolean` - Show "Manage Members" option

**Dropdown Menu Items** (Conditional):
1. ✅ "Open Project" - Always available
2. ✅ "Settings" - Only if `canUpdate=true`
3. ✅ "Manage Members" - Only if `canManageMembers=true`
4. ✅ "Delete" - Only if `canDelete=true`

**Styling**:
- Glass effect background
- Left blue border: `border-l-4 border-l-primary/30`
- Hover shadow effect
- Smooth transitions

### 5. Empty Projects State (`frontend/components/project/subcomponents/EmptyProjectsState.tsx`)

**Updates**:
- ✅ Removed dotted border (was: `border-2 border-dashed`)
- ✅ Now uses normal card styling
- ✅ Added permission-based button visibility

**Button Visibility**:
- **If user has `projects:create` permission**:
  - Shows: "Create Your First Project" button
  - Message: "Get started by creating your first project"

- **If user does NOT have permission**:
  - Shows: No button
  - Message: "Contact your administrator to create a project"

**Styling**:
- Clean glass card without left border
- Centered empty state layout
- Consistent with other empty states in app

### 6. Project Members Management (`app/projects/[id]/members/page.tsx`)

**Features**:
- ✅ Only PROJECT_MANAGER and ADMIN roles can add/remove members
- ✅ Removed role input field (application-level roles)
- ✅ Integrated `SearchableUserSelect` component
- ✅ Excludes current project members from selection
- ✅ Orange hover effect on dropdown items

**Integration**:
```tsx
<SearchableUserSelect
  label="Select User Email *"
  placeholder="Search by email or name..."
  helperText="Start typing to search for unassigned users"
  onUserSelect={handleSelectUser}
  excludeUserIds={members.map(m => m.user.id)}
  disabled={adding}
  value={formData.userId}
/>
```

**Page Layout**:
1. Header with project name
2. "Add Member" button (visible only to managers/admins)
3. Team members list with:
   - User name and email
   - Project role badge
   - Application role badge
   - Join date
   - Remove button (managers/admins only)
4. Empty state when no members

### 7. Searchable User Select Component (`components/design/SearchableUserSelect.tsx`)

**Purpose**: Reusable component for selecting users with real-time search

**Key Features**:
- ✅ Real-time search by email and name
- ✅ Filters out specified user IDs
- ✅ Orange hover effect: `hover:bg-orange-500/20`
- ✅ No gap between input and dropdown
- ✅ Callback-based architecture
- ✅ Full TypeScript support

**Props**:
- `label?: string` - Input label
- `placeholder?: string` - Search placeholder
- `helperText?: string` - Helper text below input
- `onUserSelect: (user: User) => void` - Selection callback
- `excludeUserIds?: string[]` - Users to exclude
- `disabled?: boolean` - Disable state
- `value?: string` - Current value

**Usage Example**:
```tsx
<SearchableUserSelect
  onUserSelect={(user) => setFormData({ email: user.email, userId: user.id })}
  excludeUserIds={currentMembers.map(m => m.user.id)}
/>
```

**Styling Details**:
- Dark theme: `bg-[#1a2332]`
- Subtle borders: `border-white/10`
- Orange hover: `hover:bg-orange-500/20`
- Smooth transitions: `transition-colors`
- Proper z-index: `z-50`

### 8. Users API Endpoint (`app/api/users/route.ts`)

**Updates**:
- ✅ Now allows PROJECT_MANAGER and TESTER access (in addition to ADMIN)
- ✅ Filters sensitive data based on role

**Access Control**:
- **ADMIN**: Full user data (name, email, avatar, role)
- **PROJECT_MANAGER / TESTER**: Minimal data (id, name, email, avatar)
- **Others**: 403 Forbidden

**Response Format**:
```json
{
  "data": [
    {
      "id": "user-123",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "https://..."
    }
  ]
}
```

## Authorization Matrix

### Role Permissions

| Permission | ADMIN | PROJECT_MANAGER | TESTER | VIEWER |
|-----------|-------|-----------------|--------|--------|
| projects:create | ✅ | ✅ | ❌ | ❌ |
| projects:read | ✅ | ✅ | ✅ | ✅ |
| projects:update | ✅ | ✅ | ❌ | ❌ |
| projects:delete | ✅ | ❌ | ❌ | ❌ |
| projects:manage_members | ✅ | ✅ | ❌ | ❌ |
| testsuites:* | ✅ | ✅ | ✅ | ❌ |
| testcases:* | ✅ | ✅ | ✅ | ❌ |
| testruns:* | ✅ | ✅ | ✅ | ❌ |
| users:read | ✅ | ✅ | ✅ | ❌ |

### Button Visibility by Role

**Project Page**:
- "New Project" button: ADMIN, PROJECT_MANAGER only
- Project dropdown menu: All roles can see "Open Project"
  - "Settings": ADMIN, PROJECT_MANAGER only
  - "Manage Members": ADMIN, PROJECT_MANAGER only
  - "Delete": ADMIN only

**Empty State**:
- Create button: ADMIN, PROJECT_MANAGER only
- Admin message: VIEWER

**Project Members Page**:
- "Add Member" button: ADMIN, PROJECT_MANAGER only
- Remove member button: ADMIN, PROJECT_MANAGER only

## Component Hierarchy

```
App Layout
├── Navigation
├── Project List Page
│   ├── "New Project" Button (permission-gated)
│   ├── Project Grid
│   │   ├── Project Card (per project)
│   │   │   └── Dropdown Menu (conditional items)
│   │   └── Empty Projects State (conditional button)
│   └── Delete Project Dialog
├── Project Details Page
│   └── Project Members Page
│       ├── "Add Member" Button (permission-gated)
│       ├── SearchableUserSelect Component
│       │   ├── Input Field
│       │   └── Dropdown Menu
│       ├── Members List
│       │   └── Member Cards (remove button per-card)
│       └── Delete Member Dialog
```

## Data Flow

### Permission Check Flow (Optimized)
```
User Logs In
  ↓
JWT Callback: Fetch permissions from DB
  ↓
Store permissions in JWT token
  ↓
Session created with permissions
  ↓
Component renders
  ↓
usePermissions Hook (reads from session)
  ↓
Check: session.user.permissions.includes('permission')
  ↓
Return result instantly (no API call)
  ↓
Conditional Rendering
```

**Performance**: No API calls needed - permissions available immediately from session

### User Selection Flow
```
SearchableUserSelect Component
  ↓
Fetch /api/users (on mount)
  ↓
Filter excludeUserIds + search input
  ↓
Display filtered dropdown
  ↓
User selects item
  ↓
Call onUserSelect callback
  ↓
Parent handles selection (update form state)
  ↓
Submit form with userId
  ↓
Backend creates project member
```

## Testing Scenarios

### Test Case 1: VIEWER Role Project Access
**Setup**: Log in as VIEWER
**Expected**:
- ✅ Project list visible
- ❌ "New Project" button hidden
- ✅ Project cards visible (read-only)
- ✅ Project dropdown menu shows only "Open Project"
- ✅ Empty state shows "Contact admin" message
- ✅ No "Add Member" button on project members page

### Test Case 2: PROJECT_MANAGER Full Access
**Setup**: Log in as PROJECT_MANAGER
**Expected**:
- ✅ "New Project" button visible
- ✅ Project dropdown shows Settings, Manage Members, Delete
- ✅ Can add/remove members
- ✅ SearchableUserSelect filters members correctly
- ✅ Orange hover on dropdown items

### Test Case 3: ADMIN Full Access
**Setup**: Log in as ADMIN
**Expected**:
- ✅ All buttons visible
- ✅ All project dropdown options available
- ✅ Can manage all members
- ✅ Full API access for user selection

### Test Case 4: SearchableUserSelect Functionality
**Setup**: Project with existing members
**Expected**:
- ✅ Input filters users by email/name
- ✅ Excluded users don't appear in dropdown
- ✅ Orange hover effect on items
- ✅ No gap between input and dropdown
- ✅ Dropdown closes on selection
- ✅ Form data updates on selection

## Files Modified/Created

### Created Files
1. ✅ `hooks/usePermissions.ts` - Permission checking hook (reads from session)
2. ✅ `components/design/SearchableUserSelect.tsx` - Reusable user selection component

### Modified Files
1. ✅ `lib/auth.ts` - Updated JWT and session callbacks to store permissions
2. ✅ `types/next-auth.d.ts` - Extended Session and JWT types with permissions field
3. ✅ `frontend/components/project/ProjectList.tsx` - Permission checks
4. ✅ `frontend/components/project/subcomponents/ProjectCard.tsx` - Conditional menu
5. ✅ `frontend/components/project/subcomponents/EmptyProjectsState.tsx` - Permission-based UI
6. ✅ `app/projects/[id]/members/page.tsx` - Integrated SearchableUserSelect
7. ✅ `app/api/users/route.ts` - Access control for PROJECT_MANAGER

## Styling Reference

### Colors Used
- **Primary**: Blue (`primary`, `primary/30`)
- **Accent**: Orange (`orange-500/20` for hover)
- **Muted**: `white/60`, `white/50`, `white/10`
- **Background**: `bg-[#1a2332]` (dark)

### Glass Effect Classes
- `variant="glass"` - Neutral glass style
- `variant="glass-primary"` - Blue-tinted glass
- `variant="glass-destructive"` - Red-tinted glass

### Responsive Breakpoints
- All components use `max-w-6xl` container
- Padding: `px-8 py-8`
- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`

## Future Enhancements

### Phase 2
1. **Project-Level Roles**: Add custom roles per project (Project Lead, Senior Tester, etc.)
2. **Role Inheritance**: Allow role-based permission cascading
3. **Bulk User Assignment**: Select multiple users for member assignment
4. **User Invitations**: Send email invitations to non-registered users

### Phase 3
1. **Permission Caching**: Implement Redis caching for permissions
2. **Audit Logging**: Track all permission-based UI access
3. **Dynamic Role Creation**: Allow admins to create custom roles
4. **Permission Delegation**: Allow roles to delegate permissions temporarily

## Troubleshooting

### Issue: "New Project" button not visible
**Solution**: 
1. Check user role in database (should have `projects:create` permission)
2. Verify `/api/auth/permissions` returns correct permissions
3. Clear browser cache and session
4. Check `hasPermission()` is being called correctly

### Issue: SearchableUserSelect dropdown not showing
**Solution**:
1. Verify `/api/users` endpoint is accessible
2. Check that `searchInput` has a value
3. Ensure `excludeUserIds` array is properly formatted
4. Check browser console for API errors

### Issue: Orange hover not showing
**Solution**:
1. Verify Tailwind CSS is properly configured
2. Check `hover:bg-orange-500/20` class is applied
3. Ensure dark theme isn't overriding hover styles
4. Check element z-index and positioning

## Related Documentation
- `docs/AUTHORIZATION_AND_ROLES.md` - Role system overview
- `docs/RBAC_PERMISSIONS.md` - Permission definitions
- `docs/ARCHITECTURE.md` - System architecture

## Quick Reference: Component Usage

### Using usePermissions Hook
```tsx
'use client';
import { usePermissions } from '@/hooks/usePermissions';

export function MyComponent() {
  const { hasPermission, permissions, role, isLoading } = usePermissions();

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      {hasPermission('projects:create') && (
        <button>Create Project</button>
      )}
    </>
  );
}
```

### Direct Session Access
```tsx
'use client';
import { useSession } from 'next-auth/react';

export function MyComponent() {
  const { data: session } = useSession();
  
  if (session?.user?.permissions?.includes('projects:create')) {
    return <button>Create Project</button>;
  }
}
```

### Using SearchableUserSelect
```tsx
<SearchableUserSelect
  label="Select User Email *"
  onUserSelect={(user) => {
    setFormData({ email: user.email, userId: user.id });
  }}
  excludeUserIds={currentMembers.map(m => m.user.id)}
/>
```
