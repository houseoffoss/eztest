import { importService, ImportType } from '@/backend/services/migration/import/services';
import { parseFile, validateRequiredFields } from '@/lib/file-parser';
import { CustomRequest } from '@/backend/utils/interceptor';
import { ValidationException } from '@/backend/utils/exceptions';

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

      // Validate required fields
      const requiredFields = ['title'];
      const validationErrors = validateRequiredFields(
        parseResult.data,
        requiredFields
      );

      if (validationErrors.length > 0) {
        throw new ValidationException('Missing required fields', validationErrors);
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
        { name: 'Title', required: true, description: 'Test case title' },
        { name: 'Description', required: false, description: 'Test case description' },
        { name: 'Expected Result', required: false, description: 'Expected result' },
        { name: 'Priority', required: false, description: 'Priority (e.g., HIGH, MEDIUM, LOW)' },
        { name: 'Status', required: false, description: 'Status (e.g., ACTIVE, INACTIVE, DRAFT)' },
        { name: 'Estimated Time (minutes)', required: false, description: 'Estimated time in minutes' },
        { name: 'Preconditions', required: false, description: 'Preconditions' },
        { name: 'Postconditions', required: false, description: 'Postconditions' },
        { name: 'Module', required: false, description: 'Module name (will be created if not exists)' },
        { name: 'Test Suites', required: false, description: 'Test suite name (will be created if not exists)' },
      ],
      example: {
        'Title': 'Verify user authentication with valid credentials',
        'Description': 'Validate that a registered user can successfully authenticate using correct username and password combination',
        'Expected Result': 'User successfully authenticates and is redirected to the dashboard page with appropriate session established',
        'Priority': 'HIGH',
        'Status': 'ACTIVE',
        'Estimated Time (minutes)': '15',
        'Preconditions': 'User account must be registered in the system with valid credentials',
        'Postconditions': 'User session is active and audit log records the successful login event',
        'Module': 'Authentication',
        'Test Suites': 'User Authentication Tests',
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
        { name: 'Title', required: true, description: 'Defect title' },
        { name: 'Description', required: false, description: 'Defect description' },
        { name: 'Severity', required: false, description: 'Severity (e.g., CRITICAL, HIGH, MEDIUM, LOW)' },
        { name: 'Priority', required: false, description: 'Priority (e.g., HIGH, MEDIUM, LOW)' },
        { name: 'Status', required: false, description: 'Status (e.g., NEW, IN_PROGRESS, RESOLVED, CLOSED)' },
        { name: 'Assigned To', required: false, description: 'Assignee email address (must be project member)' },
        { name: 'Environment', required: false, description: 'Environment (e.g., PRODUCTION, STAGING, QA)' },
        { name: 'Due Date', required: false, description: 'Due date (YYYY-MM-DD format)' },
        { name: 'Linked Test Cases', required: false, description: 'Test case title to link (e.g., "Login with valid credentials")' },
      ],
      example: {
        'Title': 'Authentication button unresponsive on mobile devices',
        'Description': 'The primary authentication button fails to respond to touch events on mobile devices running iOS 15+ and Android 12+. Users are unable to complete the login process, resulting in blocked access to the application.',
        'Severity': 'CRITICAL',
        'Priority': 'HIGH',
        'Status': 'NEW',
        'Assigned To': 'senior.developer@company.com',
        'Environment': 'PRODUCTION',
        'Due Date': '2025-12-31',
        'Linked Test Cases': 'Verify user authentication with valid credentials',
      },
    };

    return {
      data: template,
    };
  }
}

export const migrationController = new MigrationController();

