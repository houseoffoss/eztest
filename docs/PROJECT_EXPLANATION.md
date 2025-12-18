# EZTest Project Explanation

**A comprehensive guide to understanding EZTest - what it is, how it works, and why it exists.**

---

## Table of Contents

- [What is EZTest?](#what-is-eztest)
- [Problem Statement](#problem-statement)
- [Solution Overview](#solution-overview)
- [Core Concepts](#core-concepts)
- [How It Works](#how-it-works)
- [Project Structure](#project-structure)
- [Key Workflows](#key-workflows)
- [Technology Choices](#technology-choices)
- [Architecture Overview](#architecture-overview)

---

## What is EZTest?

**EZTest** is a self-hostable, open-source test management platform designed for teams who need a lightweight, affordable alternative to commercial test management tools like TestRail or Testiny.

### Key Characteristics

- **Self-Hosted**: You own and control your data
- **Lightweight**: Runs on minimal hardware (1 CPU, 2GB RAM)
- **Open Source**: MIT licensed, fully customizable
- **Modern**: Built with Next.js 15, React 19, TypeScript
- **Complete**: Full test management lifecycle support

### Target Users

- **QA Teams** managing test cases and test execution
- **Development Teams** tracking test coverage
- **Small to Medium Businesses** needing affordable test management
- **Organizations** requiring data privacy and self-hosting
- **Open Source Projects** needing test tracking

---

## Problem Statement

### The Challenge

Commercial test management tools present several challenges:

1. **Cost**: Expensive licensing fees ($50-200+ per user/month)
2. **Data Privacy**: Data stored on vendor servers
3. **Vendor Lock-in**: Difficult to migrate or customize
4. **Over-engineering**: Heavy tools for simple needs
5. **Infrastructure Requirements**: High resource demands

### The Need

Teams need a solution that:
- ✅ Is affordable (free/open source)
- ✅ Provides data control (self-hosted)
- ✅ Is easy to deploy (Docker)
- ✅ Runs on minimal hardware
- ✅ Covers the full test management lifecycle
- ✅ Is modern and user-friendly

---

## Solution Overview

EZTest provides a complete test management solution that addresses all these needs:

### Core Capabilities

1. **Project Organization** - Multi-project workspace
2. **Test Case Management** - Create, organize, and maintain test cases
3. **Test Execution** - Track test runs and results
4. **Defect Tracking** - Link defects to test cases
5. **Team Collaboration** - Role-based access control
6. **File Attachments** - Attach files to tests and defects
7. **Reporting** - Track progress and metrics

### Value Proposition

| Aspect | EZTest | Commercial Tools |
|--------|--------|------------------|
| **Cost** | Free (self-hosted) | $50-200/user/month |
| **Data Control** | Your servers | Vendor servers |
| **Customization** | Full source access | Limited |
| **Resource Usage** | 1 CPU, 2GB RAM | 4+ CPU, 8GB+ RAM |
| **Deployment** | Docker (5 minutes) | Complex setup |
| **License** | MIT (open source) | Proprietary |

---

## Core Concepts

### 1. Projects

**What:** A container for organizing all testing activities for a specific product, feature, or initiative.

**Purpose:**
- Isolate test cases by product/feature
- Manage team access per project
- Track project-specific metrics
- Organize large testing efforts

**Example:**
- Project: "E-Commerce Platform"
- Project Key: "ECOM"
- Contains: Test suites, test cases, test runs, defects

### 2. Test Suites

**What:** Hierarchical folders for organizing test cases.

**Purpose:**
- Group related test cases
- Create nested organization (unlimited depth)
- Organize by feature, module, or workflow
- Navigate large test case collections

**Structure:**
```
Test Suite: "User Authentication"
  ├── Test Suite: "Login"
  │   ├── Test Case: "Valid login"
  │   └── Test Case: "Invalid password"
  └── Test Suite: "Registration"
      ├── Test Case: "New user signup"
      └── Test Case: "Email validation"
```

### 3. Test Cases

**What:** Individual test scenarios with steps, expected results, and metadata.

**Components:**
- **Title**: What is being tested
- **Description**: Context and details
- **Steps**: Step-by-step test procedure
- **Expected Results**: What should happen
- **Priority**: CRITICAL, HIGH, MEDIUM, LOW
- **Status**: DRAFT, READY, OBSOLETE
- **Attachments**: Screenshots, documents

**Example:**
```
Test Case: "User Login with Valid Credentials"
Priority: HIGH
Steps:
  1. Navigate to login page
  2. Enter valid email
  3. Enter valid password
  4. Click "Sign In"
Expected Result: User is logged in and redirected to dashboard
```

### 4. Test Runs

**What:** An execution instance where testers run test cases and record results.

**Purpose:**
- Track test execution progress
- Record pass/fail results
- Link to specific builds/versions
- Generate execution reports

**Components:**
- **Name**: "Sprint 5 Regression Test"
- **Test Suite**: Which tests to execute
- **Status**: NOT_STARTED, IN_PROGRESS, COMPLETED
- **Results**: Pass/Fail/Blocked/Skipped per test case
- **Duration**: Time taken to execute

### 5. Test Results

**What:** The outcome of executing a single test case within a test run.

**Statuses:**
- ✅ **PASSED**: Test executed successfully
- ❌ **FAILED**: Test found a defect
- ⚠️ **BLOCKED**: Cannot execute (dependency issue)
- ⏭️ **SKIPPED**: Not executed (out of scope)
- ⏸️ **NOT_RUN**: Not yet executed

**Additional Data:**
- Comments: Notes about execution
- Duration: Time taken
- Executed by: Tester name
- Execution date: When it was run

### 6. Defects

**What:** Issues found during test execution, linked to test cases.

**Purpose:**
- Track bugs found during testing
- Link defects to failing test cases
- Assign defects to developers
- Track defect lifecycle (OPEN → IN_PROGRESS → RESOLVED → CLOSED)

**Components:**
- **Title**: Brief description
- **Description**: Detailed issue information
- **Severity**: CRITICAL, HIGH, MEDIUM, LOW
- **Status**: OPEN, IN_PROGRESS, RESOLVED, CLOSED
- **Assignee**: Developer responsible
- **Linked Test Case**: Which test found it
- **Attachments**: Screenshots, logs

### 7. Modules

**What:** Organizational units within a project for grouping test cases.

**Purpose:**
- Organize test cases by feature/module
- Filter test cases by module
- Track module-specific metrics
- Alternative organization to test suites

**Example:**
- Module: "Payment Processing"
- Contains: Test cases related to payments
- Can be used alongside test suites

### 8. Roles & Permissions

**What:** Access control system with granular permissions.

**System Roles:**
- **ADMIN**: Full system access
- **PROJECT_MANAGER**: Can create/manage projects
- **TESTER**: Can execute tests
- **VIEWER**: Read-only access

**Project Roles:**
- **OWNER**: Full project control
- **ADMIN**: Manage project settings
- **TESTER**: Execute tests, create test cases
- **VIEWER**: Read-only project access

**Permissions:**
- 27 granular permissions across 6 resource types
- Enforced at API and UI levels
- Role-based UI visibility

---

## How It Works

### High-Level Flow

```
1. User Authentication
   ↓
2. Access Dashboard
   ↓
3. Select/Create Project
   ↓
4. Organize Test Cases (Test Suites/Modules)
   ↓
5. Create Test Cases
   ↓
6. Create Test Run
   ↓
7. Execute Tests & Record Results
   ↓
8. Create Defects for Failures
   ↓
9. Track Progress & Generate Reports
```

### Detailed Workflows

#### Workflow 1: Setting Up a New Project

```
1. Admin/Project Manager creates project
   - Project name: "Mobile App"
   - Project key: "MOBILE"
   
2. Add team members
   - Assign roles (OWNER, ADMIN, TESTER, VIEWER)
   
3. Create test suite structure
   - "Authentication"
   - "Payment"
   - "User Profile"
   
4. Create test cases
   - Add test cases to appropriate suites
   - Define steps and expected results
```

#### Workflow 2: Executing Tests

```
1. Tester creates test run
   - Name: "Sprint 10 Regression"
   - Select test suite: "Authentication"
   
2. System generates test run
   - Includes all test cases from selected suite
   - Status: NOT_STARTED
   
3. Tester executes tests
   - For each test case:
     - Follow test steps
     - Record result (PASS/FAIL/BLOCKED/SKIP)
     - Add comments if needed
   
4. For failed tests
   - Create defect
   - Link to test case
   - Assign to developer
   
5. Track progress
   - View execution progress
   - See pass/fail rates
   - Generate reports
```

#### Workflow 3: Defect Lifecycle

```
1. Test fails → Create defect
   - Title: "Login fails with special characters"
   - Severity: HIGH
   - Linked test case: "Login with special chars"
   
2. Assign to developer
   - Developer receives notification
   
3. Developer fixes
   - Status: IN_PROGRESS → RESOLVED
   
4. Tester verifies fix
   - Re-run test case
   - If passes: Close defect
   - If fails: Reopen defect
```

---

## Project Structure

### Directory Organization

```
eztest/
├── app/                      # Next.js App Router
│   ├── api/                  # REST API endpoints
│   │   ├── auth/            # Authentication routes
│   │   ├── projects/        # Project routes
│   │   ├── test-cases/      # Test case routes
│   │   └── ...
│   ├── auth/                # Auth pages (login, register)
│   ├── dashboard/           # Dashboard page
│   └── projects/            # Project pages
│
├── backend/                  # Backend business logic
│   ├── controllers/         # API route handlers
│   ├── services/            # Business logic layer
│   ├── validators/          # Input validation
│   └── utils/               # Utilities
│
├── components/              # React components
│   ├── common/              # Shared components
│   ├── design/             # Design system components
│   ├── layout/              # Layout components
│   └── pages/               # Page components
│
├── lib/                     # Shared libraries
│   ├── auth.ts             # NextAuth configuration
│   ├── prisma.ts           # Prisma client
│   └── utils.ts            # Utility functions
│
├── prisma/                  # Database
│   ├── schema.prisma       # Database schema
│   ├── migrations/         # Database migrations
│   └── seed.ts            # Seed data
│
└── docs/                   # Documentation
```

### Key Files Explained

#### `app/api/` - API Routes
- RESTful API endpoints
- Request/response handling
- Authentication middleware
- Error handling

#### `backend/controllers/` - Controllers
- Parse incoming requests
- Validate input
- Call services
- Format responses

#### `backend/services/` - Services
- Business logic
- Database operations
- Data transformations
- External integrations

#### `prisma/schema.prisma` - Database Schema
- Data models
- Relationships
- Indexes
- Constraints

#### `lib/auth.ts` - Authentication
- NextAuth configuration
- JWT session management
- Permission loading
- User authentication

---

## Key Workflows

### 1. User Authentication Flow

```
User Login
  ↓
Enter email/password
  ↓
NextAuth validates credentials
  ↓
bcrypt verifies password hash
  ↓
Generate JWT token
  ↓
Set session cookie
  ↓
Load user permissions
  ↓
Redirect to dashboard
```

### 2. Test Case Creation Flow

```
User selects project
  ↓
Navigate to test cases
  ↓
Click "Create Test Case"
  ↓
Fill form (title, description, steps)
  ↓
Select test suite/module
  ↓
Set priority and status
  ↓
Submit → API validates
  ↓
Service creates in database
  ↓
Return success → UI updates
```

### 3. Test Execution Flow

```
Create test run
  ↓
Select test suite
  ↓
System loads all test cases
  ↓
Tester executes each test
  ↓
Record result (PASS/FAIL/etc.)
  ↓
Add comments/attachments
  ↓
Save result → Update database
  ↓
Update progress metrics
  ↓
Generate report
```

### 4. Permission Check Flow

```
User requests action
  ↓
Middleware checks authentication
  ↓
Load user permissions from JWT
  ↓
Check required permission
  ↓
If allowed → Proceed
  ↓
If denied → Return 403 error
```

---

## Technology Choices

### Why Next.js 15?

- **Full-Stack**: API routes + pages in one framework
- **Server Components**: Better performance
- **App Router**: Modern routing system
- **TypeScript**: Built-in type safety
- **Deployment**: Easy Docker deployment

### Why React 19?

- **Latest Features**: Concurrent rendering
- **Server Components**: Reduced client JS
- **Performance**: Better rendering performance
- **Ecosystem**: Large component library

### Why PostgreSQL?

- **Reliability**: ACID compliance
- **Performance**: Excellent for relational data
- **Features**: JSON support, full-text search
- **Open Source**: No licensing costs

### Why Prisma?

- **Type Safety**: Auto-generated TypeScript types
- **Migrations**: Version-controlled schema changes
- **Developer Experience**: Great tooling
- **Performance**: Query optimization

### Why NextAuth.js?

- **JWT Sessions**: Stateless authentication
- **Flexibility**: Easy to extend
- **Security**: Built-in CSRF protection
- **Integration**: Works seamlessly with Next.js

### Why Docker?

- **Consistency**: Same environment everywhere
- **Easy Deployment**: One command to run
- **Isolation**: Separate containers for services
- **Scalability**: Easy to scale horizontally

---

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────┐
│         Client Browser               │
│      (React 19 Components)           │
└──────────────┬──────────────────────┘
               │ HTTPS
┌──────────────▼──────────────────────┐
│        Next.js 15 Server             │
│  ┌────────────────────────────────┐  │
│  │  App Router                    │  │
│  │  - Pages (Server Components)   │  │
│  │  - API Routes                  │  │
│  │  - Middleware (Auth)           │  │
│  └────────────────────────────────┘  │
└──────────────┬──────────────────────┘
               │
    ┌──────────┼──────────┐
    │          │          │
    ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐
│ Prisma │ │NextAuth│ │ AWS S3 │
│  ORM   │ │  Auth  │ │Storage │
└───┬────┘ └────────┘ └────────┘
    │
    ▼
┌──────────────┐
│  PostgreSQL  │
│   Database   │
└──────────────┘
```

### Request Flow

```
1. Client Request
   ↓
2. Next.js Middleware (Auth Check)
   ↓
3. API Route Handler
   ↓
4. Controller (Parse & Validate)
   ↓
5. Service (Business Logic)
   ↓
6. Prisma (Database Query)
   ↓
7. Response to Client
```

### Data Flow

```
User Action (UI)
   ↓
API Request
   ↓
Controller Validation
   ↓
Service Business Logic
   ↓
Prisma Database Query
   ↓
Database Response
   ↓
Service Transformation
   ↓
Controller Formatting
   ↓
API Response
   ↓
UI Update
```

---

## Key Design Decisions

### 1. Self-Hosted Architecture

**Decision:** Make it self-hostable, not SaaS

**Rationale:**
- Data privacy and control
- No vendor lock-in
- Cost-effective for organizations
- Customizable to specific needs

### 2. Lightweight Resource Requirements

**Decision:** Optimize for minimal hardware

**Rationale:**
- Accessible to small teams
- Lower deployment costs
- Can run on VPS or local servers
- Better for resource-constrained environments

### 3. Role-Based Access Control

**Decision:** Implement granular permissions

**Rationale:**
- Security and access control
- Flexible team management
- Supports various organizational structures
- Enterprise-ready security

### 4. Hierarchical Test Organization

**Decision:** Support unlimited nesting in test suites

**Rationale:**
- Flexible organization
- Scales to large test collections
- Mirrors real-world test organization
- Easy navigation

### 5. JWT-Based Sessions

**Decision:** Use JWT instead of database sessions

**Rationale:**
- Stateless authentication
- Better scalability
- Reduced database load
- Contains permissions in token

---

## Integration Points

### Current Integrations

- **AWS S3**: File attachment storage
- **SMTP**: Email notifications
- **PostgreSQL**: Database storage

### Planned Integrations

- **Jira**: Defect synchronization
- **GitHub**: Issue linking
- **Azure DevOps**: Work item integration
- **CI/CD**: Test automation triggers
- **Slack**: Notifications

---

## Scalability Considerations

### Current Capacity

- **Users**: Supports hundreds of concurrent users
- **Projects**: Unlimited projects
- **Test Cases**: Thousands per project
- **Test Runs**: Unlimited execution history

### Scaling Strategies

1. **Horizontal Scaling**: Multiple Next.js instances behind load balancer
2. **Database Scaling**: PostgreSQL read replicas
3. **File Storage**: S3 handles unlimited files
4. **Caching**: Redis for session caching (future)

---

## Security Model

### Authentication

- Email/password with bcrypt hashing
- JWT token-based sessions
- Password reset with email verification
- OTP for sensitive operations

### Authorization

- Role-based access control (RBAC)
- 27 granular permissions
- Project-level and system-level roles
- Permission enforcement at API and UI

### Data Protection

- HTTPS enforcement
- Input validation and sanitization
- SQL injection prevention (Prisma)
- XSS protection
- CSRF protection (NextAuth)

---

## Development Philosophy

### Principles

1. **Simplicity**: Keep it simple and maintainable
2. **Type Safety**: TypeScript everywhere
3. **Documentation**: Comprehensive docs
4. **Open Source**: Community-driven development
5. **User Experience**: Modern, intuitive UI

### Code Quality

- TypeScript for type safety
- ESLint for code quality
- Consistent code patterns
- Comprehensive error handling
- Well-documented code

---

## Future Vision

### Short Term

- Enhanced dashboard with analytics
- Requirements traceability
- Comments and collaboration
- Advanced reporting

### Long Term

- Test automation integration
- API integrations (Jira, GitHub)
- Mobile app
- Multi-language support
- Advanced analytics and AI insights

---

## Getting Started

### For Users

1. [Installation Guide](./getting-started/installation.md)
2. [Quick Start](./getting-started/quickstart.md)
3. [First Project](./getting-started/first-project.md)

### For Developers

1. [Development Setup](./contributing/development-setup.md)
2. [Architecture Overview](./architecture/README.md)
3. [API Reference](./api/README.md)

### For Contributors

1. [Contributing Guide](./contributing/README.md)
2. [Coding Standards](./contributing/coding-standards.md)
3. [Pull Request Process](./contributing/pull-requests.md)

---

## Related Documentation

- [Features Overview](./features/README.md) - Detailed feature documentation
- [API Reference](./api/README.md) - Complete API documentation
- [Architecture](./architecture/README.md) - Technical architecture
- [Configuration](./getting-started/configuration.md) - Environment setup

---

**Last Updated:** December 2025
