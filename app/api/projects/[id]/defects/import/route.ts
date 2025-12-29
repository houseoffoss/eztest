import { migrationController } from '@/backend/controllers/migration/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';
import { CustomRequest } from '@/backend/utils/interceptor';

/**
 * @route POST /api/projects/:id/defects/import
 * @desc Import defects from CSV or Excel file
 * @access Private - Project member with write access
 */
export const POST = hasPermission(
  async (req: CustomRequest, context: { params: Promise<{ id: string }> }) => {
    const { id: projectId } = await context.params;
    return migrationController.importData(req, projectId, 'defects');
  },
  'defects',
  'create'
);
