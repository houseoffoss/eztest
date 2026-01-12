# EZTest User Guide

**A simple guide for end users - what EZTest is and how to use it.**

---

## What is EZTest?

**EZTest** is a test management tool that helps teams organize, track, and execute software tests. Think of it as a digital workspace for your testing activities.

### In Simple Terms

- **Test Management**: Create and organize test cases
- **Test Execution**: Run tests and record results
- **Defect Tracking**: Report and track bugs
- **Team Collaboration**: Work together on testing projects

### Who Uses EZTest?

- **QA Testers** - Create and execute test cases
- **Test Managers** - Organize test projects and track progress
- **Developers** - View test results and fix defects
- **Project Managers** - Monitor testing progress

---

## Key Concepts

### 1. Projects

A **Project** is a container for all testing work related to a specific product or feature.

**Example:**
- Project: "Mobile App"
- Contains: All test cases, test runs, and defects for the mobile app

### 2. Test Cases

A **Test Case** is a step-by-step procedure to test a specific feature.

**Example:**
```
Test Case: "User Login"
Steps:
  1. Open the app
  2. Enter email
  3. Enter password
  4. Click Login
Expected: User is logged in successfully
```

### 3. Test Suites

**Test Suites** are folders that organize test cases into groups.

**Example:**
```
Test Suite: "Authentication"
  ├── Test Case: "User Login"
  ├── Test Case: "User Logout"
  └── Test Suite: "Password Reset"
      └── Test Case: "Reset Password"
```

### 4. Modules

**Modules** are another way to organize test cases, similar to test suites but with a different structure. Modules represent functional areas or features of your application.

**Example:**
- Module: "Payment Processing"
- Contains: All test cases related to payments
- Can be used alongside test suites for flexible organization

**When to use Modules vs Test Suites:**
- **Test Suites**: Hierarchical organization (folders within folders)
- **Modules**: Flat organization by feature/functionality

### 5. Test Runs

A **Test Run** is when you actually execute test cases and record the results.

**Example:**
- Test Run: "Sprint 5 Regression Test"
- Date: December 15, 2025
- Status: 45 passed, 3 failed, 2 blocked

### 5. Defects

A **Defect** (or bug) is an issue found during testing.

**Example:**
- Defect: "Login fails with special characters in password"
- Severity: High
- Status: Open → In Progress → Resolved

---

## Getting Started

### Step 1: Access EZTest

1. Open your web browser
2. Navigate to your EZTest URL (provided by your administrator)
3. Log in with your email and password

### Step 2: View Your Projects

After logging in, you'll see the projects page with:
- **Projects** - List of all projects you have access to
- **Project Cards** - Each showing project name, key, and statistics
- **Create Project** - Button to add new projects (if you have permission)

### Step 3: Select or Create a Project

**If you see existing projects:**
- Click on a project card to open it

**If you need to create a project:**
- Click "Create Project" button
- Fill in:
  - Project Name (e.g., "E-Commerce Website")
  - Project Key (e.g., "ECOM")
  - Description (optional)
- Click "Create"

---

## Common Tasks

### Creating a Test Case

1. Open a project
2. Navigate to "Test Cases"
3. Click "Create Test Case"
4. Fill in:
   - **Title**: What you're testing (e.g., "User Registration")
   - **Description**: Additional context
   - **Steps**: Step-by-step instructions
   - **Expected Result**: What should happen
   - **Priority**: Critical, High, Medium, or Low
5. Click "Save"

### Organizing Test Cases

You can organize test cases in two ways:

**Option 1: Using Test Suites (Hierarchical)**
1. Go to "Test Suites" in your project
2. Click "Create Test Suite"
3. Name it (e.g., "User Management")
4. Create nested suites if needed (e.g., "User Management" → "Authentication" → "Login")
5. Move test cases into the suite by editing them

**Option 2: Using Modules (Feature-based)**
1. Go to "Modules" in your project
2. Click "Create Module"
3. Name it (e.g., "Payment Processing", "Search Functionality")
4. Assign test cases to the module when creating or editing them
5. Filter test cases by module to see all tests for a specific feature

**Which to use?**
- **Test Suites**: Best for hierarchical organization (like folders)
- **Modules**: Best for organizing by feature or functionality
- **Both**: You can use both methods together for maximum flexibility

### Running Tests

1. Go to "Test Runs"
2. Click "Create Test Run"
3. Enter a name (e.g., "Sprint 10 Regression")
4. Select a test suite to include
5. Click "Create"
6. For each test case:
   - Follow the test steps
   - Record the result:
     - ✅ **Passed** - Test worked correctly
     - ❌ **Failed** - Test found an issue
     - ⚠️ **Blocked** - Cannot test (dependency issue)
     - ⏭️ **Skipped** - Not testing this time
   - Add comments if needed
   - Click "Save Result"

### Reporting a Defect

When a test fails:

1. Click "Create Defect" (usually available from the failed test result)
2. Fill in:
   - **Title**: Brief description (e.g., "Login button not working")
   - **Description**: Detailed information
   - **Severity**: Critical, High, Medium, or Low
   - **Linked Test Case**: Automatically linked to the failed test
3. Assign to a developer (if you have permission)
4. Click "Create"

### Tracking Defects

1. Go to "Defects"
2. View the list of all defects
3. Filter by:
   - Status (Open, In Progress, Resolved, Closed)
   - Severity
   - Assignee
4. Click on a defect to view details and update status

---

## Understanding Statuses

### Test Case Status

- **DRAFT** - Not ready for testing
- **READY** - Ready to be executed
- **OBSOLETE** - No longer valid

### Test Result Status

- **PASSED** ✅ - Test executed successfully
- **FAILED** ❌ - Test found a defect
- **BLOCKED** ⚠️ - Cannot execute (blocking issue)
- **SKIPPED** ⏭️ - Not executed this time
- **NOT_RUN** - Not yet executed

### Defect Status

- **OPEN** - Newly reported, not yet fixed
- **IN_PROGRESS** - Developer is working on it
- **RESOLVED** - Fixed, waiting for verification
- **CLOSED** - Verified and closed

---

## Navigation Guide

### Main Menu (Sidebar)

- **Projects** - List of all projects
- **Test Cases** - All test cases (across projects)
- **Test Runs** - All test runs
- **Defects** - All defects
- **Settings** - Your profile and preferences

### Project View

When inside a project, you'll see:

- **Overview** - Project statistics and summary
- **Test Suites** - Hierarchical test case organization (folders)
- **Test Cases** - All test cases in this project
- **Modules** - Feature-based test case organization
- **Test Runs** - Test execution history
- **Defects** - Defects found in this project
- **Members** - Team members and their roles
- **Settings** - Project configuration

---

## Tips for Effective Use

### Organizing Test Cases

1. **Use Test Suites** to group related tests
   - Example: "Login", "Checkout", "Search"

2. **Use Descriptive Titles**
   - Good: "User can login with valid credentials"
   - Bad: "Test 1"

3. **Write Clear Steps**
   - Number each step
   - Be specific about actions
   - Include expected results

### Running Tests Efficiently

1. **Create Test Runs** for specific purposes
   - "Sprint 5 Regression"
   - "Smoke Test - Release 2.0"
   - "Daily Sanity Check"

2. **Record Results Immediately**
   - Don't wait until the end
   - Add comments while testing

3. **Create Defects Right Away**
   - When a test fails, create the defect immediately
   - Include screenshots if possible

### Managing Defects

1. **Use Clear Titles**
   - Good: "Payment fails when using expired credit card"
   - Bad: "Bug"

2. **Provide Details**
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots or attachments

3. **Update Status**
   - Change status as defects progress
   - Close when verified fixed

---

## Permissions and Roles

Your access depends on your role:

### System Roles

- **Admin** - Full access to everything
- **Project Manager** - Can create projects
- **Tester** - Can execute tests and create test cases
- **Viewer** - Read-only access

### Project Roles

- **Owner** - Full control of the project
- **Admin** - Can manage project settings
- **Tester** - Can create and execute tests
- **Viewer** - Can only view

**Note:** If you can't perform an action, contact your administrator to check your permissions.

---

## Getting Help

### Common Questions

**Q: How do I create a test case?**  
A: Go to your project → Test Cases → Create Test Case

**Q: How do I run tests?**  
A: Go to Test Runs → Create Test Run → Select test suite → Execute tests

**Q: How do I report a bug?**  
A: When a test fails, click "Create Defect" or go to Defects → Create Defect

**Q: Can I attach files?**  
A: Yes! You can attach screenshots, logs, or documents to test cases, test results, and defects.

**Q: How do I organize my tests?**  
A: You can use Test Suites (hierarchical folders) or Modules (feature-based grouping). Test Suites work like folders with nesting, while Modules organize by functionality. You can use both methods together.

**Q: Will I receive email notifications?**  
A: If your administrator has configured email (SMTP), you'll receive emails for defect assignments, test run reports, and other notifications. See [Email Notifications](../features/email/README.md) for details.

### Need More Help?

- **Documentation**: See [Getting Started Guide](./getting-started/README.md)
- **Features**: See [Features Overview](./features/README.md)
- **Troubleshooting**: See [Troubleshooting Guide](./operations/troubleshooting.md)
- **Contact**: Reach out to your system administrator

---

## Quick Reference

### Common Actions

| What You Want To Do | Where To Go |
|---------------------|-------------|
| Create a project | Projects → Create Project |
| Create a test case | Project → Test Cases → Create Test Case |
| Organize with test suites | Project → Test Suites → Create Test Suite |
| Organize with modules | Project → Modules → Create Module |
| Run tests | Project → Test Runs → Create Test Run |
| Report a defect | Defects → Create Defect (or from failed test) |
| View test results | Project → Test Runs → Select a test run |
| Track defects | Project → Defects |
| Manage team | Project → Members |


---

## Next Steps

1. **Create Your First Project** - See [First Project Guide](./getting-started/first-project.md)
2. **Explore Features** - See [Features Overview](./features/README.md)
3. **Learn Advanced Usage** - See [Feature Documentation](./features/README.md)

---

**Welcome to EZTest! Happy Testing! 🚀**

---

**Last Updated:** December 2025
