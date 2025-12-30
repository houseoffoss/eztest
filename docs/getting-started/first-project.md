# Creating Your First Project

A step-by-step guide to setting up your first test project in EzTest.

## Overview

In this guide, you'll learn how to:

1. Create a new project
2. Set up test suites for organization
3. Create test cases
4. Execute a test run
5. Report a defect

**Time required:** ~15 minutes

---

## Prerequisites

- EzTest installed and running ([Installation Guide](./installation.md))
- Logged in with a user account
- Project creation permissions (Admin or Project Manager role)

---

## Step 1: Create a Project

### Navigate to Projects

1. Click **"Projects"** in the sidebar
2. Click the **"Create Project"** button

### Fill in Project Details

| Field | Value | Description |
|-------|-------|-------------|
| **Name** | E-Commerce Platform | Full project name |
| **Key** | ECOM | Short unique identifier (3-10 chars) |
| **Description** | Testing for the main e-commerce application | Optional description |

### Click "Create"

Your project is now created! You'll be redirected to the project dashboard.

> 💡 **Tip**: The project key (ECOM) will be used as a prefix for test case IDs (e.g., TC-1, TC-2) and defect IDs (e.g., DEF-1, DEF-2).

---

## Step 2: Add Team Members

### Navigate to Members

1. Open your project
2. Click the **"Members"** tab
3. Click **"Add Member"**

### Invite a Team Member

| Field | Value |
|-------|-------|
| **Email** | tester@yourcompany.com |
| **Role** | Tester |

### Project Roles

| Role | Permissions |
|------|-------------|
| **Owner** | Full access, can delete project |
| **Admin** | Manage members, full test access |
| **Tester** | Create/execute tests, report defects |
| **Viewer** | Read-only access |

---

## Step 3: Create Test Suites

Test suites help organize your test cases into logical groups.

### Create a Root Suite

1. Navigate to **"Test Suites"** tab
2. Click **"Create Test Suite"**

**Suite 1: Authentication**
| Field | Value |
|-------|-------|
| **Name** | Authentication |
| **Description** | User authentication and authorization tests |
| **Parent** | (none - root level) |

### Create Nested Suites

**Suite 2: Shopping Cart** (root)
| Field | Value |
|-------|-------|
| **Name** | Shopping Cart |
| **Description** | Shopping cart functionality tests |

**Suite 3: Checkout** (under Shopping Cart)
| Field | Value |
|-------|-------|
| **Name** | Checkout |
| **Parent** | Shopping Cart |

### Resulting Structure

```
📁 Authentication
📁 Shopping Cart
   └── 📁 Checkout
```

---

## Step 4: Create Test Cases

### Create Your First Test Case

1. Navigate to **"Test Cases"** tab
2. Click **"Create Test Case"**

### Test Case: User Login

| Field | Value |
|-------|-------|
| **Title** | Verify user can login with valid credentials |
| **Description** | Test that registered users can login successfully |
| **Suite** | Authentication |
| **Priority** | High |
| **Status** | Active |
| **Estimated Time** | 5 minutes |
| **Preconditions** | User account exists with email: test@example.com |

### Add Test Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to the login page | Login form is displayed with email and password fields |
| 2 | Enter valid email "test@example.com" | Email field accepts input |
| 3 | Enter valid password | Password field shows masked characters |
| 4 | Click the "Login" button | User is redirected to dashboard |
| 5 | Verify welcome message | Dashboard displays "Welcome, Test User" |

### Click "Save"

### Create More Test Cases

**Test Case 2: Add Item to Cart**
| Field | Value |
|-------|-------|
| **Title** | Add product to shopping cart |
| **Suite** | Shopping Cart |
| **Priority** | Critical |
| **Steps** | 1. Browse products → 2. Click "Add to Cart" → 3. Verify cart badge |

**Test Case 3: Complete Checkout**
| Field | Value |
|-------|-------|
| **Title** | Complete purchase with credit card |
| **Suite** | Checkout |
| **Priority** | Critical |
| **Preconditions** | User logged in, items in cart |

---

## Step 5: Create a Test Run

### Navigate to Test Runs

1. Click **"Test Runs"** tab
2. Click **"Create Test Run"**

### Configure Test Run

| Field | Value |
|-------|-------|
| **Name** | Sprint 1 - Smoke Tests |
| **Description** | Basic smoke tests for Sprint 1 release |
| **Environment** | Staging |
| **Assigned To** | (Your name) |

### Select Test Cases

Select the test cases to include in this run:
- ✅ Verify user can login with valid credentials
- ✅ Add product to shopping cart
- ✅ Complete purchase with credit card

### Click "Create"

---

## Step 6: Execute Tests

### Start the Test Run

1. Open the test run you created
2. Click **"Start"** to begin execution

### Execute Each Test Case

For each test case:

1. **Read the test steps**
2. **Perform each action**
3. **Verify expected results**
4. **Record the result:**

| Result | When to Use |
|--------|-------------|
| **Passed** | All steps executed successfully |
| **Failed** | One or more steps didn't produce expected results |
| **Blocked** | Cannot execute due to external issue |
| **Skipped** | Intentionally not executed |
| **Retest** | Needs re-execution after a fix |

5. **Add comments** (optional but recommended for failures)

### Example: Recording a Failed Test

```
Status: Failed
Comment: Step 4 failed - After clicking login, error message 
         "Invalid credentials" displayed instead of redirect.
Duration: 3 minutes
```

### Complete the Test Run

When all tests are executed:
1. Click **"Complete"**
2. Review the summary
3. Optionally send report via email

---

## Step 7: Report a Defect

When a test fails, create a defect to track the issue.

### Create a Defect

1. From the failed test result, click **"Create Defect"**
   - Or navigate to **"Defects"** tab and click **"Create Defect"**

### Fill in Defect Details

| Field | Value |
|-------|-------|
| **Title** | Login fails with valid credentials |
| **Description** | When attempting to login with valid credentials (test@example.com), the system displays "Invalid credentials" error instead of redirecting to dashboard. |
| **Severity** | High |
| **Priority** | High |
| **Environment** | Staging |
| **Assigned To** | developer@company.com |

### Link to Test Case

Link this defect to the related test case(s):
- ✅ Verify user can login with valid credentials

### Attach Evidence

Upload screenshots or logs as attachments to help developers reproduce the issue.

### Click "Create"

The defect is now tracked with ID **DEF-001**.

---

## Summary

Congratulations! You've learned how to:

✅ Create a project with key and description  
✅ Add team members with appropriate roles  
✅ Organize tests with hierarchical suites  
✅ Create detailed test cases with steps  
✅ Execute tests and record results  
✅ Report and track defects  

---

## Best Practices

### Project Organization

- Use clear, consistent naming conventions
- Create logical test suite hierarchy
- Keep test cases focused (one feature per test)

### Test Case Writing

- Write clear, actionable steps
- Include specific expected results
- Add preconditions when needed
- Use appropriate priority levels

### Test Execution

- Execute in consistent environments
- Document all failures thoroughly
- Attach evidence for failed tests
- Retest after defect fixes

### Defect Reporting

- Use descriptive titles
- Include reproduction steps
- Specify environment details
- Link related test cases

---

## Next Steps

- **[Test Case Management](../features/test-cases/README.md)** - Complete test case guide
- **[Test Run Management](../features/test-runs/README.md)** - Advanced execution features
- **[Defect Management](../features/defects/README.md)** - Defect lifecycle management
