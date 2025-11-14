# Authorization System - Quick Start Guide

## 🚀 Quick Setup

### 1. Run Database Migration

```bash
npx prisma generate
npx prisma migrate dev --name add_authorization_system
```

### 2. Seed Authorization Data

```bash
npm run db:seed
```

This creates default roles, modules, actions, scopes, and privileges.

## 📝 Using hasPermission in API Routes

### Basic Syntax

```typescript
import { hasPermission } from '@/lib/auth';

export const GET = hasPermission(
  async (request, context) => {
    // Your code here
  },
  'MODULE_KEYWORD',
  'ACTION_KEYWORD'
);
```

### Quick Reference

#### Module Keywords
- `prn` - Projects
- `tc` - Test Cases  
- `tr` - Test Runs
- `usr` - Users

#### Action Keywords
- `r` - Read (lowest permission)
- `w` - Write/Create
- `u` - Update
- `d` - Delete (highest permission)

#### Scope Keywords (set per role in database)
- `all` - All resources
- `project` - Project-level resources
- `own` - User's own resources only

## 💡 Common Patterns

### Read Endpoint
```typescript
export const GET = hasPermission(
  async (request, context) => {
    const data = await fetchData(request.userInfo.id);
    return NextResponse.json({ data });
  },
  'prn', // module
  'r'    // read
);
```

### Create Endpoint
```typescript
export const POST = hasPermission(
  async (request, context) => {
    const body = await request.json();
    const created = await createResource(body, request.userInfo.id);
    return NextResponse.json({ data: created });
  },
  'prn', // module
  'w'    // write
);
```

### Update Endpoint
```typescript
export const PUT = hasPermission(
  async (request, context) => {
    const { id } = context.params;
    const body = await request.json();
    const updated = await updateResource(id, body);
    return NextResponse.json({ data: updated });
  },
  'prn', // module
  'u'    // update
);
```

### Delete Endpoint
```typescript
export const DELETE = hasPermission(
  async (request, context) => {
    const { id } = context.params;
    await deleteResource(id);
    return NextResponse.json({ success: true });
  },
  'prn', // module
  'd'    // delete
);
```

## 🔑 Accessing User Info

```typescript
export const GET = hasPermission(
  async (request, context) => {
    // User information
    const userId = request.userInfo.id;
    const userEmail = request.userInfo.email;
    const userName = request.userInfo.name;
    const userRole = request.userInfo.role;
    
    // Scope information
    const hasAccess = request.scopeInfo.access;
    const scopeName = request.scopeInfo.scope_name; // 'all', 'project', or 'own'
    
    // Use scope to filter data
    if (scopeName === 'own') {
      return await fetchUserOwnResources(userId);
    } else if (scopeName === 'project') {
      return await fetchProjectResources(userId);
    } else {
      return await fetchAllResources();
    }
  },
  'prn',
  'r'
);
```

## ⚠️ Error Handling

```typescript
import { 
  UnauthorizedException, 
  NotFoundException,
  BadRequestException,
  ValidationException 
} from '@/backend/utils/exceptions';

export const GET = hasPermission(
  async (request, context) => {
    const { id } = context.params;
    
    if (!id) {
      throw new BadRequestException('ID is required');
    }
    
    const resource = await findResource(id);
    
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    
    // Additional authorization check
    if (request.scopeInfo.scope_name === 'own' && 
        resource.ownerId !== request.userInfo.id) {
      throw new UnauthorizedException('Access denied');
    }
    
    return NextResponse.json({ data: resource });
  },
  'prn',
  'r'
);
```

## 🎭 Default Role Permissions

| Role            | Projects | Test Cases | Test Runs | Users |
|-----------------|----------|------------|-----------|-------|
| Admin           | Delete ✅ | Delete ✅   | Delete ✅  | Delete ✅ |
| Project Manager | Update ✅ | Update ✅   | Update ✅  | ❌     |
| Tester          | Read ✅   | Write ✅    | Write ✅   | ❌     |
| Viewer          | Read ✅   | Read ✅     | Read ✅    | ❌     |

**Note:** Higher permissions include lower ones (Delete > Update > Write > Read)

## 🔧 Customizing Permissions

### Add New Module

```typescript
// In seed file or admin script
await prisma.module.create({
  data: {
    name: 'Reports',
    keyword: 'rpt',
    description: 'Reporting module'
  }
});

// Grant admin access
await prisma.rolePrivilege.create({
  data: {
    role_name: 'admin',
    module_keyword: 'rpt',
    action_keyword: 'd', // highest permission
    scope_keyword: 'all'
  }
});
```

### Modify Role Permissions

```typescript
// Update existing privilege
await prisma.rolePrivilege.update({
  where: {
    role_name_module_keyword: {
      role_name: 'tester',
      module_keyword: 'tc'
    }
  },
  data: {
    action_keyword: 'u', // upgrade from 'w' to 'u'
  }
});
```

## 📚 Files Structure

```
backend/
├── helpers/
│   └── checkScopeAccess.ts    # Permission checking logic
├── utils/
│   ├── baseInterceptor.ts     # Request/response wrapper
│   ├── exceptions.ts          # Custom error classes
│   └── interceptor.ts         # Type definitions
lib/
└── auth.ts                     # hasPermission wrapper & auth functions
prisma/
├── schema.prisma              # Database schema with auth models
└── seed-auth.ts               # Seed data for authorization
docs/
└── AUTHORIZATION.md           # Full documentation
```

## 🐛 Troubleshooting

### "Unauthorized" Error
1. Check if user is logged in
2. Verify user's role in database
3. Confirm RolePrivilege exists for the role+module

### Permission Check Fails
1. Review action scores in Action table
2. Check RolePrivilege for correct action_keyword
3. Verify scope is appropriate

### TypeScript Errors
```typescript
// Import custom request type if needed
import { CustomRequest } from '@/backend/utils/interceptor';

export const GET = hasPermission(
  async (request: CustomRequest, context) => {
    // Now TypeScript knows about userInfo and scopeInfo
  },
  'prn',
  'r'
);
```

## 📖 Full Documentation

For detailed information, see: `docs/AUTHORIZATION.md`

## 🎯 Migration Checklist

- [ ] Run `npx prisma generate`
- [ ] Run `npx prisma migrate dev --name add_authorization_system`
- [ ] Run `npm run db:seed` to populate auth tables
- [ ] Update existing API routes to use `hasPermission`
- [ ] Test all endpoints with different user roles
- [ ] Update any middleware that references old auth system
- [ ] Remove or deprecate `lib/auth-middleware.ts` if no longer needed
