import { ParsedRow } from '@/lib/file-parser';

/**
 * Test Case Import Column Definitions
 * Maps template column names to normalized field names
 */
export const TEST_CASE_IMPORT_COLUMNS = {
  // Required fields
  'テストケース名': { normalized: 'title', required: true },
  'Test Case Title': { normalized: 'title', required: true },
  'title': { normalized: 'title', required: true },
  'test case title': { normalized: 'title', required: true },
  'testcase title': { normalized: 'title', required: true },
  
  // Optional fields
  'テストケースID': { normalized: 'testCaseId', required: false },
  'Test Case ID': { normalized: 'testCaseId', required: false },
  'test case id': { normalized: 'testCaseId', required: false },
  'testcase id': { normalized: 'testCaseId', required: false },
  
  'モジュール・機能': { normalized: 'module', required: false },
  'Module / Feature': { normalized: 'module', required: false },
  'module / feature': { normalized: 'module', required: false },
  'module/feature': { normalized: 'module', required: false },
  'module': { normalized: 'module', required: false },
  'feature': { normalized: 'module', required: false },
  
  '優先度': { normalized: 'priority', required: false },
  'Priority': { normalized: 'priority', required: false },
  'priority': { normalized: 'priority', required: false },
  
  '前提条件': { normalized: 'preconditions', required: false },
  'Preconditions': { normalized: 'preconditions', required: false },
  'preconditions': { normalized: 'preconditions', required: false },
  
  'テスト手順': { normalized: 'testSteps', required: false },
  'Test Steps': { normalized: 'testSteps', required: false },
  'test steps': { normalized: 'testSteps', required: false },
  'teststeps': { normalized: 'testSteps', required: false },
  
  'テストデータ': { normalized: 'testData', required: false },
  'Test Data': { normalized: 'testData', required: false },
  'test data': { normalized: 'testData', required: false },
  'testdata': { normalized: 'testData', required: false },
  
  '期待結果': { normalized: 'expectedResult', required: false },
  'Expected Result': { normalized: 'expectedResult', required: false },
  'expected result': { normalized: 'expectedResult', required: false },
  'expectedresult': { normalized: 'expectedResult', required: false },
  
  '状態': { normalized: 'status', required: false },
  'Status': { normalized: 'status', required: false },
  'status': { normalized: 'status', required: false },
  
  '不具合ID': { normalized: 'defectId', required: false },
  'Defect ID': { normalized: 'defectId', required: false },
  'defect id': { normalized: 'defectId', required: false },
  'defectid': { normalized: 'defectId', required: false },
  'defect': { normalized: 'defectId', required: false },
  
  // Older fields (backward compatibility)
  '説明': { normalized: 'description', required: false },
  'Description': { normalized: 'description', required: false },
  'description': { normalized: 'description', required: false },
  
  'テスト実行時間（秒）': { normalized: 'estimatedTime', required: false },
  'Estimated Time (minutes)': { normalized: 'estimatedTime', required: false },
  'estimated time (minutes)': { normalized: 'estimatedTime', required: false },
  'estimated time': { normalized: 'estimatedTime', required: false },
  
  '事後条件': { normalized: 'postconditions', required: false },
  'Postconditions': { normalized: 'postconditions', required: false },
  'postconditions': { normalized: 'postconditions', required: false },
  
  'テストスイート': { normalized: 'testsuite', required: false },
  'Test Suites': { normalized: 'testsuite', required: false },
  'test suites': { normalized: 'testsuite', required: false },
  'testsuite': { normalized: 'testsuite', required: false },
  'test suite': { normalized: 'testsuite', required: false },
  
  // New fields for enhanced test case management
  'RTC-ID': { normalized: 'rtcId', required: false },
  'rtc-id': { normalized: 'rtcId', required: false },
  'rtc id': { normalized: 'rtcId', required: false },
  'rtcid': { normalized: 'rtcId', required: false },
  
  'Flow-ID': { normalized: 'flowId', required: false },
  'flow-id': { normalized: 'flowId', required: false },
  'flow id': { normalized: 'flowId', required: false },
  'flowid': { normalized: 'flowId', required: false },
  
  'Layer': { normalized: 'layer', required: false },
  'layer': { normalized: 'layer', required: false },
  
'根拠': { normalized: 'evidence', required: false },
  '根拠（ドキュメント）': { normalized: 'evidence', required: false },
  '根拠コード': { normalized: 'evidence', required: false },
  'Evidence': { normalized: 'evidence', required: false },
  'evidence': { normalized: 'evidence', required: false },
  
  '備考': { normalized: 'notes', required: false },
  'Notes': { normalized: 'notes', required: false },
  'notes': { normalized: 'notes', required: false },

  // プラットフォーム・端末・ドメイン・機能
  'プラットフォーム': { normalized: 'platform', required: false },
  'platform': { normalized: 'platform', required: false },
  '端末': { normalized: 'device', required: false },
  'device': { normalized: 'device', required: false },
  'ドメイン': { normalized: 'domain', required: false },
  'domain': { normalized: 'domain', required: false },
  '機能': { normalized: 'functionName', required: false },
  'functionName': { normalized: 'functionName', required: false },
  'function': { normalized: 'functionName', required: false },

  // Test Type (テスト種別)
  'テスト種別': { normalized: 'testType', required: false },
  'Test Type': { normalized: 'testType', required: false },
  'test type': { normalized: 'testType', required: false },
  'testType': { normalized: 'testType', required: false },
  'testtype': { normalized: 'testType', required: false },

  // 実行方式・自動化状況
  '実行方式': { normalized: 'executionType', required: false },
  'executionType': { normalized: 'executionType', required: false },
  'execution type': { normalized: 'executionType', required: false },
  '自動化状況': { normalized: 'automationStatus', required: false },
  'automationStatus': { normalized: 'automationStatus', required: false },
  'automation status': { normalized: 'automationStatus', required: false },
} as const;

/** _2, _3 などの重複サフィックスを除去（Excel等で全列に _2 が付く場合に対応） */
function stripDuplicateSuffix(s: string): string {
  return s.replace(/_[0-9]+$/, '');
}

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
  // 列名の正規化: BOM・前後空白を除去（Excel 保存 CSV 等で必須列が認識されない問題を防ぐ）
  const normalize = (s: string) => s.replace(/^\uFEFF/, '').trim();
  const normalizedFields = availableFields.map((f) => normalize(f));

  // Check for required field: テストケース名 / Test Case Title（_2 サフィックス除去後に判定）
  const hasTitle = normalizedFields.some((n) => {
    const base = stripDuplicateSuffix(n);
    return (
      base === 'テストケース名' ||
      base.toLowerCase() === 'title' ||
      base.toLowerCase() === 'test case title' ||
      base.toLowerCase() === 'testcase title'
    );
  });

  if (!hasTitle) {
    const availableFieldNames = availableFields.join(', ');
    let msg = `必須列「テストケース名」（または「title」）がありません。利用可能な列: ${availableFieldNames}`;
    // 1列しかない場合、区切り文字（カンマ／タブ／セミコロン）が正しくない可能性
    if (availableFields.length <= 1 && availableFieldNames.length > 20) {
      msg += ' ※列が1つしか認識されていません。ファイルの区切り文字を確認してください（カンマ区切りで保存、またはExcelで「CSV UTF-8（コンマ区切り）」で保存）。';
    }
    errors.push(msg);
  }

  // Validate all columns exist (optional - just for information)
  // This is more of a warning than an error, but we'll include it for debugging
  
  return errors;
}

/**
 * Get normalized column name from template column name (case-insensitive)
 * _2, _3 等の重複サフィックスを除去してから照合
 */
export function getNormalizedColumnName(columnName: string): string | null {
  const base = stripDuplicateSuffix(columnName.trim());
  const normalized = base.toLowerCase();
  // Create a case-insensitive lookup
  const columnEntries = Object.entries(TEST_CASE_IMPORT_COLUMNS);
  const found = columnEntries.find(([key]) => key.toLowerCase() === normalized || key === base);
  return found ? found[1].normalized : null;
}

/**
 * Check if a column is required (case-insensitive)
 * _2, _3 等の重複サフィックスを除去してから照合
 */
export function isColumnRequired(columnName: string): boolean {
  const base = stripDuplicateSuffix(columnName.trim());
  const normalized = base.toLowerCase();
  const columnEntries = Object.entries(TEST_CASE_IMPORT_COLUMNS);
  const found = columnEntries.find(([key]) => key.toLowerCase() === normalized || key === base);
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
 * _2, _3 等の重複サフィックスを除去してから照合
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
    availableFields.map((field) => [stripDuplicateSuffix(field).toLowerCase().trim(), field])
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

