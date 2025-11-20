# Test Suite Features - Complete Documentation

## Overview

The Test Suite feature provides hierarchical organization for test cases. Test suites allow teams to group related test cases into logical collections, creating a nested structure for better test management, organization, and execution planning. Suites can contain other suites (unlimited nesting) and multiple test cases.

---

## 1. Test Suite Architecture

### 1.1 Data Model

```typescript
// Prisma Schema
model TestSuite {
  id              String   @id @default(cuid())
  projectId       String
  project         Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  name            String   // Suite name (required, 1-255 chars)
  description     String?  // Optional description
  
  parentId        String?  // Parent suite for nesting
  parent          TestSuite? @relation("SuiteHierarchy", fields: [parentId], references: [id], onDelete: Cascade)
  children        TestSuite[] @relation("SuiteHierarchy")
  
  testCases       TestCase[]   // Test cases in this suite
  
  order           Int?     // Display order/sequence
  
  createdById     String
  createdBy       User     @relation(fields: [createdById], references: [id])
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### 1.2 Architecture Diagram

```
Project
├── Test Suite: Authentication
│   ├── Test Suite: Login Scenarios
│   │   ├── Test Case: tc1 - Login with valid credentials
│   │   ├── Test Case: tc2 - Login with invalid password
│   │   └── Test Case: tc3 - Login with unregistered email
│   ├── Test Suite: Logout Scenarios
│   │   ├── Test Case: tc4 - Logout from dashboard
│   │   └── Test Case: tc5 - Logout with inactive session
│   └── Test Case: tc6 - Password reset
├── Test Suite: User Management
│   ├── Test Suite: User Profile
│   │   ├── Test Case: tc7 - View profile
│   │   └── Test Case: tc8 - Edit profile
│   └── Test Suite: User Roles
│       ├── Test Case: tc9 - Admin role permissions
│       └── Test Case: tc10 - Tester role permissions
└── Test Suite: API Testing
    ├── Test Case: tc11 - GET /api/users
    └── Test Case: tc12 - POST /api/users
```

---

## 2. API Reference

### 2.1 List Test Suites

**Endpoint:** `GET /api/projects/[id]/testsuites`

**Authentication:** Required

**Authorization:** User must be project member

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "suite_123",
      "name": "Authentication",
      "description": "All authentication-related tests",
      "projectId": "proj_123",
      "parentId": null,
      "order": 1,
      "children": [
        {
          "id": "suite_124",
          "name": "Login Scenarios",
          "description": "Test various login scenarios",
          "parentId": "suite_123",
          "order": 1,
          "children": [],
          "_count": {
            "testCases": 3
          }
        },
        {
          "id": "suite_125",
          "name": "Logout Scenarios",
          "description": "Test logout functionality",
          "parentId": "suite_123",
          "order": 2,
          "children": [],
          "_count": {
            "testCases": 2
          }
        }
      ],
      "_count": {
        "testCases": 6
      }
    },
    {
      "id": "suite_126",
      "name": "User Management",
      "description": "User profile and role management tests",
      "parentId": null,
      "order": 2,
      "children": [],
      "_count": {
        "testCases": 8
      }
    }
  ]
}
```

---

### 2.2 Create Test Suite

**Endpoint:** `POST /api/projects/[id]/testsuites`

**Authentication:** Required

**Authorization:** TESTER or higher role in project

**Request Body:**
```json
{
  "name": "Authentication",
  "description": "All authentication-related tests",
  "parentId": null,
  "order": 1
}
```

**Validation Rules:**
- `name` (required): 1-255 characters, non-empty
- `description` (optional): Any text
- `parentId` (optional): Valid parent suite ID or null (for root level)
- `order` (optional): Integer for display sequence

**Response (201 Created):**
```json
{
  "data": {
    "id": "suite_789",
    "name": "Authentication",
    "description": "All authentication-related tests",
    "projectId": "proj_123",
    "parentId": null,
    "order": 1,
    "children": [],
    "_count": {
      "testCases": 0
    }
  }
}
```

**Error Responses:**
- `400 Bad Request` - Validation failed or circular hierarchy
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Parent suite not found

---

### 2.3 Get Test Suite Details

**Endpoint:** `GET /api/testsuites/[id]`

**Authentication:** Required

**Authorization:** User must be project member

**Response (200 OK):**
```json
{
  "data": {
    "id": "suite_123",
    "name": "Authentication",
    "description": "All authentication-related tests",
    "projectId": "proj_123",
    "parentId": null,
    "order": 1,
    "children": [
      {
        "id": "suite_124",
        "name": "Login Scenarios",
        "parentId": "suite_123",
        "order": 1,
        "_count": {
          "testCases": 3
        }
      }
    ],
    "testCases": [
      {
        "id": "tc_123",
        "tcId": "tc6",
        "title": "Password reset flow",
        "priority": "HIGH",
        "status": "ACTIVE"
      }
    ],
    "_count": {
      "testCases": 6,
      "children": 2
    },
    "createdAt": "2025-11-01T10:30:00Z"
  }
}
```

---

### 2.4 Update Test Suite

**Endpoint:** `PATCH /api/testsuites/[id]`

**Authentication:** Required

**Authorization:** TESTER or higher role in project

**Request Body:**
```json
{
  "name": "Authentication & Security",
  "description": "Updated description",
  "parentId": "suite_456",
  "order": 3
}
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "suite_123",
    "name": "Authentication & Security",
    "description": "Updated description",
    "parentId": "suite_456",
    "order": 3,
    "updatedAt": "2025-11-15T16:45:00Z"
  }
}
```

---

### 2.5 Delete Test Suite

**Endpoint:** `DELETE /api/testsuites/[id]`

**Authentication:** Required

**Authorization:** TESTER or higher role in project

**Response (200 OK):**
```json
{
  "message": "Test suite deleted successfully"
}
```

**Note:** Deleting a suite can cascade to child suites or reassign test cases based on configuration

---

### 2.6 Move Test Cases to Suite

**Endpoint:** `POST /api/testsuites/move`

**Authentication:** Required

**Authorization:** TESTER or higher role in project

**Request Body:**
```json
{
  "testCaseIds": ["tc_123", "tc_124", "tc_125"],
  "suiteId": "suite_456"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "count": 3
  },
  "message": "3 test case(s) moved successfully"
}
```

**Note:** Pass `null` or omit `suiteId` to unassign test cases from suites

---

### 2.7 Reorder Test Suites

**Endpoint:** `POST /api/testsuites/reorder`

**Authentication:** Required

**Authorization:** TESTER or higher role in project

**Request Body:**
```json
{
  "updates": [
    {
      "id": "suite_123",
      "order": 1
    },
    {
      "id": "suite_124",
      "order": 2
    },
    {
      "id": "suite_125",
      "order": 3
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "message": "Test suites reordered successfully"
}
```

---

## 3. UI Components

### 3.1 Test Suites Hierarchy View

**Location:** `/app/projects/[id]/testsuites/page.tsx`

**Features:**
- Tree/hierarchy view of all suites
- Expandable/collapsible suite nodes
- Drag-and-drop reorganization (optional)
- Inline edit suite names
- Add new suite button (at any level)
- Delete suite button
- Suite icons showing collapse/expand state
- Test case count per suite
- Search within hierarchy

**Visual Structure:**
```
📁 Authentication (6 test cases)
   ├─ 📂 Login Scenarios (3 test cases)
   │  ├─ ✓ tc1: Login with valid credentials
   │  ├─ ✗ tc2: Login with invalid password
   │  └─ ✗ tc3: Login with unregistered email
   ├─ 📂 Logout Scenarios (2 test cases)
   │  ├─ ✓ tc4: Logout from dashboard
   │  └─ ✓ tc5: Logout with inactive session
   └─ ✓ tc6: Password reset

📁 User Management (8 test cases)
   ├─ 📂 User Profile (2 test cases)
   └─ 📂 User Roles (2 test cases)
```

### 3.2 Suite Detail Page

**Location:** `/app/projects/[id]/testsuites/[suiteId]/page.tsx`

**Sections:**
1. **Suite Information**
   - Name (editable)
   - Description (editable)
   - Test case count
   - Child suite count

2. **Test Cases in Suite**
   - List of all test cases
   - Can add/remove test cases
   - Quick filter options

3. **Child Suites**
   - List of nested suites
   - Ability to create nested suites
   - Reorder child suites

4. **Actions**
   - Edit suite
   - Delete suite
   - Move suite to different parent
   - Create child suite
   - Add test cases

### 3.3 Suite Management Modal

**Features:**
- Create new suite
- Edit existing suite
- Set parent suite (hierarchy)
- Set display order
- Bulk move test cases to suite
- Duplicate suite (with or without test cases)

**Form Fields:**
```
Suite Name: [text input]
Description: [textarea]
Parent Suite: [dropdown - shows hierarchy]
Display Order: [number input]
[Save] [Cancel]
```

### 3.4 TypeScript Interfaces

```typescript
export interface TestSuite {
  id: string;
  name: string;
  description?: string;
  parentId: string | null;
  order?: number;
  projectId: string;
  children?: TestSuite[];
  testCases?: TestCase[];
  _count?: {
    testCases?: number;
    children?: number;
  };
  createdAt?: string;
}

export interface TestSuiteFormData {
  name: string;
  description: string;
  parentId: string | null;
  order: number;
}
```

---

## 4. Features & Capabilities

### 4.1 Hierarchical Organization

- Create nested suites (parent-child relationships)
- Unlimited nesting levels
- Move suites within hierarchy
- Rearrange order within same level
- View full hierarchy from root

### 4.2 Test Case Management

- Assign test cases to suites
- Move test cases between suites
- Remove test cases from suites
- Bulk reassign test cases
- View all test cases in suite

### 4.3 Suite Operations

- Create suite at root or nested level
- Edit suite properties
- Delete suite (with cascading options)
- Reorder suites
- Duplicate suite structure
- Copy test cases from another suite

### 4.4 Navigation

- Expand/collapse hierarchy
- Breadcrumb navigation
- Quick links to parent/child suites
- Search within suites
- Filter by properties

---

## 5. User Workflows

### 5.1 Create Test Suite Hierarchy

**Steps:**
1. Go to Project → Test Suites
2. Click "Create New Suite"
3. Enter name: "Authentication"
4. Keep Parent Suite blank (root level)
5. Click "Create"
6. Now create nested suites:
   - Click "Add Child Suite" in Authentication
   - Create "Login Scenarios"
   - Create "Logout Scenarios"
7. Hierarchy is now organized

### 5.2 Move Test Cases to Suites

**Steps:**
1. Go to Test Cases list
2. Create test cases if needed
3. Select test cases (checkboxes)
4. Click "Move to Suite"
5. Select destination suite
6. Click "Move"
7. Test cases now appear under selected suite

### 5.3 Reorganize Suites

**Steps:**
1. Go to Test Suites
2. Drag suite to new position (if drag-and-drop enabled)
3. Or use order field in edit dialog
4. Click "Reorder"
5. Suite positions update

### 5.4 Execute Suite

**Steps:**
1. Go to Test Suites → Select suite
2. Click "Run Suite" button
3. Creates test run with all suite's test cases
4. Execute all test cases in sequence
5. View results per test case

---

## 6. Permissions & Authorization

### 6.1 Permission Matrix

| Action | ADMIN | PROJECT_MANAGER | TESTER | VIEWER |
|--------|-------|-----------------|--------|--------|
| View Suites | ✅ | ✅ | ✅ | ✅ |
| Create Suite | ✅ | ✅ | ✅ | ❌ |
| Edit Suite | ✅ | ✅ | ✅ | ❌ |
| Delete Suite | ✅ | ✅ | ✅ | ❌ |
| Move Test Cases | ✅ | ✅ | ✅ | ❌ |
| Reorder Suites | ✅ | ✅ | ✅ | ❌ |
| Execute Suite | ✅ | ✅ | ✅ | ❌ |

---

## 7. Best Practices

### 7.1 Hierarchy Design

- Keep depth to 3-4 levels maximum
- Use logical grouping (functional areas, user roles, etc.)
- Create suites for major features/modules
- Nest suites for specific scenarios
- Use naming conventions consistently

### 7.2 Naming Conventions

**Root level suites:**
- Use feature names: "Authentication", "User Management", "Payments"

**Nested suites:**
- Use scenario groupings: "Happy Path", "Error Cases", "Edge Cases"
- Use user role: "Admin Tests", "User Tests", "Guest Tests"

**Examples:**
```
Good hierarchy:
├── Authentication
│   ├── Login
│   ├── Logout
│   └── Password Reset
├── E-Commerce
│   ├── Shopping Cart
│   ├── Checkout
│   └── Payment
└── User Management
    ├── Profile
    └── Permissions

Bad hierarchy:
├── Test Suite 1
│   ├── Test Sub 1
│   │   └── Test Sub Sub 1
│   └── Test Sub 2
└── Test Suite 2
```

### 7.3 Suite Maintenance

- Review hierarchy quarterly
- Archive unused suites
- Consolidate small suites
- Update suite descriptions
- Keep consistent naming
- Limit test cases per suite (200-300 max)

### 7.4 Execution Planning

- Group test cases for efficient execution
- Consider execution time per suite
- Group related scenarios for faster execution
- Use suites for parallel test execution

---

## 8. Error Handling

### 8.1 Validation Errors

```json
{
  "error": "Validation failed",
  "message": "Suite name is required"
}
```

### 8.2 Hierarchy Errors

```json
{
  "error": "Invalid hierarchy",
  "message": "Cannot move suite to its own child suite (circular reference)"
}
```

### 8.3 Permission Errors

```json
{
  "error": "Access denied",
  "message": "You don't have permission to manage test suites"
}
```

---

## 9. Code References

### 9.1 Key Files

**Backend:**
- `backend/services/testsuite/services.ts` - Service layer
- `backend/controllers/testsuite/controller.ts` - Controller
- `app/api/projects/[id]/testsuites/route.ts` - List/create endpoint
- `app/api/testsuites/[id]/route.ts` - Detail/update/delete endpoint
- `app/api/testsuites/move/route.ts` - Move test cases endpoint
- `app/api/testsuites/reorder/route.ts` - Reorder endpoint

**Frontend:**
- `app/projects/[id]/testsuites/page.tsx` - Suites list page
- `app/projects/[id]/testsuites/[suiteId]/page.tsx` - Suite detail page
- `frontend/components/testsuite/*` - Reusable components

### 9.2 Important Methods

```typescript
// Service methods
testSuiteService.getProjectTestSuites(projectId)
testSuiteService.getTestSuiteById(suiteId)
testSuiteService.createTestSuite(data)
testSuiteService.updateTestSuite(suiteId, data)
testSuiteService.deleteTestSuite(suiteId)
testSuiteService.moveTestCasesToSuite(testCaseIds, suiteId)
testSuiteService.reorderSuites(updates)
```

---

## 10. Testing Scenarios

### 10.1 API Testing

```bash
# List suites
GET http://localhost:3000/api/projects/proj_123/testsuites

# Create suite
POST http://localhost:3000/api/projects/proj_123/testsuites
{
  "name": "Authentication",
  "description": "All auth tests"
}

# Create nested suite
POST http://localhost:3000/api/projects/proj_123/testsuites
{
  "name": "Login Scenarios",
  "parentId": "suite_123"
}

# Get suite details
GET http://localhost:3000/api/testsuites/suite_123

# Update suite
PATCH http://localhost:3000/api/testsuites/suite_123
{
  "name": "Updated Name"
}

# Move test cases
POST http://localhost:3000/api/testsuites/move
{
  "testCaseIds": ["tc_1", "tc_2"],
  "suiteId": "suite_123"
}

# Delete suite
DELETE http://localhost:3000/api/testsuites/suite_123
```

### 10.2 UI Testing

- Create root level suite
- Create nested suite under root
- Edit suite properties
- Move suite to different parent
- Move test cases to suite
- Delete suite
- Verify hierarchy displays correctly
- Expand/collapse suites
- Search within hierarchy

---

## 11. Troubleshooting

### Issue: Can't create nested suite
**Causes:**
- Parent suite doesn't exist
- Permission issue
- Invalid parent ID

**Solution:** Verify parent suite exists, check permissions

### Issue: Circular reference error
**Causes:**
- Moving suite to its own child
- Invalid parent assignment

**Solution:** Choose valid parent, verify hierarchy

### Issue: Test cases not appearing in suite
**Causes:**
- Test cases not assigned to suite
- Wrong suite selected
- Permission issue

**Solution:** Use move endpoint to assign, verify suite ID

---

## 12. Metrics & Reporting

### 12.1 Suite Metrics

- Total suites per project
- Average test cases per suite
- Suite depth
- Suite utilization
- Nested structure statistics

### 12.2 Hierarchy Reports

- Suite structure export
- Test coverage by suite
- Execution status per suite
- Pass rate by suite

---

## 13. Roadmap & Future Enhancements

- [ ] Drag-and-drop suite reorganization
- [ ] Suite templates/blueprints
- [ ] Automatic suite grouping based on tags
- [ ] Suite-level configuration (skip conditions, etc.)
- [ ] Test coverage by suite
- [ ] Suite execution scheduling
- [ ] Suite dependency management
- [ ] Import/export suite structures

