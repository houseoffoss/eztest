import { emailController } from '@/backend/controllers/email/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';

/**
 * POST /api/testruns/[id]/send-report-email
 * Send test run report email
 * Required permission: testruns:update
 */
export const POST = hasPermission(
  async (request, context) => {
    const { id } = await context.params;
    const body = await request.json();
    return emailController.sendTestRunReportEmail(request, id, body);
  },
  'testruns',
  'update'
);
