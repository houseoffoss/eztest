# Step-by-Step Migration Guide

## Prerequisites
- ✅ Prisma Client generated (already done)
- ✅ All new files created
- ✅ No TypeScript compilation errors

## Step 1: Create Database Migration

```bash
npx prisma migrate dev --name add_authorization_system
```

This will:
- Create migration files in `prisma/migrations/`
- Apply the migration to your database
- Add tables: Role, Module, Action, Scope, RolePrivilege

## Step 2: Update Seed File

Open `prisma/seed.ts` and add:

```typescript
import { seedAuthorizationSystem } from './seed-auth';

async function main() {
  // Add this at the beginning
  await seedAuthorizationSystem();
  
  // ... your existing seed code
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

## Step 3: Run Seed

```bash
npm run db:seed
```

This populates:
- 4 Roles (admin, project_manager, tester, viewer)
- 4 Modules (prn, tc, tr, usr)
- 4 Actions (r, w, u, d)
- 3 Scopes (all, project, own)
- Role privileges for each role

## Step 4: Update User Model (Optional)

If your User model stores role as enum (UserRole), you have two options:

### Option A: Keep existing enum, map in checkScopeAccess
Add mapping function in `backend/helpers/checkScopeAccess.ts`:

```typescript
function mapUserRoleToKeyword(role: string): string {
  const mapping: Record<string, string> = {
    'ADMIN': 'admin',
    'PROJECT_MANAGER': 'project_manager',
    'TESTER': 'tester',
    'VIEWER': 'viewer'
  };
  return mapping[role] || role.toLowerCase();
}

export async function checkScopeAccess(
  roleName: string,
  module_name: string,
  action: string
): Promise<ScopeInfo> {
  try {
    const mappedRole = mapUserRoleToKeyword(roleName);
    // ... rest of the function using mappedRole
```

### Option B: Change User role to string
Update `prisma/schema.prisma`:

```prisma
model User {
  // ... other fields
  role String @default("tester")
  // Remove: role UserRole @default(TESTER)
}
```

Then migrate:
```bash
npx prisma migrate dev --name change_user_role_to_string
```

## Step 5: Migrate API Routes

### Example Migration

**Before (old pattern):**
```typescript
// app/api/projects/route.ts
import { authenticateRequest, requireRoles } from '@/lib/auth-middleware';

export async function GET() {
  const auth = await authenticateRequest();
  if (auth.error) return auth.error;
  
  const projects = await projectController.listProjects(
    auth.session.user.id,
    auth.session.user.role
  );
  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  const auth = await requireRoles(['ADMIN', 'PROJECT_MANAGER', 'TESTER']);
  if (auth.error) return auth.error;
  
  return projectController.createProject(request, auth.session.user.id);
}
```

**After (new pattern):**
```typescript
// app/api/projects/route.ts
import { hasPermission } from '@/lib/auth';
import { projectController } from '@/backend/controllers/project/controller';

export const GET = hasPermission(
  async (request) => {
    const projects = await projectController.listProjects(
      request.userInfo.id,
      request.userInfo.role
    );
    return NextResponse.json(projects);
  },
  'prn', // projects module
  'r'    // read permission
);

export const POST = hasPermission(
  async (request) => {
    return projectController.createProject(request, request.userInfo.id);
  },
  'prn', // projects module
  'w'    // write permission
);
```

### Routes to Migrate

1. `app/api/projects/route.ts`
2. `app/api/projects/[id]/route.ts`
3. `app/api/testcases/route.ts`
4. `app/api/testcases/[id]/route.ts`
5. Any other protected API routes

## Step 6: Test with Different Roles

### Create Test Users

```typescript
// In seed file or admin script
const testUsers = [
  { email: 'admin@test.com', role: 'admin' },
  { email: 'pm@test.com', role: 'project_manager' },
  { email: 'tester@test.com', role: 'tester' },
  { email: 'viewer@test.com', role: 'viewer' }
];

for (const user of testUsers) {
  await prisma.user.create({
    data: {
      ...user,
      name: user.email.split('@')[0],
      password: await bcrypt.hash('password123', 10)
    }
  });
}
```

### Test Scenarios

1. **Admin User**
   - ✅ Can read projects
   - ✅ Can create projects
   - ✅ Can update projects
   - ✅ Can delete projects

2. **Project Manager**
   - ✅ Can read projects
   - ✅ Can create projects
   - ✅ Can update projects
   - ❌ Cannot delete projects

3. **Tester**
   - ✅ Can read projects
   - ❌ Cannot create projects
   - ❌ Cannot update projects
   - ❌ Cannot delete projects

4. **Viewer**
   - ✅ Can read projects
   - ❌ Cannot create projects
   - ❌ Cannot update projects
   - ❌ Cannot delete projects

## Step 7: Implement Scope-Based Filtering

Update controllers to respect scope:

```typescript
// backend/controllers/project/controller.ts
async listProjects(userId: string, scope: string) {
  if (scope === 'all') {
    // Admin - see all projects
    return await prisma.project.findMany({
      where: { isDeleted: false }
    });
  } else if (scope === 'project') {
    // Team member - see projects they're part of
    return await prisma.project.findMany({
      where: {
        isDeleted: false,
        members: {
          some: { userId }
        }
      }
    });
  } else {
    // Own - see only created projects
    return await prisma.project.findMany({
      where: {
        isDeleted: false,
        createdById: userId
      }
    });
  }
}
```

Use in routes:

```typescript
export const GET = hasPermission(
  async (request) => {
    const projects = await projectController.listProjects(
      request.userInfo.id,
      request.scopeInfo.scope_name // 'all', 'project', or 'own'
    );
    return NextResponse.json({ data: projects });
  },
  'prn',
  'r'
);
```

## Step 8: Clean Up (Optional)

After successful migration, you can:

1. **Remove old auth middleware** (keep for now during transition):
   - `lib/auth-middleware.ts`
   - `lib/auth-utils.ts`

2. **Update imports** across the codebase

3. **Remove unused UserRole enum** (if you migrated to string)

## Step 9: Verify Everything Works

### Checklist
- [ ] Database migration applied successfully
- [ ] Seed data populated (check with Prisma Studio or SQL)
- [ ] API routes use new `hasPermission` wrapper
- [ ] Test login with different roles
- [ ] Verify permissions work correctly
- [ ] Check unauthorized access returns 401
- [ ] Verify scope filtering works
- [ ] Error handling works properly
- [ ] No TypeScript errors
- [ ] No runtime errors

### Quick Test

```bash
# Start dev server
npm run dev

# Test in another terminal or use Postman/Insomnia
# Login as admin
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}'

# Test protected endpoint
curl http://localhost:3000/api/example \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

### Issue: "Property 'action' does not exist"
**Solution**: Run `npx prisma generate`

### Issue: "Unauthorized" on all requests
**Solution**: 
1. Check if user session has role field
2. Verify role name matches keyword in database
3. Check RolePrivilege table has entries

### Issue: TypeScript errors about userInfo
**Solution**: Import CustomRequest type:
```typescript
import { CustomRequest } from '@/backend/utils/interceptor';
```

### Issue: Seed fails
**Solution**: Check database connection and run migrations first

## Rollback Plan

If you need to rollback:

```bash
# Revert last migration
npx prisma migrate resolve --rolled-back <migration_name>

# Or reset database (development only!)
npx prisma migrate reset
```

Then restore old auth middleware and routes from git:
```bash
git checkout HEAD -- lib/auth-middleware.ts
git checkout HEAD -- app/api/projects/route.ts
# etc.
```

## Next Steps After Migration

1. **Add more modules** as needed (reports, settings, etc.)
2. **Fine-tune permissions** per role
3. **Add audit logging** for sensitive operations
4. **Implement scope-based filtering** in all controllers
5. **Write integration tests** for authorization
6. **Document custom modules** for your team

## Support

- See `docs/AUTHORIZATION.md` for detailed documentation
- See `docs/AUTHORIZATION_QUICK_START.md` for quick reference
- Check `app/api/example/route.ts` for working example

---

**Good luck with your migration!** 🚀
