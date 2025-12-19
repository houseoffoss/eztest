# Modules Documentation

## Overview

Modules in EZTest provide a way to organize test cases within a project into logical groups. They act as containers that help structure and categorize test cases based on features, components, or any other organizational criteria that makes sense for your project.

**Status:** ✅ Complete

## What are Modules?

Modules are organizational units within a project that group related test cases together. They provide:

- **Logical grouping** of test cases by feature, component, or functionality
- **Better organization** for large projects with many test cases
- **Clear structure** for team collaboration
- **Easy navigation** within a project's test suite

### Module vs Test Suite

- **Modules**: Organize test cases by feature/component (e.g., "Authentication", "Payment Processing")
- **Test Suites**: Organize test cases hierarchically for execution purposes (e.g., "Smoke Tests", "Regression Tests")

A test case can belong to one module and be included in multiple test suites.

---

## Key Features

### ✅ Module Management
- Create, read, update, and delete modules
- Unique module names per project
- Optional descriptions for context
- Custom ordering of modules

### ✅ Test Case Organization
- Assign test cases to modules
- View all test cases within a module
- Move test cases between modules
- Filter and search by module

### ✅ Project Integration
- Modules are project-specific
- Each module belongs to exactly one project
- Cascade deletion (deleting a module doesn't delete test cases, just unlinks them)

---

## Module Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | String | Yes | Unique identifier (auto-generated) |
| `projectId` | String | Yes | ID of the parent project |
| `name` | String | Yes | Module name (unique within project) |
| `description` | String | No | Optional description |
| `order` | Integer | Yes | Display order (default: 0) |
| `createdAt` | DateTime | Auto | Creation timestamp |
| `updatedAt` | DateTime | Auto | Last update timestamp |

---

## API Endpoints

### Get All Modules
```http
GET /api/projects/{projectId}/modules
```

**Permission Required:** `testcases:read`

**Response:**
```json
[
  {
    "id": "clxxx",
    "projectId": "proj123",
    "name": "Authentication",
    "description": "User login and authentication features",
    "order": 0,
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-15T10:00:00Z",
    "_count": {
      "testCases": 15
    }
  }
]
```

### Create Module
```http
POST /api/projects/{projectId}/modules
```

**Permission Required:** `testcases:create`

**Request Body:**
```json
{
  "name": "Payment Processing",
  "description": "All payment-related functionality",
  "order": 1
}
```

**Response:** Returns the created module object.

### Get Module Details
```http
GET /api/projects/{projectId}/modules/{moduleId}
```

**Permission Required:** `testcases:read`

**Response:** Returns module object with test case count.

### Update Module
```http
PUT /api/projects/{projectId}/modules/{moduleId}
```

**Permission Required:** `testcases:update`

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Module Name",
  "description": "Updated description",
  "order": 2
}
```

### Delete Module
```http
DELETE /api/projects/{projectId}/modules/{moduleId}
```

**Permission Required:** `testcases:delete`

**Response:** 204 No Content on success

**Note:** Deleting a module does not delete test cases; it only removes the module association.

### Reorder Modules
```http
POST /api/projects/{projectId}/modules/reorder
```

**Permission Required:** `testcases:update`

**Request Body:**
```json
{
  "moduleIds": ["module1", "module2", "module3"]
}
```

Updates the `order` field based on array position.

### Get Module Test Cases
```http
GET /api/projects/{projectId}/modules/{moduleId}/testcases
```

**Permission Required:** `testcases:read`

**Response:** Returns array of test cases belonging to the module.

---

## User Interface

### Module List View
- **Location:** Project detail page
- **Features:**
  - View all modules in a project
  - See test case count per module
  - Reorder modules via drag-and-drop
  - Quick access to module details

### Module Detail View
- **Location:** `/projects/{projectId}/modules/{moduleId}`
- **Features:**
  - View module information
  - List all test cases in the module
  - Create new test cases in the module
  - Edit module properties
  - Delete module

### Test Case Assignment
- When creating/editing a test case
- Dropdown to select module
- Optional field (test cases can exist without a module)

---

## Permissions

Module operations use the `testcases` resource permissions:

| Operation | Permission | Description |
|-----------|-----------|-------------|
| View modules | `testcases:read` | List and view module details |
| Create modules | `testcases:create` | Create new modules |
| Update modules | `testcases:update` | Edit module properties, reorder |
| Delete modules | `testcases:delete` | Remove modules |

---

## Database Schema

```prisma
model Module {
  id          String   @id @default(cuid())
  projectId   String
  name        String
  description String?
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  testCases   TestCase[]

  @@unique([id, projectId])
  @@unique([projectId, name])
  @@index([projectId])
}
```

### Relationships
- **Belongs to:** One Project (many-to-one)
- **Has many:** Test Cases (one-to-many, optional)

### Constraints
- Module name must be unique within a project
- Composite unique key on `[id, projectId]` for foreign key relations
- Cascading delete: Deleting a project deletes all its modules

---

## Common Use Cases

### 1. Feature-Based Organization
```
Project: E-Commerce Platform
├── Module: Authentication
├── Module: Product Catalog
├── Module: Shopping Cart
├── Module: Checkout
└── Module: Order Management
```

### 2. Component-Based Organization
```
Project: Mobile App
├── Module: UI Components
├── Module: API Integration
├── Module: Data Storage
├── Module: Push Notifications
└── Module: Analytics
```

### 3. Subsystem Organization
```
Project: Enterprise System
├── Module: User Management
├── Module: Reporting Engine
├── Module: Workflow Engine
├── Module: Email Service
└── Module: Integration Layer
```

---

## Best Practices

### Naming Conventions
- Use clear, descriptive names
- Be consistent across projects
- Avoid overly generic names like "Module 1"
- Use proper capitalization

### Organization Tips
- Create modules based on functional areas
- Keep module count manageable (typically 5-20 per project)
- Use descriptions to clarify module scope
- Order modules by priority or logical flow

### When to Use Modules
- ✅ Large projects with 50+ test cases
- ✅ Projects with distinct functional areas
- ✅ Teams working on different features
- ✅ When you need clear categorization

### When NOT to Use Modules
- ❌ Small projects with <20 test cases
- ❌ When test suites already provide sufficient organization
- ❌ Single-feature applications

---

## Examples

### Creating a Module Structure

1. **Create modules for your project:**
   ```
   POST /api/projects/proj123/modules
   {
     "name": "User Authentication",
     "description": "Login, logout, password reset, MFA",
     "order": 0
   }
   ```

2. **Create test cases within the module:**
   ```
   POST /api/projects/proj123/testcases
   {
     "moduleId": "module123",
     "title": "User can login with valid credentials",
     ...
   }
   ```

3. **View all test cases in the module:**
   ```
   GET /api/projects/proj123/modules/module123/testcases
   ```

---

## Troubleshooting

### Common Issues

**Issue:** Cannot create module with existing name
- **Cause:** Module names must be unique within a project
- **Solution:** Choose a different name or update the existing module

**Issue:** Module deletion fails
- **Cause:** May have foreign key constraints
- **Solution:** Check for test cases linked to the module; they will be unlinked automatically

**Issue:** Test cases not showing in module
- **Cause:** Test case `moduleId` not set
- **Solution:** Update test cases to assign them to the module

---

## Related Documentation

- [Projects](../projects/README.md) - Parent container for modules
- [Test Cases](../test-cases/README.md) - Test cases can be organized by modules
- [Test Suites](../test-suites/README.md) - Alternative organization method
- [API Documentation](../../api/README.md) - Complete API reference

---

## Future Enhancements

Planned improvements for modules:

- 📋 Module templates for common patterns
- 📋 Module-level metrics and reporting
- 📋 Module import/export functionality
- 📋 Module hierarchies (nested modules)
- 📋 Module tags and labels
- 📋 Bulk test case assignment to modules

---

**Last Updated:** December 19, 2025
