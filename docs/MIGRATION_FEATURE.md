# Migration Feature Documentation

## Overview
The migration feature allows users to bulk import test cases and defects from CSV and Excel files, making it easy to migrate data from other test management tools or import large datasets.

## Features
- Support for CSV (.csv) and Excel (.xlsx, .xls) files
- Template download for correct format
- Real-time validation and error reporting
- Automatic ID generation (tcId for test cases, defectId for defects)
- Module creation on-the-fly for test cases
- User assignment by email for defects
- Progress indication during import
- Detailed import results with success/failure counts

## API Endpoints

### Test Cases Import
- **POST** `/api/projects/:projectId/testcases/import`
  - Requires: Project member with WRITE access
  - Body: FormData with 'file' field
  - Returns: Import result with success count, failed count, and error details

- **GET** `/api/projects/:projectId/testcases/import/template`
  - Returns: Template structure and example data

### Defects Import
- **POST** `/api/projects/:projectId/defects/import`
  - Requires: Project member with WRITE access
  - Body: FormData with 'file' field
  - Returns: Import result with success count, failed count, and error details

- **GET** `/api/projects/:projectId/defects/import/template`
  - Returns: Template structure and example data

## File Format

### Test Cases CSV/Excel Format
**Required Columns:**
- `title` - Test case title (required)

**Optional Columns:**
- `description` - Test case description
- `expectedResult` - Expected result
- `priority` - Priority (e.g., HIGH, MEDIUM, LOW)
- `status` - Status (e.g., ACTIVE, INACTIVE, DRAFT)
- `estimatedTime` - Estimated time in minutes
- `preconditions` - Preconditions
- `postconditions` - Postconditions
- `module` - Module name (will be created if doesn't exist)
- `suite` - Test suite name (must exist)

**Example:**
```csv
title,description,expectedResult,priority,status,estimatedTime,preconditions,postconditions,module,suite
"Login with valid credentials","Verify user can login","User is logged in successfully",HIGH,ACTIVE,5,"User account exists","User is on dashboard","Authentication","Login Tests"
```

### Defects CSV/Excel Format
**Required Columns:**
- `title` - Defect title (required)

**Optional Columns:**
- `description` - Defect description
- `severity` - Severity (e.g., CRITICAL, HIGH, MEDIUM, LOW)
- `priority` - Priority (e.g., HIGH, MEDIUM, LOW)
- `status` - Status (e.g., NEW, IN_PROGRESS, RESOLVED, CLOSED)
- `assignedTo` - Assignee email address (must be project member)
- `environment` - Environment (e.g., PRODUCTION, STAGING, QA)
- `dueDate` - Due date (YYYY-MM-DD format)

**Example:**
```csv
title,description,severity,priority,status,assignedTo,environment,dueDate
"Login button not working","The login button is not clickable on mobile",HIGH,HIGH,NEW,"developer@example.com",PRODUCTION,2025-12-31
```

## Usage

### From UI
1. Navigate to Test Cases or Defects page
2. Click the "Import" button in the action bar
3. Download the template (optional but recommended)
4. Fill in your data following the template format
5. Click "Upload" and select your file
6. Review the import results
7. The page will automatically refresh to show imported items

### Validation Rules

#### Test Cases
- Title is required and must not be empty
- Priority must be a valid dropdown option (validated against TESTCASE_PRIORITY)
- Status must be a valid dropdown option (validated against TESTCASE_STATUS)
- Estimated time must be a positive integer
- Module will be created if it doesn't exist
- Suite must exist in the project (if specified)

#### Defects
- Title is required and must not be empty
- Severity must be a valid dropdown option (validated against DEFECT_SEVERITY)
- Priority must be a valid dropdown option (validated against DEFECT_PRIORITY)
- Status must be a valid dropdown option (validated against DEFECT_STATUS)
- Environment must be a valid dropdown option (validated against ENVIRONMENT)
- Assigned user must be a project member (if specified by email)
- Due date must be a valid date format

## Error Handling
- Invalid file formats are rejected before upload
- Parse errors are reported with specific row numbers
- Validation errors show which field failed and why
- Partial imports are supported - successful rows are imported even if some fail
- Detailed error report shows:
  - Row number
  - Title of the failed item
  - Specific error message

## Implementation Details

### Backend Services
- `testcase-migration.service.ts` - Handles test case import logic
- `defect-migration.service.ts` - Handles defect import logic
- `file-parser.ts` - CSV and Excel parsing utilities

### Frontend Components
- `FileImportDialog.tsx` - Reusable import dialog component
- Integrated into TestCaseList and DefectList pages

### Dependencies
- `papaparse` - CSV parsing
- `xlsx` - Excel file handling
- `@radix-ui/react-progress` - Progress indicator

## Notes
- Files are processed entirely in memory (not saved to disk)
- Maximum file size is determined by your server configuration
- IDs are auto-generated and cannot be specified in the import file
- All timestamps are set to the import time
- The importing user is set as the creator

## Future Enhancements
- Support for test steps import
- Batch size configuration for large files
- Background processing for very large imports
- Import history and rollback feature
- Excel template download (currently CSV only)
