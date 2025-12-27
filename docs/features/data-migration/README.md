# Data Migration & Bulk Import

Comprehensive guide to importing test cases and defects in bulk using CSV or Excel files.

## Overview

The data migration feature allows you to:

- Import multiple test cases at once
- Import multiple defects at once
- Migrate data from other testing tools
- Bootstrap new projects quickly
- Auto-create modules and test suites during import

---

## Table of Contents

- [Quick Start](#quick-start)
- [Test Case Import](#test-case-import)
- [Defect Import](#defect-import)
- [File Formats](#file-formats)
- [Field Reference](#field-reference)
- [Validation Rules](#validation-rules)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites

**Required Permissions:**
- `testcases:create` - For test case imports
- `defects:create` - For defect imports

**Required Setup:**
- Project membership
- Valid project with configured dropdown options

### Basic Import Process

1. **Navigate to Import**
   - Go to Test Cases or Defects page
   - Click **"Import"** button

2. **Download Template**
   - Click **"Download Template"** to get the correct format
   - Template includes all available columns and example data

3. **Prepare Your Data**
   - Fill in the template with your data
   - Save as CSV or Excel (.csv, .xlsx, .xls)

4. **Upload File**
   - Drag and drop file or click to browse
   - Click **"Import"** to start

5. **Review Results**
   - See success/failure counts
   - Review any errors
   - Imported items appear immediately in lists

---

## Test Case Import

### Required Fields

| Field | Required | Description |
|-------|----------|-------------|
| `title` | ✅ **Yes** | Unique test case title (max 200 chars) |

### Optional Fields

| Field | Optional | Default | Description |
|-------|----------|---------|-------------|
| `description` | ✅ | Empty | Detailed description of the test |
| `expectedResult` | ✅ | Empty | Expected outcome |
| `priority` | ✅ | `MEDIUM` | Test priority (HIGH, MEDIUM, LOW) |
| `status` | ✅ | `DRAFT` | Test status (DRAFT, ACTIVE, DEPRECATED) |
| `estimatedTime` | ✅ | `0` | Time in minutes |
| `preconditions` | ✅ | Empty | Prerequisites before testing |
| `postconditions` | ✅ | Empty | Cleanup steps |
| `module` | ✅ | None | Module name (auto-created if doesn't exist) |
| `testsuite` | ✅ | None | Test suite name (auto-created if doesn't exist) |

### Example CSV Template

```csv
title,description,expectedResult,priority,status,estimatedTime,preconditions,postconditions,module,testsuite
"Verify user authentication with valid credentials","Test the login functionality with correct username and password to ensure successful authentication and redirection to dashboard","User should be successfully logged in and redirected to the dashboard page with a welcome message displayed",HIGH,ACTIVE,15,"1. User account exists in the system
2. User has valid credentials
3. Login page is accessible","1. User session is created
2. Login attempt is logged
3. User can access protected resources",Authentication,Login Tests
```

### Import Behavior

**Duplicate Detection:**
- Test cases with existing titles (case-insensitive) are skipped
- You'll see a warning: `"Test case with title 'X' already exists (tc123)"`

**Auto-Creation:**
- **Modules**: Created automatically if module name doesn't exist
- **Test Suites**: Created automatically if suite name doesn't exist
- **IDs**: Generated sequentially (tc1, tc2, tc3...)

**Many-to-Many Relationships:**
- Test cases can belong to multiple test suites
- Linking is handled automatically via junction tables

---

## Defect Import

### Required Fields

| Field | Required | Description |
|-------|----------|-------------|
| `title` | ✅ **Yes** | Unique defect title (max 200 chars) |
| `severity` | ✅ **Yes** | Bug severity (CRITICAL, HIGH, MEDIUM, LOW) |

### Optional Fields

| Field | Optional | Default | Description |
|-------|----------|---------|-------------|
| `description` | ✅ | Empty | Detailed bug description |
| `priority` | ✅ | `MEDIUM` | Fix priority (CRITICAL, HIGH, MEDIUM, LOW) |
| `status` | ✅ | `NEW` | Defect status (NEW, IN_PROGRESS, RESOLVED, etc.) |
| `assignedTo` | ✅ | None | Assignee email (must be project member) |
| `environment` | ✅ | None | Testing environment (DEV, QA, STAGING, PROD) |
| `dueDate` | ✅ | None | Due date in YYYY-MM-DD format |
| `testCase` | ✅ | None | Related test case title for linking |

### Example CSV Template

```csv
title,description,severity,priority,status,assignedTo,environment,dueDate,testCase
"Login button not responding on mobile devices","The login button on the mobile app (iOS 15+ and Android 12+) becomes unresponsive after entering credentials. Users must restart the app to attempt login again. This impacts user experience and prevents access to the application.",CRITICAL,HIGH,NEW,john.doe@company.com,PROD,2024-02-15,"Verify user authentication with valid credentials"
```

### Import Behavior

**Assignee Validation:**
- Email must belong to a project member
- Invalid/non-member emails will cause import failure
- Leave empty if no assignee

**Test Case Linking:**
- Links defect to test case by title match (case-insensitive)
- Creates TestCaseDefect relationship automatically
- Skips linking if test case not found (no error)

**Duplicate Detection:**
- Defect IDs must be unique within project
- System prevents ID collisions automatically

**Auto-Creation:**
- **IDs**: Generated sequentially (def1, def2, def3...)
- **Reporter**: Set to importing user automatically

---

## File Formats

### Supported Formats

| Format | Extension | Notes |
|--------|-----------|-------|
| CSV | `.csv` | Comma-separated values |
| Excel | `.xlsx` | Excel 2007+ format |
| Excel Legacy | `.xls` | Excel 97-2003 format |

### CSV Format Guidelines

**Encoding:**
- UTF-8 encoding recommended
- BOM (Byte Order Mark) optional

**Delimiters:**
- Comma (`,`) as field separator
- Quotes (`"`) for fields containing commas or newlines

**Headers:**
- First row must contain column names
- Column names are case-insensitive
- Extra columns are ignored

**Multi-line Fields:**
```csv
title,description
"Test login","Line 1
Line 2
Line 3"
```

### Excel Format Guidelines

- Use first sheet only (other sheets ignored)
- First row must contain headers
- Empty rows are skipped
- Cell formatting is ignored (converted to text)

---

## Field Reference

### Priority Values

**Test Cases & Defects:**
- `HIGH` - Critical or high priority
- `MEDIUM` - Normal priority (default)
- `LOW` - Low priority

**Validation:**
- Case-insensitive matching
- Invalid values cause import failure

### Status Values

**Test Cases:**
- `DRAFT` - Work in progress (default)
- `ACTIVE` - Ready for execution
- `DEPRECATED` - No longer used

**Defects:**
- `NEW` - Just reported (default)
- `IN_PROGRESS` - Being worked on
- `RESOLVED` - Fixed
- `CLOSED` - Verified and closed
- `REOPENED` - Reopened after resolution

### Severity Values (Defects Only)

- `CRITICAL` - System down, blocking
- `HIGH` - Major functionality broken
- `MEDIUM` - Moderate impact (default)
- `LOW` - Minor issue

### Environment Values

- `DEV` - Development environment
- `QA` - Quality assurance environment
- `STAGING` - Pre-production environment
- `PROD` - Production environment

---

## Validation Rules

### Title Validation

**Requirements:**
- Cannot be empty
- Maximum 200 characters
- Must be unique within project (case-insensitive)

**Examples:**
- ✅ Valid: `"Login with valid credentials"`
- ✅ Valid: `"TEST-123: Verify dashboard loading"`
- ❌ Invalid: `""` (empty)
- ❌ Invalid: Duplicate of existing test case

### Date Validation

**Format:** `YYYY-MM-DD`

**Examples:**
- ✅ Valid: `2024-12-31`
- ✅ Valid: `2025-01-15`
- ❌ Invalid: `12/31/2024`
- ❌ Invalid: `2024-13-01` (invalid month)

### Email Validation

**Requirements:**
- Must be valid email format
- Must belong to project member
- Case-insensitive matching

**Examples:**
- ✅ Valid: `john.doe@company.com`
- ✅ Valid: `JOHN.DOE@COMPANY.COM`
- ❌ Invalid: `john.doe` (not an email)
- ❌ Invalid: `external@other.com` (not a member)

### Number Validation

**Estimated Time:**
- Must be positive integer
- Represents minutes
- Example: `15`, `30`, `60`

**Auto-Conversion:**
- Empty fields → `0`
- Non-numeric values → Import failure

---

## Best Practices

### Data Preparation

✅ **DO:**
- Use the provided template
- Keep titles concise but descriptive
- Include descriptions for complex tests
- Use consistent naming conventions
- Group related items with modules/suites
- Validate emails before import

❌ **DON'T:**
- Mix different entity types in one file
- Use special characters in titles
- Leave required fields empty
- Import without checking for duplicates
- Use outdated email addresses

### Module & Suite Organization

**Recommended Structure:**

```
Project: E-Commerce Website
├── Module: Authentication
│   └── Suite: Login Tests
│   └── Suite: Registration Tests
├── Module: Shopping Cart
│   └── Suite: Add to Cart Tests
│   └── Suite: Checkout Tests
└── Module: Payment
    └── Suite: Payment Gateway Tests
```

**Tips:**
- Create logical module groupings
- Use suites for test execution planning
- Keep module names short and clear
- Avoid deep nesting

### Performance Optimization

- **Batch Size**: Recommended 50-100 items per file
- **Large Imports**: Split into multiple files
- **Validation**: Pre-validate data before import

### Data Migration Strategy

1. **Phase 1: Structure**
   - Import modules first (if needed)
   - Import test suites first (if needed)

2. **Phase 2: Test Cases**
   - Import test cases with module/suite references

3. **Phase 3: Defects**
   - Import defects after test cases (for linking)

4. **Phase 4: Verification**
   - Check counts match expected
   - Verify relationships are correct
   - Test a few items manually

---

## Troubleshooting

### Common Errors

#### "Title is required"

**Cause:** Empty or missing title field

**Solution:**
- Ensure every row has a title
- Check for extra commas creating empty columns
- Verify file encoding (use UTF-8)

#### "Test case with title 'X' already exists"

**Cause:** Duplicate title (case-insensitive)

**Solution:**
- Check existing test cases
- Use unique titles
- Add distinguishing information (e.g., "Login - Desktop" vs "Login - Mobile")

#### "Invalid severity: X"

**Cause:** Severity value not in allowed list

**Solution:**
- Use only: CRITICAL, HIGH, MEDIUM, LOW
- Check for typos
- Ensure proper case (case-insensitive matching works)

#### "User not found or not a project member"

**Cause:** Assignee email not in project

**Solution:**
- Verify email spelling
- Add user to project first
- Leave assignedTo empty if unsure

#### "Invalid date format"

**Cause:** Date not in YYYY-MM-DD format

**Solution:**
- Use format: `2024-12-31`
- Don't use: `12/31/2024` or `31-12-2024`
- Excel users: Format cells as Text before entering dates

### Partial Import Failures

**Scenario:** Some items succeed, some fail

**What Happens:**
- Successful items are imported
- Failed items are listed with errors
- You can fix errors and re-import

**Example Result:**
```
Success: 45
Failed: 5

Errors:
Row 12: "Login Test" - Title already exists (tc67)
Row 23: "Payment Test" - Invalid severity: URGENT
Row 31: "Checkout Test" - User not found: old.user@company.com
```

**Resolution:**
1. Note the failed rows
2. Fix the issues in your file
3. Remove successful rows
4. Re-import only the fixed rows

### File Upload Issues

#### "Please select a CSV or Excel file"

**Cause:** Wrong file format

**Solution:**
- Use only: .csv, .xlsx, .xls
- Don't use: .txt, .doc, .pdf

#### "Failed to download template"

**Cause:** Permission or network issue

**Solution:**
- Check your permissions
- Refresh the page
- Contact administrator if persists

---

## Import Results

### Success Indicators

**Full Success:**
```
✅ Successfully imported 50 test cases. Refreshing...
```
- All items imported
- Auto-refresh after 2 seconds
- Items appear in list immediately

**Partial Success:**
```
⚠️ Partially imported: 45 succeeded, 5 failed.
Click Close & Refresh to see the imported items.
```
- Some items imported
- Manual refresh required
- Review errors before re-importing

### Understanding Results

**Success Count:**
- Number of items imported successfully
- Includes auto-created modules/suites
- Relationships created automatically

**Failed Count:**
- Number of rows that failed validation
- Each error includes row number and reason
- Failed items are not imported

**Error Details:**
- Row number in original file
- Title of the failed item
- Specific error message

---

## API Endpoints

### Test Case Import

**Endpoint:** `POST /api/projects/:id/testcases/import`

**Template:** `GET /api/projects/:id/testcases/import/template`

**Permissions:** `testcases:create`

### Defect Import

**Endpoint:** `POST /api/projects/:id/defects/import`

**Template:** `GET /api/projects/:id/defects/import/template`

**Permissions:** `defects:create`

---

## Related Documentation

- [Test Case Management](../test-cases/README.md) - Full test case documentation
- [Defect Tracking](../defects/README.md) - Full defect documentation
- [Module Management](../modules/README.md) - Organizing test cases
- [Test Suite Management](../test-suites/README.md) - Test execution planning
- [Permissions](../authentication/permissions.md) - User permissions reference

---

## Need Help?

- Check the [Troubleshooting](#troubleshooting) section above
- Review [Common Errors](#common-errors)
- Download the template to see correct format
- Contact your administrator for permission issues
