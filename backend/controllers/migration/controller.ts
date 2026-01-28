import { importService, ImportType } from '@/backend/services/migration/import/services';
import { parseFile } from '@/lib/file-parser';
import { CustomRequest } from '@/backend/utils/interceptor';
import { ValidationException } from '@/backend/utils/exceptions';
import { validateTestCaseImportColumns, validateDefectImportColumns } from '@/backend/validators/migration.validator';

export class MigrationController {
  /**
   * Import data from CSV/Excel file
   */
  async importData(req: CustomRequest, projectId: string, type: ImportType) {
    try {
      const formData = await req.formData();
      const file = formData.get('file') as File;

      if (!file) {
        throw new ValidationException('No file uploaded');
      }

      // Parse the file
      const parseResult = await parseFile(file);

      if (parseResult.errors.length > 0) {
        throw new ValidationException('File parsing errors', parseResult.errors);
      }

      // Validate required fields using dedicated validator
      if (type === 'testcases') {
        const validationErrors = validateTestCaseImportColumns(parseResult.data);
        if (validationErrors.length > 0) {
          throw new ValidationException('Missing required fields', validationErrors);
        }
      } else {
        // For defects, use dedicated validator
        const validationErrors = validateDefectImportColumns(parseResult.data);
        if (validationErrors.length > 0) {
          throw new ValidationException('Missing required fields', validationErrors);
        }
      }

      // Import data
      const result = await importService.importData(
        type,
        projectId,
        req.userInfo.id,
        parseResult.data
      );

      const typeNames: Record<ImportType, string> = {
        testcases: 'Test cases',
        defects: 'Defects',
      };


      return {
        message: `${typeNames[type]} import completed`,
        data: result,
      };
    } catch (error) {
      if (error instanceof ValidationException) {
        throw error;
      }
      
      const typeNames: Record<ImportType, string> = {
        testcases: 'test cases',
        defects: 'defects',
      };
      
      throw new ValidationException(
        `Failed to import ${typeNames[type]}`,
        error instanceof Error ? [error.message] : ['Unknown error']
      );
    }
  }

  /**
   * Get import template for test cases
   */
  getTestCaseImportTemplate() {
    const template = {
      columns: [
        { name: 'Test Case Title', required: false, description: 'Short, clear description of the test case. If not provided, "操作手順" (Operation) or "Assertion-ID" will be used as title.' },
        { name: 'Module / Feature', required: false, description: 'Application area (Login, Payments, IoT Device, etc.). Will be created if not exists' },
        { name: 'Priority', required: false, description: 'Priority level: High / Medium / Low' },
        { name: 'Preconditions', required: false, description: 'Conditions required before test execution' },
        { name: 'Test Steps', required: false, description: 'Step-by-step actions. Each newline or numbered point (1., 2., etc.) is a new step. Can be empty if Expected Result column has values. Formats: 1) Newline-separated without numbers: "Navigate to login page\nEnter valid email and password\nClick Login button" 2) Numbered with newlines: "1. Navigate to login page\n2. Enter valid email and password\n3. Click Login button" 3) Numbered points (same line): "1. Enter password 2. Verify" 4) JSON array: [{"stepNumber":1,"action":"..."}]. Note: If empty, steps will be created from Expected Result column. If expected results are included with semicolon in this column, they will be ignored - use Expected Result column instead. In CSV files, wrap this field in double quotes to prevent splitting across columns.' },
        { name: 'Test Data', required: false, description: 'Input values or test data to be used' },
        { name: 'Expected Result', required: false, description: 'Expected system behavior or outcome for each test step. Each newline or numbered point (1., 2., etc.) matches a test step by position (line 1 matches step 1, line 2 matches step 2, etc.). Can be empty if Test Steps column has values. Formats: 1) Newline-separated without numbers (one per step): "Login page displays\nCredentials accepted\nUser redirected to dashboard" 2) Numbered with newlines: "1. Login page displays\n2. Credentials accepted\n3. User redirected to dashboard" 3) Numbered points (same line): "1. Login page displays 2. Credentials accepted 3. User redirected to dashboard" 4) Single value (applies to all steps): "User successfully logs in". Note: If Test Steps is empty, steps will be created from this column. If both columns have values, they are matched by line number/index.' },
        { name: 'Status', required: false, description: 'Test case status: Active / Draft / Deprecated (execution statuses like Pass/Fail are for test results, not test cases)' },
        { name: 'Defect ID', required: false, description: 'Bug reference if failed. Can specify multiple defects separated by comma or semicolon (e.g., DEF-1, BUG-123, na, any-text). Any value is allowed. Defects will be linked automatically when they are created. You can use defect IDs that don\'t exist yet - they will be linked when the defects are created (case-sensitive matching).' },
        // Older fields (kept for backward compatibility)
        { name: 'Description', required: false, description: 'Detailed test case description (older field)' },
        { name: 'Estimated Time (minutes)', required: false, description: 'Estimated time in minutes (older field)' },
        { name: 'Postconditions', required: false, description: 'Postconditions (older field)' },
        { name: 'Test Suites', required: false, description: 'Test suite name (will be created if not exists) (older field)' },
        // New fields for enhanced test case management (EZ Test UI labels)
        { name: 'Assertion-ID', required: false, description: 'Assertion-ID: Assertion identifier (e.g., AST-RTC-SM-001-01)' },
        { name: 'RTC-ID', required: false, description: 'RTC-ID: RTC identifier (e.g., RTC-SM-001)' },
        { name: 'Flow-ID', required: false, description: 'Flow-ID: Flow identifier (e.g., SM-001)' },
        { name: 'Layer', required: false, description: 'Layer: Test layer - Smoke / Core / Extended / Unknown (will be converted to uppercase: SMOKE, CORE, EXTENDED, UNKNOWN)' },
        { name: '対象（API/画面）', required: false, description: '対象: Target type - API endpoint (e.g., "POST /signup/sms") or 画面 (screen/flow). API endpoints starting with HTTP methods (POST/GET/PUT/DELETE/PATCH) will be converted to "API". Values containing "画面" or "フロー" will be converted to "SCREEN". Can also use "API" or "SCREEN" directly.' },
        { name: '操作手順', required: false, description: '操作手順: Operation procedure / Test steps description' },
        { name: '期待値', required: false, description: '期待値: Expected value / Expected result (different from Expected Result column which is for test steps)' },
        { name: '根拠（ドキュメント）', required: false, description: '根拠: Evidence / Documentation reference (e.g., docs/20_backend_services/phone_auth_implementation_spec.md)' },
        { name: '備考', required: false, description: '備考: Notes / Additional remarks' },
        { name: '自動化', required: false, description: '自動化: Automation status - true / false / yes / no / 自動化 (will be converted to boolean)' },
        { name: '環境（iOS / Android / Web）', required: false, description: '環境: Platforms - iOS / Android / Web (can specify multiple separated by "/" or ","). Will be converted to array: ["IOS", "ANDROID", "WEB"]' },
      ],
      example: {
        'Test Case Title': 'Verify user authentication with valid credentials',
        'Module / Feature': 'Login',
        'Priority': 'HIGH',
        'Preconditions': 'User account must be registered in the system with valid credentials',
        'Test Steps': '1. Navigate to login page\n2. Enter valid email and password\n3. Click Login button\n4. Verify dashboard loads\n5. Check user profile is displayed',
        'Test Data': 'Email: user@example.com, Password: Test123!',
        'Expected Result': '1. Login page displays\n2. Credentials accepted\n3. User redirected to dashboard\n4. Dashboard page loads successfully\n5. User profile information is visible',
        'Status': 'ACTIVE',
        'Defect ID': 'DEF-1, DEF-LOGIN-001',
      },
      examples: [
        {
          description: 'Both Test Steps and Expected Result with numbered format (5 steps) - Mixed defect ID formats',
          'Test Case Title': 'Verify user authentication with valid credentials',
          'Module / Feature': 'Login',
          'Priority': 'HIGH',
          'Preconditions': 'User account must be registered in the system with valid credentials',
          'Test Steps': '1. Navigate to login page\n2. Enter valid email and password\n3. Click Login button\n4. Verify dashboard loads\n5. Check user profile is displayed',
          'Test Data': 'Email: user@example.com, Password: Test123!',
          'Expected Result': '1. Login page displays\n2. Credentials accepted\n3. User redirected to dashboard\n4. Dashboard page loads successfully\n5. User profile information is visible',
          'Status': 'ACTIVE',
          'Defect ID': 'DEF-1, DEF-LOGIN-001',
        },
        {
          description: 'Test case with custom format defect IDs',
          'Test Case Title': 'Verify payment processing workflow',
          'Module / Feature': 'Payments',
          'Priority': 'CRITICAL',
          'Preconditions': 'User must have valid payment method registered',
          'Test Steps': '1. Navigate to checkout\n2. Select payment method\n3. Enter payment details\n4. Submit payment',
          'Test Data': 'Card: 4111-1111-1111-1111, CVV: 123',
          'Expected Result': '1. Checkout page loads\n2. Payment method selected\n3. Details accepted\n4. Payment processed successfully',
          'Status': 'ACTIVE',
          'Defect ID': 'DEF-PAYMENT-001, BUG-456, DEF-LOGIN-123',
        },
        {
          description: 'Both Test Steps and Expected Result without numbers (4 steps) - Custom format defect IDs',
          'Test Case Title': 'Verify login page loads correctly',
          'Module / Feature': 'Login',
          'Priority': 'MEDIUM',
          'Test Steps': 'Navigate to login page\nVerify login form displays\nCheck remember me checkbox\nValidate password field is masked',
          'Expected Result': 'Login page displays\nLogin form is visible\nRemember me option is available\nPassword input shows dots or asterisks',
          'Status': 'ACTIVE',
          'Defect ID': 'BUG-123, DEF-UI-456',
        },
        {
          description: 'Single Expected Result applies to all steps (3 steps)',
          'Test Case Title': 'Verify user can logout',
          'Module / Feature': 'Login',
          'Priority': 'HIGH',
          'Test Steps': 'Click logout button\nConfirm logout action\nVerify redirect to login page',
          'Expected Result': 'User successfully logs out',
          'Status': 'ACTIVE',
        },
        {
          description: 'Only Expected Result (no Test Steps) - steps created from Expected Result (4 steps)',
          'Test Case Title': 'Verify error message on invalid login',
          'Module / Feature': 'Login',
          'Priority': 'MEDIUM',
          'Test Steps': '',
          'Expected Result': 'Invalid credentials error message\nUser remains on login page\nAccount is not locked\nError message disappears after 5 seconds',
          'Status': 'ACTIVE',
        },
        {
          description: 'Only Test Steps (no Expected Result) - steps with actions only (5 steps)',
          'Test Case Title': 'Verify password reset functionality',
          'Module / Feature': 'Login',
          'Priority': 'HIGH',
          'Test Steps': 'Click forgot password link\nEnter email address\nSubmit reset request\nCheck email for reset link\nClick reset link and set new password',
          'Expected Result': '',
          'Status': 'ACTIVE',
        },
        {
          description: 'Test case with new enhanced fields (Assertion-ID, RTC-ID, Flow-ID, Layer, 対象, 操作手順, 期待値, 根拠, 備考, 自動化, 環境) - No Test Case Title, using 操作手順 as title',
          'Assertion-ID': 'AST-RTC-SM-001-01',
          'RTC-ID': 'RTC-SM-001',
          'Flow-ID': 'SM-001',
          'Layer': 'Smoke',
          '対象（API/画面）': 'POST /signup/sms',
          '操作手順': 'POST /signup/sms を実行する',
          '期待値': 'レスポンスが ok=true を返し、expires_at（24時間後）が含まれる',
          '根拠（ドキュメント）': 'docs/20_backend_services/phone_auth_implementation_spec.md',
          '備考': 'UI/画面名は不明',
          '自動化': '',
          '環境（iOS / Android / Web）': '',
          'Priority': 'HIGH',
          'Status': 'ACTIVE',
        },
        {
          description: 'Test case with screen/flow target type',
          'Assertion-ID': 'AST-RTC-SM-001-04',
          'RTC-ID': 'RTC-SM-001',
          'Flow-ID': 'SM-001',
          'Layer': 'Smoke',
          '対象（API/画面）': 'フロー（新規登録→ログイン）',
          '操作手順': '新規登録からログインまでの一連の操作を完了する',
          '期待値': '登録後にログイン状態となり、トークンを取得できる',
          '根拠（ドキュメント）': 'docs/20_backend_services/phone_auth_implementation_spec.md',
          '備考': 'UI/画面名は不明',
          '自動化': '',
          '環境（iOS / Android / Web）': '',
        },
        {
          description: 'Test case with multiple platforms',
          'Assertion-ID': 'AST-RTC-SM-003-01',
          'RTC-ID': 'RTC-SM-003',
          'Flow-ID': 'SM-003',
          'Layer': 'Smoke',
          '対象（API/画面）': 'POST /me/oripa_lotteries/:id/withdraw',
          '操作手順': 'times=1 を指定して POST /me/oripa_lotteries/:id/withdraw を実行する',
          '期待値': 'レスポンスに cards が含まれる',
          '根拠（ドキュメント）': 'docs/20_backend_services/api_documents/oripa_withdraw_api_spec.md',
          '備考': 'オリパ選択UIは不明',
          '自動化': '',
          '環境（iOS / Android / Web）': 'iOS / Android / Web',
        },
      ],
    };

    return {
      data: template,
    };
  }

  /**
   * Get import template for defects
   */
  getDefectImportTemplate() {
    const template = {
      columns: [
        { name: 'Defect ID', required: false, description: 'Unique identifier - can be any value (e.g., DEF-1, BUG-123, na, ISSUE-001, any-text). If not provided, will be auto-generated in DEF-1, DEF-2 format. Will be matched with test cases that reference this ID (case-sensitive).' },
        { name: 'Defect Title / Summary', required: true, description: 'Short, precise problem statement' },
        { name: 'Description', required: false, description: 'Detailed explanation of the issue' },
        { name: 'Severity', required: false, description: 'Blocker / Critical / Major / Minor / Trivial' },
        { name: 'Priority', required: false, description: 'CRITICAL / HIGH / MEDIUM / LOW' },
        { name: 'Status', required: false, description: 'New / Open / Fixed / Retest / Closed' },
        { name: 'Environment', required: false, description: 'QA / Staging / Prod' },
        { name: 'Reported By', required: false, description: 'Tester name or email (must be project member)' },
        { name: 'Reported Date', required: false, description: 'Date when defect was reported (YYYY-MM-DD format)' },
        { name: 'Assigned To', required: false, description: 'Name or email of Developer/Tester (must be project member). Leave empty if unassigned' },
        { name: 'Due Date', required: false, description: 'Due date (YYYY-MM-DD format)' },
      ],
      example: {
        'Defect ID': 'DEF-1',
        'Defect Title / Summary': 'Authentication button unresponsive on mobile devices',
        'Description': 'The primary authentication button fails to respond to touch events on mobile devices running iOS 15+ and Android 12+. Users are unable to complete the login process, resulting in blocked access to the application.',
        'Severity': 'CRITICAL',
        'Priority': 'HIGH',
        'Status': 'NEW',
        'Environment': 'PROD',
        'Reported By': 'john.tester@company.com',
        'Reported Date': '2025-01-15',
        'Assigned To': 'senior.developer@company.com',
        'Due Date': '2025-12-31',
      },
      examples: [
        {
          description: 'Defect with provided ID (standard format)',
          'Defect ID': 'DEF-1',
          'Defect Title / Summary': 'Authentication button unresponsive on mobile devices',
          'Description': 'The primary authentication button fails to respond to touch events on mobile devices running iOS 15+ and Android 12+. Users are unable to complete the login process, resulting in blocked access to the application.',
          'Severity': 'CRITICAL',
          'Priority': 'HIGH',
          'Status': 'NEW',
          'Environment': 'PROD',
          'Reported By': 'john.tester@company.com',
          'Reported Date': '2025-01-15',
          'Assigned To': 'senior.developer@company.com',
          'Due Date': '2025-12-31',
        },
        {
          description: 'Defect with custom format ID',
          'Defect ID': 'DEF-LOGIN-001',
          'Defect Title / Summary': 'Password field accepts invalid characters',
          'Description': 'Password input field allows special characters that should be restricted according to security requirements.',
          'Severity': 'MAJOR',
          'Priority': 'MEDIUM',
          'Status': 'OPEN',
          'Environment': 'QA',
          'Reported By': 'qa.tester@company.com',
          'Reported Date': '2025-01-16',
          'Assigned To': 'developer@company.com',
          'Due Date': '2025-02-01',
        },
        {
          description: 'Defect without ID (will be auto-generated)',
          'Defect ID': '',
          'Defect Title / Summary': 'Dashboard loading timeout error',
          'Description': 'Dashboard page takes more than 30 seconds to load on first access, causing timeout errors.',
          'Severity': 'MAJOR',
          'Priority': 'HIGH',
          'Status': 'NEW',
          'Environment': 'STAGING',
          'Reported By': 'tester@company.com',
          'Reported Date': '2025-01-17',
          'Assigned To': 'backend.developer@company.com',
          'Due Date': '',
        },
        {
          description: 'Defect with minimal required fields only',
          'Defect ID': 'BUG-123',
          'Defect Title / Summary': 'User profile image not displaying',
          'Description': '',
          'Severity': 'MINOR',
          'Priority': 'LOW',
          'Status': 'NEW',
          'Environment': '',
          'Reported By': '',
          'Reported Date': '',
          'Assigned To': '',
          'Due Date': '',
        },
        {
          description: 'Defect with unassigned status',
          'Defect ID': '',
          'Defect Title / Summary': 'API endpoint returns 500 error',
          'Description': 'GET /api/users endpoint returns 500 Internal Server Error when querying with specific filters.',
          'Severity': 'CRITICAL',
          'Priority': 'HIGH',
          'Status': 'NEW',
          'Environment': 'PROD',
          'Reported By': 'monitoring@company.com',
          'Reported Date': '2025-01-18',
          'Assigned To': '',
          'Due Date': '2025-01-25',
        },
      ],
    };

    return {
      data: template,
    };
  }
}

export const migrationController = new MigrationController();

