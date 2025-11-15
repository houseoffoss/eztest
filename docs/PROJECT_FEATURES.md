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
- **Automatic Owner Assignment**: Creator is automatically assigned as project owner

**Requirements:**
- Project name must be unique within the organization
- Project key must be unique and follow naming conventions (uppercase, no spaces)
- Only authenticated users can create projects

### View Projects

- **Projects List View**: Card-based layout showing all accessible projects
- **Project Details**: Each card displays:
  - Project name and key
  - Description
  - Owner information
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
  - Owner information
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
  - Owner (can be changed through member management)

**Permissions Required:**
- Project Owner or Admin role
- System Admin (global access)

### Delete Project

Soft-delete functionality to remove projects:

- **Confirmation Dialog**: Requires explicit confirmation
- **Warning Information**: 
  - Deletes all associated test cases
  - Removes all team members
  - Cannot be undone
  - Prevents last owner removal before deletion
  
- **Soft Delete**: Projects are marked as deleted, not permanently removed
- **Data Retention**: Deleted projects remain in database for recovery if needed

**Permissions Required:**
- Project Owner role
- System Admin (global access)

---

## Team Collaboration

### Add Team Members

Invite users to collaborate on your project:

- **Email-Based Invitation**: Add members using their email address
- **Role Assignment**: Assign appropriate role during invitation
- **Automatic Notification**: System looks up user by email
- **Duplicate Prevention**: Cannot add existing members twice

**Available Roles:**
- **Owner**: Full control over project and settings
- **Admin**: Manage members and project settings
- **Tester**: Create and manage test cases
- **Viewer**: Read-only access to project and test cases

**Input Fields:**
- Email Address (required): user@example.com
- Project Role (required): Default is "Tester"

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
  - Project role badge
  - System role badge
  - Join date
  
- **Total Member Count**: Displayed in card header
- **Empty State**: Helpful message when no members exist

### Remove Team Members

Remove users from project access:

- **Confirmation Dialog**: Glass-style confirmation with warning
- **Warning Information**:
  - Removes member's access immediately
  - Revokes all permissions
  - Can be reversed by re-adding member
  
- **Safety Checks**:
  - Cannot remove last project owner
  - Requires confirmation before deletion
  - Loading state during removal process

**Permissions Required:**
- Project Owner or Admin
- System Admin (global access)
- Cannot remove yourself if you're the last owner

### Member Roles & Permissions

#### Owner
- Full project control
- Manage all members (including other owners)
- Modify project settings
- Delete project
- Create/edit/delete test cases
- View all project data

#### Admin
- Manage project members (except owners)
- Modify project settings
- Create/edit/delete test cases
- Cannot delete project
- Cannot modify owner permissions

#### Tester
- Create new test cases
- Edit own test cases
- View all test cases
- Cannot manage members
- Cannot modify project settings

#### Viewer
- Read-only access
- View project details
- View test cases
- Cannot create or modify content
- Cannot manage members

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
- Test case creator (own cases)
- Project Owner or Admin (all cases)
- System Admin (global access)

### Delete Test Cases

Remove test cases from project:

- **Confirmation Required**: Dialog confirmation before deletion
- **Permanent Deletion**: Cannot be undone
- **Cascade Effects**: Associated data removed

**Permissions Required:**
- Test case creator (own cases)
- Project Owner or Admin (all cases)
- System Admin (global access)

---

## Access Control

### Project Visibility

- **Member-Based Access**: Only project members can view project
- **Admin Override**: System admins can access all projects
- **Private by Default**: Projects not visible to non-members

### Permission System

Four-tier role-based access control:

1. **System Admin** (Global)
   - Access to all projects
   - Full CRUD operations
   - User management
   - System settings

2. **Project Owner** (Project-Level)
   - Full project control
   - Member management
   - Project deletion
   - Settings modification

3. **Project Admin** (Project-Level)
   - Member management (except owners)
   - Content management
   - Limited settings access

4. **Project Member** (Tester/Viewer)
   - Content access based on role
   - No member management
   - No settings access

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
  - Name (editable)
  - Key (read-only)
  - Description (editable)
  - Created date (read-only)
  - Owner (read-only, changeable via members)

### Delete Project

Permanently remove project:

- **Danger Zone**: Clearly marked dangerous action
- **Confirmation Dialog**: Two-step confirmation process
- **Warning Display**: 
  - Glass-style warning box
  - Lists all consequences
  - Cannot be undone message
  
- **Prerequisites**:
  - Must have Owner role
  - Cannot delete if last owner (must transfer ownership first)

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
4. **Proper Roles**: Assign minimal required permissions
5. **Regular Cleanup**: Remove inactive members and test cases

### Team Management

1. **Role Assignment**: Give appropriate access levels
2. **Multiple Owners**: Have at least 2 owners for continuity
3. **Regular Reviews**: Audit member list periodically
4. **Email Verification**: Ensure correct email addresses
5. **Communication**: Notify members when adding/removing access

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
- Verify you have Owner/Admin permissions

**Cannot Delete Project**
- Must be project owner
- Cannot delete if last owner (transfer ownership first)
- Check for unsaved changes
- Verify network connection

**Cannot Access Project**
- Verify you are a project member
- Check if project was deleted
- Ensure you're logged in
- Contact project owner for access

**Cannot Remove Member**
- Must be Owner/Admin
- Cannot remove last owner
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
