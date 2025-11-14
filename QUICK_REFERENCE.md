# 🎯 Quick Reference: Updated API Authorization

## ✅ What Changed

All protected API routes now use the new `hasPermission` wrapper for consistent, secure authorization.

## 📝 Pattern

```typescript
import { hasPermission } from '@/lib/auth';

export const [METHOD] = hasPermission(
  async (request, { params }) => {
    // Access user info
    const userId = request.userInfo.id;
    const userRole = request.userInfo.role;
    const scope = request.scopeInfo.scope_name;
    
    // Your business logic here
    return NextResponse.json({ data: result });
  },
  'MODULE_KEYWORD', // prn, tc, tr, usr
  'ACTION_KEYWORD'  // r, w, u, d
);
```

## 🔑 Module & Action Keywords

| Route Pattern | Module | Actions |
|--------------|--------|---------|
| `/api/projects/*` | `prn` | `r` `w` `u` `d` |
| `/api/testcases/*` | `tc` | `r` `w` `u` `d` |
| `/api/users/*` | `usr` | `r` `w` `u` `d` |

## 📊 Permission Matrix

| Role | Projects | Test Cases | Users |
|------|----------|------------|-------|
| Admin | `d` ✅ | `d` ✅ | `d` ✅ |
| PM | `u` ✅ | `u` ✅ | ❌ |
| Tester | `r` ✅ | `w` ✅ | ❌ |
| Viewer | `r` ✅ | `r` ✅ | ❌ |

## 🔒 Request Properties

Every `hasPermission` wrapped route has access to:

```typescript
request.userInfo.id       // string
request.userInfo.email    // string
request.userInfo.name     // string
request.userInfo.role     // UserRole enum
request.scopeInfo.access  // boolean
request.scopeInfo.scope_name // 'all' | 'project' | 'own'
```

## ⚠️ Error Handling

```typescript
import { 
  BadRequestException, 
  UnauthorizedException,
  NotFoundException 
} from '@/backend/utils/exceptions';

// Use instead of returning NextResponse with error status
throw new NotFoundException('Resource not found');
throw new BadRequestException('Invalid input');
throw new UnauthorizedException('Access denied');
```

## 🚀 Next Steps

1. **Run Migration**
   ```bash
   npx prisma migrate dev --name add_authorization_system
   ```

2. **Seed Data**
   ```bash
   npm run db:seed
   ```

3. **Test Routes**
   - Test with different user roles
   - Verify permissions work correctly
   - Check scope filtering

## 📚 Documentation

- Full docs: `docs/AUTHORIZATION.md`
- Quick start: `docs/AUTHORIZATION_QUICK_START.md`
- Migration summary: `API_ROUTES_MIGRATION.md`
