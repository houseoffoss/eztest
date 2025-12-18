# Database Schema Documentation

## Overview

EZTest uses PostgreSQL with Prisma ORM for data persistence. The schema is designed to support comprehensive test management with support for projects, test organization, execution tracking, and collaboration.

## Entity Relationship Diagram

```
User (1) ──── (M) ProjectMember ──── (1) Project
 │                                        │
 │ (1)                            (M)  ──┴──
 ├─→ Project (created)                    │
 │   (createdBy)              ┌───────────┤
 │                             │           │
 ├─→ TestRun (assigned)     TestSuite ──┐ │
 │   (assignedTo)              │         │ │
 │                       (M) ──┘      TestCase (M)
 │                       │                │
 │                   (1) │              │ │
 ├─→ TestResult      (parent)      Requirements
 │   (executedBy)        │             │
 │                        └→ Requirement
 └─→ Comment
     (user)
```

## Core Models

### User

Represents system users with roles and authentication.

```prisma
model User {
  id            String    @id @default(cuid())          // Unique identifier
  email         String    @unique                        // Email (unique)
  name          String                                   // Display name
  password      String                                   // Hashed password
  role          UserRole  @default(TESTER)              // System-level role
  avatar        String?                                  // Avatar URL
  createdAt     DateTime  @default(now())               // Creation timestamp
  updatedAt     DateTime  @updatedAt                    // Update timestamp

  // Relations
  projects      ProjectMember[]  // Teams user is member of
  testCases     TestCase[]       // Test cases created by user
  testRuns      TestRun[]        // Test runs assigned to user
  testResults   TestResult[]     // Test results executed by user
  comments      Comment[]        // Comments added by user
  createdProjects Project[]      // Projects created by user
}

enum UserRole {
  ADMIN          // Full system access
  PROJECT_MANAGER // Can manage projects
  TESTER         // Can execute tests
  VIEWER         // Read-only access (default)
}
```

**Key Relationships:**
- 1-to-Many with ProjectMember (team memberships)
- 1-to-Many with TestCase (test authorship)
- 1-to-Many with TestRun (test assignments)
- 1-to-Many with TestResult (test execution)

### Project

Represents a test project.

```prisma
model Project {
  id          String   @id @default(cuid())
  name        String                        // Project name
  key         String   @unique              // Short key (e.g., "PROJ")
  description String?                       // Project description
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdById String                        // Creator reference

  // Relations
  createdBy   User             // Project creator
  members     ProjectMember[]  // Team members
  testSuites  TestSuite[]      // Test organization
  modules     Module[]         // Test case modules
  testCases   TestCase[]       // All test cases
  testRuns    TestRun[]        // Test executions
  requirements Requirement[]   // Linked requirements
}
```

**Key Features:**
- Unique project key for short reference
- Multi-tenant support through CreatedBy/Members
- Cascading deletes for cleanup

### ProjectMember

Represents team membership with role-based access.

```prisma
model ProjectMember {
  id        String   @id @default(cuid())
  projectId String
  userId    String
  joinedAt  DateTime @default(now())

  // Relations
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([projectId, userId])  // One member per project
}
```

**Design Notes:**
- **Binary Membership Model**: No project-specific roles, just membership tracking
- Unique constraint prevents duplicate memberships
- Cascade deletes maintain referential integrity
- User permissions within project determined by their application-level role (ADMIN, PROJECT_MANAGER, TESTER, VIEWER)

### TestSuite

Represents hierarchical test organization.

```prisma
model TestSuite {
  id          String   @id @default(cuid())
  projectId   String
  name        String
  description String?
  parentId    String?            // For nesting
  order       Int      @default(0) // Display order
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  project     Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  parent      TestSuite?   @relation("NestedSuites", fields: [parentId], references: [id], onDelete: Cascade)
  children    TestSuite[]  @relation("NestedSuites")  // Nested suites
  testCases   TestCase[]   // Tests in this suite
}
```

**Features:**
- Self-referential relationship for nesting
- Order field for custom sorting
- Cascading deletes with parent

### Module

Represents modules for organizing test cases within a project.

```prisma
model Module {
  id          String     @id @default(cuid())
  projectId   String
  name        String
  description String?
  order       Int        @default(0)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  // Relations
  project     Project    @relation(fields: [projectId], references: [id], onDelete: Cascade)
  testCases   TestCase[] // Test cases in this module

  @@unique([projectId, name])  // Unique module name per project
  @@index([projectId])         // For efficient project queries
}
```

**Features:**
- Project-scoped organization
- Unique module names per project
- Custom ordering for display
- Test case grouping
- Cascade deletion with project

### TestCase

Represents individual test cases.

```prisma
model TestCase {
  id            String     @id @default(cuid())
  projectId     String
  suiteId       String?              // Can be in suite or standalone
  moduleId      String?              // Optional module assignment
  title         String
  description   String?
  priority      Priority   @default(MEDIUM)
  status        TestStatus @default(ACTIVE)
  estimatedTime Int?                 // Minutes
  preconditions String?              // Setup steps
  postconditions String?             // Cleanup/verification
  createdById   String
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  // Relations
  project       Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  suite         TestSuite?   @relation(fields: [suiteId], references: [id], onDelete: SetNull)
  module        Module?      @relation(fields: [moduleId], references: [id], onDelete: SetNull)
  createdBy     User         @relation(fields: [createdById], references: [id])
  steps         TestStep[]   // Test execution steps
  results       TestResult[] // Execution history
  requirements  Requirement[]// Linked requirements
  comments      Comment[]
  attachments   Attachment[]

  @@index([status])  // For querying by status
}

enum TestStatus {
  ACTIVE     // Currently in use
  DEPRECATED // Retired/obsolete
  DRAFT      // Work in progress
}

enum Priority {
  CRITICAL  // Must pass
  HIGH      // Important
  MEDIUM    // Normal (default)
  LOW       // Nice to have
}
```

**Key Features:**
- Stateful test cases (ACTIVE/DEPRECATED/DRAFT)
- Priority levels for test organization
- Optional suite membership
- SetNull on suite deletion (keeps test if suite deleted)

### TestStep

Represents individual test actions within a test case.

```prisma
model TestStep {
  id              String   @id @default(cuid())
  testCaseId      String
  stepNumber      Int                          // Sequential number
  action          String                       // What to do
  expectedResult  String                       // Expected outcome
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  testCase        TestCase @relation(fields: [testCaseId], references: [id], onDelete: Cascade)

  @@unique([testCaseId, stepNumber])  // One step number per test
}
```

**Design:**
- Sequential steps within test cases
- Unique constraint per test case
- Cascading delete with test case

### TestRun

Represents a batch/suite of test executions.

```prisma
model TestRun {
  id          String        @id @default(cuid())
  projectId   String
  name        String                          // Run name/identifier
  description String?
  status      TestRunStatus @default(PLANNED)
  assignedToId String?                        // Who is executing
  environment String?                         // Target environment
  startedAt   DateTime?                       // Execution start
  completedAt DateTime?                       // Execution completion
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  project     Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  assignedTo  User?        @relation(fields: [assignedToId], references: [id])
  results     TestResult[] // Results in this run

  @@index([status])  // For querying by status
}

enum TestRunStatus {
  PLANNED      // Not started
  IN_PROGRESS  // Currently running
  COMPLETED    // Finished
  CANCELLED    // Aborted
}
```

**Features:**
- Groups related test results
- Tracks execution timeline
- Optional environment designation

### TestResult

Represents individual test execution results.

```prisma
model TestResult {
  id          String           @id @default(cuid())
  testRunId   String
  testCaseId  String
  status      TestResultStatus                // Outcome
  executedById String
  duration    Int?                            // Seconds
  comment     String?                         // Tester notes
  errorMessage String?                        // Error details
  stackTrace  String?                         // Stack trace
  executedAt  DateTime         @default(now())

  testRun     TestRun      @relation(fields: [testRunId], references: [id], onDelete: Cascade)
  testCase    TestCase     @relation(fields: [testCaseId], references: [id], onDelete: Cascade)
  executedBy  User         @relation(fields: [executedById], references: [id])
  attachments Attachment[] // Screenshots, logs, etc.

  @@unique([testRunId, testCaseId])  // One result per test per run
}

enum TestResultStatus {
  PASSED   // Test passed
  FAILED   // Test failed
  BLOCKED  // Could not run
  SKIPPED  // Intentionally skipped
  RETEST   // Needs retesting
}
```

**Design:**
- Unique constraint prevents duplicate results
- Links execution to test case and run
- Tracks execution metadata

### Requirement

Represents requirements linked to test cases.

```prisma
model Requirement {
  id          String             @id @default(cuid())
  projectId   String
  key         String             // e.g., "REQ-001"
  title       String
  description String?
  priority    Priority           @default(MEDIUM)
  status      RequirementStatus  @default(DRAFT)
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt

  project     Project    @relation(fields: [projectId], references: [id], onDelete: Cascade)
  testCases   TestCase[] // Tests covering this requirement

  @@unique([projectId, key])  // Unique key per project
}

enum RequirementStatus {
  DRAFT       // Being defined
  APPROVED    // Accepted
  IMPLEMENTED // Code implemented
  VERIFIED    // Tests passing
  DEPRECATED  // No longer needed
}
```

### Comment

Represents collaboration comments.

```prisma
model Comment {
  id          String   @id @default(cuid())
  testCaseId  String
  userId      String
  content     String                    // Comment text
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  testCase    TestCase @relation(fields: [testCaseId], references: [id], onDelete: Cascade)
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Attachment

Represents file attachments.

```prisma
model Attachment {
  id            String   @id @default(cuid())
  filename      String              // Stored filename
  originalName  String              // Original filename
  mimeType      String              // File type
  size          Int                 // File size bytes
  path          String              // File path
  testCaseId    String?             // Linked test case
  testResultId  String?             // Linked test result
  uploadedAt    DateTime @default(now())

  testCase      TestCase?   @relation(fields: [testCaseId], references: [id], onDelete: Cascade)
  testResult    TestResult? @relation(fields: [testResultId], references: [id], onDelete: Cascade)
}
```

## Indexing Strategy

### Primary Indexes
```prisma
// Email lookup (authentication)
@@index([email])

// Project lookups
@@index([key])
@@index([createdById])

// Test organization
@@index([projectId])
@@index([suiteId])
@@index([createdById])

// Status queries (frequent filtering)
@@index([status])

// User lookups
@@index([projectId])
@@index([userId])
```

### Query Optimization
- Foreign key relationships indexed by default
- Status fields indexed for filtering
- Email indexed for user lookup
- Composite indexes avoid N+1 queries

## Relationship Patterns

### Many-to-Many (Project Members)
```
ProjectMember acts as junction table
User (1) ──── (M) ProjectMember ──── (M) Project
```

### Hierarchical (Test Suites)
```
Self-referential relationship
TestSuite.parent ─→ TestSuite
TestSuite.children ← TestSuite[]
```

### One-to-Many with Cascade
```
Project (1) ──── (M) TestSuite
  → Delete project = cascade delete suites
```

### One-to-Many with SetNull
```
TestSuite (1) ──── (M) TestCase (parentId)
  → Delete suite = set testCase.suiteId to NULL
```

## Database Constraints

| Constraint | Purpose |
|---|---|
| `@id @default(cuid())` | Unique distributed IDs |
| `@unique` | Enforce uniqueness (email, key) |
| `@@unique([field1, field2])` | Composite uniqueness |
| `onDelete: Cascade` | Delete children with parent |
| `onDelete: SetNull` | Orphan children safely |
| `@@index([field])` | Query optimization |

## Relationships Summary

| From | To | Type | Delete Policy |
|---|---|---|---|
| User | Project | 1-M | Cascade |
| User | TestCase | 1-M | Cascade |
| User | TestRun | 1-M | No policy |
| User | TestResult | 1-M | Cascade |
| User | Comment | 1-M | Cascade |
| Project | TestSuite | 1-M | Cascade |
| Project | TestCase | 1-M | Cascade |
| TestSuite | TestCase | 1-M | SetNull |
| TestSuite | TestSuite | 1-M (self) | Cascade |
| TestCase | TestStep | 1-M | Cascade |
| TestCase | TestResult | 1-M | Cascade |
| TestCase | Requirement | M-M | - |
| TestRun | TestResult | 1-M | Cascade |

## Future Schema Enhancements

1. **Audit Logging** - Track all data changes
2. **Test Configurations** - Parameterized test execution
3. **Test Reports** - Generate comprehensive reports
4. **Defect Tracking** - Link to external issue trackers
5. **Automation** - Integration with test automation tools

