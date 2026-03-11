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
      const updateExisting = formData.get('updateExisting') === 'true';

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
          const detailMessage = validationErrors.join(' ');
          throw new ValidationException(detailMessage, validationErrors);
        }
      } else {
        // For defects, use dedicated validator
        const validationErrors = validateDefectImportColumns(parseResult.data);
        if (validationErrors.length > 0) {
          const detailMessage = validationErrors.join(' ');
          throw new ValidationException(detailMessage, validationErrors);
        }
      }

      // Import data
      const result = await importService.importData(
        type,
        projectId,
        req.userInfo.id,
        parseResult.data,
        type === 'testcases' ? { updateExisting } : undefined
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
        { name: 'テストケース名', required: true, description: 'テストケースの短い説明。必須。' },
        { name: 'モジュール・機能', required: false, description: '対象領域（ログイン、決済など）。存在しなければ作成されます。' },
        { name: '優先度', required: false, description: '優先度: High / Medium / Low' },
        { name: '前提条件', required: false, description: 'テスト実行前に必要な条件' },
        { name: 'テスト手順', required: false, description: '手順ごとのアクション。改行または番号（1. 2.）で step に分割。期待結果列に値があれば空可。CSV ではダブルクォートで囲んでください。' },
        { name: 'テストデータ', required: false, description: '入力値やテストデータ' },
        { name: '期待結果', required: false, description: '各手順の期待する結果。改行または番号で手順と対応。テスト手順が空の場合はこの列から手順を作成。' },
        { name: '状態', required: false, description: 'テストケースの状態: Active / Draft / Deprecated' },
        { name: '不具合ID', required: false, description: '不具合参照。複数はカンマまたはセミコロン区切り（例: DEF-1, BUG-123）。未作成のIDも指定可。' },
        // Older fields (kept for backward compatibility)
        { name: '説明', required: false, description: '詳細説明' },
        { name: 'テスト実行時間（秒）', required: false, description: 'テスト実行時間（秒）' },
        { name: '事後条件', required: false, description: '事後条件' },
        { name: 'テストスイート', required: false, description: 'テストスイート名（存在しなければ作成）' },
        // New fields for enhanced test case management (EZ Test UI labels)
        { name: 'RTC-ID', required: false, description: 'RTC-ID: RTC identifier (e.g., RTC-SM-001)' },
        { name: 'Flow-ID', required: false, description: 'Flow-ID: Flow identifier (e.g., SM-001)' },
        { name: 'Layer', required: false, description: 'Layer: Test layer - Smoke / Core / Extended / Unknown (will be converted to uppercase: SMOKE, CORE, EXTENDED, UNKNOWN). Unknown or invalid values will default to UNKNOWN.' },
        { name: 'テスト種別', required: false, description: 'テスト種別: Test type - 正常系 / 異常系 / 非機能 / 回帰 / データ整合性確認 / 状態遷移確認 / 運用確認 / 障害時確認. English values also accepted: NORMAL, ABNORMAL, NON_FUNCTIONAL, REGRESSION, DATA_INTEGRITY, STATE_TRANSITION, OPERATIONAL, FAILURE.' },
        { name: '根拠コード', required: false, description: '根拠コード: Evidence / Code reference (e.g., docs/20_backend_services/phone_auth_implementation_spec.md)' },
        { name: '備考', required: false, description: '備考: Notes / Additional remarks' },
        { name: 'プラットフォーム', required: false, description: 'プラットフォーム: Web / Web(SP) / iOS Native / Android Native（いずれか1つ）' },
        { name: '端末', required: false, description: '端末: Device - iPhone / Android / PC（いずれか1つ）' },
        { name: 'ドメイン', required: false, description: 'ドメイン（自由入力）' },
        { name: '機能', required: false, description: '機能（自由入力）' },
        { name: '実行方式', required: false, description: '実行方式: 手動 / 自動' },
        { name: '自動化状況', required: false, description: '自動化状況: 自動化済 / 自動化対象 / 自動化対象外 / 検討中' },
      ],
      example: {
        'テストケース名': 'Verify user authentication with valid credentials',
        'モジュール・機能': 'Login',
        '優先度': 'HIGH',
        '前提条件': 'User account must be registered in the system with valid credentials',
        'テスト手順': '1. Navigate to login page\n2. Enter valid email and password\n3. Click Login button\n4. Verify dashboard loads\n5. Check user profile is displayed',
        'テストデータ': 'Email: user@example.com, Password: Test123!',
        '期待結果': '1. Login page displays\n2. Credentials accepted\n3. User redirected to dashboard\n4. Dashboard page loads successfully\n5. User profile information is visible',
        '状態': 'ACTIVE',
        '不具合ID': 'DEF-1, DEF-LOGIN-001',
        'プラットフォーム': 'Web',
        '端末': '',
        'ドメイン': '認証',
        '機能': 'ログイン',
        '実行方式': '手動',
        '自動化状況': '',
      },
      examples: [
        {
          description: 'Both Test Steps and Expected Result with numbered format (5 steps) - Mixed defect ID formats',
          'テストケース名': 'Verify user authentication with valid credentials',
          'モジュール・機能': 'Login',
          '優先度': 'HIGH',
          '前提条件': 'User account must be registered in the system with valid credentials',
          'テスト手順': '1. Navigate to login page\n2. Enter valid email and password\n3. Click Login button\n4. Verify dashboard loads\n5. Check user profile is displayed',
          'テストデータ': 'Email: user@example.com, Password: Test123!',
          '期待結果': '1. Login page displays\n2. Credentials accepted\n3. User redirected to dashboard\n4. Dashboard page loads successfully\n5. User profile information is visible',
          '状態': 'ACTIVE',
          '不具合ID': 'DEF-1, DEF-LOGIN-001',
          'プラットフォーム': 'Web',
          '端末': '',
          'ドメイン': '認証',
          '機能': 'ログイン',
          '実行方式': '手動',
          '自動化状況': '',
        },
        {
          description: 'Test case with custom format defect IDs',
          'テストケース名': 'Verify payment processing workflow',
          'モジュール・機能': 'Payments',
          '優先度': 'CRITICAL',
          '前提条件': 'User must have valid payment method registered',
          'テスト手順': '1. Navigate to checkout\n2. Select payment method\n3. Enter payment details\n4. Submit payment',
          'テストデータ': 'Card: 4111-1111-1111-1111, CVV: 123',
          '期待結果': '1. Checkout page loads\n2. Payment method selected\n3. Details accepted\n4. Payment processed successfully',
          '状態': 'ACTIVE',
          '不具合ID': 'DEF-PAYMENT-001, BUG-456, DEF-LOGIN-123',
          'プラットフォーム': 'iOS Native',
          '端末': 'iPhone',
          'ドメイン': '決済',
          '機能': 'Stripe決済',
          '実行方式': '手動',
          '自動化状況': '',
        },
        {
          description: 'Both Test Steps and Expected Result without numbers (4 steps) - Custom format defect IDs',
          'テストケース名': 'Verify login page loads correctly',
          'モジュール・機能': 'Login',
          '優先度': 'MEDIUM',
          'テスト手順': 'Navigate to login page\nVerify login form displays\nCheck remember me checkbox\nValidate password field is masked',
          '期待結果': 'Login page displays\nLogin form is visible\nRemember me option is available\nPassword input shows dots or asterisks',
          '状態': 'ACTIVE',
          '不具合ID': 'BUG-123, DEF-UI-456',
          'プラットフォーム': 'Web',
          '端末': 'PC',
          'ドメイン': '認証',
          '機能': 'ログイン',
          '実行方式': '',
          '自動化状況': '',
        },
        {
          description: 'Single Expected Result applies to all steps (3 steps)',
          'テストケース名': 'Verify user can logout',
          'モジュール・機能': 'Login',
          '優先度': 'HIGH',
          'テスト手順': 'Click logout button\nConfirm logout action\nVerify redirect to login page',
          '期待結果': 'User successfully logs out',
          '状態': 'ACTIVE',
          'プラットフォーム': 'Web',
          '端末': '',
          'ドメイン': '認証',
          '機能': 'ログイン',
          '実行方式': '',
          '自動化状況': '',
        },
        {
          description: 'Only Expected Result (no Test Steps) - steps created from Expected Result (4 steps)',
          'テストケース名': 'Verify error message on invalid login',
          'モジュール・機能': 'Login',
          '優先度': 'MEDIUM',
          'テスト手順': '',
          '期待結果': 'Invalid credentials error message\nUser remains on login page\nAccount is not locked\nError message disappears after 5 seconds',
          '状態': 'ACTIVE',
          '実行方式': '',
          '自動化状況': '',
        },
        {
          description: 'Only Test Steps (no Expected Result) - steps with actions only (5 steps)',
          'テストケース名': 'Verify password reset functionality',
          'モジュール・機能': 'Login',
          '優先度': 'HIGH',
          'テスト手順': 'Click forgot password link\nEnter email address\nSubmit reset request\nCheck email for reset link\nClick reset link and set new password',
          '期待結果': '',
          '状態': 'ACTIVE',
          '実行方式': '',
          '自動化状況': '',
        },
        {
          description: 'Test case with new enhanced fields (RTC-ID, Flow-ID, Layer, 根拠コード, 備考)',
          'テストケース名': 'POST /signup/sms - SMS送信',
          'RTC-ID': 'RTC-SM-001',
          'Flow-ID': 'SM-001',
          'Layer': 'Smoke',
          '根拠コード': 'docs/20_backend_services/phone_auth_implementation_spec.md',
          '備考': 'UI/画面名は不明',
          '優先度': 'HIGH',
          '状態': 'ACTIVE',
          '実行方式': '',
          '自動化状況': '',
        },
        {
          description: 'Test case with screen/flow',
          'テストケース名': 'フロー（新規登録→ログイン）',
          'RTC-ID': 'RTC-SM-001',
          'Flow-ID': 'SM-001',
          'Layer': 'Smoke',
          '根拠コード': 'docs/20_backend_services/phone_auth_implementation_spec.md',
          '備考': 'UI/画面名は不明',
          '優先度': 'HIGH',
          '状態': 'ACTIVE',
          '実行方式': '',
          '自動化状況': '',
        },
        {
          description: 'Test case example 2',
          'テストケース名': 'POST /me/oripa_lotteries/:id/withdraw',
          'RTC-ID': 'RTC-SM-003',
          'Flow-ID': 'SM-003',
          'Layer': 'Smoke',
          '根拠コード': 'docs/20_backend_services/api_documents/oripa_withdraw_api_spec.md',
          '備考': 'オリパ選択UIは不明',
          '優先度': 'HIGH',
          '状態': 'ACTIVE',
          '実行方式': '',
          '自動化状況': '',
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

