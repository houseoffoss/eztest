import { exportController } from '@/backend/controllers/export/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';
import { CustomRequest } from '@/backend/utils/interceptor';

/**
 * @route GET /api/projects/:id/defects/export
 * @desc Export defects to CSV or Excel file
 * @access Private - Project member with read access
 */
export const GET = hasPermission(
  async (req: CustomRequest, context: { params: Promise<{ id: string }> }) => {
    const { id: projectId } = await context.params;
    const searchParams = req.nextUrl?.searchParams || new URL(req.url).searchParams;
    const queryParams = {
      type: 'defects' as const,
      format: searchParams.get('format') || undefined,
      status: searchParams.get('status') || undefined,
      severity: searchParams.get('severity') || undefined,
      priority: searchParams.get('priority') || undefined,
      assignedToId: searchParams.get('assignedToId') || undefined,
      environment: searchParams.get('environment') || undefined,
    };
    return exportController.exportData(projectId, queryParams);
  },
  'defects',
  'read'
);

