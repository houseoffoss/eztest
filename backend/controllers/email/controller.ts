import { emailService } from '@/backend/services/email/services';
import { CustomRequest } from '@/backend/utils/interceptor';
import { EmailMessages } from '@/backend/constants/static_messages';

export class EmailController {
  /**
   * GET /api/email/status - Check email service availability
   * Public endpoint - no authentication required
   */
  async getEmailServiceStatus() {
    const isAvailable = await emailService.isEmailServiceAvailable();

    return {
      data: {
        available: isAvailable,
        message: isAvailable
          ? EmailMessages.EmailServiceConfigured
          : EmailMessages.EmailServiceNotConfigured,
      },
    };
  }

  /**
   * POST /api/defects/[defectId]/send-assignment-email - Send defect assignment notification
   * Permission already checked by route wrapper
   */
  async sendDefectAssignmentEmail(
    request: CustomRequest,
    defectId: string,
    body: unknown
  ) {
    const { assigneeId } = body as { assigneeId?: string };

    // Get app URL from environment
    const appUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || 'http://localhost:3000';

    // Delegate to service to handle all data fetching and email sending
    await emailService.sendDefectAssignmentEmail({
      defectId,
      assigneeId,
      assignedByUserId: request.userInfo.id,
      appUrl,
    });

    return {
      data: {
        message: EmailMessages.EmailSentSuccessfully,
        success: true,
      },
    };
  }

  /**
   * POST /api/testruns/[id]/send-report-email - Send test run report email
   * Permission already checked by route wrapper
   */
  async sendTestRunReportEmail(
    request: CustomRequest,
    testRunId: string,
    body: unknown
  ) {
    const { recipientId } = body as { recipientId?: string };

    // Get app URL from environment
    const appUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || 'http://localhost:3000';

    // Delegate to service to handle all data fetching and email sending
    await emailService.sendTestRunReportEmail({
      testRunId,
      recipientId,
      startedByUserId: request.userInfo.id,
      appUrl,
    });

    return {
      data: {
        message: EmailMessages.EmailSentSuccessfully,
        success: true,
      },
    };
  }
}

export const emailController = new EmailController();
