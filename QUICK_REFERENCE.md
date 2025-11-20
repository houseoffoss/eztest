# Quick Reference: Admin-Only Member Management

## What Changed?

### ✅ Project Visibility (No Change - Already Working)
- Projects are only visible to members + ADMIN users
- Non-members cannot see projects

### 🔒 Member Management (NEW RESTRICTION)
- **ONLY ADMIN** can add/remove project members
- PROJECT_MANAGER, TESTER, VIEWER can only **view** members

## File Changes

| File | Change |
|------|--------|
| `prisma/seed-rbac.ts` | Removed `projects:manage_members` from PM & TESTER |
| `app/projects/[id]/members/page.tsx` | Added role check, conditional buttons |
| `frontend/components/members/ProjectMembers.tsx` | Added `useSession()` and isAdmin prop |
| `frontend/components/members/subcomponents/MembersHeader.tsx` | Conditional "Add Member" button |
| `frontend/components/members/subcomponents/MembersCard.tsx` | Conditional "Add First Member" and remove buttons |

## Key Code Patterns

### Check if user is ADMIN
```typescript
const { data: session } = useSession();
const isAdmin = session?.user?.roleName === 'ADMIN';
```

### Conditionally render button
```typescript
{isAdmin && (
  <Button onClick={onAddMember}>Add Member</Button>
)}
```

## Permission Matrix

| Action | ADMIN | PROJECT_MANAGER | TESTER | VIEWER |
|--------|:-----:|:---------------:|:------:|:------:|
| View projects | ✅ | ✅* | ✅* | ✅* |
| Create project | ✅ | ✅ | ✅ | ❌ |
| Update project | ✅ | ✅* | ✅* | ❌ |
| Delete project | ✅ | ❌ | ❌ | ❌ |
| **View members** | ✅ | ✅* | ✅* | ✅* |
| **Add members** | ✅ | ❌ | ❌ | ❌ |
| **Remove members** | ✅ | ❌ | ❌ | ❌ |

*Only for projects they're members of (except ADMIN who sees all)

## Running Seeds

To apply permission changes to database:

```bash
npx prisma db seed
```

## API Responses

### Non-Admin Adding Member
**Request:** POST `/api/projects/[id]/members`
```json
{
  "email": "user@example.com",
  "role": "TESTER"
}
```

**Response:** 
```json
{
  "statusCode": 403,
  "success": false,
  "message": "Forbidden: Insufficient permissions"
}
```

### Admin Adding Member (Success)
**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "id": "member_id",
    "projectId": "project_id",
    "userId": "user_id",
    "joinedAt": "2025-11-20T10:00:00Z"
  }
}
```

## Testing Commands

### Test non-admin cannot add member
```bash
curl -X POST http://localhost:3000/api/projects/[projectId]/members \
  -H "Content-Type: application/json" \
  -b "sessionToken=..." \
  -d '{"email": "test@example.com", "role": "TESTER"}'
# Expected: 403 Forbidden (if not ADMIN)
```

### Test admin can add member
```bash
curl -X POST http://localhost:3000/api/projects/[projectId]/members \
  -H "Content-Type: application/json" \
  -b "sessionToken=..." \
  -d '{"email": "test@example.com", "role": "TESTER"}'
# Expected: 201 Created (if ADMIN)
```

## User Experience

### ADMIN Sees This
![ADMIN View]
- "Add Member" button at top
- Trash icons on each member
- Can click to add/remove

### PROJECT_MANAGER/TESTER Sees This
![PM View]
- NO "Add Member" button
- NO trash icons
- Message: "(Admin only can manage members)"
- Empty state: "Waiting for admin to add members"

## Deployment Checklist

- [ ] Pull code changes
- [ ] Run `npx prisma db seed`
- [ ] Restart application
- [ ] Test as ADMIN - add/remove members works
- [ ] Test as PROJECT_MANAGER - no buttons shown
- [ ] Test API directly - 403 for non-admin
- [ ] Verify projects still hidden from non-members

---

**Status:** ✅ Implementation Complete
**Ready for:** Deployment
**Testing:** Required before production
