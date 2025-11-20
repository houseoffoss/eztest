# Projects Features Documentation

## Overview

The Projects feature in EZTest is the core organizational unit for managing test artifacts. Users can create projects, manage project members, and organize test cases, test suites, and test runs within a project context.

---

## Table of Contents

1. [Feature Overview](#feature-overview)
2. [Project List Page](#project-list-page)
3. [Project Overview Page](#project-overview-page)
4. [API Documentation](#api-documentation)
5. [Frontend Components](#frontend-components)
6. [Architecture](#architecture)
7. [Data Models](#data-models)

---

## Feature Overview

### Key Capabilities

- **Create Projects**: Users with appropriate roles can create new projects
- **List Projects**: View all projects the user has access to
- **View Project Details**: See comprehensive project information including statistics
- **Update Projects**: Modify project name and description
- **Delete Projects**: Remove projects (admin only)
- **Manage Members**: Add or remove team members from projects
- **Track Statistics**: View counts of test cases, test runs, test suites, and requirements

### Access Control

- **ADMINs**: Can see all projects and perform all operations
- **PROJECT_MANAGER & TESTER**: Can see projects they're members of
- **VIEWER**: Read-only access to projects they're members of

---

## Project List Page

### Location
- **Route**: `/projects`
- **Component**: `frontend/components/project/ProjectList.tsx`
- **Page**: `app/projects/page.tsx`

### User Interface

#### Top Bar
- **Breadcrumbs**: Navigation indicator showing "Projects"
- **Create Button**: "+ New Project" button to create a new project
- **Sign Out Button**: User logout functionality

#### Page Header
- **Title**: "Projects"
- **Subtitle**: "Manage your test projects and track progress"

#### Projects Grid

##### When Projects Exist
- **Layout**: Responsive grid (1 column on mobile, 2 on tablet, 3 on desktop)
- **Card Component**: `ProjectCard` for each project
- **Cards Display**:
  - Project name
  - Project key (short identifier like "PROJ")
  - Description (if available)
  - Created by user information
  - Quick action buttons (View, Edit, Delete)
  - Creation date

##### When No Projects Exist
- **Empty State**: `EmptyProjectsState` component
- **Message**: "No projects yet. Create your first project to get started."
- **Action**: Button to trigger create project dialog

#### Create Project Dialog
- **Component**: `CreateProjectDialog`
- **Trigger**: "New Project" button or action in empty state
- **Fields**:
  - **Project Name** (required): 3-255 characters
  - **Project Key** (required): 2-10 uppercase alphanumeric characters (e.g., "TEST", "PROJ")
  - **Description** (optional): Project description
- **Actions**:
  - Cancel button
  - Create button
- **Behavior**:
  - Validates input fields
  - Creates project via API
  - Adds new project to the list
  - Shows success notification

#### Delete Project Dialog
- **Component**: `DeleteProjectDialog`
- **Trigger**: Delete button on project card
- **Content**: Confirmation message with project name
- **Actions**:
  - Cancel button
  - Delete button (destructive styling)
- **Behavior**:
  - Confirms deletion with user
  - Calls delete API
  - Removes project from list
  - Shows success notification

### Features

#### Project Card Features
- **Navigation**: Click card to navigate to project overview
- **Quick Stats**: Display count of test cases, test runs
- **User Info**: Show who created the project
- **Actions**:
  - **View**: Navigate to project details
  - **Edit**: Open edit dialog (if permitted)
  - **Delete**: Open delete confirmation (if permitted)
- **Status Indicators**: Visual indicators for project status

#### Filtering & Sorting
- **Current**: No built-in filtering/sorting (can be enhanced)
- **Future Enhancement**: 
  - Filter by created date, team member
  - Sort by name, creation date, activity
  - Search by project name or key

### Data Flow

```
1. Component Mounts
   ↓
2. useEffect triggers fetchProjects()
   ↓
3. API Call: GET /api/projects
   ↓
4. Response: Array of Project objects
   ↓
5. setProjects() updates state
   ↓
6. Render ProjectCard for each project
   ↓
7. User Interactions:
   - Click "New Project" → Open CreateProjectDialog
   - Click Delete → Open DeleteProjectDialog
   - Click Card → Navigate to Project Overview
```

### Component Hierarchy

```
ProjectList
├── Top Bar
│   ├── Breadcrumbs
│   ├── Create Project Button
│   └── Sign Out Button
├── Page Header
│   ├── Title
│   └── Subtitle
├── Projects Grid
│   ├── ProjectCard (repeated)
│   │   ├── Project Info
│   │   ├── Stats
│   │   └── Action Buttons
│   └── EmptyProjectsState (if no projects)
├── CreateProjectDialog
│   ├── Form Fields
│   └── Actions
└── DeleteProjectDialog
    ├── Confirmation Message
    └── Actions
```

---

## Project Overview Page

### Location
- **Route**: `/projects/[id]`
- **Component**: `frontend/components/project/ProjectDetail.tsx`
- **Page**: `app/projects/[id]/page.tsx`

### User Interface

#### Top Bar
- **Breadcrumbs**: 
  - Projects (link)
  - Project Name (link)
  - Overview
- **Sign Out Button**: User logout functionality

#### Project Header
- **Component**: `ProjectHeader`
- **Content**:
  - Project name (large heading)
  - Project key (badge)
  - Project description (if available)
  - Created by information with avatar
  - Last updated timestamp

#### Statistics Cards
Four statistics cards displayed in a grid layout:

1. **Test Cases**
   - Icon: `TestTube2`
   - Value: `_count.testCases`
   - Color Accent: Primary blue

2. **Test Runs**
   - Icon: `Play`
   - Value: `_count.testRuns`
   - Color Accent: Accent orange

3. **Test Suites**
   - Icon: `FileText`
   - Value: `_count.testSuites`
   - Color Accent: Purple

4. **Requirements**
   - Icon: `Folder`
   - Value: `_count.requirements`
   - Color Accent: Green

Each stat card shows:
- Icon
- Label
- Large numerical value
- Left border with theme color

#### Project Overview Card
- **Component**: `ProjectOverviewCard`
- **Sections**:
  - **Quick Info**: Key, description, created date
  - **Team Members**: List of project members with roles
  - **Quick Actions**: Links to create test cases, test runs, etc.

### Data Loading

```
Component Mount
    ↓
useEffect with [projectId] dependency
    ↓
Fetch: GET /api/projects/[id]?stats=true
    ↓
Query Parameter: stats=true includes count statistics
    ↓
Response: Project object with _count included
    ↓
setProject() updates state
    ↓
Render Project Details
```

### Project Data Structure

```typescript
interface Project {
  id: string;                    // Unique project ID
  name: string;                  // Project name
  key: string;                   // Short identifier (e.g., "TEST")
  description: string | null;    // Optional description
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
  createdBy: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  members: Array<{
    id: string;
    role: string;
    user: {
      id: string;
      name: string;
      email: string;
      avatar: string | null;
    };
  }>;
  _count: {
    testCases: number;
    testRuns: number;
    testSuites: number;
    requirements: number;
  };
}
```

### Features

- **Real-time Stats**: View current counts of artifacts
- **Team Overview**: See all project members and their roles
- **Project Info**: Display comprehensive project metadata
- **Quick Navigation**: Links to create and manage test artifacts

---

## API Documentation

### Base URL
```
http://localhost:3000/api/projects
```

### Authentication
All endpoints require authentication. User must be logged in.

---

### 1. List All Projects
**Endpoint**: `GET /api/projects`

**Description**: Retrieve all projects accessible to the current user.

**Authorization**:
- Authenticated users only
- ADMINs see all projects
- Other users see only projects they're members of

**Request**:
```bash
curl -X GET http://localhost:3000/api/projects \
  -H "Authorization: Bearer <token>"
```

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "clxxx123",
      "name": "My Test Project",
      "key": "MTP",
      "description": "A sample project for testing",
      "createdAt": "2025-11-12T10:00:00Z",
      "updatedAt": "2025-11-12T10:00:00Z",
      "createdById": "user123",
      "createdBy": {
        "id": "user123",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": null
      },
      "members": [
        {
          "id": "member1",
          "role": "OWNER",
          "user": {
            "id": "user123",
            "name": "John Doe",
            "email": "john@example.com",
            "avatar": null
          }
        }
      ],
      "_count": {
        "testCases": 25,
        "testRuns": 5,
        "testSuites": 3
      }
    }
  ]
}
```

**Error Responses**:
- **401**: Unauthorized - User not authenticated
- **403**: Forbidden - User lacks required permissions

---

### 2. Create New Project
**Endpoint**: `POST /api/projects`

**Description**: Create a new project.

**Authorization**:
- Required role: ADMIN, PROJECT_MANAGER, or TESTER
- User must be authenticated

**Request Body**:
```json
{
  "name": "New Project",
  "key": "NP",
  "description": "Optional description"
}
```

**Request**:
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "New Project",
    "key": "NP",
    "description": "A new test project"
  }'
```

**Validation Rules**:
- **name**: 3-255 characters, required
- **key**: 2-10 uppercase alphanumeric characters, must be unique
- **description**: Optional, free text

**Response** (201 Created):
```json
{
  "data": {
    "id": "clxxx456",
    "name": "New Project",
    "key": "NP",
    "description": "A new test project",
    "createdAt": "2025-11-13T15:30:00Z",
    "updatedAt": "2025-11-13T15:30:00Z",
    "createdById": "user123",
    "members": []
  },
  "statusCode": 201
}
```

**Error Responses**:
- **400**: Bad Request - Invalid input
  ```json
  {
    "error": "Validation failed",
    "issues": [
      {
        "code": "too_small",
        "minimum": 3,
        "type": "string",
        "path": ["name"],
        "message": "String must contain at least 3 character(s)"
      }
    ]
  }
  ```
- **409**: Conflict - Project key already exists
  ```json
  {
    "error": "Project key already exists"
  }
  ```

---

### 3. Get Project Details
**Endpoint**: `GET /api/projects/[id]`

**Description**: Retrieve detailed information about a specific project.

**Authorization**:
- User must be a member of the project or be a system ADMIN

**Query Parameters**:
- `stats` (optional, boolean): Include statistics (testCases, testRuns, testSuites, requirements count)
  - Example: `/api/projects/clxxx123?stats=true`

**Request**:
```bash
curl -X GET http://localhost:3000/api/projects/clxxx123?stats=true \
  -H "Authorization: Bearer <token>"
```

**Response** (200 OK):
```json
{
  "data": {
    "id": "clxxx123",
    "name": "My Test Project",
    "key": "MTP",
    "description": "A sample project",
    "createdAt": "2025-11-12T10:00:00Z",
    "updatedAt": "2025-11-12T10:00:00Z",
    "createdById": "user123",
    "createdBy": {
      "id": "user123",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": null
    },
    "members": [
      {
        "id": "member1",
        "role": "OWNER",
        "user": {
          "id": "user123",
          "name": "John Doe",
          "email": "john@example.com",
          "avatar": null
        }
      }
    ],
    "_count": {
      "testCases": 25,
      "testRuns": 5,
      "testSuites": 3,
      "requirements": 10
    }
  }
}
```

**Error Responses**:
- **403**: Forbidden - User is not a member
- **404**: Not Found - Project doesn't exist

---

### 4. Update Project Info
**Endpoint**: `PUT /api/projects/[id]`

**Description**: Update project name or description.

**Authorization**:
- Required permission: `projects:update`
- User must be project member with PROJECT_MANAGER or TESTER role

**Request Body**:
```json
{
  "name": "Updated Project Name",
  "description": "Updated description"
}
```

**Request**:
```bash
curl -X PUT http://localhost:3000/api/projects/clxxx123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Updated Project Name",
    "description": "Updated description"
  }'
```

**Validation Rules**:
- **name**: 3-255 characters, optional
- **description**: Optional, free text

**Response** (200 OK):
```json
{
  "data": {
    "id": "clxxx123",
    "name": "Updated Project Name",
    "key": "MTP",
    "description": "Updated description",
    "createdAt": "2025-11-12T10:00:00Z",
    "updatedAt": "2025-11-13T16:00:00Z",
    "createdById": "user123"
  }
}
```

**Error Responses**:
- **400**: Bad Request - Invalid input
- **403**: Forbidden - User lacks update permission
- **404**: Not Found - Project doesn't exist

---

### 5. Delete Project
**Endpoint**: `DELETE /api/projects/[id]`

**Description**: Delete a project (soft delete).

**Authorization**:
- Required permission: `projects:delete`
- Only system ADMINs can delete projects

**Request**:
```bash
curl -X DELETE http://localhost:3000/api/projects/clxxx123 \
  -H "Authorization: Bearer <token>"
```

**Response** (200 OK):
```json
{
  "message": "Project deleted successfully"
}
```

**Error Responses**:
- **403**: Forbidden - Only admins can delete
- **404**: Not Found - Project doesn't exist

---

### 6. Get Project Members
**Endpoint**: `GET /api/projects/[id]/members`

**Description**: Retrieve all members of a project.

**Authorization**:
- User must be a member of the project or be a system ADMIN

**Request**:
```bash
curl -X GET http://localhost:3000/api/projects/clxxx123/members \
  -H "Authorization: Bearer <token>"
```

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "member1",
      "projectId": "clxxx123",
      "userId": "user123",
      "role": "OWNER",
      "joinedAt": "2025-11-12T10:00:00Z",
      "user": {
        "id": "user123",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": null
      }
    },
    {
      "id": "member2",
      "projectId": "clxxx123",
      "userId": "user456",
      "role": "TESTER",
      "joinedAt": "2025-11-13T14:00:00Z",
      "user": {
        "id": "user456",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "avatar": null
      }
    }
  ]
}
```

**Error Responses**:
- **403**: Forbidden - User is not a member
- **404**: Not Found - Project doesn't exist

---

### 7. Add Member to Project
**Endpoint**: `POST /api/projects/[id]/members`

**Description**: Add a team member to the project by email.

**Authorization**:
- Required permission: `projects:member:create`
- User must be a member with PROJECT_MANAGER role

**Request Body**:
```json
{
  "email": "newmember@example.com"
}
```

**Request**:
```bash
curl -X POST http://localhost:3000/api/projects/clxxx123/members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "email": "newmember@example.com"
  }'
```

**Response** (201 Created):
```json
{
  "data": {
    "id": "member3",
    "projectId": "clxxx123",
    "userId": "user789",
    "role": "TESTER",
    "joinedAt": "2025-11-13T17:00:00Z",
    "user": {
      "id": "user789",
      "name": "New Member",
      "email": "newmember@example.com",
      "avatar": null
    }
  }
}
```

**Error Responses**:
- **400**: Bad Request - Invalid email
- **403**: Forbidden - User lacks permission
- **404**: Not Found - Project or user doesn't exist
- **409**: Conflict - User already a member

---

### 8. Remove Member from Project
**Endpoint**: `DELETE /api/projects/[id]/members/[memberId]`

**Description**: Remove a member from the project.

**Authorization**:
- Required permission: `projects:member:delete`
- User must be a member with PROJECT_MANAGER role

**Request**:
```bash
curl -X DELETE http://localhost:3000/api/projects/clxxx123/members/member2 \
  -H "Authorization: Bearer <token>"
```

**Response** (200 OK):
```json
{
  "message": "Member removed successfully"
}
```

**Error Responses**:
- **403**: Forbidden - User lacks permission
- **404**: Not Found - Project or member doesn't exist

---

## Frontend Components

### Component Structure

```
frontend/components/project/
├── ProjectList.tsx              # Main list view component
├── ProjectDetail.tsx            # Main detail/overview component
├── ProjectMembers.tsx           # Members management component
├── ProjectSettings.tsx          # Project settings component
├── ProjectTestCases.tsx         # Test cases view component
├── types.ts                     # TypeScript interfaces
└── subcomponents/
    ├── ProjectCard.tsx          # Individual project card
    ├── CreateProjectDialog.tsx  # Create project form dialog
    ├── DeleteProjectDialog.tsx  # Delete confirmation dialog
    ├── ProjectHeader.tsx        # Project header info
    ├── ProjectOverviewCard.tsx  # Overview card with info
    ├── StatCard.tsx             # Statistics card component
    └── EmptyProjectsState.tsx   # Empty state display
```

### ProjectList Component

**Props**: None

**State**:
- `projects: Project[]` - List of projects
- `loading: boolean` - Loading state
- `deleteDialogOpen: boolean` - Delete dialog visibility
- `projectToDelete: { id, name } | null` - Project pending deletion
- `triggerCreateDialog: boolean` - Create dialog trigger

**Key Methods**:
- `fetchProjects()` - Fetch projects from API
- `handleProjectCreated()` - Add new project to list
- `handleProjectDeleted()` - Remove project from list
- `openDeleteDialog()` - Show delete confirmation

### ProjectDetail Component

**Props**:
```typescript
interface ProjectDetailProps {
  projectId: string;
}
```

**State**:
- `project: Project | null` - Current project data
- `loading: boolean` - Loading state

**Key Methods**:
- `fetchProject()` - Fetch project details with stats

### ProjectCard Component

**Props**:
```typescript
interface ProjectCardProps {
  project: Project;
  onNavigate: (path: string) => void;
  onDelete: () => void;
}
```

**Features**:
- Display project summary
- Show action buttons
- Handle navigation

### CreateProjectDialog Component

**Props**:
```typescript
interface CreateProjectDialogProps {
  triggerOpen: boolean;
  onProjectCreated: (project: Project) => void;
  onOpenChange: (isOpen: boolean) => void;
}
```

**Form Fields**:
- Project Name (required)
- Project Key (required)
- Description (optional)

### StatCard Component

**Props**:
```typescript
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  borderColor: string;
}
```

---

## Architecture

### Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Frontend Layer                                          │
│ - React Components (ProjectList, ProjectDetail)        │
│ - User Interactions (Create, Update, Delete)           │
│ - State Management (useState, useEffect)               │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTP Requests
                     ↓
┌─────────────────────────────────────────────────────────┐
│ API Routes Layer                                        │
│ - app/api/projects/route.ts (GET, POST)               │
│ - app/api/projects/[id]/route.ts (GET, PUT, DELETE)   │
│ - app/api/projects/[id]/members/route.ts              │
│ - Middleware: Authentication, Authorization            │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Delegate
                     ↓
┌─────────────────────────────────────────────────────────┐
│ Controllers Layer                                       │
│ - backend/controllers/project/controller.ts            │
│ - Validation (Zod schemas)                             │
│ - Error Handling                                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Delegate
                     ↓
┌─────────────────────────────────────────────────────────┐
│ Services Layer                                          │
│ - backend/services/project/services.ts                 │
│ - Business Logic                                       │
│ - Database Queries (Prisma)                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Query
                     ↓
┌─────────────────────────────────────────────────────────┐
│ Database Layer                                          │
│ - PostgreSQL Database                                   │
│ - Project, ProjectMember tables                         │
└─────────────────────────────────────────────────────────┘
```

### Request/Response Flow

```
Client Request
    ↓
Authentication Middleware (lib/auth-middleware.ts)
    ↓ (Valid Session)
Authorization Middleware (hasPermission wrapper)
    ↓ (Has Required Permission)
Route Handler (app/api/projects/[...]/route.ts)
    ↓
Controller Method (ProjectController)
    ↓
Validation (Zod Schema)
    ↓ (Valid Input)
Service Method (ProjectService)
    ↓
Database Query (Prisma)
    ↓
Response Object
    ↓
Route Handler Formats Response
    ↓
HTTP Response to Client
    ↓
Frontend Updates UI
```

---

## Data Models

### Project Model

```typescript
model Project {
  id          String   @id @default(cuid())
  name        String
  key         String   @unique
  description String?
  isDeleted   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdById String

  createdBy   User     @relation("CreatedBy", fields: [createdById], references: [id])
  members     ProjectMember[]
  testSuites  TestSuite[]
  testCases   TestCase[]
  testRuns    TestRun[]
  requirements Requirement[]

  @@index([key])
  @@index([createdById])
  @@index([isDeleted])
}
```

### ProjectMember Model

```typescript
model ProjectMember {
  id        String   @id @default(cuid())
  projectId String
  userId    String
  joinedAt  DateTime @default(now())

  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([projectId, userId])
  @@index([projectId])
  @@index([userId])
}
```

### Relationships

- **Project → User**: Many-to-One (created by)
- **Project → ProjectMember**: One-to-Many (members)
- **Project → TestSuite**: One-to-Many
- **Project → TestCase**: One-to-Many
- **Project → TestRun**: One-to-Many
- **Project → Requirement**: One-to-Many

---

## Validation Schemas

### Create Project Schema

```typescript
createProjectSchema = z.object({
  name: z.string().min(3).max(255),
  key: z.string().min(2).max(10).regex(/^[A-Z0-9]+$/),
  description: z.string().optional(),
});
```

### Update Project Schema

```typescript
updateProjectSchema = z.object({
  name: z.string().min(3).max(255).optional(),
  description: z.string().optional(),
});
```

### Add Project Member Schema

```typescript
addProjectMemberSchema = z.object({
  email: z.string().email(),
});
```

---

## Error Handling

### Common Error Codes

| Code | Message | Status |
|------|---------|--------|
| 400 | Validation failed | Bad Request |
| 401 | Unauthorized | Unauthorized |
| 403 | Forbidden / Access denied | Forbidden |
| 404 | Project not found | Not Found |
| 409 | Project key already exists | Conflict |
| 500 | Internal server error | Server Error |

### Error Response Format

```json
{
  "error": "Error message",
  "issues": [
    {
      "code": "error_code",
      "message": "Detailed error message"
    }
  ]
}
```

---

## Best Practices

### Frontend Development

1. **Always handle loading states** when fetching data
2. **Show error messages** to users when requests fail
3. **Use breadcrumbs** for navigation context
4. **Validate form input** before submission
5. **Provide feedback** for user actions (toasts, notifications)

### Backend Development

1. **Always validate input** with Zod schemas
2. **Check permissions** at route and controller levels
3. **Use proper HTTP status codes**
4. **Log errors** for debugging
5. **Handle edge cases** (duplicate keys, missing resources)

### API Usage

1. **Include query parameters** for optional functionality (e.g., `?stats=true`)
2. **Use appropriate HTTP methods** (GET for retrieval, POST for creation, etc.)
3. **Include required headers** (Content-Type, Authorization)
4. **Handle rate limiting** if implemented
5. **Cache responses** on the frontend when appropriate

---

## Future Enhancements

1. **Filtering & Sorting**
   - Filter by created date, team members
   - Sort by name, creation date, activity

2. **Search Functionality**
   - Search by project name or key
   - Full-text search on descriptions

3. **Bulk Operations**
   - Select multiple projects
   - Bulk delete or archive

4. **Project Templates**
   - Create projects from templates
   - Predefined test structures

5. **Advanced Statistics**
   - Test execution trends
   - Pass/fail rate charts
   - Team activity metrics

6. **Project Settings**
   - Custom fields
   - Access level configuration
   - Integration settings

---

## Troubleshooting

### Common Issues

#### Projects list is empty
- **Cause**: User has no projects assigned
- **Solution**: Create a new project or ask admin to add you to existing project

#### "Access Denied" error
- **Cause**: User is not a member of the project
- **Solution**: Ask a project manager to add you to the project

#### Project key already exists
- **Cause**: The project key is already used by another project
- **Solution**: Use a unique, meaningful project key

#### Cannot delete project
- **Cause**: Only admins can delete projects
- **Solution**: Contact a system administrator

---

## Related Documentation

- [RBAC Implementation](./RBAC_IMPLEMENTATION_SUMMARY.md)
- [Project API Implementation](./PROJECT_API_IMPLEMENTATION.md)
- [Authorization and Roles](./AUTHORIZATION_AND_ROLES.md)
- [API Documentation](./API.md)
- [Project Features](./PROJECT_FEATURES.md)

