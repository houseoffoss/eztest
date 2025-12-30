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
        { name: 'Test Case ID', required: false, description: 'Unique identifier (e.g., TC-1, TC-2). If not provided, will be auto-generated in TC-1, TC-2 format' },
        { name: 'Test Case Title', required: true, description: 'Short, clear description of the test case' },
        { name: 'Module / Feature', required: false, description: 'Application area (Login, Payments, IoT Device, etc.). Will be created if not exists' },
        { name: 'Priority', required: false, description: 'Priority level: High / Medium / Low' },
        { name: 'Preconditions', required: false, description: 'Conditions required before test execution' },
        { name: 'Test Steps', required: false, description: 'Step-by-step actions in JSON array format: [{"stepNumber":1,"action":"...","expectedResult":"..."}]. Note: In CSV files, wrap this field in double quotes to prevent splitting across columns.' },
        { name: 'Test Data', required: false, description: 'Input values or test data to be used' },
        { name: 'Expected Result', required: false, description: 'Expected system behavior or outcome' },
        { name: 'Status', required: false, description: 'Test case status: Active / Draft / Deprecated (execution statuses like Pass/Fail are for test results, not test cases)' },
        { name: 'Defect ID', required: false, description: 'Bug reference if failed. Can specify multiple defects separated by comma or semicolon (e.g., DEF-1, DEF-2). IMPORTANT: All defect IDs must already exist in the target project. If any defect ID is not found, the test case will be skipped with an error. Leave empty if no defects to link.' },
        // Older fields (kept for backward compatibility)
        { name: 'Description', required: false, description: 'Detailed test case description (older field)' },
        { name: 'Estimated Time (minutes)', required: false, description: 'Estimated time in minutes (older field)' },
        { name: 'Postconditions', required: false, description: 'Postconditions (older field)' },
        { name: 'Test Suites', required: false, description: 'Test suite name (will be created if not exists) (older field)' },
      ],
      example: {
        'Test Case ID': 'TC-1',
        'Test Case Title': 'Verify user authentication with valid credentials',
        'Module / Feature': 'Login',
        'Priority': 'HIGH',
        'Preconditions': 'User account must be registered in the system with valid credentials',
        'Test Steps': '[{"stepNumber":1,"action":"Navigate to login page","expectedResult":"Login page displays"},{"stepNumber":2,"action":"Enter valid email and password","expectedResult":"Credentials accepted"},{"stepNumber":3,"action":"Click Login button","expectedResult":"User redirected to dashboard"}]',
        'Test Data': 'Email: user@example.com, Password: Test123!',
        'Expected Result': 'User successfully authenticates and is redirected to the dashboard page',
        'Status': 'ACTIVE',
        'Defect ID': 'DEF-1, DEF-2',
      },
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
        { name: 'Defect Title / Summary', required: true, description: 'Short, precise problem statement' },
        { name: 'Description', required: false, description: 'Detailed explanation of the issue' },
        { name: 'Severity', required: false, description: 'Blocker / Critical / Major / Minor / Trivial' },
        { name: 'Priority', required: false, description: 'CRITICAL / HIGH / MEDIUM / LOW' },
        { name: 'Status', required: false, description: 'New / Open / Fixed / Retest / Closed' },
        { name: 'Environment', required: false, description: 'QA / Staging / Prod' },
        { name: 'Reported By', required: false, description: 'Tester name or email (must be project member)' },
        { name: 'Reported Date', required: false, description: 'Date when defect was reported (YYYY-MM-DD format)' },
        { name: 'Assigned To', required: true, description: 'Name or email of Developer/Tester (must be project member)' },
        { name: 'Due Date', required: false, description: 'Due date (YYYY-MM-DD format)' },
      ],
      example: {
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
    };

    return {
      data: template,
    };
  }
}

export const migrationController = new MigrationController();

