import { exportController } from '@/backend/controllers/export/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';
import { CustomRequest } from '@/backend/utils/interceptor';

/**
 * @route GET /api/projects/:id/testruns/export
 * @desc Export test runs to CSV or Excel file
 * @access Private - Project member with read access
 */
export const GET = hasPermission(
  async (req: CustomRequest, context: { params: Promise<{ id: string }> }) => {
    const { id: projectId } = await context.params;
    const searchParams = req.nextUrl?.searchParams || new URL(req.url).searchParams;
    const queryParams = {
      type: 'testruns' as const,
      format: searchParams.get('format') || undefined,
      status: searchParams.get('status') || undefined,
      environment: searchParams.get('environment') || undefined,
      assignedToId: searchParams.get('assignedToId') || undefined,
    };
    return exportController.exportData(projectId, queryParams);
  },
  'testruns',
  'read'
);

