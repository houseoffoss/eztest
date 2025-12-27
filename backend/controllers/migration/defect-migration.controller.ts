import { defectMigrationService } from '@/backend/services/migration/defect-migration.service';
import { parseFile, validateRequiredFields } from '@/lib/file-parser';
import { CustomRequest } from '@/backend/utils/interceptor';
import { ValidationException } from '@/backend/utils/exceptions';

export class DefectMigrationController {
  /**
   * Import defects from CSV/Excel file
   */
  async importDefects(req: CustomRequest, projectId: string) {
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

      // Import defects
      const result = await defectMigrationService.importDefects(
        projectId,
        req.userInfo.id,
        parseResult.data
      );

      return {
        message: 'Defects import completed',
        data: result,
      };
    } catch (error) {
      if (error instanceof ValidationException) {
        throw error;
      }
      throw new ValidationException(
        'Failed to import defects',
        error instanceof Error ? [error.message] : ['Unknown error']
      );
    }
  }

  /**
   * Get import template for defects
   */
  async getImportTemplate() {
    const template = {
      columns: [
        { name: 'title', required: true, description: 'Defect title' },
        { name: 'description', required: false, description: 'Defect description' },
        { name: 'severity', required: false, description: 'Severity (e.g., CRITICAL, HIGH, MEDIUM, LOW)' },
        { name: 'priority', required: false, description: 'Priority (e.g., HIGH, MEDIUM, LOW)' },
        { name: 'status', required: false, description: 'Status (e.g., NEW, IN_PROGRESS, RESOLVED, CLOSED)' },
        { name: 'assignedTo', required: false, description: 'Assignee email address (must be project member)' },
        { name: 'environment', required: false, description: 'Environment (e.g., PRODUCTION, STAGING, QA)' },
        { name: 'dueDate', required: false, description: 'Due date (YYYY-MM-DD format)' },
        { name: 'testCase', required: false, description: 'Test case title to link (e.g., "Login with valid credentials")' },
      ],
      example: {
        title: 'Authentication button unresponsive on mobile devices',
        description: 'The primary authentication button fails to respond to touch events on mobile devices running iOS 15+ and Android 12+. Users are unable to complete the login process, resulting in blocked access to the application.',
        severity: 'CRITICAL',
        priority: 'HIGH',
        status: 'NEW',
        assignedTo: 'senior.developer@company.com',
        environment: 'PRODUCTION',
        dueDate: '2025-12-31',
        testCase: 'Verify user authentication with valid credentials',
      },
    };

    return {
      data: template,
    };
  }
}

export const defectMigrationController = new DefectMigrationController();
