# Why We Need Both User Roles and Project Membership

## Your Question
> "In this project why we need project role table we need to manage all using user role table is that possible?"

## The Answer: Yes, It's Now Simplified! ✅

We've **removed the `ProjectRole` enum** entirely and now use a cleaner system:

### What We Have Now

1. **User Roles (System-Level)**
   - Stored in `Role` table
   - User has one role via `User.roleId`
   - Defines what a user can do **across the application**
   - Examples: ADMIN, PROJECT_MANAGER, TESTER, VIEWER

2. **Project Membership (Project-Level)**
   - Stored in `ProjectMember` table (NO role field anymore)
   - Simply tracks: "Is this user a member of this project?"
   - Used to filter which projects a user can access

## Why We Still Need Both

### Scenario 1: Sarah the Tester

```
Sarah's System Role: TESTER
Sarah's Projects:
  - Project A (member) ✅ Can create test cases
  - Project B (member) ✅ Can create test cases  
  - Project C (NOT member) ❌ Cannot access at all
```

**Permission Check:**
```typescript
// 1. Check user's system role permission
if (!hasPermission(user, 'testcases:create')) {
  return 403; // Sarah has TESTER role, so this passes
}

// 2. Check project membership
const isMember = await prisma.projectMember.findUnique({
  where: { projectId_userId: { projectId, userId: sarah.id } }
});

if (!isMember) {
  return 403; // Sarah is not in Project C
}

// Both checks passed → Allow action
```

### Scenario 2: John the Project Manager

```
John's System Role: PROJECT_MANAGER
John's Projects:
  - Project X (member) ✅ Can manage everything
  - Project Y (member) ✅ Can manage everything
  - Project Z (NOT member) ❌ Cannot access
```

**Key Point:** Even though John is a PROJECT_MANAGER (high privilege), he still can't access projects he's not a member of.

### Scenario 3: Admin Override

```
Alice's System Role: ADMIN
Alice's Projects:
  - ANY PROJECT ✅ (Admins bypass membership checks)
```

**Implementation:**
```typescript
if (user.role.name === 'ADMIN') {
  // Admins can access all projects
  return getAllProjects();
} else {
  // Non-admins only see their projects
  return getUserProjects(userId);
}
```

## What Changed from Before

### ❌ Old System (Confusing)
```prisma
model User {
  role  UserRole  // System role: ADMIN, PROJECT_MANAGER, TESTER, VIEWER
}

model ProjectMember {
  role  ProjectRole  // Project role: OWNER, ADMIN, TESTER, VIEWER
}
```

**Problems:**
- Two separate role systems
- Confusing: What's the difference between USER.TESTER and PROJECT.TESTER?
- Hard to manage: Which role takes precedence?

### ✅ New System (Clear)
```prisma
model User {
  roleId  String  // FK to Role table
  role    Role    @relation(...)
}

model ProjectMember {
  // NO ROLE FIELD - just tracks membership
  userId    String
  projectId String
  joinedAt  DateTime
}
```

**Benefits:**
- Single source of truth: User's role defines permissions
- Project membership only controls access scope
- Clear separation: Role = "what can I do?", Membership = "where can I do it?"

## Real-World Example

### Managing a Test Case

```typescript
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();

  // Step 1: Check user's role permission
  if (!hasPermission(user, 'testcases:update')) {
    // User's role doesn't allow updating test cases
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  // Step 2: Check project membership
  const testCase = await prisma.testCase.findUnique({
    where: { id: params.id },
    include: { project: true }
  });

  const isMember = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId: testCase.project.id,
        userId: user.id
      }
    }
  });

  if (!isMember && user.role.name !== 'ADMIN') {
    // User is not a project member (and not an admin override)
    return NextResponse.json({ error: 'Not a project member' }, { status: 403 });
  }

  // Both checks passed → Update test case
  const updated = await prisma.testCase.update({
    where: { id: params.id },
    data: await req.json()
  });

  return NextResponse.json({ data: updated });
}
```

## Could We Use Only User Roles?

**Technically yes, but you'd lose multi-tenancy:**

### Without Project Membership
```
Every TESTER can access ALL test cases in the system ❌
No way to isolate projects from each other ❌
No privacy between different teams ❌
```

### With Project Membership
```
TESTERs only see test cases in THEIR projects ✅
Projects are isolated from each other ✅
Teams can work independently ✅
```

## The Two-Layer Model

```
Layer 1: Role Permissions (System-Wide)
├─ "What am I allowed to do?"
├─ ADMIN → Everything
├─ PROJECT_MANAGER → Manage projects and tests
├─ TESTER → Create and execute tests
└─ VIEWER → Read-only

Layer 2: Project Membership (Scope)
├─ "Where am I allowed to do it?"
├─ Member of Project A → Access granted
├─ Member of Project B → Access granted
└─ NOT member of Project C → Access denied
```

## Benefits of This Approach

1. **Flexibility**: Assign different roles without changing project memberships
2. **Security**: Users can only access their projects
3. **Scalability**: Easy to add new projects without affecting roles
4. **Clarity**: Role = permissions, Membership = scope
5. **Multi-tenancy**: Different teams can use the same system

## Summary

✅ **We simplified the system by removing `ProjectRole`**
✅ **We kept `ProjectMember` table for membership tracking**
✅ **User roles control permissions (what you can do)**
✅ **Project membership controls scope (where you can do it)**
✅ **This is standard SaaS multi-tenancy pattern**

## References

- [Complete RBAC Documentation](./RBAC.md)
- [Migration Guide](./RBAC_MIGRATION.md)
- [Implementation Summary](./RBAC_SUMMARY.md)
