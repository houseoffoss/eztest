# Database Schema

PostgreSQL database schema documentation for EzTest.

## Overview

EzTest uses PostgreSQL 16 with Prisma ORM. The schema supports:

- User and role management
- Project organization
- Test management (suites, cases, steps)
- Test execution (runs, results)
- Defect tracking
- File attachments

---

## Entity Relationship Diagram

```
┌──────────┐       ┌───────────────┐       ┌──────────┐
│   User   │───────│ProjectMember  │───────│  Project │
└──────────┘       └───────────────┘       └──────────┘
     │                                           │
     │              ┌────────────────────────────┼────────────────────┐
     │              │                            │                    │
     ▼              ▼                            ▼                    ▼
┌──────────┐   ┌──────────┐              ┌──────────────┐      ┌──────────┐
│   Role   │   │TestSuite │──────────────│   TestCase   │      │  Defect  │
└──────────┘   └──────────┘              └──────────────┘      └──────────┘
     │              │                          │    │                │
     │              │                          │    │                │
     ▼              ▼                          ▼    ▼                ▼
┌──────────┐   ┌──────────┐              ┌──────────┐        ┌───────────────┐
│Permission│   │TestRun   │──────────────│TestResult│        │DefectComment  │
└──────────┘   └──────────┘              └──────────┘        └───────────────┘
                                               │
                                               ▼
                                         ┌──────────┐
                                         │Attachment│
                                         └──────────┘
```

---

## Core Models

### User

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  password      String    // bcrypt hashed
  roleId        String
  avatar        String?
  bio           String?
  phone         String?
  location      String?
  deletedAt     DateTime? // Soft delete
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  role          Role      @relation(...)
  projects      ProjectMember[]
  testCases     TestCase[]
  testRuns      TestRun[]
  testResults   TestResult[]
  // ... more relations
}
```

**Indexes:** `email`, `roleId`, `deletedAt`

### Project

```prisma
model Project {
  id          String   @id @default(cuid())
  name        String
  key         String   @unique  // e.g., "ECOM"
  description String?
  isDeleted   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdById String

  createdBy   User     @relation(...)
  members     ProjectMember[]
  testSuites  TestSuite[]
  testCases   TestCase[]
  testRuns    TestRun[]
  defects     Defect[]
  modules     Module[]
}
```

**Indexes:** `key`, `createdById`, `isDeleted`

### TestCase

```prisma
model TestCase {
  id            String     @id @default(cuid())
  tcId          String     // e.g., "tc1", "tc2"
  projectId     String
  moduleId      String?
  suiteId       String?
  title         String
  description   String?
  expectedResult String?
  priority      Priority   @default(MEDIUM)
  status        TestStatus @default(ACTIVE)
  estimatedTime Int?       // minutes
  preconditions String?
  postconditions String?
  createdById   String
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  project       Project    @relation(...)
  module        Module?    @relation(...)
  suite         TestSuite? @relation(...)
  createdBy     User       @relation(...)
  steps         TestStep[]
  results       TestResult[]
  attachments   Attachment[]
  defects       TestCaseDefect[]

  @@unique([projectId, tcId])
}
```

**Indexes:** `projectId`, `moduleId`, `suiteId`, `createdById`, `status`

### TestRun

```prisma
model TestRun {
  id          String        @id @default(cuid())
  projectId   String
  name        String
  description String?
  status      TestRunStatus @default(PLANNED)
  assignedToId String?
  environment String?
  startedAt   DateTime?
  completedAt DateTime?
  createdById String
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  project     Project       @relation(...)
  assignedTo  User?         @relation(...)
  createdBy   User          @relation(...)
  results     TestResult[]
  suites      TestRunSuite[]
  defects     Defect[]
}
```

**Indexes:** `projectId`, `assignedToId`, `createdById`, `status`

### Defect

```prisma
model Defect {
  id            String         @id @default(cuid())
  defectId      String         // e.g., "DEF-001"
  projectId     String
  title         String
  description   String?        @db.Text
  severity      DefectSeverity @default(MEDIUM)
  priority      Priority       @default(MEDIUM)
  status        DefectStatus   @default(NEW)
  assignedToId  String?
  testRunId     String?
  environment   String?
  dueDate       DateTime?
  progressPercentage Int?
  createdById   String
  resolvedAt    DateTime?
  closedAt      DateTime?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  project       Project        @relation(...)
  assignedTo    User?          @relation(...)
  createdBy     User           @relation(...)
  testRun       TestRun?       @relation(...)
  testCases     TestCaseDefect[]
  attachments   DefectAttachment[]
  comments      DefectComment[]

  @@unique([projectId, defectId])
}
```

**Indexes:** `projectId`, `assignedToId`, `createdById`, `testRunId`, `status`, `severity`

---

## Enums

### Priority

```prisma
enum Priority {
  CRITICAL
  HIGH
  MEDIUM
  LOW
}
```

### TestStatus

```prisma
enum TestStatus {
  ACTIVE
  DEPRECATED
  DRAFT
}
```

### TestRunStatus

```prisma
enum TestRunStatus {
  PLANNED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```

### TestResultStatus

```prisma
enum TestResultStatus {
  PASSED
  FAILED
  BLOCKED
  SKIPPED
  RETEST
}
```

### DefectSeverity

```prisma
enum DefectSeverity {
  CRITICAL
  HIGH
  MEDIUM
  LOW
}
```

### DefectStatus

```prisma
enum DefectStatus {
  NEW
  IN_PROGRESS
  FIXED
  TESTED
  CLOSED
}
```

---

## RBAC Models

### Role

```prisma
model Role {
  id          String         @id @default(cuid())
  name        String         @unique
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  users       User[]
  permissions RolePermission[]
}
```

**Roles:** ADMIN, PROJECT_MANAGER, TESTER, VIEWER

### Permission

```prisma
model Permission {
  id          String         @id @default(cuid())
  name        String         @unique  // e.g., "projects:read"
  description String?
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  roles       RolePermission[]
}
```

### RolePermission

```prisma
model RolePermission {
  id           String     @id @default(cuid())
  roleId       String
  permissionId String
  createdAt    DateTime   @default(now())

  role         Role       @relation(...)
  permission   Permission @relation(...)

  @@unique([roleId, permissionId])
}
```

---

## Junction Tables

### ProjectMember

Links users to projects.

```prisma
model ProjectMember {
  id        String   @id @default(cuid())
  projectId String
  userId    String
  joinedAt  DateTime @default(now())

  project   Project  @relation(...)
  user      User     @relation(...)

  @@unique([projectId, userId])
}
```

### TestCaseSuite

Many-to-many: TestCase ↔ TestSuite

```prisma
model TestCaseSuite {
  id          String   @id @default(cuid())
  testCaseId  String
  testSuiteId String
  addedAt     DateTime @default(now())

  testCase    TestCase  @relation(...)
  testSuite   TestSuite @relation(...)

  @@unique([testCaseId, testSuiteId])
}
```

### TestCaseDefect

Many-to-many: TestCase ↔ Defect

```prisma
model TestCaseDefect {
  id          String   @id @default(cuid())
  testCaseId  String
  defectId    String
  linkedAt    DateTime @default(now())

  testCase    TestCase @relation(...)
  defect      Defect   @relation(...)

  @@unique([testCaseId, defectId])
}
```

---

## Database Commands

### Development

```bash
# Generate Prisma client
npx prisma generate

# Push schema changes (dev)
npx prisma db push

# Open database GUI
npx prisma studio

# Seed database
npx prisma db seed
```

### Production

```bash
# Create migration
npx prisma migrate dev --name description

# Apply migrations
npx prisma migrate deploy

# Reset database (WARNING: deletes data)
npx prisma migrate reset
```

---

## Indexing Strategy

### Primary Indexes

- All `id` fields (primary key)
- All `@unique` fields

### Foreign Key Indexes

- `projectId` on all project-scoped models
- `userId` on user-related models
- `testCaseId` on steps, results
- `testRunId` on results
- `defectId` on attachments, comments

### Query Optimization Indexes

- `status` fields for filtering
- `createdAt` for sorting
- `email` for user lookup
- Composite indexes for common queries

---

## Related Documentation

- [Architecture Overview](./README.md)
- [API Reference](../api/README.md)
