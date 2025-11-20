# Test Runs Features - Complete Documentation

## Overview

The Test Runs feature enables teams to execute test cases, record results, and track testing progress. A test run is a specific execution of selected test cases in a particular environment at a given time. Test runs help track which tests have been executed, their results (passed/failed/blocked), and provide execution history and metrics for project visibility.

---

## 1. Test Run Architecture

### 1.1 Data Model

```typescript
// Prisma Schema
model TestRun {
  id              String   @id @default(cuid())
  name            String   // Run name (required)
  description     String?  // Optional description
  
  projectId       String
  project         Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  status          TestRunStatus @default(PLANNED)  // PLANNED, IN_PROGRESS, COMPLETED, CANCELLED
  environment     String?  // Target environment (Staging, QA, Production, etc)
  
  assignedToId    String?  // User assigned to execute the run
  assignedTo      User?    @relation(fields: [assignedToId], references: [id])
  
  createdById     String
  createdBy       User     @relation(fields: [createdById], references: [id])
  
  results         TestResult[]  // Individual test results
  
  startedAt       DateTime?
  completedAt     DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model TestResult {
  id              String   @id @default(cuid())
  testRunId       String
  testRun         TestRun  @relation(fields: [testRunId], references: [id], onDelete: Cascade)
  
  testCaseId      String
  testCase        TestCase @relation(fields: [testCaseId], references: [id])
  
  status          TestResultStatus  // PASSED, FAILED, BLOCKED, SKIPPED, RETEST
  
  executedById    String
  executedBy      User     @relation(fields: [executedById], references: [id])
  
  duration        Int?     // Execution time in seconds
  comment         String?  // Test result notes
  errorMessage    String?  // Error details if failed
  stackTrace      String?  // Stack trace if failed
  
  executedAt      DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum TestRunStatus {
  PLANNED         // Run created but not started
  IN_PROGRESS     // Run is being executed
  COMPLETED       // All tests executed
  CANCELLED       // Run was cancelled
}

enum TestResultStatus {
  PASSED          // Test passed
  FAILED          // Test failed
  BLOCKED         // Cannot execute (blocker)
  SKIPPED         // Not executed
  RETEST          // Needs re-execution
}
```

### 1.2 Architecture Layers

```
┌──────────────────────────────────────────┐
│     UI: Test Run Pages & Components      │
│  - List view                             │
│  - Detail/execution view                 │
│  - Create/edit forms                     │
│  - Results display                       │
└──────────────┬───────────────────────────┘
               │
┌──────────────▼───────────────────────────┐
│     API Routes                           │
│  GET    /api/projects/[id]/testruns      │
│  POST   /api/projects/[id]/testruns      │
│  GET    /api/testruns/[id]               │
│  PATCH  /api/testruns/[id]               │
│  DELETE /api/testruns/[id]               │
│  POST   /api/testruns/[id]/start         │
│  POST   /api/testruns/[id]/complete      │
│  POST   /api/testruns/[id]/results       │
└──────────────┬───────────────────────────┘
               │
┌──────────────▼───────────────────────────┐
│    TestRunController                     │
│  - Request handling                      │
│  - Input validation                      │
│  - Response formatting                   │
└──────────────┬───────────────────────────┘
               │
┌──────────────▼───────────────────────────┐
│    TestRunService                        │
│  - CRUD operations                       │
│  - Status transitions                    │
│  - Result recording                      │
│  - Statistics calculation                │
└──────────────┬───────────────────────────┘
               │
└──────────────▼───────────────────────────┘
         Prisma → PostgreSQL
```

---

## 2. API Reference

### 2.1 List Test Runs

**Endpoint:** `GET /api/projects/[id]/testruns`

**Authentication:** Required

**Authorization:** User must be project member

**Query Parameters:**
- `status` (optional): Filter by status (PLANNED, IN_PROGRESS, COMPLETED, CANCELLED)
- `assignedToId` (optional): Filter by assigned user
- `environment` (optional): Filter by environment
- `search` (optional): Search by run name

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "run_123",
      "name": "Sprint 2.1 Regression Testing",
      "description": "End-to-end regression testing for Sprint 2.1 release",
      "status": "IN_PROGRESS",
      "environment": "Staging",
      "assignedTo": {
        "id": "user_123",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "results": [
        {
          "status": "PASSED",
          "testCaseId": "tc_1"
        },
        {
          "status": "FAILED",
          "testCaseId": "tc_2"
        }
      ],
      "_count": {
        "results": 45
      },
      "createdAt": "2025-11-15T10:00:00Z",
      "startedAt": "2025-11-15T10:15:00Z",
      "completedAt": null
    }
  ]
}
```

---

### 2.2 Create Test Run

**Endpoint:** `POST /api/projects/[id]/testruns`

**Authentication:** Required

**Authorization:** TESTER or higher role in project

**Request Body:**
```json
{
  "name": "Sprint 2.1 Regression Testing",
  "description": "End-to-end regression testing for Sprint 2.1 release",
  "environment": "Staging",
  "assignedToId": "user_123",
  "testCaseIds": ["tc_1", "tc_2", "tc_3", "tc_4"]
}
```

**Validation Rules:**
- `name` (required): 1-255 characters, non-empty
- `description` (optional): Any text
- `environment` (optional): Any text (e.g., "Staging", "QA", "Production")
- `assignedToId` (optional): Valid user ID or null (unassigned)
- `testCaseIds` (optional): Array of test case IDs to include in run

**Response (201 Created):**
```json
{
  "data": {
    "id": "run_456",
    "name": "Sprint 2.1 Regression Testing",
    "description": "End-to-end regression testing for Sprint 2.1 release",
    "projectId": "proj_123",
    "status": "PLANNED",
    "environment": "Staging",
    "assignedToId": "user_123",
    "createdById": "user_123",
    "createdAt": "2025-11-15T14:22:00Z",
    "startedAt": null,
    "completedAt": null,
    "_count": {
      "results": 4
    }
  }
}
```

---

### 2.3 Get Test Run Details

**Endpoint:** `GET /api/testruns/[id]`

**Authentication:** Required

**Authorization:** User must be project member

**Response (200 OK):**
```json
{
  "data": {
    "id": "run_123",
    "name": "Sprint 2.1 Regression Testing",
    "description": "End-to-end regression testing for Sprint 2.1 release",
    "status": "IN_PROGRESS",
    "environment": "Staging",
    "project": {
      "id": "proj_123",
      "name": "E-Commerce Platform",
      "key": "ECOM"
    },
    "assignedTo": {
      "id": "user_123",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "results": [
      {
        "id": "result_1",
        "status": "PASSED",
        "testCaseId": "tc_1",
        "testCase": {
          "id": "tc_1",
          "tcId": "tc1",
          "title": "User Login - Valid Credentials",
          "priority": "CRITICAL"
        },
        "executedBy": {
          "id": "user_123",
          "name": "John Doe"
        },
        "comment": "Test passed successfully",
        "duration": 45,
        "executedAt": "2025-11-15T10:30:00Z"
      },
      {
        "id": "result_2",
        "status": "FAILED",
        "testCaseId": "tc_2",
        "testCase": {
          "id": "tc_2",
          "tcId": "tc2",
          "title": "User Logout",
          "priority": "HIGH"
        },
        "executedBy": {
          "id": "user_123",
          "name": "John Doe"
        },
        "comment": "Session timeout not triggered",
        "errorMessage": "Logout button not visible after 30 minutes",
        "duration": 120,
        "executedAt": "2025-11-15T10:45:00Z"
      }
    ],
    "createdAt": "2025-11-15T10:00:00Z",
    "startedAt": "2025-11-15T10:15:00Z",
    "completedAt": null
  }
}
```

---

### 2.4 Update Test Run

**Endpoint:** `PATCH /api/testruns/[id]`

**Authentication:** Required

**Authorization:** TESTER or higher role in project

**Request Body:**
```json
{
  "name": "Sprint 2.1 Extended Testing",
  "description": "Extended regression testing",
  "environment": "Production",
  "assignedToId": "user_456"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "run_123",
    "name": "Sprint 2.1 Extended Testing",
    "environment": "Production",
    "assignedToId": "user_456",
    "updatedAt": "2025-11-15T16:45:00Z"
  }
}
```

---

### 2.5 Delete Test Run

**Endpoint:** `DELETE /api/testruns/[id]`

**Authentication:** Required

**Authorization:** TESTER or higher role in project

**Response (200 OK):**
```json
{
  "message": "Test run deleted successfully"
}
```

---

### 2.6 Start Test Run

**Endpoint:** `POST /api/testruns/[id]/start`

**Authentication:** Required

**Authorization:** User assigned to run or TESTER+

**Response (200 OK):**
```json
{
  "data": {
    "id": "run_123",
    "status": "IN_PROGRESS",
    "startedAt": "2025-11-15T14:00:00Z"
  }
}
```

**Status Transitions:**
- PLANNED → IN_PROGRESS

---

### 2.7 Complete Test Run

**Endpoint:** `POST /api/testruns/[id]/complete`

**Authentication:** Required

**Authorization:** User assigned to run or TESTER+

**Response (200 OK):**
```json
{
  "data": {
    "id": "run_123",
    "status": "COMPLETED",
    "completedAt": "2025-11-15T16:45:00Z",
    "summary": {
      "total": 45,
      "passed": 42,
      "failed": 2,
      "blocked": 1,
      "skipped": 0,
      "passRate": "93.3%"
    }
  }
}
```

**Status Transitions:**
- IN_PROGRESS → COMPLETED
- PLANNED → COMPLETED

---

### 2.8 Add Test Result

**Endpoint:** `POST /api/testruns/[id]/results`

**Authentication:** Required

**Authorization:** User assigned to run or TESTER+

**Request Body:**
```json
{
  "testCaseId": "tc_1",
  "status": "PASSED",
  "duration": 45,
  "comment": "Test executed successfully",
  "errorMessage": null,
  "stackTrace": null
}
```

**Validation Rules:**
- `testCaseId` (required): Valid test case ID
- `status` (required): PASSED, FAILED, BLOCKED, SKIPPED, or RETEST
- `duration` (optional): Number of seconds
- `comment` (optional): Test notes
- `errorMessage` (optional): Error details if failed
- `stackTrace` (optional): Stack trace if failed

**Response (201 Created):**
```json
{
  "data": {
    "id": "result_123",
    "testRunId": "run_123",
    "testCaseId": "tc_1",
    "status": "PASSED",
    "duration": 45,
    "comment": "Test executed successfully",
    "executedBy": {
      "id": "user_123",
      "name": "John Doe"
    },
    "executedAt": "2025-11-15T14:30:00Z"
  }
}
```

---

## 3. UI Components

### 3.1 Test Runs List Page

**Location:** `/app/projects/[id]/testruns/page.tsx`

**Features:**
- Display all test runs in table/card format
- Columns: Name, Status, Environment, Assigned To, Progress, Actions
- Filter by status (PLANNED, IN_PROGRESS, COMPLETED, CANCELLED)
- Filter by environment
- Filter by assigned user
- Search by run name
- Create new test run button
- View/edit/delete actions per row
- Status badges with colors
- Progress indicator (X/Y tests completed)
- Sort by creation date, status, etc.

**Status Color Coding:**
- 🔵 PLANNED - Blue (not started)
- 🟠 IN_PROGRESS - Orange (active)
- ✅ COMPLETED - Green (done)
- ⛔ CANCELLED - Red (cancelled)

**Progress Display:**
- Visual progress bar
- "42/45 passed" or "42/45 completed"
- Percentage completion

### 3.2 Test Run Execution Page

**Location:** `/app/projects/[id]/testruns/[testrunId]/page.tsx`

**Layout:**
```
┌─────────────────────────────────────┐
│  Test Run: Sprint 2.1 Testing      │
│  Status: IN_PROGRESS                │
│  Assigned to: John Doe              │
│  Progress: 42/45 (93.3%)            │
└─────────────────────────────────────┘

┌─ Test Run Information ───────────────┐
│  Name: Sprint 2.1 Regression Testing │
│  Environment: Staging               │
│  Created: 2025-11-15 10:00          │
│  Started: 2025-11-15 10:15          │
│  Est. Completed: -                  │
└─────────────────────────────────────┘

┌─ Quick Stats ────────────────────────┐
│  ✅ Passed: 42      🔴 Failed: 2    │
│  ⛔ Blocked: 1      ⏭️ Skipped: 0   │
│  🔄 Retest: 0       ⏳ Pending: 3   │
└─────────────────────────────────────┘

┌─ Test Case Results ──────────────────┐
│ [Start Run] [Complete Run] [Actions] │
│                                      │
│  tc1 ✅ PASSED - 45s - "Works great"│
│  tc2 🔴 FAILED - 120s - "Button..."  │
│  tc3 ⛔ BLOCKED - - - "Needs fix"    │
│  tc4 ⏳ PENDING - - - -              │
│  ...                                 │
└─────────────────────────────────────┘
```

### 3.3 Test Case Execution Card

**Features:**
- Test case ID and title
- Current execution status
- Priority and test case priority
- View detailed steps
- Execute test button
- Result recording dialog
- Status dropdown
- Comment/notes field
- Duration timer
- Error details (if failed)

```
┌─────────────────────────────────┐
│ tc1: User Login - Valid Creds   │
│ Priority: CRITICAL              │
│ Status: ⏳ PENDING              │
├─────────────────────────────────┤
│ Steps:                          │
│ 1. Navigate to login page      │
│ 2. Enter valid credentials     │
│ 3. Click Login button          │
│ 4. Verify dashboard displays   │
├─────────────────────────────────┤
│ Result:                         │
│ [Select Status: ✅ PASSED]      │
│ Comment: [text area]            │
│ Duration: [00:45] (auto-timer)  │
├─────────────────────────────────┤
│ [Save Result] [Skip] [Mark Retest]
└─────────────────────────────────┘
```

### 3.4 Create Test Run Form

**Fields:**
1. **Run Name** (required)
   - Text input
   - e.g., "Sprint 2.1 Testing"

2. **Description** (optional)
   - Textarea
   - Purpose and scope

3. **Environment** (required)
   - Dropdown: Production, Staging, QA, Dev
   - Custom value allowed

4. **Assign To** (optional)
   - Dropdown with team members
   - Can be unassigned initially

5. **Select Test Cases** (optional)
   - Multi-select or suite selection
   - Can add test cases later

6. **By Suite** (alternative)
   - Select entire test suite
   - All suite test cases included

**Actions:**
- Create & Start
- Create & Review
- Save as Template
- Cancel

### 3.5 TypeScript Interfaces

```typescript
export interface TestRun {
  id: string;
  name: string;
  description?: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  environment?: string;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  project: {
    id: string;
    name: string;
    key: string;
  };
  results: TestResult[];
  _count: {
    results: number;
  };
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface TestResult {
  id: string;
  status: 'PASSED' | 'FAILED' | 'BLOCKED' | 'SKIPPED' | 'RETEST';
  testCaseId: string;
  testCase: {
    id: string;
    title: string;
    priority: string;
  };
  comment?: string;
  duration?: number;
  executedBy?: {
    name: string;
    email: string;
  };
  executedAt?: string;
}

export interface TestRunFormData {
  name: string;
  description: string;
  environment: string;
  assignedToId: string;
}
```

---

## 4. User Workflows

### 4.1 Create and Execute Test Run

**Steps:**
1. Go to Project → Test Runs
2. Click "Create New Test Run"
3. Fill in details:
   - Name: "Sprint 2.1 Testing"
   - Environment: "Staging"
   - Assign To: "John Doe"
4. Select test cases or entire suite
5. Click "Create & Start"
6. Test run status changes to IN_PROGRESS
7. Redirected to execution page

### 4.2 Execute Test Cases

**Steps:**
1. View test run details
2. For each test case:
   - Click test case to expand
   - Read steps carefully
   - Execute steps manually or automatically
   - Record result (PASSED/FAILED/etc.)
   - Add comments/notes if needed
   - Save result
3. Move to next test case
4. When all done, click "Complete Run"

### 4.3 Record Test Results

**Steps:**
1. During execution, view test case
2. Click "Record Result"
3. Select status:
   - ✅ PASSED: Test passed
   - 🔴 FAILED: Found defect
   - ⛔ BLOCKED: Cannot proceed
   - ⏭️ SKIPPED: Not executed
   - 🔄 RETEST: Needs retry
4. Add comment (optional)
5. Start/stop timer for duration
6. If failed, add error details
7. Click "Save"
8. Result is recorded and shown in list

### 4.4 View Test Run Results

**Steps:**
1. Go to Test Runs → Select run
2. View summary statistics:
   - Total tests: 45
   - Passed: 42 (93.3%)
   - Failed: 2 (4.4%)
   - Blocked: 1 (2.2%)
3. View individual results with details
4. Filter by status if needed
5. Export results (if available)

---

## 5. Features & Capabilities

### 5.1 Status Tracking

- **PLANNED**: Run created but not started
- **IN_PROGRESS**: Execution in progress
- **COMPLETED**: All tests executed
- **CANCELLED**: Run was cancelled

### 5.2 Result Statuses

- **PASSED**: Test executed and passed
- **FAILED**: Test found defects
- **BLOCKED**: Test blocked by external issue
- **SKIPPED**: Test not executed
- **RETEST**: Test needs re-execution

### 5.3 Execution Features

- Assign run to team member
- Select target environment
- Group test cases by suite
- Add/remove test cases before execution
- Track execution time per test
- Record detailed result comments
- Add error messages and stack traces
- View execution history

### 5.4 Reporting & Analytics

- Pass rate calculation
- Execution statistics
- Test failure trends
- Execution time tracking
- Team member metrics
- Environment-specific metrics

---

## 6. Permissions & Authorization

### 6.1 Permission Matrix

| Action | ADMIN | PROJECT_MANAGER | TESTER | VIEWER |
|--------|-------|-----------------|--------|--------|
| View Test Runs | ✅ | ✅ | ✅ | ✅ |
| Create Test Run | ✅ | ✅ | ✅ | ❌ |
| Edit Test Run | ✅ | ✅ | ✅ | ❌ |
| Delete Test Run | ✅ | ✅ | ✅ | ❌ |
| Execute Test Run | ✅ | ✅ | ✅ | ❌ |
| Record Results | ✅ | ✅ | ✅ | ❌ |
| View Results | ✅ | ✅ | ✅ | ✅ |

---

## 7. Best Practices

### 7.1 Test Run Planning

- Plan runs around development sprints
- Group related test cases
- Assign clear ownership
- Set realistic execution timeframes
- Consider environment availability

### 7.2 Execution

- Follow test steps exactly as written
- Record actual behavior observed
- Add detailed comments for failures
- Don't skip tests without reason
- Use retest for borderline cases

### 7.3 Result Recording

- Be specific in failure comments
- Include error messages and screenshots (if supported)
- Record actual duration
- Include steps to reproduce failures
- Provide context for blocked tests

### 7.4 Naming Conventions

- Run name format: "Sprint X Testing" or "Release Y QA"
- Include date/iteration identifier
- Be descriptive: "Sprint 2.1 Regression Testing - Staging"

---

## 8. Error Handling

### 8.1 Validation Errors

```json
{
  "error": "Validation failed",
  "message": "Test run name is required"
}
```

### 8.2 Status Transition Errors

```json
{
  "error": "Invalid status transition",
  "message": "Cannot complete a run that hasn't been started"
}
```

### 8.3 Permission Errors

```json
{
  "error": "Access denied",
  "message": "You don't have permission to execute this test run"
}
```

---

## 9. Code References

### 9.1 Key Files

**Backend:**
- `backend/services/testrun/services.ts` - Service layer
- `backend/controllers/testrun/controller.ts` - Controller
- `app/api/projects/[id]/testruns/route.ts` - List/create endpoint
- `app/api/testruns/[id]/route.ts` - Detail/update/delete endpoint
- `app/api/testruns/[id]/start/route.ts` - Start endpoint
- `app/api/testruns/[id]/complete/route.ts` - Complete endpoint
- `app/api/testruns/[id]/results/route.ts` - Results endpoint

**Frontend:**
- `app/projects/[id]/testruns/page.tsx` - Runs list page
- `app/projects/[id]/testruns/[testrunId]/page.tsx` - Execution page
- `frontend/components/testruns/*` - Reusable components

### 9.2 Important Methods

```typescript
// Service methods
testRunService.getProjectTestRuns(projectId, filters)
testRunService.getTestRunById(testRunId)
testRunService.createTestRun(data)
testRunService.updateTestRun(testRunId, data)
testRunService.deleteTestRun(testRunId)
testRunService.startTestRun(testRunId)
testRunService.completeTestRun(testRunId)
testRunService.addTestResult(testRunId, testCaseId, resultData)
testRunService.getTestRunStats(testRunId)
```

---

## 10. Testing Scenarios

### 10.1 API Testing

```bash
# List test runs
GET http://localhost:3000/api/projects/proj_123/testruns?status=IN_PROGRESS

# Create test run
POST http://localhost:3000/api/projects/proj_123/testruns
{
  "name": "Sprint Testing",
  "environment": "Staging",
  "testCaseIds": ["tc_1", "tc_2", "tc_3"]
}

# Get test run details
GET http://localhost:3000/api/testruns/run_123

# Start test run
POST http://localhost:3000/api/testruns/run_123/start

# Record test result
POST http://localhost:3000/api/testruns/run_123/results
{
  "testCaseId": "tc_1",
  "status": "PASSED",
  "duration": 45
}

# Complete test run
POST http://localhost:3000/api/testruns/run_123/complete

# Update test run
PATCH http://localhost:3000/api/testruns/run_123
{
  "environment": "Production"
}

# Delete test run
DELETE http://localhost:3000/api/testruns/run_123
```

### 10.2 UI Testing

- Create test run with test cases
- Start test run
- Execute test cases and record results
- Record different result statuses
- Add comments and error details
- Complete test run
- View results summary
- Filter results by status
- Verify statistics calculations

---

## 11. Troubleshooting

### Issue: Can't create test run
**Causes:**
- Insufficient permissions
- Invalid test case IDs
- Project not found

**Solution:** Check user role, verify test case IDs exist

### Issue: Can't start test run
**Causes:**
- Wrong status (already started or completed)
- Permission issue
- Run doesn't exist

**Solution:** Check current status, verify permissions

### Issue: Test results not saving
**Causes:**
- Invalid test case ID
- Invalid result status
- Permission issue

**Solution:** Verify IDs, check valid statuses, verify permissions

---

## 12. Metrics & Reporting

### 12.1 Test Run Metrics

- Total test runs per project
- Average pass rate
- Tests per run
- Average execution time
- Execution frequency
- Status distribution

### 12.2 Reports

- Test run summary
- Pass/fail trends
- Execution timeline
- Result distribution
- Team productivity metrics
- Environment-specific metrics

---

## 13. Roadmap & Future Enhancements

- [ ] Parallel test execution
- [ ] Automated test integration
- [ ] Performance metrics per test
- [ ] Failure trend analysis
- [ ] Test run templates
- [ ] Scheduled/recurring runs
- [ ] Integration with CI/CD pipelines
- [ ] Real-time result notifications
- [ ] Test result attachments (screenshots, logs)
- [ ] Advanced filtering and search

