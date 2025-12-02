# Modules Documentation

## Table of Contents

1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [Test Suite Module Management](#test-suite-module-management)
5. [Implementation Details](#implementation-details)
6. [Test Case Integration](#test-case-integration)
7. [Usage Examples](#usage-examples)
8. [Error Handling](#error-handling)
9. [Permissions](#permissions)

---

## Overview

The Module feature allows users to organize test cases into logical groups within a project. Modules provide a hierarchical organization structure where:
- Modules are project-scoped (unique per project)
- Test cases can be assigned to modules
- Modules can be reordered with custom ordering
- Module deletion is prevented if test cases are associated

### Key Features

- **Project-Scoped Organization**: Modules are unique per project
- **Test Case Grouping**: Test cases can be associated with modules
- **Custom Ordering**: Modules can be reordered via dedicated endpoint
- **Comprehensive Validation**: Input validation with Zod schemas
- **Role-Based Access**: Integrated with RBAC system
- **Automatic Count Tracking**: Tracks number of test cases per module
- **Cascade Deletion**: Modules are deleted when project is deleted

---

## Database Schema

### Module Model

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

  @@unique([projectId, name])
  @@index([projectId])
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | String (CUID) | Yes | Unique identifier for the module |
| `projectId` | String | Yes | Foreign key to the parent project |
| `name` | String | Yes | Module name (unique within project) |
| `description` | String | No | Optional module description |
| `order` | Int | No | Display order (default: 0) |
| `createdAt` | DateTime | Yes | Creation timestamp |
| `updatedAt` | DateTime | Yes | Last update timestamp |

### TestCase Model Changes

The `TestCase` model has been updated to support module assignment:

```prisma
model TestCase {
  id        String   @id @default(cuid())
  tcId      String
  projectId String
  moduleId  String?  // New field - optional reference to Module
  module    Module?  @relation(fields: [moduleId], references: [id], onDelete: SetNull)
  // ... other existing fields
}
```

---

## API Endpoints

### 1. Get All Modules for a Project

**GET** `/api/projects/[id]/modules`

**Permission Required**: `testcases:read`

**Description**: Retrieve all modules in a project with their test case counts.

**Response**:
```json
{
  "data": [
    {
      "id": "module_id_1",
      "projectId": "project_id",
      "name": "Authentication",
      "description": "Module for authentication test cases",
      "order": 0,
      "createdAt": "2025-12-01T10:00:00Z",
      "updatedAt": "2025-12-01T10:00:00Z",
      "_count": {
        "testCases": 5
      }
    },
    {
      "id": "module_id_2",
      "projectId": "project_id",
      "name": "User Management",
      "description": "Module for user management test cases",
      "order": 1,
      "createdAt": "2025-12-01T10:00:00Z",
      "updatedAt": "2025-12-01T10:00:00Z",
      "_count": {
        "testCases": 3
      }
    }
  ]
}
```

---

### 2. Create a Module

**POST** `/api/projects/[id]/modules`

**Permission Required**: `testcases:create`

**Description**: Create a new module within a project.

**Request Body**:
```json
{
  "name": "Authentication",
  "description": "Module for authentication test cases",
  "order": 0
}
```

**Validation Rules**:
- `name` (required): String, 1-255 characters, unique per project
- `description` (optional): String, max 1000 characters
- `order` (optional): Non-negative integer (auto-incremented if not provided)

**Success Response** (201):
```json
{
  "data": {
    "id": "module_id_1",
    "projectId": "project_id",
    "name": "Authentication",
    "description": "Module for authentication test cases",
    "order": 0,
    "createdAt": "2025-12-01T10:00:00Z",
    "updatedAt": "2025-12-01T10:00:00Z",
    "_count": {
      "testCases": 0
    }
  },
  "statusCode": 201
}
```

**Error Responses**:
- `400 Bad Request`: Validation error (invalid input data)
- `400 Bad Request`: Module name already exists in the project
- `404 Not Found`: Project not found

---

### 3. Get Module by ID

**GET** `/api/projects/[id]/modules/[moduleId]`

**Permission Required**: `testcases:read`

**Description**: Retrieve a specific module with all its associated test cases.

**Response**:
```json
{
  "data": {
    "id": "module_id_1",
    "projectId": "project_id",
    "name": "Authentication",
    "description": "Module for authentication test cases",
    "order": 0,
    "createdAt": "2025-12-01T10:00:00Z",
    "updatedAt": "2025-12-01T10:00:00Z",
    "testCases": [
      {
        "id": "tc_1",
        "tcId": "tc1",
        "title": "Test login functionality",
        "priority": "HIGH",
        "status": "ACTIVE"
      },
      {
        "id": "tc_2",
        "tcId": "tc2",
        "title": "Test logout functionality",
        "priority": "MEDIUM",
        "status": "ACTIVE"
      }
    ],
    "_count": {
      "testCases": 2
    }
  }
}
```

**Error Responses**:
- `404 Not Found`: Module not found

---

### 4. Update a Module

**PATCH** `/api/projects/[id]/modules/[moduleId]`

**Permission Required**: `testcases:update`

**Description**: Update module properties (all fields are optional).

**Request Body**:
```json
{
  "name": "Authentication & Authorization",
  "description": "Module for auth-related test cases",
  "order": 1
}
```

**Validation Rules**:
- `name` (optional): String, 1-255 characters, must be unique per project if provided
- `description` (optional): String, max 1000 characters
- `order` (optional): Non-negative integer

**Response**:
```json
{
  "data": {
    "id": "module_id_1",
    "projectId": "project_id",
    "name": "Authentication & Authorization",
    "description": "Module for auth-related test cases",
    "order": 1,
    "createdAt": "2025-12-01T10:00:00Z",
    "updatedAt": "2025-12-01T10:30:00Z",
    "_count": {
      "testCases": 5
    }
  }
}
```

**Error Responses**:
- `400 Bad Request`: Validation error
- `400 Bad Request`: Module name already exists in the project
- `404 Not Found`: Module not found

---

### 5. Delete a Module

**DELETE** `/api/projects/[id]/modules/[moduleId]`

**Permission Required**: `testcases:delete`

**Description**: Delete a module. Only modules without associated test cases can be deleted.

**Response**:
```json
{
  "message": "Module deleted successfully."
}
```

**Error Responses**:
- `400 Bad Request`: Cannot delete module with associated test cases
- `404 Not Found`: Module not found

---

### 6. Reorder Modules

**POST** `/api/projects/[id]/modules/reorder`

**Permission Required**: `testcases:update`

**Description**: Reorder multiple modules within a project.

**Request Body**:
```json
{
  "modules": [
    {
      "id": "module_id_1",
      "order": 0
    },
    {
      "id": "module_id_2",
      "order": 1
    },
    {
      "id": "module_id_3",
      "order": 2
    }
  ]
}
```

**Validation Rules**:
- `modules` (required): Array with at least one item
- Each module must have:
  - `id` (required): Valid CUID format
  - `order` (required): Non-negative integer

**Response**:
```json
{
  "data": [
    {
      "id": "module_id_1",
      "projectId": "project_id",
      "name": "Authentication",
      "order": 0,
      "createdAt": "2025-12-01T10:00:00Z",
      "updatedAt": "2025-12-01T10:00:00Z",
      "_count": {
        "testCases": 5
      }
    },
    {
      "id": "module_id_2",
      "projectId": "project_id",
      "name": "API Testing",
      "order": 1,
      "createdAt": "2025-12-01T10:00:00Z",
      "updatedAt": "2025-12-01T10:00:00Z",
      "_count": {
        "testCases": 3
      }
    }
  ]
}
```

---

### 7. Add Test Case to Module

**POST** `/api/projects/[id]/testcases/[tcId]/add-to-module`

**Permission Required**: `testcases:update`

**Description**: Assign an existing test case to a module.

**Request Body**:
```json
{
  "moduleId": "module_id_123"
}
```

**Validation Rules**:
- `moduleId` (required): Valid CUID format, must exist and belong to the same project

**Response**:
```json
{
  "data": {
    "id": "tc_1",
    "tcId": "tc1",
    "projectId": "project_id",
    "moduleId": "module_id_123",
    "title": "Test login functionality",
    "description": "Verify user can login with valid credentials",
    "expectedResult": "User successfully logs in",
    "priority": "HIGH",
    "status": "ACTIVE",
    "estimatedTime": 5,
    "createdAt": "2025-12-01T10:00:00Z",
    "updatedAt": "2025-12-01T10:00:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Module ID validation failed or missing
- `404 Not Found`: Test case or module not found
- `500 Internal Server Error`: Server error

---

### 8. Remove Test Case from Module

**POST** `/api/projects/[id]/testcases/[tcId]/remove-from-module`

**Permission Required**: `testcases:update`

**Description**: Remove a test case from its module (sets moduleId to null).

**Response**:
```json
{
  "data": {
    "id": "tc_1",
    "tcId": "tc1",
    "projectId": "project_id",
    "moduleId": null,
    "title": "Test login functionality",
    "description": "Verify user can login with valid credentials",
    "expectedResult": "User successfully logs in",
    "priority": "HIGH",
    "status": "ACTIVE",
    "estimatedTime": 5,
    "createdAt": "2025-12-01T10:00:00Z",
    "updatedAt": "2025-12-01T10:00:00Z"
  }
}
```

**Error Responses**:
- `404 Not Found`: Test case not found
- `500 Internal Server Error`: Server error

---

## Implementation Details

### Backend Service Layer

**File**: `backend/services/module/services.ts`

**Methods**:
- `getProjectModules(projectId)`: Fetch all modules with test case counts
- `getModuleById(moduleId, projectId)`: Get specific module with test cases
- `createModule(data)`: Create new module with validation
- `updateModule(moduleId, projectId, data)`: Update module properties
- `deleteModule(moduleId, projectId)`: Delete module (checks for associated test cases)
- `reorderModules(projectId, moduleOrders)`: Batch reorder modules

**Features**:
- Automatic order number assignment
- Unique name validation per project
- Test case count tracking
- Cascade deletion support

### Backend Controller Layer

**File**: `backend/controllers/module/controller.ts`

**Methods**:
- `getProjectModules()`: Fetch all modules
- `getModuleById()`: Fetch specific module
- `createModule()`: Create module with validation
- `updateModule()`: Update module
- `deleteModule()`: Delete module
- `reorderModules()`: Reorder modules

**Features**:
- Request body validation with Zod schemas
- Error handling and conversion to custom exceptions
- Permission checks through `hasPermission` wrapper

### Validators

**File**: `backend/validators/module.validator.ts`

**Schemas**:
- `createModuleSchema`: Validates name, description, and order
- `updateModuleSchema`: All fields optional for PATCH operations
- `reorderModulesSchema`: Validates array of modules with id and order

**Validation Rules**:
- Name: 1-255 characters, required
- Description: Max 1000 characters, optional
- Order: Non-negative integer, optional

### API Routes

**File**: `app/api/projects/[id]/modules/route.ts`
- `GET`: List all modules for a project
- `POST`: Create new module

**File**: `app/api/projects/[id]/modules/[moduleId]/route.ts`
- `GET`: Fetch specific module with test cases
- `PATCH`: Update module
- `DELETE`: Delete module

**File**: `app/api/projects/[id]/modules/reorder/route.ts`
- `POST`: Reorder modules

---

## Test Case Integration

### Creating a Test Case with Module Assignment

```typescript
POST /api/projects/proj_123/testcases
{
  "moduleId": "module_123",
  "title": "Test user registration",
  "description": "Verify user can register with valid email",
  "priority": "HIGH",
  "status": "ACTIVE"
}
```

### Test Case Schema Updates

**File**: `backend/validators/testcase.validator.ts`

Changes:
- Added `moduleId?: string` to `createTestCaseSchema`
- Added `moduleId?: string | null` to `updateTestCaseSchema`

### Test Case Service Updates

**File**: `backend/services/testcase/services.ts`

Changes:
- Added `moduleId?: string` to `CreateTestCaseInput` interface
- Added `moduleId?: string | null` to `UpdateTestCaseInput` interface
- Updated `createTestCase()` method to handle `moduleId` parameter

---

## Usage Examples

### Example 1: Create a Module and Add Test Cases

1. Create the module:
```bash
POST /api/projects/proj_123/modules
Content-Type: application/json

{
  "name": "User Management",
  "description": "Test cases for user management features"
}
```

Response:
```json
{
  "data": {
    "id": "module_456",
    "projectId": "proj_123",
    "name": "User Management",
    "description": "Test cases for user management features",
    "order": 0,
    "createdAt": "2025-12-01T10:00:00Z",
    "updatedAt": "2025-12-01T10:00:00Z",
    "_count": {
      "testCases": 0
    }
  },
  "statusCode": 201
}
```

2. Create a test case in the module:
```bash
POST /api/projects/proj_123/testcases
Content-Type: application/json

{
  "moduleId": "module_456",
  "title": "Test user registration",
  "description": "Verify user can register with valid email",
  "priority": "HIGH"
}
```

3. Add existing test case to module:
```bash
POST /api/projects/proj_123/testcases/tc_789/add-to-module
Content-Type: application/json

{
  "moduleId": "module_456"
}
```

---

### Example 2: Organize Modules in Order

```bash
POST /api/projects/proj_123/modules/reorder
Content-Type: application/json

{
  "modules": [
    { "id": "module_auth", "order": 0 },
    { "id": "module_users", "order": 1 },
    { "id": "module_api", "order": 2 },
    { "id": "module_db", "order": 3 }
  ]
}
```

Response:
```json
{
  "data": [
    {
      "id": "module_auth",
      "projectId": "proj_123",
      "name": "Authentication",
      "order": 0,
      "_count": { "testCases": 5 }
    },
    {
      "id": "module_users",
      "projectId": "proj_123",
      "name": "User Management",
      "order": 1,
      "_count": { "testCases": 3 }
    },
    {
      "id": "module_api",
      "projectId": "proj_123",
      "name": "API Testing",
      "order": 2,
      "_count": { "testCases": 8 }
    },
    {
      "id": "module_db",
      "projectId": "proj_123",
      "name": "Database Operations",
      "order": 3,
      "_count": { "testCases": 2 }
    }
  ]
}
```

---

### Example 3: Get All Test Cases in a Module

```bash
GET /api/projects/proj_123/modules/module_456
```

Response:
```json
{
  "data": {
    "id": "module_456",
    "projectId": "proj_123",
    "name": "User Management",
    "description": "Test cases for user management features",
    "order": 0,
    "createdAt": "2025-12-01T10:00:00Z",
    "updatedAt": "2025-12-01T10:00:00Z",
    "testCases": [
      {
        "id": "tc_1",
        "tcId": "tc_001",
        "title": "Test user registration",
        "priority": "HIGH",
        "status": "ACTIVE"
      },
      {
        "id": "tc_2",
        "tcId": "tc_002",
        "title": "Test user login",
        "priority": "HIGH",
        "status": "ACTIVE"
      },
      {
        "id": "tc_3",
        "tcId": "tc_003",
        "title": "Test user profile update",
        "priority": "MEDIUM",
        "status": "ACTIVE"
      }
    ],
    "_count": {
      "testCases": 3
    }
  }
}
```

---

### Example 4: Remove Test Case from Module

```bash
POST /api/projects/proj_123/testcases/tc_1/remove-from-module
```

Response:
```json
{
  "data": {
    "id": "tc_1",
    "tcId": "tc_001",
    "projectId": "proj_123",
    "moduleId": null,
    "title": "Test user registration",
    "priority": "HIGH",
    "status": "ACTIVE"
  }
}
```

---

## Test Suite Module Management

### 9. Add Module to Test Suite

**POST** `/api/projects/[id]/testsuites/[suiteId]/add-module`

**Permission Required**: `testsuites:update`

**Description**: Assign a module to all test cases in a test suite.

**Request Body**:
```json
{
  "moduleId": "module_123"
}
```

**Validation Rules**:
- `moduleId` (required): Valid CUID format, must exist and belong to the same project

**Response**:
```json
{
  "data": {
    "id": "suite_1",
    "projectId": "project_id",
    "name": "User Authentication Tests",
    "description": "Test suite for authentication flows",
    "testCases": [
      {
        "id": "tc_1",
        "tcId": "tc_001",
        "title": "Test login",
        "moduleId": "module_123",
        "module": {
          "id": "module_123",
          "name": "Authentication",
          "description": "Auth module"
        }
      }
    ]
  }
}
```

**Error Responses**:
- `400 Bad Request`: Module ID missing or validation error
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Test suite or module not found

---

### 10. Update Module in Test Suite

**POST** `/api/projects/[id]/testsuites/[suiteId]/update-module`

**Permission Required**: `testsuites:update`

**Description**: Change module assignment for all test cases in a test suite (move from old module to new module).

**Request Body**:
```json
{
  "oldModuleId": "module_old",
  "newModuleId": "module_new"
}
```

**Validation Rules**:
- `newModuleId` (required): Valid CUID format, must exist and belong to the same project
- `oldModuleId` (optional): Current module ID (can be null if test cases are unassigned)

**Response**:
```json
{
  "data": {
    "id": "suite_1",
    "projectId": "project_id",
    "name": "User Authentication Tests",
    "testCases": [
      {
        "id": "tc_1",
        "tcId": "tc_001",
        "title": "Test login",
        "moduleId": "module_new",
        "module": {
          "id": "module_new",
          "name": "Authentication v2",
          "description": "Updated auth module"
        }
      }
    ]
  }
}
```

**Error Responses**:
- `400 Bad Request`: New module ID missing or validation error
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Test suite or module not found

---

### 11. Remove Module from Test Suite

**POST** `/api/projects/[id]/testsuites/[suiteId]/remove-module`

**Permission Required**: `testsuites:update`

**Description**: Remove module assignment from all test cases in a test suite (sets moduleId to null).

**Request Body**:
```json
{
  "moduleId": "module_123"
}
```

**Validation Rules**:
- `moduleId` (required): Valid CUID format

**Response**:
```json
{
  "data": {
    "id": "suite_1",
    "projectId": "project_id",
    "name": "User Authentication Tests",
    "testCases": [
      {
        "id": "tc_1",
        "tcId": "tc_001",
        "title": "Test login",
        "moduleId": null,
        "module": null
      }
    ]
  }
}
```

**Error Responses**:
- `400 Bad Request`: Module ID missing
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Test suite not found

---

## Error Handling

All endpoints follow consistent error handling patterns:

### Error Response Format

```json
{
  "data": null,
  "error": "Error message describing the issue"
}
```

### HTTP Status Codes

| Status | Meaning | Typical Causes |
|--------|---------|----------------|
| `400 Bad Request` | Validation error | Invalid input, duplicate name, missing required fields |
| `401 Unauthorized` | Missing authentication | No auth token provided |
| `403 Forbidden` | Insufficient permissions | User lacks required permission |
| `404 Not Found` | Resource not found | Module, project, or test case doesn't exist |
| `500 Internal Server Error` | Server error | Unexpected server error |

### Common Error Scenarios

**Module name already exists**:
```json
{
  "data": null,
  "error": "Module name 'Authentication' already exists in this project"
}
```

**Cannot delete module with test cases**:
```json
{
  "data": null,
  "error": "Cannot delete module with associated test cases (5 test cases found)"
}
```

**Module not found**:
```json
{
  "data": null,
  "error": "Module not found"
}
```

**Validation error**:
```json
{
  "data": null,
  "error": "Validation error: name must be between 1 and 255 characters"
}
```

---

## Permissions

All module endpoints require specific RBAC permissions:

### Permission Requirements by Operation

| Operation | Permission | Description |
|-----------|-----------|-------------|
| Get modules | `testcases:read` | View modules and their properties |
| Create module | `testcases:create` | Create new modules |
| Update module | `testcases:update` | Modify module properties |
| Delete module | `testcases:delete` | Remove modules (only without test cases) |
| Reorder modules | `testcases:update` | Change module ordering |
| Add test case to module | `testcases:update` | Assign test cases to modules |
| Remove test case from module | `testcases:update` | Unassign test cases from modules |
| Add module to test suite | `testsuites:update` | Assign module to all test cases in a suite |
| Update module in test suite | `testsuites:update` | Change module assignment in a suite |
| Remove module from test suite | `testsuites:update` | Remove module assignment from a suite |

### Permission Groups

- **View Only**: `testcases:read` - Can list and view modules
- **Full Access**: `testcases:create`, `testcases:update`, `testcases:delete`

---

## UI Components and Features

### Module List Page

**Location**: `/projects/[id]/modules`

**Features**:
- View all modules in a project
- Create new modules via dialog
- Edit module name and description
- Delete modules (only if empty)
- Reorder modules via drag-and-drop
- View test case count per module
- Navigate to module detail page

**Components**:
- `ModuleList.tsx` - Main module list page
- `CreateModuleDialog.tsx` - Dialog for creating new modules
- `ModuleTable.tsx` - Table displaying modules with actions

### Module Detail Page

**Location**: `/projects/[id]/modules/[moduleId]`

**Features**:
- View module details (name, description, test case count)
- Create new test cases directly in the module
- View all test cases assigned to the module
- Edit test cases inline
- Delete test cases
- Empty state when no test cases exist
- Navigate to test case detail page

**Components**:
- `ModuleDetail.tsx` - Main module detail page
- `ModuleTestCasesCard.tsx` - Card displaying test cases with DataTable
- `DataTable.tsx` - Reusable table component for test cases

### Test Case List Integration

**Location**: `/projects/[id]/testcases`

**Features**:
- Filter test cases by module (dropdown)
- Group test cases by module (collapsible sections)
- Show empty modules in grouped view
- Create module from test case list
- Module count display for each group
- Empty state message for modules without test cases

**Components**:
- `TestCaseList.tsx` - Main test case list with module filter
- `TestCaseTable.tsx` - Table with module grouping support
- `CreateModuleDialog.tsx` - Quick module creation

### Test Case Detail Page Integration

**Location**: `/projects/[id]/testcases/[testcaseId]`

**Features**:
- Display assigned module
- Edit module assignment via dropdown
- Navigate to module detail page (if assigned)
- Update module in test case edit form

**Components**:
- `TestCaseDetail.tsx` - Main test case detail page
- `TestCaseDetailsCard.tsx` - Card displaying test case details with module
- `testCaseFormConfig.ts` - Form configuration with module field

### Dialog Width Standards

- **List/Selection Dialogs**: `max-w-3xl` - Used for Create Module, Add Test Case
- **Confirmation Dialogs**: `sm:max-w-[425px]` - Used for delete confirmations

### UI Behaviors

**Empty Modules Display**:
- Empty modules appear in grouped view with "0 test cases" count
- Clicking empty module expands to show "No test cases in this module yet" message
- Empty modules are collapsible like modules with test cases

**Module Navigation**:
- Module names in test case list are clickable links (blue, underline on hover)
- Clicking module name navigates to module detail page
- Module links only enabled when `enableModuleLink` prop is true

**Test Case Assignment**:
- Test cases can be assigned to modules during creation
- Test cases can be reassigned via edit form
- Module dropdown shows all project modules
- Unassigned test cases show in "Ungrouped" section

**Module Management**:
- Modules can only be deleted if empty (no test cases)
- Module name must be unique per project
- Module description is optional
- Module order determines display sequence

---

## Related Documentation

- [Test Cases Documentation](./TEST_CASES_FEATURE.md)
- [RBAC Implementation](./RBAC_IMPLEMENTATION_SUMMARY.md)
- [API Documentation](./API.md)
- [Database Schema](./DATABASE.md)

---

## Notes

- **Module Uniqueness**: Module names must be unique within a project. Cross-project modules with the same name are allowed.
- **Deletion Constraints**: Modules containing test cases cannot be deleted. Remove all test cases first or assign them to another module.
- **Cascade Deletion**: When a project is deleted, all its modules are automatically deleted (cascade delete).
- **Ordering**: The `order` field helps maintain custom ordering of modules. Modules are returned sorted by this field.
- **Test Case Association**: Test cases can be associated with modules by setting the `moduleId` field during creation or via the add-to-module endpoint.
- **Null Values**: When a test case is removed from a module, its `moduleId` is set to `null`, not deleted.

