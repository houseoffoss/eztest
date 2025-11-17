# Project Features Documentation

## Overview

EZTest provides comprehensive project management capabilities for organizing and managing test cases, team members, and project settings. This document outlines all available features for project management.

---

## Table of Contents

1. [Project Management](#project-management)
2. [Team Collaboration](#team-collaboration)
3. [Test Case Management](#test-case-management)
4. [Access Control](#access-control)
5. [Project Settings](#project-settings)

---

## Project Management

### Create Project

Create new test projects with the following capabilities:

- **Project Name**: Unique, descriptive name for your project
- **Project Key**: Short identifier (e.g., "EZTEST") used in test case IDs
- **Description**: Optional detailed description of the project
- **Automatic Member Assignment**: Creator is automatically added as project member

**Requirements:**
- Project name must be unique within the organization
- Project key must be unique and follow naming conventions (uppercase, no spaces)
- Only authenticated users with PROJECT_MANAGER, TESTER, or ADMIN role can create projects

### View Projects

- **Projects List View**: Card-based layout showing all accessible projects
- **Project Details**: Each card displays:
  - Project name and key
  - Description
  - Creator information
  - Member count
  - Test case count
  - Created date
- **Quick Actions**: Edit and delete options available from card menu
- **Navigation**: Click any project card to access project details

### Project Overview

Access comprehensive project information including:

- **Project Statistics**:
  - Total test cases
  - Active test cases
  - Team member count
  - Project status
  
- **Project Details Card**:
  - Project name and key
  - Full description
  - Creator information
  - Creation date
  - Last updated timestamp

- **Quick Navigation**: Access to test cases, members, and settings

### Update Project

Modify existing project details:

- **Editable Fields**:
  - Project name
  - Project description
  
- **Non-editable Fields**:
  - Project key (permanent after creation)
  - Created date
  - Creator (tracked automatically)

**Permissions Required:**
- ADMIN role (can edit any project)
- PROJECT_MANAGER or TESTER role (can edit projects where they are members)

### Delete Project

Soft-delete functionality to remove projects:

- **Confirmation Dialog**: Requires explicit confirmation
- **Warning Information**: 
  - Deletes all associated test cases
  - Removes all team members
  - Cannot be undone
  - Prevents creator removal if they're the only member
  
- **Soft Delete**: Projects are marked as deleted, not permanently removed
- **Data Retention**: Deleted projects remain in database for recovery if needed

**Permissions Required:**
- ADMIN role only (system-wide permission)

---

## Team Collaboration

### Add Team Members

Invite users to collaborate on your project:

- **Email-Based Invitation**: Add members using their email address
- **Simple Membership**: Users are added as members (no project-specific roles)
- **Automatic Lookup**: System looks up user by email
- **Duplicate Prevention**: Cannot add existing members twice

**Note on Roles:**
- Project membership is binary (member or not member)
- User permissions are determined by their **application role**: ADMIN, PROJECT_MANAGER, TESTER, or VIEWER
- Application roles are system-wide and assigned by administrators
- Members with different application roles have different capabilities within projects

**Input Fields:**
- Email Address (required): user@example.com

**Validation:**
- User must exist in the system
- Email must be valid and registered
- User cannot already be a project member

### View Team Members

Access team member information:

- **Member List Display**:
  - Avatar/Initial badge
  - Full name
  - Email address
  - Application role badge (ADMIN, PROJECT_MANAGER, TESTER, or VIEWER)
  - Join date
  
- **Total Member Count**: Displayed in card header
- **Empty State**: Helpful message when no members exist

### Remove Team Members

Remove users from project access:

- **Confirmation Dialog**: Glass-style confirmation with warning
- **Warning Information**:
  - Removes member's access immediately
  - Revokes project access (user retains their application role)
  - Can be reversed by re-adding member
  
- **Safety Checks**:
  - Cannot remove project creator if they're the only member
  - Requires confirmation before deletion
  - Loading state during removal process

**Permissions Required:**
- ADMIN or PROJECT_MANAGER role
- Cannot remove yourself if you're the last member

### Application Roles & Project Permissions

**Note:** All roles are application-level (system-wide), not project-specific. Users have the same role across all projects, but must be members to access projects (except ADMIN).

#### ADMIN (System-Wide)
- Access **all projects** without membership requirement
- Full project control
- Manage all members
- Delete any project
- Create/edit/delete test cases in any project
- Assign roles to users
- Remove users from the application

#### PROJECT_MANAGER (System-Wide)
- Access projects where they are **members**
- Create new projects
- Manage project members (add/remove)
- Modify project settings
- Create/edit/delete test cases
- **Cannot** delete projects
- **Cannot** assign roles or remove users from application

#### TESTER (System-Wide)
- Access projects where they are **members**
- Create new projects
- Modify project settings
- Create/edit/delete test cases
- **Cannot** manage project members
- **Cannot** delete projects

#### VIEWER (System-Wide)
- Access projects where they are **members**
- Read-only access to all project data
- View project details and test cases
- **Cannot** create or modify anything
- **Cannot** manage members

---

## Test Case Management

### Create Test Cases

Add test cases to your project:

- **Test Case Fields**:
  - Title (required)
  - Description (optional)
  - Steps (optional)
  - Expected results (optional)
  - Priority (Low, Medium, High, Critical)
  - Status (Draft, Active, Deprecated)
  
- **Automatic ID Generation**: System generates unique ID (e.g., EZTEST-001)
- **Creator Assignment**: Test case linked to creator
- **Timestamps**: Automatic creation and update tracking

### View Test Cases

Browse and search test cases:

- **List View**: All test cases for the project
- **Test Case Card Display**:
  - Test case ID and title
  - Description preview
  - Priority badge
  - Status badge
  - Created date
  - Creator information
  
- **Empty State**: Helpful message and create button when no test cases exist
- **Quick Actions**: Edit and delete from card menu

### Test Case Details

View comprehensive test case information:

- **Full Details Display**:
  - Complete title and description
  - All test steps
  - Expected results
  - Priority and status
  - Creator information
  - Created and updated timestamps
  
- **Navigation**: Breadcrumbs showing full path
  - Projects → Project Name → Test Cases → Test Case Title

### Update Test Cases

Modify existing test cases:

- **Editable Fields**: All fields can be updated
- **Auto-save Timestamps**: Last updated time tracked automatically
- **Version History**: Tracked for audit purposes

**Permissions Required:**
- PROJECT_MANAGER or TESTER role (member projects)
- ADMIN role (all projects without membership requirement)

### Delete Test Cases

Remove test cases from project:

- **Confirmation Required**: Dialog confirmation before deletion
- **Permanent Deletion**: Cannot be undone
- **Cascade Effects**: Associated data removed

**Permissions Required:**
- PROJECT_MANAGER or TESTER role (member projects)
- ADMIN role (all projects without membership requirement)

---

## Access Control

### Project Visibility

- **Member-Based Access**: Only project members can view project
- **Admin Override**: System admins can access all projects
- **Private by Default**: Projects not visible to non-members

### Permission System

Four-tier application-level role-based access control:

1. **ADMIN** (Application-Level)
   - Access to all projects without membership
   - Full CRUD operations on all projects
   - User and role management
   - System settings

2. **PROJECT_MANAGER** (Application-Level)
   - Access to member projects only
   - Full project control (except deletion)
   - Member management within projects
   - Settings modification

3. **TESTER** (Application-Level)
   - Access to member projects only
   - Content creation and management
   - Cannot manage members
   - Cannot delete projects

4. **VIEWER** (Application-Level)
   - Access to member projects only
   - Read-only access to all content
   - No modification permissions
   - No member management

### Security Features

- **Authentication Required**: All project operations require login
- **Authorization Checks**: Role verification on every operation
- **Session Management**: Secure session handling with NextAuth
- **API Protection**: Backend validates permissions for all requests

---

## Project Settings

### General Settings

Configure project properties:

- **Project Information**:
  - Name (editable by PROJECT_MANAGER, TESTER, or ADMIN)
  - Key (read-only, permanent after creation)
  - Description (editable by PROJECT_MANAGER, TESTER, or ADMIN)
  - Created date (read-only)
  - Creator (read-only, tracked automatically)

### Delete Project

Permanently remove project:

- **Danger Zone**: Clearly marked dangerous action
- **Confirmation Dialog**: Two-step confirmation process
- **Warning Display**: 
  - Glass-style warning box
  - Lists all consequences
  - Cannot be undone message
  
- **Prerequisites**:
  - Must have ADMIN role (system-wide)
  - Cannot delete if creator is the only member
  - Project must exist and be accessible

### Access Settings

View current access configuration:

- **Member Count**: Total team members
- **Role Distribution**: Count by role type
- **Access Level**: Project visibility settings

---

## Navigation & UI

### Project-Specific Navigation

Each project has dedicated navigation:

- **Overview**: Project dashboard and statistics
- **Test Cases**: Browse and manage test cases
- **Members**: Team member management
- **Settings**: Project configuration

### Breadcrumbs

Hierarchical navigation showing current location:

- Projects → Project Name → Current Page
- Clickable links for easy navigation
- Updates dynamically based on current view

### Actions Bar

Consistent actions available:

- **Sign Out**: Available on all project pages
- **Context Actions**: Page-specific actions (Add Member, Create Test Case, etc.)
- **Quick Access**: Important features always accessible

---

## API Endpoints

### Project Endpoints

- `GET /api/projects` - List all accessible projects
- `POST /api/projects` - Create new project
- `GET /api/projects/[id]` - Get project details
- `PATCH /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

### Member Endpoints

- `GET /api/projects/[id]/members` - List project members
- `POST /api/projects/[id]/members` - Add team member (by email)
- `DELETE /api/projects/[id]/members/[memberId]` - Remove member

### Test Case Endpoints

- `GET /api/projects/[id]/testcases` - List test cases
- `POST /api/projects/[id]/testcases` - Create test case
- `GET /api/testcases/[id]` - Get test case details
- `PATCH /api/testcases/[id]` - Update test case
- `DELETE /api/testcases/[id]` - Delete test case

---

## Best Practices

### Project Organization

1. **Use Clear Names**: Choose descriptive project names
2. **Consistent Keys**: Use uppercase, short keys (3-6 chars)
3. **Detailed Descriptions**: Help team understand project scope
4. **Appropriate Members**: Add only necessary team members to projects
5. **Regular Cleanup**: Remove inactive members and test cases

### Team Management

1. **Application Roles**: Contact system admin to assign appropriate roles (ADMIN, PROJECT_MANAGER, TESTER, VIEWER)
2. **Multiple Members**: Have multiple team members for continuity
3. **Regular Reviews**: Audit member list periodically
4. **Email Verification**: Ensure correct email addresses when adding members
5. **Communication**: Notify members when adding/removing project access

### Test Case Management

1. **Clear Titles**: Use descriptive test case names
2. **Detailed Steps**: Document all test steps thoroughly
3. **Set Priorities**: Appropriately prioritize test cases
4. **Update Status**: Keep test case status current
5. **Regular Maintenance**: Archive deprecated test cases

---

## Future Enhancements

### Planned Features

- **Email Notifications**: Automated emails when members are added
- **Member Invitations**: Send invitation links to non-users
- **Bulk Operations**: Add multiple members at once
- **Export/Import**: Project data export and import
- **Templates**: Project and test case templates
- **Advanced Permissions**: Granular permission controls
- **Activity Log**: Track all project activities
- **Analytics**: Project metrics and reporting

### Under Consideration

- Project archiving (soft archive vs. delete)
- Custom roles and permissions
- Project categories/tags
- Cross-project test case linking
- Integration with CI/CD pipelines
- Real-time collaboration features
- Comments and discussions on test cases
- File attachments for test cases

---

## Troubleshooting

### Common Issues

**Cannot Add Member**
- Verify email address is correct
- Ensure user has registered account
- Check if user is already a member
- Verify you have PROJECT_MANAGER or ADMIN role

**Cannot Delete Project**
- Must have ADMIN role (system-wide)
- Cannot delete if creator is the only member
- Check for unsaved changes
- Verify network connection

**Cannot Access Project**
- Verify you are a project member (unless you're an ADMIN)
- Check if project was deleted
- Ensure you're logged in
- Contact project admin or system admin for membership

**Cannot Remove Member**
- Must have PROJECT_MANAGER or ADMIN role
- Cannot remove creator if they're the only member
- Check if member has open tasks
- Verify permissions

---

## Support & Resources

### Documentation
- [API Documentation](./API.md)
- [Authentication Guide](./AUTHENTICATION.md)
- [Development Guide](./DEVELOPMENT.md)
- [Troubleshooting](./TROUBLESHOOTING.md)

### Getting Help
- Check documentation first
- Review error messages carefully
- Contact system administrator
- Report bugs on project repository

---

*Last Updated: November 13, 2025*
*Version: 1.0*
