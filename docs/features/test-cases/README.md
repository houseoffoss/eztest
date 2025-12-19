# Test Case Management

Comprehensive guide to creating and managing test cases in EzTest.

## Overview

Test cases are the core of your testing effort. Each test case defines:

- What to test (description)
- How to test (steps)
- What to expect (expected results)
- Additional context (preconditions, priority)

---

## Table of Contents

- [Creating Test Cases](#creating-test-cases)
- [Test Case Fields](#test-case-fields)
- [Test Steps](#test-steps)
- [Organizing Test Cases](#organizing-test-cases)
- [Test Case Lifecycle](#test-case-lifecycle)
- [Best Practices](#best-practices)

---

## <a id="creating-test-cases"></a>Creating Test Cases

### Required Permissions

- `testcases:create` permission
- Project membership

### Quick Create

1. Navigate to your project
2. Go to **Test Cases** tab
3. Click **"Create Test Case"**
4. Fill in required fields
5. Click **"Save"**

### Test Case ID

Test case IDs are automatically generated:

- Format: `tc1`, `tc2`, `tc3`, ...
- Unique within each project
- Cannot be changed after creation

---

## <a id="test-case-fields"></a>Test Case Fields

### Required Fields

| Field | Description | Example |
|-------|-------------|---------|
| **Title** | Clear, descriptive name | "Verify user can login with valid credentials" |
| **Project** | Parent project | E-Commerce Platform |

### Optional Fields

| Field | Description | Default |
|-------|-------------|---------|
| **Description** | Detailed test description | - |
| **Expected Result** | Overall expected outcome | - |
| **Priority** | Execution importance | Medium |
| **Status** | Current state | Active |
| **Module** | Associated module | - |
| **Preconditions** | Required setup | - |
| **Postconditions** | Cleanup/verification | - |
| **Estimated Time** | Expected duration (minutes) | - |

### Priority Levels

| Priority | Color | Description | When to Use |
|----------|-------|-------------|-------------|
| **Critical** | 🔴 Red | Business-critical functionality | Core features, security |
| **High** | 🟠 Orange | Important features | Key workflows |
| **Medium** | 🟡 Yellow | Standard functionality | Regular features |
| **Low** | 🟢 Green | Nice-to-have | Edge cases, enhancements |

### Status Values

| Status | Description | When to Use |
|--------|-------------|-------------|
| **Active** | Ready for execution | Approved, ready to test |
| **Draft** | Work in progress | Still being written |
| **Deprecated** | No longer valid | Obsolete, replaced |

---

## <a id="test-steps"></a>Test Steps

### Step Structure

Each step consists of:

| Field | Description | Example |
|-------|-------------|---------|
| **Step Number** | Sequential order | 1, 2, 3... |
| **Action** | What to do | "Click the Login button" |
| **Expected Result** | What should happen | "Login form submits" |

### Adding Steps

1. Open test case edit mode
2. Scroll to **Steps** section
3. Click **"Add Step"**
4. Enter action and expected result
5. Repeat for all steps
6. Click **"Save"**

### Step Example

**Test Case:** Verify user login

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to https://app.example.com/login | Login page displays with email and password fields |
| 2 | Enter "user@example.com" in the email field | Email is accepted, no error shown |
| 3 | Enter "Password123!" in the password field | Password field shows masked characters |
| 4 | Click the "Login" button | Form submits, loading indicator shows |
| 5 | Wait for redirect | User is redirected to dashboard |
| 6 | Verify welcome message | "Welcome, User Name" is displayed |

### Reordering Steps

- Drag and drop steps to reorder
- Or use up/down arrows
- Step numbers auto-update

### Step Attachments

Attach files to individual steps:
- Screenshots
- Test data files
- Expected output samples

---

## <a id="organizing-test-cases"></a>Organizing Test Cases

### Using Test Suites

Group related test cases into suites:

```
Authentication (Suite)
├── tc1 - User Login
├── tc2 - User Registration  
├── tc3 - Password Reset
└── tc4 - Logout
```

### Using Modules

Modules provide another organization layer:

```
User Management (Module)
├── tc1 - Create User
├── tc5 - Edit User
└── tc9 - Delete User
```

### Filtering Test Cases

Filter by:
- **Status**: Active, Draft, Deprecated
- **Priority**: Critical, High, Medium, Low
- **Suite**: By test suite
- **Module**: By module
- **Assignee**: By creator

### Searching Test Cases

Search by:
- Title
- Description
- Test case ID

---

## <a id="test-case-lifecycle"></a>Test Case Lifecycle

### Typical Workflow

```
1. Draft → Write initial test case
2. Review → Team reviews and provides feedback
3. Active → Approved and ready for execution
4. Execute → Run in test runs
5. Update → Modify based on application changes
6. Deprecated → Mark obsolete when no longer needed
```

### Version History

EzTest tracks changes to test cases:
- Who made changes
- When changes were made
- What was changed

View history:
1. Open test case
2. Click **"History"** tab
3. Browse versions

---

## <a id="best-practices"></a>Best Practices

### Writing Good Test Cases

#### 1. Clear Titles

| ❌ Bad | ✅ Good |
|--------|---------|
| "Test login" | "Verify user can login with valid credentials" |
| "Check cart" | "Verify items persist in cart after page refresh" |
| "Error test" | "Verify error message for invalid email format" |

#### 2. Atomic Steps

Each step should be:
- Single action
- Clear expected result
- Independently verifiable

| ❌ Bad | ✅ Good |
|--------|---------|
| "Login and go to dashboard" | Step 1: "Login" → Step 2: "Navigate to dashboard" |

#### 3. Specific Expected Results

| ❌ Bad | ✅ Good |
|--------|---------|
| "Works correctly" | "Displays 'Login successful' message" |
| "Shows error" | "Shows 'Invalid email format' in red text below email field" |

#### 4. Complete Preconditions

Document all requirements:
- User state (logged in/out)
- Data requirements
- Environment settings

#### 5. Maintainable

- Avoid hard-coded data when possible
- Use clear references
- Update when application changes

### Organization Tips

1. **Group by feature** - One suite per feature area
2. **Consistent naming** - Follow naming conventions
3. **Regular review** - Audit and update test cases
4. **Link to requirements** - Trace to specifications

### Anti-patterns to Avoid

| Anti-pattern | Problem | Solution |
|--------------|---------|----------|
| Mega test cases | Hard to maintain, unclear failures | Split into focused tests |
| Vague steps | Can't reproduce | Be specific and clear |
| No preconditions | Setup confusion | Document all requirements |
| Duplicate tests | Maintenance overhead | Consolidate or reference |

---

## API Reference

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/projects/:id/testcases` | List test cases |
| `POST` | `/api/projects/:id/testcases` | Create test case |
| `GET` | `/api/testcases/:id` | Get test case |
| `PUT` | `/api/testcases/:id` | Update test case |
| `DELETE` | `/api/testcases/:id` | Delete test case |

See [Test Cases API](../../api/test-cases.md) for complete reference.

---

## Related Documentation

- [Test Suites](../test-suites/README.md)
- [Test Runs](../test-runs/README.md)
- [Attachments](../attachments/README.md)
- [API Reference](../../api/test-cases.md)
