# Project Management

Complete guide to managing projects in EzTest.

## Overview

Projects are the top-level organizational unit in EzTest. Each project contains:

- Test Suites
- Test Cases
- Test Runs
- Defects
- Team Members

---

## Table of Contents

- [Creating Projects](#creating-projects)
- [Project Structure](#project-structure)
- [Team Management](#team-management)
- [Project Settings](#project-settings)
- [Project Dashboard](#project-dashboard)

---

## <a id="creating-projects"></a>Creating Projects

### Required Permissions

- `projects:create` permission
- Admin or Project Manager role

### Project Fields

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| **Name** | Yes | Full project name | "E-Commerce Platform" |
| **Key** | Yes | Unique 3-10 char identifier | "ECOM" |
| **Description** | No | Project description | "Main shopping application" |

### Creating a Project

1. Navigate to **Projects** in the sidebar
2. Click **"Create Project"**
3. Fill in the project details
4. Click **"Create"**

### Project Key Guidelines

The project key is used as a prefix for:
- Test case IDs (e.g., tc1, tc2)
- Defect IDs (e.g., DEF-001)

**Best Practices:**
- Use 3-5 uppercase letters
- Make it memorable and recognizable
- Keep it short for readability

**Examples:**
| Project Name | Good Key | Avoid |
|--------------|----------|-------|
| E-Commerce Platform | ECOM | ECOMMERCE |
| Mobile App | MAPP | MOBILEAPP |
| API Testing | API | APITESTING |

---

## <a id="project-structure"></a>Project Structure

### Hierarchy

```
Project (ECOM)
├── Test Suites
│   ├── Authentication
│   │   ├── Login Tests
│   │   └── Registration Tests
│   └── Shopping Cart
│       └── Checkout
├── Test Cases
│   ├── tc1 - User Login
│   ├── tc2 - User Registration
│   └── tc3 - Add to Cart
├── Test Runs
│   ├── Sprint 1 Testing
│   └── Regression Suite
├── Defects
│   ├── DEF-001 - Login fails
│   └── DEF-002 - Cart empty
└── Members
    ├── John (Owner)
    ├── Jane (Admin)
    └── Bob (Tester)
```

### Navigation

Within a project, navigate using tabs:

| Tab | Description |
|-----|-------------|
| **Overview** | Project dashboard and statistics |
| **Test Suites** | Hierarchical test organization |
| **Test Cases** | All test cases in the project |
| **Test Runs** | Test execution management |
| **Defects** | Bug tracking |
| **Members** | Team management |
| **Settings** | Project configuration |

---

## <a id="team-management"></a>Team Management

### Project Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| **Owner** | Project creator, full control | All, including delete |
| **Admin** | Project administrator | Manage members, full content access |
| **Tester** | Test executor | Create/edit tests, report defects |
| **Viewer** | Read-only access | View only |

### Adding Members

1. Open the project
2. Navigate to **Members** tab
3. Click **"Add Member"**
4. Search for user by email
5. Select role
6. Click **"Add"**

### Removing Members

1. Navigate to **Members** tab
2. Find the member
3. Click the **"Remove"** button
4. Confirm removal

> ⚠️ **Note:** Project owners cannot be removed. Transfer ownership first.

### Changing Member Roles

1. Navigate to **Members** tab
2. Find the member
3. Click the role dropdown
4. Select new role

### Project Visibility

- **Members** see the project in their project list
- **Admins** (system role) can see all projects
- **Non-members** cannot access the project

---

## <a id="project-settings"></a>Project Settings

### Basic Settings

| Setting | Description |
|---------|-------------|
| **Name** | Update project name |
| **Description** | Update project description |
| **Key** | Cannot be changed after creation |

### Access Settings

| Setting | Description |
|---------|-------------|
| **Default Role** | Role for new members |
| **Allow Join Requests** | Enable/disable join requests |

### Danger Zone

| Action | Description | Permission |
|--------|-------------|------------|
| **Archive Project** | Hide from active list | Owner, Admin |
| **Delete Project** | Permanently delete | Owner only |

> ⚠️ **Warning:** Deleting a project removes all test suites, test cases, test runs, defects, and attachments. This cannot be undone.

---

## <a id="project-dashboard"></a>Project Dashboard

### Overview Statistics

| Metric | Description |
|--------|-------------|
| **Total Test Cases** | Number of test cases |
| **Active Test Runs** | Currently running test runs |
| **Open Defects** | Unresolved defects |
| **Pass Rate** | Overall test pass percentage |

### Charts (Coming Soon)

- Test execution trends
- Defect trends
- Test coverage
- Team activity

### Recent Activity

- Latest test executions
- Recent defects
- Team updates

---

## API Reference

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/projects` | List all projects |
| `POST` | `/api/projects` | Create project |
| `GET` | `/api/projects/:id` | Get project details |
| `PUT` | `/api/projects/:id` | Update project |
| `DELETE` | `/api/projects/:id` | Delete project |

### Example: Create Project

```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "name": "E-Commerce Platform",
    "key": "ECOM",
    "description": "Main shopping application"
  }'
```

### Example: List Projects

```bash
curl http://localhost:3000/api/projects \
  -H "Cookie: next-auth.session-token=..."
```

See [Projects API Documentation](../../api/projects.md) for complete reference.

---

## Best Practices

### Project Organization

1. **One project per application** - Keep scope focused
2. **Use meaningful keys** - Short, memorable identifiers
3. **Document in description** - Include relevant context
4. **Regular cleanup** - Archive completed projects

### Team Management

1. **Assign appropriate roles** - Follow least privilege
2. **Clear ownership** - Designate project owners
3. **Regular access review** - Remove inactive members

---

## Related Documentation

- [Creating Your First Project](../../getting-started/first-project.md)
- See this documentation for team management details
- [Projects API](../../api/projects.md)
