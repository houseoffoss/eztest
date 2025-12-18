# Project Features - Complete Documentation

## Overview

The Project feature is the foundation of EZTest, providing a centralized workspace where teams can organize and manage all testing activities. Projects serve as containers for test cases, test suites, test runs, and team members.

---

## 1. Project Architecture

### 1.1 Data Model

```typescript
// Prisma Schema
model Project {
  id            String   @id @default(cuid())
  name          String   // Project name (3-255 characters)
  key           String   @unique  // Unique identifier (2-10 chars, uppercase alphanumeric)
  description   String?  // Optional project description
  
  createdById   String   // User who created the project
  createdBy     User     @relation("CreatedProjects", fields: [createdById], references: [id])
  
  members       ProjectMember[]  // Team members in the project
  testCases     TestCase[]       // Test cases in the project
  testRuns      TestRun[]        // Test runs in the project
  testSuites    TestSuite[]      // Test suites in the project
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Composite unique constraint ensures project key is unique per project
  @@unique([key])
}

model ProjectMember {
  id        String   @id @default(cuid())
  projectId String
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  role      Role     @default(TESTER)  // Role in the project
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([projectId, userId])
}
```

### 1.2 Architecture Layers

```
┌─────────────────────────────────────────┐
│         UI Components                   │
│  (React Components in /frontend)        │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      API Routes (/app/api)              │
│  - Handle HTTP Requests                 │
│  - Request/Response Formatting          │
│  - Permission Checking                  │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│   Controllers (business logic)          │
│  - Request Validation                   │
│  - Authorization Enforcement            │
│  - Service Orchestration                │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│    Services (reusable business logic)   │
│  - CRUD Operations                      │
│  - Database Interactions                │
│  - Complex Business Rules               │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│        Prisma ORM                       │
│     (Database Abstraction)              │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      PostgreSQL Database                │
└─────────────────────────────────────────┘
```

---

## 2. API Reference

### 2.1 List All Projects

**Endpoint:** `GET /api/projects`

**Authentication:** Required (Any authenticated user)

**Authorization:** Users see only projects they're members of; ADMINs see all projects

**Query Parameters:** None

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "clx...123",
      "name": "E-Commerce Platform",
      "key": "ECOM",
      "description": "Testing suite for e-commerce platform",
      "createdAt": "2025-11-01T10:30:00Z",
      "updatedAt": "2025-11-01T10:30:00Z",
      "createdById": "user123",
      "createdBy": {
        "id": "user123",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": null
      },
      "members": [
        {
          "id": "mem123",
          "userId": "user123",
          "role": "PROJECT_MANAGER",
          "user": {
            "id": "user123",
            "name": "John Doe",
            "email": "john@example.com"
          }
        }
      ],
      "_count": {
        "testCases": 45,
        "testRuns": 12,
        "testSuites": 8
      }
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized` - No valid session
- `500 Internal Server Error` - Database error

---

### 2.2 Create New Project

**Endpoint:** `POST /api/projects`

**Authentication:** Required

**Authorization:** Users with ADMIN, PROJECT_MANAGER, or TESTER role

**Request Body:**
```json
{
  "name": "Mobile App Testing",
  "key": "MAT",
  "description": "Complete test suite for mobile application"
}
```

**Validation Rules:**
- `name` (required): 3-255 characters, non-empty
- `key` (required): 2-10 characters, uppercase letters and numbers only, must be unique
- `description` (optional): Any string

**Response (201 Created):**
```json
{
  "data": {
    "id": "clx...456",
    "name": "Mobile App Testing",
    "key": "MAT",
    "description": "Complete test suite for mobile application",
    "createdAt": "2025-11-15T14:22:00Z",
    "updatedAt": "2025-11-15T14:22:00Z",
    "createdById": "user123"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Validation failed
- `409 Conflict` - Project key already exists
- `401 Unauthorized` - User not authenticated
- `403 Forbidden` - Insufficient permissions

---

### 2.3 Get Project Details

**Endpoint:** `GET /api/projects/[id]`

**Authentication:** Required

**Authorization:** User must be project member or ADMIN

**Query Parameters:**
- `stats` (optional): `true` to include statistics (default: false)

**Response (200 OK):**
```json
{
  "data": {
    "id": "clx...123",
    "name": "E-Commerce Platform",
    "key": "ECOM",
    "description": "Testing suite for e-commerce platform",
    "createdAt": "2025-11-01T10:30:00Z",
    "updatedAt": "2025-11-01T10:30:00Z",
    "createdById": "user123",
    "createdBy": {
      "id": "user123",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "members": [
      {
        "id": "mem123",
        "userId": "user123",
        "role": "PROJECT_MANAGER",
        "user": {
          "id": "user123",
          "name": "John Doe",
          "email": "john@example.com",
          "avatar": null
        }
      },
      {
        "id": "mem124",
        "userId": "user456",
        "role": "TESTER",
        "user": {
          "id": "user456",
          "name": "Jane Smith",
          "email": "jane@example.com",
          "avatar": null
        }
      }
    ],
    "_count": {
      "testCases": 45,
      "testRuns": 12,
      "testSuites": 8
    }
  }
}
```

**Error Responses:**
- `403 Forbidden` - Access denied
- `404 Not Found` - Project doesn't exist
- `401 Unauthorized` - Not authenticated

---

### 2.4 Update Project

**Endpoint:** `PUT /api/projects/[id]`

**Authentication:** Required

**Authorization:** PROJECT_MANAGER or higher role within project, or ADMIN

**Request Body:**
```json
{
  "name": "Updated Project Name",
  "description": "Updated description"
}
```

**Validation Rules:**
- `name` (optional): 3-255 characters if provided
- `description` (optional): Any string
- At least one field required

**Response (200 OK):**
```json
{
  "data": {
    "id": "clx...123",
    "name": "Updated Project Name",
    "key": "ECOM",
    "description": "Updated description",
    "createdAt": "2025-11-01T10:30:00Z",
    "updatedAt": "2025-11-15T16:45:00Z",
    "createdById": "user123"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Validation failed
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Project not found

---

### 2.5 Delete Project

**Endpoint:** `DELETE /api/projects/[id]`

**Authentication:** Required

**Authorization:** ADMIN role only (system-wide admin)

**Response (200 OK):**
```json
{
  "message": "Project deleted successfully"
}
```

**Error Responses:**
- `403 Forbidden` - Only admins can delete projects
- `404 Not Found` - Project not found

---

### 2.6 Get Project Members

**Endpoint:** `GET /api/projects/[id]/members`

**Authentication:** Required

**Authorization:** User must be project member or ADMIN

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "mem123",
      "userId": "user123",
      "role": "PROJECT_MANAGER",
      "user": {
        "id": "user123",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": null
      },
      "createdAt": "2025-11-01T10:30:00Z"
    },
    {
      "id": "mem124",
      "userId": "user456",
      "role": "TESTER",
      "user": {
        "id": "user456",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "avatar": null
      },
      "createdAt": "2025-11-05T14:22:00Z"
    }
  ]
}
```

---

### 2.7 Add Member to Project

**Endpoint:** `POST /api/projects/[id]/members`

**Authentication:** Required

**Authorization:** PROJECT_MANAGER or higher within project, or ADMIN

**Request Body:**
```json
{
  "email": "newmember@example.com",
  "role": "TESTER"
}
```

**Validation Rules:**
- `email` (required): Valid email format, user must exist
- `role` (required): Valid role (ADMIN, PROJECT_MANAGER, TESTER, VIEWER)

**Response (201 Created):**
```json
{
  "data": {
    "id": "mem125",
    "userId": "user789",
    "role": "TESTER",
    "user": {
      "id": "user789",
      "name": "Bob Johnson",
      "email": "newmember@example.com"
    },
    "createdAt": "2025-11-15T16:45:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Validation failed or user already member
- `404 Not Found` - User or project not found
- `403 Forbidden` - Insufficient permissions

---

### 2.8 Remove Member from Project

**Endpoint:** `DELETE /api/projects/[id]/members/[memberId]`

**Authentication:** Required

**Authorization:** PROJECT_MANAGER or higher within project, or ADMIN

**Response (200 OK):**
```json
{
  "message": "Member removed successfully"
}
```

**Error Responses:**
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Project or member not found

---

## 3. UI Components

### 3.1 Projects List Page

**Location:** `/app/projects/page.tsx`

**Features:**
- Display all accessible projects in card/grid layout
- Search projects by name
- Sort by creation date or name
- Filter by member status (created by me, member of)
- Quick stats: number of test cases, test runs, test suites
- Create new project button
- Edit/delete project options
- View member list
- Navigate to project details

**Components Used:**
```typescript
<ProjectsList />
  ├── ProjectCard (for each project)
  ├── SearchBar
  ├── FilterButtons
  └── CreateProjectModal
```

### 3.2 Project Details Page

**Location:** `/app/projects/[id]/page.tsx`

**Features:**
- Project name and description
- Project key badge
- Team members section with roles
- Quick stats (test cases, test runs, test suites)
- Recent activity timeline
- Settings link
- Members management link
- Navigation tabs to test cases, test suites, test runs

**Sections:**
1. **Project Header** - Name, key, description, stats
2. **Members Section** - List members, add/remove members
3. **Recent Activity** - Timeline of recent changes
4. **Quick Actions** - Links to create test case, test run, test suite

### 3.3 Project Members Page

**Location:** `/app/projects/[id]/members/page.tsx`

**Features:**
- List all project members
- Show member role and email
- Add new member by email
- Change member role
- Remove member from project
- Admin-only deletion features

**UI Elements:**
- Member table with columns: Name, Email, Role, Actions
- Add Member dialog/modal
- Role selector dropdown
- Delete confirmation dialog

### 3.4 Project Settings Page

**Location:** `/app/projects/[id]/settings/page.tsx`

**Features:**
- Edit project name
- Edit project description
- View project key (read-only)
- Danger zone:
  - Delete project (admin only)
  - Archive project (if applicable)

### 3.5 TypeScript Interfaces

```typescript
// Project interface
export interface Project {
  id: string;
  name: string;
  key: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  members: ProjectMember[];
  _count: {
    testCases: number;
    testRuns: number;
    testSuites: number;
  };
}

// Project Member interface
export interface ProjectMember {
  id: string;
  userId: string;
  role: 'ADMIN' | 'PROJECT_MANAGER' | 'TESTER' | 'VIEWER';
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  createdAt: string;
}

// Form data interface
export interface ProjectFormData {
  name: string;
  key: string;
  description: string;
}
```

---

## 4. User Workflows

### 4.1 Create a New Project

**Steps:**
1. Click "Create Project" button on Projects page
2. Fill in project details:
   - Project Name (e.g., "Mobile App v2.0")
   - Project Key (auto-generates or enter manually, e.g., "MAV2")
   - Description (optional)
3. Click "Create"
4. User is automatically added as PROJECT_MANAGER
5. Redirected to project details page

### 4.2 Add Team Members

**Steps:**
1. Navigate to project
2. Go to "Members" tab or settings
3. Click "Add Member" button
4. Enter member email
5. Select role: ADMIN, PROJECT_MANAGER, TESTER, or VIEWER
6. Click "Add"
7. Member receives notification and gains access

### 4.3 Manage Project Settings

**Steps:**
1. Go to project settings
2. Update project name/description
3. Click "Save Changes"
4. Project metadata is updated immediately
5. All members see updated information

---

## 5. Permission & Authorization

### 5.1 Permission Matrix

| Action | ADMIN | PROJECT_MANAGER | TESTER | VIEWER |
|--------|-------|-----------------|--------|--------|
| View Project | ✅ | ✅ | ✅ | ✅ |
| Create Project | ✅ | ✅ | ✅ | ❌ |
| Update Project | ✅ | ✅ | ❌ | ❌ |
| Delete Project | ✅ | ❌ | ❌ | ❌ |
| Add Member | ✅ | ✅ | ❌ | ❌ |
| Remove Member | ✅ | ✅ | ❌ | ❌ |
| Change Member Role | ✅ | ✅ | ❌ | ❌ |
| Create Test Case | ✅ | ✅ | ✅ | ❌ |
| Create Test Run | ✅ | ✅ | ✅ | ❌ |
| View Statistics | ✅ | ✅ | ✅ | ✅ |

### 5.2 Authorization Implementation

```typescript
// Example: Require PROJECT_MANAGER role in project
export const PUT = hasPermission(
  async (request, context) => {
    const { id } = await context!.params;
    return projectController.updateProject(request, id);
  },
  'projects',
  'update'  // Checks user has UPDATE permission on projects module
);
```

---

## 6. Error Handling

### 6.1 Validation Errors

```json
{
  "error": "Validation failed",
  "fields": [
    {
      "field": "name",
      "message": "Name must be 3-255 characters"
    },
    {
      "field": "key",
      "message": "Key must be 2-10 uppercase alphanumeric characters"
    }
  ]
}
```

### 6.2 Authorization Errors

```json
{
  "error": "Access denied",
  "message": "You don't have permission to perform this action"
}
```

### 6.3 Not Found Errors

```json
{
  "error": "Project not found",
  "projectId": "clx...123"
}
```

---

## 7. Best Practices

### 7.1 Project Naming
- Use clear, descriptive names
- Include version if applicable (e.g., "App v2.0 Testing")
- Keep names concise (under 50 characters)

### 7.2 Project Keys
- Use uppercase letters and numbers
- Keep short (2-10 characters)
- Make them memorable (e.g., ECOM for E-Commerce)

### 7.3 Team Organization
- Assign appropriate roles based on responsibilities
- Use PROJECT_MANAGER for test leads
- Use TESTER for QA engineers
- Use VIEWER for stakeholders who need visibility
- Regularly review member access

### 7.4 Project Structure
- Create projects for distinct products or features
- Use test suites within a project for organization
- Keep related test cases together

---

## 8. Code References

### 8.1 Key Files

**Backend:**
- `backend/services/project/services.ts` - Service layer with business logic
- `backend/controllers/project/controller.ts` - Controller with request handling
- `backend/validators/project.validator.ts` - Input validation schemas
- `app/api/projects/route.ts` - Main projects endpoint
- `app/api/projects/[id]/route.ts` - Individual project endpoint
- `app/api/projects/[id]/members/route.ts` - Members management

**Frontend:**
- `app/projects/page.tsx` - Projects list page
- `app/projects/[id]/page.tsx` - Project details page
- `app/projects/[id]/members/page.tsx` - Members management page
- `app/projects/[id]/settings/page.tsx` - Project settings page
- `frontend/components/projects/*` - Reusable project components

### 8.2 Important Methods

```typescript
// Service methods
projectService.getAllProjects(userId, scope)
projectService.getProjectById(projectId, userId, scope, includeStats)
projectService.createProject(data)
projectService.updateProject(projectId, data)
projectService.deleteProject(projectId, userId, scope)
projectService.getProjectMembers(projectId)
projectService.addProjectMember(projectId, userId, role)
projectService.removeProjectMember(projectId, memberId)
```

---

## 9. Testing Scenarios

### 9.1 API Testing
```bash
# List projects
GET http://localhost:3000/api/projects

# Create project
POST http://localhost:3000/api/projects
Content-Type: application/json
{
  "name": "Test Project",
  "key": "TEST",
  "description": "For testing"
}

# Get specific project
GET http://localhost:3000/api/projects/{projectId}

# Update project
PUT http://localhost:3000/api/projects/{projectId}
{
  "name": "Updated Name"
}

# Get members
GET http://localhost:3000/api/projects/{projectId}/members

# Add member
POST http://localhost:3000/api/projects/{projectId}/members
{
  "email": "user@example.com",
  "role": "TESTER"
}
```

### 9.2 UI Testing
- Create new project with valid data
- Create project with invalid key (too long, wrong characters)
- Add duplicate member to project
- Remove member and verify access revoked
- Update project details and confirm changes
- Filter projects by various criteria

---

## 10. Troubleshooting

### Issue: Can't create project
**Causes:**
- User lacks CREATE permission (needs TESTER or higher role)
- Project key already exists
- Validation failed (check error message)

**Solution:** Verify user role, use unique key, check input validation

### Issue: Member can't access project
**Causes:**
- Member not added to project
- Project was deleted
- Member access revoked

**Solution:** Add member to project or restore project access

### Issue: Permission denied when updating
**Causes:**
- User is VIEWER or lower role
- User not project member
- User is not ADMIN

**Solution:** Request PROJECT_MANAGER role or ask ADMIN to update

---

## 11. Roadmap & Future Enhancements

- [ ] Project templates (common project structures)
- [ ] Project cloning (duplicate project structure)
- [ ] Project archiving (soft delete)
- [ ] Advanced permission management (custom roles)
- [ ] Project-level automation rules
- [ ] Integration with CI/CD pipelines
- [ ] Real-time notifications for project changes
- [ ] Project usage analytics and reports

