# Project Features Documentation

## Overview

EZTest provides comprehensive project management capabilities for organizing and managing test cases, team members, and project settings. This document outlines all available features for project management.

---

## Table of Contents

1. [Project Management](#project-management)
2. [Team Collaboration](#team-collaboration)
3. [Test Suite Management](#test-suite-management)
4. [Test Case Management](#test-case-management)
5. [Test Run Management](#test-run-management)
6. [Access Control](#access-control)
7. [Project Settings](#project-settings)

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

## Test Suite Management

### Overview

Test Suites provide hierarchical organization for test cases, similar to Testiny's workflow. Organize tests into logical groups with unlimited nesting levels for maximum flexibility.

### Create Test Suites

Add test suites to organize your test cases:

- **Suite Fields**:
  - Name (required): Descriptive name for the suite
  - Description (optional): Detailed suite purpose
  - Parent Suite (optional): Create nested hierarchy
  - Order (optional): Control display sequence
  
- **Automatic Tracking**: 
  - Test case count per suite
  - Child suite count
  - Created and updated timestamps

**Permissions Required:**
- Project Owner or Admin
- Tester role

### View Test Suites

Browse test suites in hierarchical tree view:

- **Tree View Display**:
  - Expandable/collapsible hierarchy
  - Folder icons (open/closed states)
  - Test case counts per suite
  - Child suite counts
  - Description previews
  
- **Visual Hierarchy**:
  - Indentation for nested suites
  - Chevron icons for expand/collapse
  - Color-coded folder icons
  
- **Empty State**: Helpful message and create button when no suites exist

### Hierarchical Organization

Unlimited nesting for flexible organization:

- **Parent-Child Relationships**:
  - Any suite can contain child suites
  - Any suite can contain test cases
  - Mix of test cases and child suites allowed
  
- **Navigation**:
  - Click suite name to view details
  - Expand/collapse to manage view
  - Breadcrumbs show full hierarchy
  
- **Example Structure**:
  ```
  📁 Authentication
    📁 Login
      ✓ TC-001: Valid credentials
      ✓ TC-002: Invalid password
    📁 Registration
      ✓ TC-003: New user signup
      ✓ TC-004: Duplicate email
  📁 E-Commerce
    📁 Cart
      ✓ TC-005: Add item
      ✓ TC-006: Remove item
    📁 Checkout
      ✓ TC-007: Payment success
      ✓ TC-008: Payment failure
  ```

### Update Test Suites

Modify existing test suites:

- **Editable Fields**:
  - Name
  - Description
  - Parent suite (move to different parent)
  - Order (reorder within level)
  
- **Auto-save Timestamps**: Last updated time tracked automatically
- **Move Suites**: Change parent to reorganize structure
- **Reorder**: Drag-and-drop or manual order adjustment

**Permissions Required:**
- Project Owner or Admin
- System Admin (global access)

### Delete Test Suites

Remove test suites from project:

- **Confirmation Dialog**: Glass-style confirmation with warnings
- **Safety Checks**:
  - Cannot delete suite with child suites
  - Must move or delete children first
  - Test cases in suite can be moved or deleted
  
- **Warning Information**:
  - Lists number of test cases affected
  - Lists number of child suites (if any)
  - Cannot be undone
  
**Permissions Required:**
- Project Owner or Admin
- System Admin (global access)

### Assign Test Cases to Suites

Organize test cases within suites:

- **Assignment Methods**:
  - During test case creation
  - Move existing test cases
  - Bulk move operations
  
- **Multiple Assignments**: 
  - Test case can only belong to one suite
  - Move test case between suites
  - Remove from suite (unassigned state)
  
- **Automatic Updates**:
  - Test case counts update immediately
  - Suite hierarchy reflects changes
  - Reorder test cases within suite

### Suite-Based Test Runs

Create test runs from entire suites:

- **Suite Selection**:
  - Select one or multiple suites
  - Automatically includes all test cases from selected suites
  - Includes test cases from child suites
  
- **Benefits**:
  - Run entire feature area at once
  - Consistent test coverage
  - Simplified test execution
  - Track results by suite
  
- **Workflow**:
  1. Navigate to Test Runs
  2. Click "Create Test Run"
  3. Select test suites instead of individual cases
  4. System automatically includes all suite test cases
  5. Execute test run as normal

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

## Test Run Management

### Overview

Test Runs enable systematic execution and tracking of test cases. Create test runs from individual test cases or entire test suites for comprehensive testing workflows.

### Create Test Runs

Execute organized test campaigns:

- **Test Run Fields**:
  - Title (required): Descriptive name for the test run
  - Description (optional): Test run objectives
  - Environment (optional): Test environment name
  - Assigned To (optional): Team member responsible
  - Test Case Selection (required): Choose from:
    - Individual test cases (manual selection)
    - Test suites (automatic inclusion of all cases)
    - Combination of both
  
- **Suite-Based Runs**:
  - Select one or multiple test suites
  - System automatically includes all test cases from selected suites
  - Includes test cases from child suites (recursive)
  - Combines with manually selected test cases
  - Removes duplicates automatically
  
- **Status Tracking**:
  - PLANNED: Created but not started
  - IN_PROGRESS: Currently executing
  - COMPLETED: All tests executed
  - CANCELLED: Run aborted

### View Test Runs

Browse and track test execution:

- **List View**: All test runs for the project
- **Test Run Card Display**:
  - Test run title and ID
  - Description preview
  - Status badge (color-coded)
  - Environment badge
  - Assigned team member
  - Progress indicators
  - Test case count
  - Created date
  
- **Filtering Options**:
  - By status (Planned, In Progress, Completed, Cancelled)
  - By assigned team member
  - By environment
  - By date range
  - Search by title
  
- **Empty State**: Create new test run button when list is empty

### Execute Test Runs

Run tests and record results:

- **Execution View**:
  - Test case list with all details
  - Step-by-step execution
  - Result recording per test case
  - Real-time progress tracking
  
- **Result Status Options**:
  - PASSED: Test executed successfully
  - FAILED: Test found defects
  - BLOCKED: Cannot proceed with test
  - SKIPPED: Test not executed
  - RETEST: Needs re-execution
  
- **For Each Test Case**:
  - View test steps
  - View expected results
  - Record actual results
  - Add comments
  - Update execution status
  - Track execution time
  
- **Bulk Operations**:
  - Mark multiple as passed/failed
  - Skip multiple test cases
  - Mark for retest

### Test Run Details

View comprehensive test run information:

- **Overview Section**:
  - Test run title and description
  - Status and progress percentage
  - Environment information
  - Assigned team member
  - Created by and date
  - Last updated timestamp
  
- **Test Results Summary**:
  - Total test cases
  - Passed count
  - Failed count
  - Blocked count
  - Skipped count
  - Retest needed count
  
- **Test Case Results**:
  - List of all test cases in run
  - Individual test case status
  - Execution notes
  - Time taken per test
  - Assigned executor

### Update Test Runs

Modify test run properties:

- **Editable Fields**:
  - Title
  - Description
  - Environment
  - Assigned to
  - Status
  
- **Cannot Change**:
  - Test cases in run (fixed at creation)
  - Created by
  - Created date
  
- **Auto-tracking**:
  - Last updated timestamp
  - Status change history
  - Progress calculation

**Permissions Required:**
- Test run creator
- Project Owner or Admin
- System Admin (global access)

### Delete Test Runs

Remove test runs from project:

- **Confirmation Required**: Dialog confirmation before deletion
- **Permanent Deletion**: Cannot be undone
- **Warning Information**:
  - All test results will be deleted
  - Execution history will be lost
  - Cannot be recovered
  
- **Impact**:
  - Test cases remain unaffected
  - Only execution records removed
  - No effect on test suites

**Permissions Required:**
- Test run creator
- Project Owner or Admin
- System Admin (global access)

### Test Run Workflow

Recommended process for test execution:

1. **Planning Phase**:
   - Create test suites for different features
   - Organize test cases within suites
   - Define test environments
   
2. **Creation Phase**:
   - Create new test run
   - Select test suites or individual cases
   - Assign to team member
   - Set environment
   - Review included test cases
   
3. **Execution Phase**:
   - Start test run (IN_PROGRESS)
   - Execute test cases one by one
   - Record results for each test
   - Add notes and comments
   - Track progress
   
4. **Completion Phase**:
   - Mark test run as COMPLETED
   - Review results summary
   - Generate reports
   - Plan retest if needed
   
5. **Follow-up**:
   - Create defect tickets for failed tests
   - Schedule retests
   - Update test cases if needed
   - Archive completed runs

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
- **Test Suites**: Hierarchical test organization
- **Test Cases**: Browse and manage test cases
- **Test Runs**: Execute and track test campaigns
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

### Test Suite Endpoints

- `GET /api/projects/[id]/testsuites` - List test suites with hierarchy
- `POST /api/projects/[id]/testsuites` - Create test suite
- `GET /api/testsuites/[id]` - Get test suite details
- `PATCH /api/testsuites/[id]` - Update test suite
- `DELETE /api/testsuites/[id]` - Delete test suite
- `POST /api/testsuites/move` - Move test cases to suite
- `POST /api/testsuites/reorder` - Reorder suites

### Test Case Endpoints

- `GET /api/projects/[id]/testcases` - List test cases
- `POST /api/projects/[id]/testcases` - Create test case
- `GET /api/testcases/[id]` - Get test case details
- `PATCH /api/testcases/[id]` - Update test case
- `DELETE /api/testcases/[id]` - Delete test case

### Test Run Endpoints

- `GET /api/projects/[id]/testruns` - List test runs
- `POST /api/projects/[id]/testruns` - Create test run
- `GET /api/testruns/[id]` - Get test run details
- `PATCH /api/testruns/[id]` - Update test run
- `DELETE /api/testruns/[id]` - Delete test run
- `POST /api/testruns/[id]/results` - Record test results
- `GET /api/testruns/[id]/execute` - Get execution view

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

### Test Suite Organization

1. **Logical Grouping**: Organize suites by feature/module
2. **Consistent Naming**: Use clear, descriptive suite names
3. **Appropriate Nesting**: Don't nest too deeply (3-4 levels max)
4. **Balanced Distribution**: Distribute test cases evenly
5. **Regular Review**: Reorganize as project evolves

### Test Case Management

1. **Clear Titles**: Use descriptive test case names
2. **Detailed Steps**: Document all test steps thoroughly
3. **Set Priorities**: Appropriately prioritize test cases
4. **Update Status**: Keep test case status current
5. **Suite Assignment**: Keep test cases organized in suites
6. **Regular Maintenance**: Archive deprecated test cases

### Test Run Execution

1. **Pre-Run Planning**: Review test cases before starting
2. **Consistent Environment**: Use same environment for related runs
3. **Detailed Notes**: Record observations and issues
4. **Timely Execution**: Don't leave runs incomplete
5. **Follow-up Actions**: Create defects for failed tests
6. **Suite-Based Runs**: Use suites for comprehensive testing

---

## Future Enhancements

### Planned Features

- **Test Suite Detail Page**: View suite contents and statistics
- **Drag-and-Drop**: Reorder suites and test cases
- **Bulk Operations**: Move multiple test cases at once
- **Suite Templates**: Predefined suite structures
- **Test Run Reports**: Detailed execution reports
- **Email Notifications**: Automated emails for test runs
- **Member Invitations**: Send invitation links to non-users
- **Export/Import**: Project data export and import
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
- Comments and discussions on test cases/runs
- File attachments for test cases
- Test result trending and analytics
- Defect tracking integration
- Requirements traceability

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

**Cannot Delete Test Suite**
- Must be Owner/Admin
- Cannot delete suite with child suites
- Move or delete children first
- Verify permissions

**Cannot Create Test Run**
- Must select at least one test case or suite
- Verify suite contains test cases
- Check if test cases are active
- Ensure you have proper permissions

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

## Complete Workflow Example

### Testiny-Like Workflow in EZTest

Here's how to use EZTest's complete testing workflow:

**1. Project Setup**
- Create project: "E-Commerce Application"
- Add team members with appropriate roles
- Configure project settings

**2. Organize with Test Suites**
```
📁 Authentication
  📁 Login
  📁 Registration
  📁 Password Reset
📁 Shopping
  📁 Product Catalog
  📁 Shopping Cart
  📁 Checkout
📁 User Profile
  📁 Account Settings
  📁 Order History
```

**3. Create Test Cases**
- Add test cases to each suite
- Define steps and expected results
- Set priorities and status
- Assign to team members

**4. Execute Test Runs**
- Create test run for "Sprint 5 Testing"
- Select suites: Authentication, Shopping Cart
- System automatically includes all test cases from selected suites
- Assign to QA team member
- Execute tests and record results

**5. Track Progress**
- View test run dashboard
- Monitor pass/fail rates
- Identify blocked tests
- Create defects for failures
- Plan retests as needed

**6. Reporting**
- Review test run results
- Analyze coverage by suite
- Track trends over time
- Generate reports for stakeholders

---

*Last Updated: November 14, 2025*
*Version: 1.1 - Added Test Suites and Test Runs*
