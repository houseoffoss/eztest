# Test Suites

Guide to organizing test cases with hierarchical test suites.

## Overview

Test suites provide a way to organize test cases into logical groups. Features include:

- **Hierarchical Structure** - Unlimited nesting depth
- **Flexible Organization** - By feature, module, or any criteria
- **Easy Navigation** - Tree view interface
- **Bulk Operations** - Act on multiple test cases

---

## Table of Contents

- [Creating Test Suites](#creating-test-suites)
- [Suite Hierarchy](#suite-hierarchy)
- [Managing Test Cases](#managing-test-cases)
- [Suite Operations](#suite-operations)
- [Best Practices](#best-practices)

---

## <a id="creating-test-suites"></a>Creating Test Suites

### Required Permissions

- `testsuites:create` permission
- Project membership

### Create a Suite

1. Navigate to your project
2. Go to **Test Suites** tab
3. Click **"Create Test Suite"**
4. Fill in details:

| Field | Required | Description |
|-------|----------|-------------|
| **Name** | Yes | Suite name |
| **Description** | No | Suite description |
| **Parent** | No | Parent suite (for nesting) |

5. Click **"Create"**

---

## <a id="suite-hierarchy"></a>Suite Hierarchy

### Structure Example

```
📁 Authentication
│   ├── 📝 tc1 - User Login
│   ├── 📝 tc2 - User Registration
│   └── 📁 Password Management
│       ├── 📝 tc3 - Password Reset
│       └── 📝 tc4 - Password Change
│
📁 Shopping Cart
│   ├── 📝 tc5 - Add Item
│   ├── 📝 tc6 - Remove Item
│   └── 📁 Checkout
│       ├── 📝 tc7 - Payment Processing
│       └── 📝 tc8 - Order Confirmation
│
📁 User Profile
    ├── 📝 tc9 - View Profile
    └── 📝 tc10 - Edit Profile
```

### Creating Nested Suites

1. When creating a suite, select a **Parent Suite**
2. Or drag an existing suite onto another

### Nesting Depth

- Unlimited nesting levels
- Recommended: Maximum 3-4 levels for usability

### Suite Order

- Suites display in order of creation
- Use drag-and-drop to reorder
- Or set explicit order number

---

## <a id="managing-test-cases"></a>Managing Test Cases

### Add Test Case to Suite

**Option 1: During Creation**
1. Create new test case
2. Select suite in the **Suite** dropdown
3. Save

**Option 2: Move Existing**
1. Open test case
2. Click **Edit**
3. Change suite selection
4. Save

**Option 3: Drag and Drop**
1. Drag test case
2. Drop onto target suite

### Remove from Suite

1. Open test case
2. Click **Edit**
3. Clear suite selection (select "None")
4. Save

### Bulk Operations

Select multiple test cases and:
- Move to another suite
- Change status
- Change priority

---

## <a id="suite-operations"></a>Suite Operations

### Move Suite

Move a suite (and all contents) to a new parent:

1. Drag the suite
2. Drop onto new parent
3. Or select "Move" from suite menu

### Rename Suite

1. Click suite name or menu
2. Select **Rename**
3. Enter new name
4. Save

### Delete Suite

> ⚠️ **Warning:** Deleting a suite removes the suite but test cases are preserved (moved to no suite).

1. Select suite
2. Click **Delete**
3. Confirm deletion

### Suite Statistics

Each suite shows:

| Stat | Description |
|------|-------------|
| **Test Cases** | Number of test cases in suite |
| **Passed** | Last run pass count |
| **Failed** | Last run fail count |
| **Coverage** | % of test cases executed |

---

## <a id="best-practices"></a>Best Practices

### Organization Strategies

**By Feature:**
```
📁 User Authentication
📁 User Management
📁 Product Catalog
📁 Shopping Cart
📁 Checkout
📁 Order Management
```

**By Test Type:**
```
📁 Smoke Tests
📁 Regression Tests
📁 Integration Tests
📁 Performance Tests
📁 Security Tests
```

**By Release:**
```
📁 v1.0 Features
📁 v1.1 Features
📁 v2.0 Features
```

### Naming Conventions

| ✅ Good | ❌ Avoid |
|---------|---------|
| "User Authentication" | "Auth" |
| "Shopping Cart - Add Items" | "Cart Tests" |
| "API - User Endpoints" | "API" |

### Structure Guidelines

1. **Keep it shallow** - Max 3-4 levels deep
2. **Be consistent** - Use same structure across projects
3. **Use descriptions** - Explain suite purpose
4. **Review regularly** - Update as application evolves

### Common Mistakes

| Mistake | Problem | Solution |
|---------|---------|----------|
| Too many levels | Hard to navigate | Flatten structure |
| Vague names | Unclear purpose | Use descriptive names |
| Empty suites | Clutter | Delete or populate |
| Inconsistent | Confusing | Standardize naming |

---

## API Reference

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/projects/:id/testsuites` | List suites |
| `POST` | `/api/projects/:id/testsuites` | Create suite |
| `GET` | `/api/testsuites/:id` | Get suite |
| `PUT` | `/api/testsuites/:id` | Update suite |
| `DELETE` | `/api/testsuites/:id` | Delete suite |
| `POST` | `/api/testsuites/move` | Move suite |

### Example: Create Suite

```bash
curl -X POST http://localhost:3000/api/projects/proj-id/testsuites \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Authentication",
    "description": "User authentication tests",
    "parentId": null
  }'
```

---

## Related Documentation

- [Test Cases](../test-cases/README.md)
- [Test Runs](../test-runs/README.md)
- [API Reference](../../api/test-suites.md)
