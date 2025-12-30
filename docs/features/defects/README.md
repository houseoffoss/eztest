# Defect Tracking

Complete guide to tracking and managing defects in EzTest.

## Overview

Defects (bugs) are issues found during testing. EzTest provides:

- **Structured Tracking** - Severity, priority, status
- **Test Case Linking** - Connect defects to failed tests
- **Workflow Management** - Track from discovery to closure
- **Team Collaboration** - Comments, attachments, assignments
- **Reporting** - Defect statistics and trends

---

## Table of Contents

- [Creating Defects](#creating-defects)
- [Defect Fields](#defect-fields)
- [Defect Workflow](#defect-workflow)
- [Linking Test Cases](#linking-test-cases)
- [Managing Defects](#managing-defects)
- [Best Practices](#best-practices)

---

## <a id="creating-defects"></a>Creating Defects

### Required Permissions

- `defects:create` permission
- Project membership

### Create from Test Failure

1. Record a **Failed** test result
2. Click **"Create Defect"** on the result
3. Defect is pre-populated with test info
4. Add additional details
5. Save

### Create Manually

1. Navigate to **Defects** tab
2. Click **"Create Defect"**
3. Fill in all required fields
4. Save

### Defect ID

Automatically generated:
- Format: `DEF-001`, `DEF-002`, etc.
- Unique within project
- Cannot be changed

---

## <a id="defect-fields"></a>Defect Fields

### Required Fields

| Field | Description |
|-------|-------------|
| **Title** | Clear, descriptive summary |
| **Project** | Parent project |

### Optional Fields

| Field | Description | Default |
|-------|-------------|---------|
| **Description** | Detailed defect description | - |
| **Severity** | Impact level | Medium |
| **Priority** | Fix urgency | Medium |
| **Status** | Current state | New |
| **Assigned To** | Responsible person | - |
| **Environment** | Where found | - |
| **Due Date** | Expected fix date | - |
| **Progress** | Fix progress % | - |
| **Test Run** | Associated test run | - |

### Severity Levels

| Severity | Description | Examples |
|----------|-------------|----------|
| **Critical** | System unusable, data loss | Crash, security breach |
| **High** | Major feature broken | Login fails, payment error |
| **Medium** | Feature impaired | Slow performance, UI issues |
| **Low** | Minor issue | Typo, cosmetic |

### Priority Levels

| Priority | Description | Target Resolution |
|----------|-------------|-------------------|
| **Critical** | Fix immediately | Same day |
| **High** | Fix ASAP | 1-2 days |
| **Medium** | Fix in current sprint | 1 week |
| **Low** | Fix when convenient | Backlog |

---

## <a id="defect-workflow"></a>Defect Workflow

### Status Lifecycle

```
    NEW
     │
     ▼
IN_PROGRESS ←──┐
     │         │
     ▼         │
   FIXED       │
     │         │
     ▼         │
  TESTED ──────┘ (if test fails)
     │
     ▼
  CLOSED
```

### Status Descriptions

| Status | Description | Next States |
|--------|-------------|-------------|
| **New** | Just reported | In Progress |
| **In Progress** | Being fixed | Fixed |
| **Fixed** | Developer completed fix | Tested |
| **Tested** | QA verified fix | Closed, In Progress |
| **Closed** | Verified and closed | - |

### Typical Workflow

1. **Tester** creates defect (NEW)
2. **Manager** assigns to developer
3. **Developer** starts work (IN_PROGRESS)
4. **Developer** completes fix (FIXED)
5. **Tester** verifies fix (TESTED)
6. **Tester** confirms fix works (CLOSED)

### Reopen Defect

If fix verification fails:
1. Change status to **In Progress**
2. Add comment explaining issue
3. Developer fixes again

---

## <a id="linking-test-cases"></a>Linking Test Cases

### Why Link?

- **Traceability** - Know which test found the defect
- **Retesting** - Know what to retest after fix
- **Analysis** - Find problematic areas

### Link During Creation

When creating defect from failed test, link is automatic.

### Manual Linking from Defect

1. Open defect detail page
2. Click **"Link Test Cases"**
3. Search/select test cases
4. Save

### Manual Linking from Test Case

1. Open test case detail page
2. Scroll to **"Linked Defects"** card
3. Click **"Link Defect"** button
4. Select a defect from the dropdown
5. Click **"Link Defect"** to confirm

### View Links

On the defect page:
- **Linked Test Cases** section shows all linked tests
- Click to view test case details

On the test case page:
- **Linked Defects** section shows all linked defects
- Click to navigate to defect details

### Unlink Test Cases

1. Open defect
2. Find linked test case
3. Click **"Unlink"**

---

## <a id="managing-defects"></a>Managing Defects

### Filtering Defects

Filter by:
- **Status** - New, In Progress, Fixed, etc.
- **Severity** - Critical, High, Medium, Low
- **Priority** - Critical, High, Medium, Low
- **Assignee** - Assigned team member
- **Created By** - Reporter
- **Date Range** - Created/updated dates

### Bulk Operations

Select multiple defects to:
- Change status
- Assign to user
- Change priority
- Delete

### Comments

Add comments for discussion:
1. Open defect
2. Scroll to **Comments**
3. Enter comment
4. Click **"Add"**

Comments support:
- Text formatting
- File attachments
- @mentions (coming soon)

### Attachments

Attach evidence:
- Screenshots
- Log files
- Video recordings
- Test data

### Notifications

Email notifications for:
- Defect assigned to you
- Status changes
- New comments

---

## <a id="best-practices"></a>Best Practices

### Writing Good Defect Reports

#### 1. Clear Title

| ❌ Bad | ✅ Good |
|--------|---------|
| "Bug" | "Login fails with 500 error for valid credentials" |
| "Doesn't work" | "Shopping cart total incorrect with discount codes" |

#### 2. Detailed Description

Include:
- **Steps to Reproduce** - Exact steps
- **Expected Result** - What should happen
- **Actual Result** - What actually happens
- **Environment** - Browser, OS, etc.

**Template:**
```
## Steps to Reproduce
1. Navigate to login page
2. Enter email: test@example.com
3. Enter password: Test123!
4. Click "Login" button

## Expected Result
User is redirected to dashboard

## Actual Result
Page shows "500 Internal Server Error"

## Environment
- Browser: Chrome 120.0
- OS: Windows 11
- URL: https://staging.example.com
```

#### 3. Evidence

Always attach:
- Screenshot of the error
- Browser console logs
- Network request/response
- Video if complex

#### 4. Severity vs Priority

| Scenario | Severity | Priority |
|----------|----------|----------|
| Login broken, release tomorrow | Critical | Critical |
| Login broken, no release planned | Critical | High |
| Typo on homepage | Low | Medium |
| Typo on admin page | Low | Low |

### Workflow Tips

1. **Verify before reporting** - Reproduce the issue
2. **Check for duplicates** - Search existing defects
3. **Assign promptly** - Don't leave defects unassigned
4. **Update status** - Keep status current
5. **Close completely** - Verify fix before closing

---

## API Reference

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/projects/:id/defects` | List defects |
| `POST` | `/api/projects/:id/defects` | Create defect |
| `GET` | `/api/defects/:id` | Get defect |
| `PUT` | `/api/defects/:id` | Update defect |
| `DELETE` | `/api/defects/:id` | Delete defect |
| `POST` | `/api/defects/bulk-status` | Bulk status update |
| `POST` | `/api/defects/bulk-assign` | Bulk assign |

### Example: Create Defect

```bash
curl -X POST http://localhost:3000/api/projects/proj-id/defects \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Login fails with 500 error",
    "description": "Steps to reproduce...",
    "severity": "HIGH",
    "priority": "CRITICAL",
    "environment": "Staging"
  }'
```

---

## Related Documentation

- [Test Cases](../test-cases/README.md)
- [Test Runs](../test-runs/README.md)
- [Attachments](../attachments/README.md)
- [API Reference](../../api/defects.md)

