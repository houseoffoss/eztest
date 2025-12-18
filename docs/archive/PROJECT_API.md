# Project API Documentation

## Overview

This document describes the Project Management API endpoints, including authentication, authorization, and usage examples.

## Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [Project Endpoints](#project-endpoints)
   - [List All Projects](#1-list-all-projects)
   - [Create New Project](#2-create-new-project)
   - [Get Project Details](#3-get-project-details)
   - [Update Project Info](#4-update-project-info)
   - [Delete Project](#5-delete-project)
3. [Project Members Endpoints](#project-members-endpoints)
   - [Get Project Members](#6-get-project-members)
   - [Add Member to Project](#7-add-member-to-project)
   - [Remove Member from Project](#8-remove-member-from-project)
4. [Common Error Responses](#common-error-responses)
5. [Architecture](#architecture)
6. [Usage Examples](#usage-examples)

---

## Authentication & Authorization

### Authentication

All endpoints require authentication using NextAuth session. Include the session cookie in your requests.

**Unauthorized Response (401):**
```json
{
  "error": "Unauthorized. Please log in."
}
```

### User Roles (System-wide)
- **ADMIN**: System administrators with access to all projects and operations
- **PROJECT_MANAGER**: Can create projects, manage their own projects
- **TESTER**: Can create projects, work on assigned projects
- **VIEWER**: Read-only access, cannot create projects

### Project Membership
- **Binary Membership**: Users are either members or non-members of a project
- **No Project-Specific Roles**: All permissions are determined by application-level roles
- **Creator Tracking**: Project creator tracked via `createdById` field
- **Member Permissions**: Based on user's application role (ADMIN, PROJECT_MANAGER, TESTER, VIEWER)

### Permission Matrix

| Action | Required Application Role | Membership Required |
|--------|--------------------------|---------------------|
| List Projects | Any authenticated user | N/A |
| Create Project | ADMIN, PROJECT_MANAGER, TESTER | No |
| View Project | Any | Yes (unless ADMIN) |
| Update Project | ADMIN, PROJECT_MANAGER, TESTER | Yes (unless ADMIN) |
| Delete Project | ADMIN only | No |
| View Members | Any | Yes (unless ADMIN) |
| Add Members | ADMIN, PROJECT_MANAGER | Yes (unless ADMIN) |
| Remove Members | ADMIN, PROJECT_MANAGER | Yes (unless ADMIN) |

---

## Project Endpoints

## API Endpoints

### 1. List All Projects
**GET** `/api/projects`

List all projects accessible to the current user.

**Authorization:**
- Authenticated users only
- ADMINs see all projects
- Other users see only projects they're members of

**Response:**
```json
{
  "data": [
    {
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
      "members": [...],
      "_count": {
        "testCases": 25,
        "testRuns": 5,
        "testSuites": 3
      }
    }
  ]
}
```

---

### 2. Create New Project
**POST** `/api/projects`

Create a new project. The creator is automatically added as a project member.

**Authorization:**
- Users with ADMIN, PROJECT_MANAGER, or TESTER role can create projects
- VIEWER role cannot create projects

**Request Body:**
```json
{
  "name": "My New Project",
  "key": "MNP",
  "description": "Optional project description"
}
```

**Validation:**
- `name` (required): 3-255 characters
- `key` (required): 2-10 characters, uppercase letters and numbers only
- `description` (optional): Any string

**Success Response (201):**
```json
{
  "data": {
    "id": "clxxx456",
    "name": "My New Project",
    "key": "MNP",
    "description": "Optional project description",
    "createdAt": "2025-11-12T10:00:00Z",
    "updatedAt": "2025-11-12T10:00:00Z",
    "createdById": "user123",
    "createdBy": {...},
    "members": [...]
  }
}
```

**Error Responses:**
- **400**: Validation error
- **409**: Project key already exists

---

### 3. Get Project Details
**GET** `/api/projects/[id]?stats=true`

Get detailed information about a specific project.

**Authorization:**
- User must be a member of the project or be a system ADMIN

**Query Parameters:**
- `stats` (optional): Include statistics (testCases, testRuns, testSuites, requirements count)

**Success Response (200):**
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
    "createdBy": {...},
    "members": [...],
    "_count": {
      "testCases": 25,
      "testRuns": 5,
      "testSuites": 3,
      "requirements": 10
    }
  }
}
```

**Error Responses:**
- **403**: Access denied
- **404**: Project not found

---

### 4. Update Project Info
**PUT** `/api/projects/[id]`

Update project information.

**Authorization:**
- User must be project OWNER or ADMIN
- System ADMINs can update any project

**Request Body:**
```json
{
  "name": "Updated Project Name",
  "description": "Updated description"
}
```

**Validation:**
- `name` (optional): 3-255 characters
- `description` (optional): Any string or null

**Success Response (200):**
```json
{
  "data": {
    "id": "clxxx123",
    "name": "Updated Project Name",
    "key": "MTP",
    "description": "Updated description",
    ...
  }
}
```

**Error Responses:**
- **400**: Validation error
- **403**: Access denied
- **404**: Project not found

---

### 5. Delete Project
**DELETE** `/api/projects/[id]`

Delete a project and all associated data (cascading delete).

**Authorization:**
- User must be project OWNER or ADMIN
- System ADMINs can delete any project

**Success Response (200):**
```json
{
  "message": "Project deleted successfully"
}
```

**Error Responses:**
- **403**: Access denied
- **404**: Project not found

**Warning:** This action is irreversible and will delete all:
- Test suites
- Test cases
- Test runs
- Test results
- Requirements
- Comments
- Attachments
- Project members

---

### 6. Get Project Members
**GET** `/api/projects/[id]/members`

Get all members of a project.

**Authorization:**
- User must be a member of the project or be a system ADMIN

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "member123",
      "projectId": "clxxx123",
      "userId": "user123",
      "role": "OWNER",
      "joinedAt": "2025-11-12T10:00:00Z",
      "user": {
        "id": "user123",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": null,
        "role": "PROJECT_MANAGER"
      }
    }
  ]
}
```

**Error Responses:**
- **403**: Access denied

---

### 7. Add Member to Project
**POST** `/api/projects/[id]/members`

Add a new member to the project.

**Authorization:**
- User must be project OWNER or ADMIN
- System ADMINs can add members to any project

**Request Body:**
```json
{
  "userId": "user456",
  "role": "TESTER"
}
```

**Validation:**
- `userId` (required): Valid user ID
- `role` (required): One of `OWNER`, `ADMIN`, `TESTER`, `VIEWER`

**Success Response (201):**
```json
{
  "data": {
    "id": "member456",
    "projectId": "clxxx123",
    "userId": "user456",
    "role": "TESTER",
    "joinedAt": "2025-11-12T11:00:00Z",
    "user": {...}
  }
}
```

**Error Responses:**
- **400**: Validation error or invalid role
- **403**: Access denied
- **404**: User not found
- **409**: User is already a member

---

### 8. Remove Member from Project
**DELETE** `/api/projects/[id]/members/[memberId]`

Remove a member from the project.

**Authorization:**
- User must be project OWNER or ADMIN
- System ADMINs can remove members from any project

**Success Response (200):**
```json
{
  "message": "Member removed successfully"
}
```

**Error Responses:**
- **400**: Cannot remove the last owner of the project
- **403**: Access denied
- **404**: Member not found in this project

---

## Common Error Responses

### 400 Bad Request
```json
{
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized. Please log in."
}
```

### 403 Forbidden
```json
{
  "error": "Access denied. Only project owners/admins can modify projects"
}
```

### 404 Not Found
```json
{
  "error": "Project not found"
}
```

### 409 Conflict
```json
{
  "error": "Project key already exists"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Architecture

The API follows a three-layer architecture:

### 1. Routes Layer (`app/api/projects/`)
- Handles HTTP requests and responses
- Performs authentication using `auth-middleware`
- Delegates business logic to controllers

### 2. Controllers Layer (`controllers/project/controller.ts`)
- Validates request data
- Enforces authorization rules
- Calls service layer for business logic
- Formats responses

### 3. Services Layer (`services/project/services.ts`)
- Contains business logic
- Interacts with the database via Prisma
- Reusable across different controllers

### Middleware (`lib/auth-middleware.ts`)
- `authenticateRequest()`: Validates user session
- `requireAdmin()`: Ensures user is a system admin
- `requireRoles()`: Checks for specific roles

---

## Usage Examples

### Creating a Project

**JavaScript/TypeScript:**
```typescript
const response = await fetch('/api/projects', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'E-Commerce Testing',
    key: 'ECOM',
    description: 'Testing suite for e-commerce platform'
  }),
});

const { data } = await response.json();
console.log('Project created:', data.id);
```

**cURL:**
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{
    "name": "E-Commerce Testing",
    "key": "ECOM",
    "description": "Testing suite for e-commerce platform"
  }'
```

### Getting Project with Stats

**JavaScript/TypeScript:**
```typescript
const response = await fetch('/api/projects/clxxx123?stats=true');
const { data } = await response.json();
console.log(`Project has ${data._count.testCases} test cases`);
```

**cURL:**
```bash
curl -X GET "http://localhost:3000/api/projects/clxxx123?stats=true" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

### Updating a Project

**JavaScript/TypeScript:**
```typescript
const response = await fetch('/api/projects/clxxx123', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Updated Project Name',
    description: 'Updated description'
  }),
});

const { data } = await response.json();
console.log('Project updated:', data.name);
```

**cURL:**
```bash
curl -X PUT http://localhost:3000/api/projects/clxxx123 \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{
    "name": "Updated Project Name",
    "description": "Updated description"
  }'
```

### Adding a Team Member

**JavaScript/TypeScript:**
```typescript
const response = await fetch('/api/projects/clxxx123/members', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    userId: 'user456',
    role: 'TESTER' // Optional, defaults to TESTER
  }),
});

const { data } = await response.json();
console.log('Member added:', data.user.name);
```

**cURL:**
```bash
# With explicit role
curl -X POST http://localhost:3000/api/projects/clxxx123/members \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{
    "userId": "user456",
    "role": "TESTER"
  }'

# Without role (defaults to TESTER)
curl -X POST http://localhost:3000/api/projects/clxxx123/members \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{
    "userId": "user456"
  }'
```

### Removing a Member

**JavaScript/TypeScript:**
```typescript
const response = await fetch('/api/projects/clxxx123/members/member789', {
  method: 'DELETE',
});

const { message } = await response.json();
console.log(message); // "Member removed successfully"
```

**cURL:**
```bash
curl -X DELETE http://localhost:3000/api/projects/clxxx123/members/member789 \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

### Deleting a Project

**JavaScript/TypeScript:**
```typescript
if (confirm('Are you sure you want to delete this project?')) {
  const response = await fetch('/api/projects/clxxx123', {
    method: 'DELETE',
  });

  if (response.ok) {
    console.log('Project deleted successfully');
  }
}
```

**cURL:**
```bash
curl -X DELETE http://localhost:3000/api/projects/clxxx123 \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

---

## Frontend Integration

### React Hook Example

```typescript
// hooks/useProjects.ts
import { useState, useEffect } from 'react';

interface Project {
  id: string;
  name: string;
  key: string;
  description: string | null;
  // ... other fields
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.data);
      } else {
        setError('Failed to fetch projects');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: {
    name: string;
    key: string;
    description?: string;
  }) => {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData),
    });

    if (response.ok) {
      await fetchProjects();
      return await response.json();
    }
    throw new Error('Failed to create project');
  };

  const deleteProject = async (projectId: string) => {
    const response = await fetch(`/api/projects/${projectId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setProjects(projects.filter(p => p.id !== projectId));
    }
  };

  return {
    projects,
    loading,
    error,
    createProject,
    deleteProject,
    refetch: fetchProjects,
  };
}
```

---

## Security Considerations

1. **Authentication**: All endpoints require valid NextAuth session
2. **Authorization**: Project-level permissions are enforced
3. **Validation**: Input data is validated before processing
4. **Rate Limiting**: Consider implementing rate limiting in production
5. **CSRF Protection**: NextAuth provides CSRF protection
6. **SQL Injection**: Prisma ORM prevents SQL injection

---

## Best Practices

1. **Error Handling**: Always check response status codes
2. **Loading States**: Implement loading states in UI
3. **Optimistic Updates**: Consider optimistic UI updates for better UX
4. **Caching**: Cache project lists and details when appropriate
5. **Permissions**: Check user permissions before showing UI controls
6. **Validation**: Validate input on both client and server side
