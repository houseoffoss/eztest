import { ParsedRow } from '@/lib/file-parser';

/**
 * Test Case Import Column Definitions
 * Maps template column names to normalized field names
 */
export const TEST_CASE_IMPORT_COLUMNS = {
  // Required fields
  'Test Case Title': { normalized: 'title', required: true },
  'title': { normalized: 'title', required: true },
  'test case title': { normalized: 'title', required: true },
  'testcase title': { normalized: 'title', required: true },
  
  // Optional fields
  'Test Case ID': { normalized: 'testCaseId', required: false },
  'test case id': { normalized: 'testCaseId', required: false },
  'testcase id': { normalized: 'testCaseId', required: false },
  
  'Module / Feature': { normalized: 'module', required: false },
  'module / feature': { normalized: 'module', required: false },
  'module/feature': { normalized: 'module', required: false },
  'module': { normalized: 'module', required: false },
  'feature': { normalized: 'module', required: false },
  
  'Priority': { normalized: 'priority', required: false },
  'priority': { normalized: 'priority', required: false },
  
  'Preconditions': { normalized: 'preconditions', required: false },
  'preconditions': { normalized: 'preconditions', required: false },
  
  'Test Steps': { normalized: 'testSteps', required: false },
  'test steps': { normalized: 'testSteps', required: false },
  'teststeps': { normalized: 'testSteps', required: false },
  
  'Test Data': { normalized: 'testData', required: false },
  'test data': { normalized: 'testData', required: false },
  'testdata': { normalized: 'testData', required: false },
  
  'Expected Result': { normalized: 'expectedResult', required: false },
  'expected result': { normalized: 'expectedResult', required: false },
  'expectedresult': { normalized: 'expectedResult', required: false },
  
  'Status': { normalized: 'status', required: false },
  'status': { normalized: 'status', required: false },
  
  'Defect ID': { normalized: 'defectId', required: false },
  'defect id': { normalized: 'defectId', required: false },
  'defectid': { normalized: 'defectId', required: false },
  'defect': { normalized: 'defectId', required: false },
  
  // Older fields (backward compatibility)
  'Description': { normalized: 'description', required: false },
  'description': { normalized: 'description', required: false },
  
  'Estimated Time (minutes)': { normalized: 'estimatedTime', required: false },
  'estimated time (minutes)': { normalized: 'estimatedTime', required: false },
  'estimated time': { normalized: 'estimatedTime', required: false },
  
  'Postconditions': { normalized: 'postconditions', required: false },
  'postconditions': { normalized: 'postconditions', required: false },
  
  'Test Suites': { normalized: 'testsuite', required: false },
  'test suites': { normalized: 'testsuite', required: false },
  'testsuite': { normalized: 'testsuite', required: false },
  'test suite': { normalized: 'testsuite', required: false },
} as const;

/**
 * Validate test case import columns
 */
export function validateTestCaseImportColumns(data: ParsedRow[]): string[] {
  const errors: string[] = [];
  
  if (data.length === 0) {
    errors.push('File is empty or has no data rows');
    return errors;
  }

  const firstRow = data[0];
  const availableFields = Object.keys(firstRow);
  const availableFieldsLower = new Map(
    availableFields.map((field) => [field.toLowerCase().trim(), field])
  );

  // Check for required field: Title (in any variation)
  const titleVariations = ['title', 'test case title', 'testcase title'];
  const hasTitle = titleVariations.some(variation => 
    availableFieldsLower.has(variation)
  );

  if (!hasTitle) {
    const availableFieldNames = availableFields.join(', ');
    errors.push(
      `Missing required column: "Test Case Title" or "Title". Available columns: ${availableFieldNames}`
    );
  }

  // Validate all columns exist (optional - just for information)
  // This is more of a warning than an error, but we'll include it for debugging
  
  return errors;
}

/**
 * Get normalized column name from template column name (case-insensitive)
 */
export function getNormalizedColumnName(columnName: string): string | null {
  const normalized = columnName.trim().toLowerCase();
  // Create a case-insensitive lookup
  const columnEntries = Object.entries(TEST_CASE_IMPORT_COLUMNS);
  const found = columnEntries.find(([key]) => key.toLowerCase() === normalized);
  return found ? found[1].normalized : null;
}

/**
 * Check if a column is required (case-insensitive)
 */
export function isColumnRequired(columnName: string): boolean {
  const normalized = columnName.trim().toLowerCase();
  // Create a case-insensitive lookup
  const columnEntries = Object.entries(TEST_CASE_IMPORT_COLUMNS);
  const found = columnEntries.find(([key]) => key.toLowerCase() === normalized);
  return found ? found[1].required : false;
}

/**
 * Get all valid column names (for validation messages)
 */
export function getValidColumnNames(): string[] {
  return Object.keys(TEST_CASE_IMPORT_COLUMNS).filter(
    (key) => key === key.toLowerCase() || !key.includes(key.toLowerCase())
  );
}

/**
 * Defect Import Column Definitions
 * Maps template column names to normalized field names
 */
export const DEFECT_IMPORT_COLUMNS = {
  // Required fields
  'Defect Title / Summary': { normalized: 'title', required: true },
  'defect title / summary': { normalized: 'title', required: true },
  'defect title': { normalized: 'title', required: true },
  'title': { normalized: 'title', required: true },
  'summary': { normalized: 'title', required: true },
  
  // Optional fields
  'Description': { normalized: 'description', required: false },
  'description': { normalized: 'description', required: false },
  
  'Severity': { normalized: 'severity', required: false },
  'severity': { normalized: 'severity', required: false },
  
  'Priority': { normalized: 'priority', required: false },
  'priority': { normalized: 'priority', required: false },
  
  'Status': { normalized: 'status', required: false },
  'status': { normalized: 'status', required: false },
  
  'Environment': { normalized: 'environment', required: false },
  'environment': { normalized: 'environment', required: false },
  
  'Reported By': { normalized: 'reportedBy', required: false },
  'reported by': { normalized: 'reportedBy', required: false },
  'reportedby': { normalized: 'reportedBy', required: false },
  
  'Reported Date': { normalized: 'reportedDate', required: false },
  'reported date': { normalized: 'reportedDate', required: false },
  'reporteddate': { normalized: 'reportedDate', required: false },
  
  'Assigned To': { normalized: 'assignedTo', required: true },
  'assigned to': { normalized: 'assignedTo', required: true },
  'assignedto': { normalized: 'assignedTo', required: true },
  
  'Due Date': { normalized: 'dueDate', required: false },
  'due date': { normalized: 'dueDate', required: false },
  'duedate': { normalized: 'dueDate', required: false },
} as const;

/**
 * Validate defect import columns
 */
export function validateDefectImportColumns(data: ParsedRow[]): string[] {
  const errors: string[] = [];
  
  if (data.length === 0) {
    errors.push('File is empty or has no data rows');
    return errors;
  }

  const firstRow = data[0];
  const availableFields = Object.keys(firstRow);
  const availableFieldsLower = new Map(
    availableFields.map((field) => [field.toLowerCase().trim(), field])
  );

  // Check for required field: Title (in any variation)
  const titleVariations = ['title', 'defect title / summary', 'defect title', 'summary'];
  const hasTitle = titleVariations.some(variation => 
    availableFieldsLower.has(variation)
  );

  if (!hasTitle) {
    const availableFieldNames = availableFields.join(', ');
    errors.push(
      `Missing required column: "Defect Title / Summary" or "Title". Available columns: ${availableFieldNames}`
    );
  }

  // Check for required field: Assigned To (in any variation)
  const assignedToVariations = ['assigned to', 'assignedto'];
  const hasAssignedTo = assignedToVariations.some(variation => 
    availableFieldsLower.has(variation)
  );

  if (!hasAssignedTo) {
    const availableFieldNames = availableFields.join(', ');
    errors.push(
      `Missing required column: "Assigned To". Available columns: ${availableFieldNames}`
    );
  }
  
  return errors;
}

