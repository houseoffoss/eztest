# Authorization System Implementation Summary

## ✅ What Was Implemented

The EZTest project now has a complete role-based access control (RBAC) system with scope-based permissions, modeled after the reference architecture you provided.

## 📁 New Files Created

### Backend Structure
```
backend/
├── helpers/
│   └── checkScopeAccess.ts          # Permission validation logic
└── utils/
    ├── baseInterceptor.ts           # Request/response wrapper with error handling
    ├── exceptions.ts                # Custom exception classes
    └── interceptor.ts               # TypeScript type definitions
```

### Database & Seeding
```
prisma/
└── seed-auth.ts                     # Seed data for authorization system
```

### Documentation
```
docs/
├── AUTHORIZATION.md                 # Comprehensive documentation
└── AUTHORIZATION_QUICK_START.md     # Quick reference guide
```

### Example API Route
```
app/api/example/route.ts             # Demo of new authorization pattern
```

## 🔄 Modified Files

### `lib/auth.ts`
- Added `auth()` function for getting current session
- Added `checkPermission()` middleware function
- Added `hasPermission()` wrapper for API routes
- Kept existing NextAuth configuration intact

### `prisma/schema.prisma`
- Added 5 new models: `Role`, `Module`, `Action`, `Scope`, `RolePrivilege`
- All models have proper relationships and indexes
- Existing models remain unchanged

## 🎯 Key Features

### 1. Flexible Permission System
- **Roles**: admin, project_manager, tester, viewer
- **Modules**: projects (prn), test cases (tc), test runs (tr), users (usr)
- **Actions**: read (r), write (w), update (u), delete (d)
- **Scopes**: all, project, own

### 2. Simple API Integration
```typescript
export const GET = hasPermission(
  async (request, context) => {
    // Access userInfo and scopeInfo on request object
    return NextResponse.json({ data: 'success' });
  },
  'prn', // module
  'r'    // action
);
```

### 3. Comprehensive Error Handling
- UnauthorizedException (401)
- BadRequestException (400)
- ForbiddenException (403)
- NotFoundException (404)
- ValidationException (422)
- InternalServerException (500)

### 4. Request Extensions
Every protected API route has access to:
- `request.userInfo` - Current user details
- `request.scopeInfo` - Permission scope information

## 🚀 Next Steps

### 1. Database Migration
```bash
# Generate Prisma client (✅ Already done)
npx prisma generate

# Create migration
npx prisma migrate dev --name add_authorization_system

# Run seed to populate auth tables
npm run db:seed
```

### 2. Update Seed File
Add to `prisma/seed.ts`:
```typescript
import { seedAuthorizationSystem } from './seed-auth';

async function main() {
  await seedAuthorizationSystem();
  // ... existing seed code
}
```

### 3. Migrate Existing API Routes
Replace old authentication pattern:
```typescript
// OLD ❌
export async function GET() {
  const auth = await authenticateRequest();
  if (auth.error) return auth.error;
  // ... logic
}

// NEW ✅
export const GET = hasPermission(
  async (request, context) => {
    // ... logic
  },
  'prn', 'r'
);
```

### 4. Map User Roles
Update your User model to store role as string matching role keywords:
- `ADMIN` → `admin`
- `PROJECT_MANAGER` → `project_manager`
- `TESTER` → `tester`
- `VIEWER` → `viewer`

Or modify `checkScopeAccess.ts` to map from UserRole enum to role keywords.

### 5. Test the System
1. Create test users with different roles
2. Test API endpoints with each role
3. Verify permission checks work correctly
4. Test scope filtering (all, project, own)

## 📚 Documentation

- **Full Documentation**: `docs/AUTHORIZATION.md`
- **Quick Start Guide**: `docs/AUTHORIZATION_QUICK_START.md`
- **Example API Route**: `app/api/example/route.ts`

## 🔧 Configuration

### Module Keywords (Customizable)
- `prn` - Projects
- `tc` - Test Cases
- `tr` - Test Runs
- `usr` - Users

Add more modules by creating entries in the `Module` table.

### Action Keywords (Customizable)
- `r` (score: 1) - Read
- `w` (score: 2) - Write
- `u` (score: 3) - Update
- `d` (score: 4) - Delete

Higher scores include lower permissions (e.g., delete includes update, write, read).

### Scope Keywords (Customizable)
- `all` (score: 1) - All resources
- `project` (score: 2) - Project-level
- `own` (score: 3) - Own resources only

## 🔐 Security Features

1. **Token-based authentication** via NextAuth
2. **Role-based access control** with granular permissions
3. **Scope-based filtering** for data access
4. **Centralized error handling** for consistent responses
5. **Type-safe request extensions** for user and scope info

## 🎨 Design Patterns

### Middleware Pattern
The `hasPermission` wrapper uses middleware pattern to:
1. Authenticate user
2. Check permissions
3. Inject user/scope info into request
4. Execute business logic
5. Handle errors uniformly

### Interceptor Pattern
The `baseInterceptor` catches all errors and formats responses:
- Success → JSON with 200 status
- Error → JSON with appropriate status code
- Logging support for monitoring

### Repository Pattern (Ready)
The structure supports repository pattern with scope-aware data access:
```typescript
async function getProjects(userId: string, scope: string) {
  if (scope === 'all') return prisma.project.findMany();
  if (scope === 'project') return prisma.project.findMany({
    where: { members: { some: { userId } } }
  });
  if (scope === 'own') return prisma.project.findMany({
    where: { createdById: userId }
  });
}
```

## 🧪 Testing Checklist

- [ ] Run database migration successfully
- [ ] Seed authorization data
- [ ] Test GET endpoint with different roles
- [ ] Test POST endpoint with different roles
- [ ] Test PUT endpoint with different roles
- [ ] Test DELETE endpoint with different roles
- [ ] Verify unauthorized access returns 401
- [ ] Verify forbidden access returns appropriate errors
- [ ] Test scope filtering (all, project, own)
- [ ] Verify user info is accessible in request
- [ ] Test error handling with various exceptions

## 💡 Tips

1. **Start with example route**: Test with `app/api/example/route.ts` first
2. **Use scopes wisely**: Don't use `all` scope unless necessary
3. **Log permission checks**: Add logging in `checkScopeAccess` for debugging
4. **Gradual migration**: Migrate routes one at a time
5. **Keep old middleware**: Keep `auth-middleware.ts` during transition period

## 🐛 Troubleshooting

### Prisma Client Errors
If you see "Property 'action' does not exist on Prisma Client":
```bash
npx prisma generate
```

### Type Errors
If TypeScript complains about `userInfo` or `scopeInfo`:
```typescript
import { CustomRequest } from '@/backend/utils/interceptor';

export const GET = hasPermission(
  async (request: CustomRequest, context) => {
    // Now types are recognized
  },
  'prn', 'r'
);
```

### Unauthorized Errors
1. Check if role_privilege exists for user's role + module
2. Verify action score comparison logic
3. Ensure user session has role property

## 📞 Support

For questions or issues:
1. Check `docs/AUTHORIZATION.md` for detailed explanations
2. Review `docs/AUTHORIZATION_QUICK_START.md` for quick reference
3. Examine `app/api/example/route.ts` for working example
4. Verify database has been seeded with authorization data

---

**Status**: ✅ Implementation Complete - Ready for Migration  
**Next Step**: Run database migration and seed data  
**Estimated Migration Time**: 1-2 hours for small project
