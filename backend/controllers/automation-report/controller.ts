import { automationReportService } from '@/backend/services/automation-report/services';
import { automationReportSchema } from '@/backend/validators/automation-report.validator';
import { CustomRequest } from '@/backend/utils/interceptor';
import { ValidationException, InternalServerException } from '@/backend/utils/exceptions';

export class AutomationReportController {
  /**
   * Import automation report
   */
  async importAutomationReport(req: CustomRequest, projectId: string) {
    const body = await req.json();

    // Validate request
    const validationResult = automationReportSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationException(
        'Validation failed',
        validationResult.error.issues
      );
    }

    try {
      const result = await automationReportService.importAutomationReport(
        projectId,
        validationResult.data,
        req.userInfo.id
      );

      return {
        data: result,
        message: `Successfully imported automation report. Processed ${result.processedCount} test result(s).`,
        statusCode: 201,
      };
    } catch (error) {
      throw new InternalServerException('Failed to import automation report');
    }
  }
}

export const automationReportController = new AutomationReportController();

