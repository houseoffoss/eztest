import { automationReportController } from '@/backend/controllers/automation-report/controller';
import { hasPermission } from '@/lib/rbac';

/**
 * POST /api/projects/[id]/automation-report
 * Import automation test report
 * Required permission: testruns:create
 */
export const POST = hasPermission(
  async (request, context) => {
    const { id: projectId } = await context!.params;
    return automationReportController.importAutomationReport(request, projectId);
  },
  'testruns',
  'create'
);

