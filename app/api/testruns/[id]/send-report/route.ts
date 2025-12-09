import { testRunController } from '@/backend/controllers/testrun/controller';
import { hasPermission } from '@/lib/rbac';

/**
 * POST /api/testruns/[id]/send-report
 * Send test run report via email to admin, project managers, and defect assignees
 * Required permission: testruns:read
 */
export const POST = hasPermission(
  async (request, context) => {
    const { id } = await context!.params;
    return testRunController.sendTestRunReport(id, request.userInfo.id);
  },
  'testruns',
  'read'
);
