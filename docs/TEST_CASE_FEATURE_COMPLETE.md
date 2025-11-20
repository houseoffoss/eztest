# Test Case Features - Complete Documentation

## Overview

The Test Case feature enables teams to create, manage, and organize comprehensive test scenarios. Each test case represents a specific testing scenario with detailed steps, expected results, and execution history. Test cases can be organized into test suites and executed as part of test runs.

---

## 1. Test Case Architecture

### 1.1 Data Model

```typescript
// Prisma Schema
model TestCase {
  id              String   @id @default(cuid())
  tcId            String   // Unique sequential ID per project (tc1, tc2, etc)
  projectId       String
  project         Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  title           String   // Test case title (required, 1-255 chars)
  description     String?  // Detailed description
  expectedResult  String?  // Expected outcome of the test case
  priority        Priority @default(MEDIUM)  // CRITICAL, HIGH, MEDIUM, LOW
  status          TestStatus @default(ACTIVE)  // ACTIVE, DRAFT, DEPRECATED
  
  suiteId         String?  // Optional parent test suite
  suite           TestSuite? @relation(fields: [suiteId], references: [id], onDelete: SetNull)
  
  preconditions   String?  // Setup required before test execution
  postconditions  String?  // Cleanup after test execution
  estimatedTime   Int?     // Estimated time in minutes
  
  steps           TestStep[]      // Detailed test steps
  results         TestResult[]    // Execution results from test runs
  
  createdById     String
  createdBy       User     @relation(fields: [createdById], references: [id])
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Composite unique: each project has unique tcIds
  @@unique([projectId, tcId])
}

model TestStep {
  id              String   @id @default(cuid())
  testCaseId      String
  testCase        TestCase @relation(fields: [testCaseId], references: [id], onDelete: Cascade)
  
  stepNumber      Int      // Sequential step number
  action          String   // What to do in this step
  expectedResult  String   // What should happen
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@unique([testCaseId, stepNumber])
}

enum Priority {
  CRITICAL
  HIGH
  MEDIUM
  LOW
}

enum TestStatus {
  ACTIVE
  DRAFT
  DEPRECATED
}
```

### 1.2 Architecture Flow

```
┌─────────────────────────────────────────┐
│    UI: Test Case Pages                  │
│  - List view                            │
│  - Detail view                          │
│  - Create/Edit forms                    │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│    API Routes                           │
│  GET    /api/projects/[id]/testcases    │
│  POST   /api/projects/[id]/testcases    │
│  GET    /api/testcases/[id]             │
│  PUT    /api/testcases/[id]             │
│  DELETE /api/testcases/[id]             │
│  PUT    /api/testcases/[id]/steps       │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│    TestCaseController                   │
│  - Input validation                     │
│  - Permission checks                    │
│  - Response formatting                  │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│    TestCaseService                      │
│  - CRUD operations                      │
│  - ID generation (tc1, tc2...)          │
│  - Step management                      │
│  - Filter & search                      │
└──────────────┬──────────────────────────┘
               │
└──────────────▼──────────────────────────┘
         Prisma → PostgreSQL
```

---

## 2. API Reference

### 2.1 List Test Cases

**Endpoint:** `GET /api/projects/[id]/testcases`

**Authentication:** Required

**Authorization:** User must be project member

**Query Parameters:**
- `suiteId` (optional): Filter by test suite
- `priority` (optional): Filter by priority (CRITICAL, HIGH, MEDIUM, LOW)
- `status` (optional): Filter by status (ACTIVE, DRAFT, DEPRECATED)
- `search` (optional): Search by title/description

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "tc_123",
      "tcId": "tc1",
      "title": "User Login - Valid Credentials",
      "description": "Verify user can login with valid email and password",
      "expectedResult": "User is authenticated and dashboard displays",
      "priority": "CRITICAL",
      "status": "ACTIVE",
      "estimatedTime": 5,
      "suiteId": "suite_123",
      "suite": {
        "id": "suite_123",
        "name": "Authentication"
      },
      "preconditions": "User account exists in system",
      "postconditions": "User session is created",
      "createdBy": {
        "id": "user_123",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "_count": {
        "steps": 4,
        "results": 12,
        "requirements": 2
      },
      "createdAt": "2025-11-01T10:30:00Z"
    }
  ]
}
```

---

### 2.2 Create Test Case

**Endpoint:** `POST /api/projects/[id]/testcases`

**Authentication:** Required

**Authorization:** TESTER or higher role in project

**Request Body:**
```json
{
  "title": "User Login - Valid Credentials",
  "description": "Verify user can login with valid email and password",
  "expectedResult": "User is authenticated and dashboard displays",
  "priority": "CRITICAL",
  "status": "ACTIVE",
  "estimatedTime": 5,
  "suiteId": "suite_123",
  "preconditions": "User account exists in system",
  "postconditions": "User session is created",
  "steps": [
    {
      "stepNumber": 1,
      "action": "Navigate to login page",
      "expectedResult": "Login form is displayed"
    },
    {
      "stepNumber": 2,
      "action": "Enter email: test@example.com",
      "expectedResult": "Email is entered in the field"
    },
    {
      "stepNumber": 3,
      "action": "Enter password: TestPassword123",
      "expectedResult": "Password is entered (masked)"
    },
    {
      "stepNumber": 4,
      "action": "Click Login button",
      "expectedResult": "User is redirected to dashboard"
    }
  ]
}
```

**Validation Rules:**
- `title` (required): 1-255 characters, non-empty
- `description` (optional): Any text
- `expectedResult` (optional): Any text
- `priority` (optional): CRITICAL, HIGH, MEDIUM, LOW (default: MEDIUM)
- `status` (optional): ACTIVE, DRAFT, DEPRECATED (default: ACTIVE)
- `estimatedTime` (optional): Positive integer (minutes)
- `suiteId` (optional): Valid test suite ID or null
- `preconditions` (optional): Any text
- `postconditions` (optional): Any text
- `steps` (optional): Array of test steps

**Test Step Schema:**
```typescript
{
  stepNumber: number (required, positive integer)
  action: string (required, non-empty)
  expectedResult: string (required, non-empty)
}
```

**Response (201 Created):**
```json
{
  "data": {
    "id": "tc_456",
    "tcId": "tc2",
    "title": "User Login - Valid Credentials",
    "description": "Verify user can login with valid email and password",
    "expectedResult": "User is authenticated and dashboard displays",
    "priority": "CRITICAL",
    "status": "ACTIVE",
    "estimatedTime": 5,
    "suiteId": "suite_123",
    "preconditions": "User account exists in system",
    "postconditions": "User session is created",
    "createdAt": "2025-11-15T14:22:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Validation failed
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Project or suite not found

---

### 2.3 Get Test Case Details

**Endpoint:** `GET /api/testcases/[id]`

**Authentication:** Required

**Authorization:** User must be project member

**Response (200 OK):**
```json
{
  "data": {
    "id": "tc_123",
    "tcId": "tc1",
    "title": "User Login - Valid Credentials",
    "description": "Verify user can login with valid email and password",
    "expectedResult": "User is authenticated and dashboard displays",
    "priority": "CRITICAL",
    "status": "ACTIVE",
    "estimatedTime": 5,
    "suiteId": "suite_123",
    "suite": {
      "id": "suite_123",
      "name": "Authentication"
    },
    "preconditions": "User account exists in system",
    "postconditions": "User session is created",
    "steps": [
      {
        "id": "step_1",
        "stepNumber": 1,
        "action": "Navigate to login page",
        "expectedResult": "Login form is displayed"
      },
      {
        "id": "step_2",
        "stepNumber": 2,
        "action": "Enter email: test@example.com",
        "expectedResult": "Email is entered in the field"
      }
    ],
    "createdBy": {
      "id": "user_123",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "_count": {
      "steps": 4,
      "results": 12
    },
    "createdAt": "2025-11-01T10:30:00Z"
  }
}
```

---

### 2.4 Update Test Case

**Endpoint:** `PUT /api/testcases/[id]`

**Authentication:** Required

**Authorization:** TESTER or higher role in project

**Request Body:**
```json
{
  "title": "Updated Test Case Title",
  "description": "Updated description",
  "priority": "HIGH",
  "status": "DRAFT",
  "estimatedTime": 10,
  "suiteId": "suite_456",
  "preconditions": "Updated preconditions",
  "postconditions": "Updated postconditions"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "tc_123",
    "tcId": "tc1",
    "title": "Updated Test Case Title",
    "priority": "HIGH",
    "status": "DRAFT",
    "estimatedTime": 10,
    "updatedAt": "2025-11-15T16:45:00Z"
  }
}
```

---

### 2.5 Delete Test Case

**Endpoint:** `DELETE /api/testcases/[id]`

**Authentication:** Required

**Authorization:** TESTER or higher role in project

**Response (200 OK):**
```json
{
  "message": "Test case deleted successfully"
}
```

---

### 2.6 Update Test Steps

**Endpoint:** `PUT /api/testcases/[id]/steps`

**Authentication:** Required

**Authorization:** TESTER or higher role in project

**Request Body:**
```json
{
  "steps": [
    {
      "stepNumber": 1,
      "action": "Navigate to login page",
      "expectedResult": "Login form is displayed"
    },
    {
      "stepNumber": 2,
      "action": "Enter valid credentials",
      "expectedResult": "Credentials are accepted"
    },
    {
      "stepNumber": 3,
      "action": "Click Login",
      "expectedResult": "User is logged in and redirected to dashboard"
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "tc_123",
    "tcId": "tc1",
    "title": "User Login - Valid Credentials",
    "steps": [
      {
        "id": "step_1",
        "stepNumber": 1,
        "action": "Navigate to login page",
        "expectedResult": "Login form is displayed"
      },
      {
        "id": "step_2",
        "stepNumber": 2,
        "action": "Enter valid credentials",
        "expectedResult": "Credentials are accepted"
      },
      {
        "id": "step_3",
        "stepNumber": 3,
        "action": "Click Login",
        "expectedResult": "User is logged in and redirected to dashboard"
      }
    ]
  }
}
```

---

## 3. UI Components

### 3.1 Test Cases List Page

**Location:** `/app/projects/[id]/testcases/page.tsx`

**Features:**
- Display all test cases in table format
- Columns: ID, Title, Priority, Status, Suite, Created By, Actions
- Search by title/description
- Filter by priority (dropdown)
- Filter by status (dropdown)
- Filter by test suite (dropdown)
- Sort by various columns
- Create new test case button
- View/edit/delete actions per row
- Bulk actions (mark as deprecated, delete multiple)
- Pagination

**Priority Color Coding:**
- 🔴 CRITICAL - Red
- 🟠 HIGH - Orange
- 🟡 MEDIUM - Yellow
- 🟢 LOW - Green

**Status Indicators:**
- ✅ ACTIVE - Green checkmark
- 📝 DRAFT - Draft label
- ⚠️ DEPRECATED - Strikethrough

### 3.2 Test Case Detail View

**Location:** `/app/projects/[id]/testcases/[testcaseId]/page.tsx`

**Layout:**
```
┌─────────────────────────────────────┐
│  Test Case: tc1                      │
│  User Login - Valid Credentials      │
│  Created by: John Doe                │
└─────────────────────────────────────┘

┌─ Basic Information ──────────────────┐
│  Title: ...                          │
│  Priority: [CRITICAL]                │
│  Status: [ACTIVE]                    │
│  Estimated Time: 5 minutes           │
│  Suite: Authentication               │
└──────────────────────────────────────┘

┌─ Description ────────────────────────┐
│  Verify user can login with valid    │
│  email and password                  │
└──────────────────────────────────────┘

┌─ Expected Result ────────────────────┐
│  User is authenticated and           │
│  dashboard displays                  │
└──────────────────────────────────────┘

┌─ Pre/Post Conditions ────────────────┐
│  Preconditions: User account exists  │
│  Postconditions: User session created│
└──────────────────────────────────────┘

┌─ Test Steps ─────────────────────────┐
│  Step 1: Navigate to login page      │
│    → Login form is displayed         │
│  Step 2: Enter email: test@...       │
│    → Email is entered in the field   │
│  Step 3: Enter password              │
│    → Password is entered (masked)    │
│  Step 4: Click Login button          │
│    → User is redirected to dashboard │
└──────────────────────────────────────┘

┌─ Execution History ──────────────────┐
│  Run ID    Status    Date      By    │
│  run_123   PASSED    11/15     John  │
│  run_124   FAILED    11/14     Jane  │
│  run_125   BLOCKED   11/13     Bob   │
└──────────────────────────────────────┘

[Edit] [Delete] [Duplicate] [Run Test]
```

### 3.3 Create/Edit Test Case Form

**Location:** `/app/projects/[id]/testcases/new/page.tsx` (create)

**Form Fields:**
1. **Title** (required)
   - Text input, max 255 chars
   - Live character counter

2. **Description** (optional)
   - Rich text editor or textarea
   - Markdown support

3. **Expected Result** (optional)
   - Text input, describes expected outcome

4. **Priority** (optional, default: MEDIUM)
   - Radio buttons: CRITICAL, HIGH, MEDIUM, LOW
   - Color-coded display

5. **Status** (optional, default: ACTIVE)
   - Radio buttons: ACTIVE, DRAFT, DEPRECATED
   - Visual indicators

6. **Test Suite** (optional)
   - Dropdown with suite hierarchy
   - Can move test case between suites

7. **Estimated Time** (optional)
   - Number input (minutes)
   - Suggestions: 5, 10, 15, 30, 60 minutes

8. **Preconditions** (optional)
   - Textarea for setup requirements

9. **Postconditions** (optional)
   - Textarea for cleanup requirements

10. **Test Steps** (optional)
    - Dynamic step list
    - Add/remove steps
    - Step number auto-increments
    - For each step:
      - Step Number
      - Action (what to do)
      - Expected Result (what should happen)

**Form Actions:**
- Save Test Case
- Save & Add Another
- Save as Draft
- Preview
- Cancel

### 3.4 Test Case Card Component

**Used in:** List views, project dashboard

```typescript
interface TestCaseCardProps {
  testCase: TestCase;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onRun?: (id: string) => void;
}

// Shows:
// - Test case ID (tc1)
// - Title
// - Priority badge
// - Status indicator
// - Estimated time
// - Suite name
// - Creator name
// - Quick action buttons
```

### 3.5 TypeScript Interfaces

```typescript
export interface TestCase {
  id: string;
  tcId: string;  // e.g., "tc1", "tc2"
  title: string;
  description?: string;
  expectedResult?: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'ACTIVE' | 'DRAFT' | 'DEPRECATED';
  estimatedTime?: number;
  suiteId?: string;
  suite?: {
    id: string;
    name: string;
  };
  preconditions?: string;
  postconditions?: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  _count: {
    steps: number;
    results: number;
    requirements: number;
  };
  createdAt: string;
}

export interface TestStep {
  id: string;
  stepNumber: number;
  action: string;
  expectedResult: string;
}

export interface TestCaseFormData {
  title: string;
  description: string;
  expectedResult: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'ACTIVE' | 'DRAFT' | 'DEPRECATED';
  estimatedTime: string;
  preconditions: string;
  postconditions: string;
  suiteId: string | null;
  steps: TestStep[];
}
```

---

## 4. User Workflows

### 4.1 Create a Test Case

**Steps:**
1. Go to Project → Test Cases
2. Click "Create New Test Case"
3. Fill in basic information:
   - Title: "User Login - Valid Credentials"
   - Priority: CRITICAL
   - Status: ACTIVE
4. Add description and expected result
5. Fill preconditions and postconditions
6. Add test steps:
   - Step 1: Navigate to login page → Login form displays
   - Step 2: Enter credentials → Fields are populated
   - Step 3: Click Login → User is logged in
7. Click "Save Test Case"
8. Test case is created with auto-generated tcId (tc1, tc2, etc.)

### 4.2 Organize into Test Suites

**Steps:**
1. Create test cases
2. View test case details
3. Edit → Select test suite
4. Save
5. Test case now appears under that suite

### 4.3 Execute Test Case

**Steps:**
1. View test case details
2. Click "Run Test" button
3. Creates or links to test run
4. Follow steps manually
5. Record results for each step
6. Save execution result (PASSED/FAILED/BLOCKED/etc.)

### 4.4 Bulk Operations

**Steps:**
1. List view → Select multiple test cases (checkboxes)
2. Click "Bulk Actions"
3. Options:
   - Mark as Deprecated
   - Move to Suite
   - Delete All
   - Change Priority
4. Confirm action

---

## 5. Features & Capabilities

### 5.1 Test Case ID System

Each project maintains sequential test case IDs:
- tc1, tc2, tc3, ... automatically generated
- Unique per project
- Read-only after creation
- Used for quick reference

### 5.2 Priority Levels

- **CRITICAL**: Test must pass before release
- **HIGH**: Important functional test
- **MEDIUM**: Standard test (default)
- **LOW**: Nice-to-have test

### 5.3 Status Lifecycle

- **DRAFT**: In development, not ready to execute
- **ACTIVE**: Ready for execution (default)
- **DEPRECATED**: No longer used, kept for history

### 5.4 Test Steps

- Detailed action-by-action test procedure
- Each step includes action and expected result
- Steps guide testers through test execution
- Can be reordered or edited

### 5.5 Search & Filter

- Search by title or description
- Filter by priority
- Filter by status
- Filter by test suite
- Combine multiple filters

---

## 6. Error Handling

### 6.1 Validation Errors

```json
{
  "error": "Validation failed",
  "fields": [
    {
      "field": "title",
      "message": "Title is required"
    },
    {
      "field": "steps",
      "message": "Each step must have an action and expected result"
    }
  ]
}
```

### 6.2 Permission Errors

```json
{
  "error": "Access denied",
  "message": "You don't have permission to create test cases"
}
```

### 6.3 Not Found Errors

```json
{
  "error": "Test case not found",
  "testCaseId": "tc_123"
}
```

---

## 7. Best Practices

### 7.1 Test Case Writing

- Use clear, descriptive titles
- Include exact values in steps (not "enter password" but "enter: SecurePass123")
- Break complex scenarios into multiple steps
- Define clear pre/postconditions
- Set realistic estimated times
- Use expected result field for overall test goal

### 7.2 Naming Conventions

- Title format: "Feature - Scenario"
  - Good: "Login - Valid Email and Password"
  - Bad: "Test 1"
- Use consistent terminology
- Reference user roles: "User", "Admin", "Guest"

### 7.3 Priority Assignment

- CRITICAL: Blocking functionality, security tests
- HIGH: Main features, core workflows
- MEDIUM: Secondary features, edge cases
- LOW: UI refinements, nice-to-have functionality

### 7.4 Organization

- Group related tests in suites
- Keep test count manageable (50-200 per suite)
- Archive deprecated tests rather than deleting
- Maintain test-to-requirement traceability

---

## 8. Code References

### 8.1 Key Files

**Backend:**
- `backend/services/testcase/services.ts` - Service layer
- `backend/controllers/testcase/controller.ts` - Controller
- `backend/validators/testcase.validator.ts` - Validation schemas
- `app/api/projects/[id]/testcases/route.ts` - List/create endpoint
- `app/api/testcases/[id]/route.ts` - Detail/update/delete endpoint
- `app/api/testcases/[id]/steps/route.ts` - Steps management

**Frontend:**
- `app/projects/[id]/testcases/page.tsx` - List page
- `app/projects/[id]/testcases/[testcaseId]/page.tsx` - Detail page
- `app/projects/[id]/testcases/new/page.tsx` - Create page
- `frontend/components/testcase/*` - Reusable components

### 8.2 Important Methods

```typescript
// Service methods
testCaseService.getProjectTestCases(projectId, filters)
testCaseService.getTestCaseById(testCaseId, userId, scope)
testCaseService.createTestCase(data)
testCaseService.updateTestCase(testCaseId, userId, scope, data)
testCaseService.deleteTestCase(testCaseId, userId, scope)
testCaseService.updateTestSteps(testCaseId, userId, scope, steps)
testCaseService.generateTestCaseId(projectId)  // Generates tc1, tc2, etc
```

---

## 9. Testing Scenarios

### 9.1 API Testing

```bash
# List test cases
GET http://localhost:3000/api/projects/proj_123/testcases?priority=CRITICAL&status=ACTIVE

# Create test case
POST http://localhost:3000/api/projects/proj_123/testcases
{
  "title": "Login Test",
  "priority": "CRITICAL",
  "steps": [...]
}

# Get specific test case
GET http://localhost:3000/api/testcases/tc_123

# Update test case
PUT http://localhost:3000/api/testcases/tc_123
{
  "title": "Updated Title"
}

# Update steps
PUT http://localhost:3000/api/testcases/tc_123/steps
{
  "steps": [...]
}

# Delete test case
DELETE http://localhost:3000/api/testcases/tc_123
```

### 9.2 UI Testing

- Create test case with valid data
- Verify tcId is auto-generated (tc1)
- Create multiple test cases, verify sequential IDs
- Add test steps and verify they're displayed correctly
- Edit test case and verify changes
- Delete test case and verify removal
- Filter by priority/status
- Search by title
- Move test case to different suite

---

## 10. Troubleshooting

### Issue: Can't create test case
**Causes:**
- Insufficient permissions (need TESTER or higher)
- Project not found
- Validation error in form

**Solution:** Check user role, verify project ID, review validation errors

### Issue: Test steps not saving
**Causes:**
- Step number not sequential
- Missing action or expected result
- Invalid JSON

**Solution:** Verify step numbers start at 1, all fields are filled

### Issue: Can't find test case
**Causes:**
- Test case doesn't exist
- Insufficient permissions
- Wrong project context

**Solution:** Verify tcId, check permissions, ensure correct project

---

## 11. Metrics & Reporting

### 11.1 Test Case Metrics

- Total test cases per project
- By priority (critical, high, medium, low)
- By status (active, draft, deprecated)
- By suite
- Test case pass rate
- Execution frequency

### 11.2 Dashboards

- Test case creation trend
- Priority distribution
- Status breakdown
- Most executed test cases
- Newest test cases

---

## 12. Roadmap & Future Enhancements

- [ ] Test case templates
- [ ] Test case cloning/duplication
- [ ] Requirement traceability (link to requirements)
- [ ] Test case versioning/history
- [ ] Test case comments/discussions
- [ ] Inline attachments (screenshots, files)
- [ ] Test case dependencies
- [ ] Automated test script generation
- [ ] BDD/Gherkin support
- [ ] Integration with test management tools

