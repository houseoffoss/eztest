import { exportController } from '@/backend/controllers/export/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';
import { CustomRequest } from '@/backend/utils/interceptor';

/**
 * @route GET /api/projects/:id/testcases/export
 * @desc Export test cases to CSV or Excel file
 * @access Private - Project member with read access
 */
export const GET = hasPermission(
  async (req: CustomRequest, context: { params: Promise<{ id: string }> }) => {
    const { id: projectId } = await context.params;
    const searchParams = req.nextUrl?.searchParams || new URL(req.url).searchParams;
    const queryParams = {
      type: 'testcases' as const,
      format: searchParams.get('format') || undefined,
      moduleId: searchParams.get('moduleId') || undefined,
      suiteId: searchParams.get('suiteId') || undefined,
      status: searchParams.get('status') || undefined,
      priority: searchParams.get('priority') || undefined,
    };
    return exportController.exportData(projectId, queryParams);
  },
  'testcases',
  'read'
);

