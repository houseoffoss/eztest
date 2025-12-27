import { testCaseMigrationService } from '@/backend/services/migration/testcase-migration.service';
import { parseFile, validateRequiredFields } from '@/lib/file-parser';
import { CustomRequest } from '@/backend/utils/interceptor';
import { ValidationException } from '@/backend/utils/exceptions';

export class TestCaseMigrationController {
  /**
   * Import test cases from CSV/Excel file
   */
  async importTestCases(req: CustomRequest, projectId: string) {
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

      // Import test cases
      const result = await testCaseMigrationService.importTestCases(
        projectId,
        req.userInfo.id,
        parseResult.data
      );

      return {
        message: 'Test cases import completed',
        data: result,
      };
    } catch (error) {
      if (error instanceof ValidationException) {
        throw error;
      }
      throw new ValidationException(
        'Failed to import test cases',
        error instanceof Error ? [error.message] : ['Unknown error']
      );
    }
  }

  /**
   * Get import template for test cases
   */
  async getImportTemplate() {
    const template = {
      columns: [
        { name: 'title', required: true, description: 'Test case title' },
        { name: 'description', required: false, description: 'Test case description' },
        { name: 'expectedResult', required: false, description: 'Expected result' },
        { name: 'priority', required: false, description: 'Priority (e.g., HIGH, MEDIUM, LOW)' },
        { name: 'status', required: false, description: 'Status (e.g., ACTIVE, INACTIVE, DRAFT)' },
        { name: 'estimatedTime', required: false, description: 'Estimated time in minutes' },
        { name: 'preconditions', required: false, description: 'Preconditions' },
        { name: 'postconditions', required: false, description: 'Postconditions' },
        { name: 'module', required: false, description: 'Module name (will be created if not exists)' },
        { name: 'testsuite', required: false, description: 'Test suite name (will be created if not exists)' },
      ],
      example: {
        title: 'Verify user authentication with valid credentials',
        description: 'Validate that a registered user can successfully authenticate using correct username and password combination',
        expectedResult: 'User successfully authenticates and is redirected to the dashboard page with appropriate session established',
        priority: 'HIGH',
        status: 'ACTIVE',
        estimatedTime: '15',
        preconditions: 'User account must be registered in the system with valid credentials',
        postconditions: 'User session is active and audit log records the successful login event',
        module: 'Authentication',
        testsuite: 'User Authentication Tests',
      },
    };

    return {
      data: template,
    };
  }
}

export const testCaseMigrationController = new TestCaseMigrationController();
