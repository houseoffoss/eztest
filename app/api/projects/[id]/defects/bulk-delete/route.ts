import { defectController } from '@/backend/controllers/defect/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';

/**
 * POST /api/projects/[id]/defects/bulk-delete
 * Bulk delete defects
 * Required permission: defects:delete
 */
export const POST = hasPermission(
  async (request) => {
    const body = await request.json();
    return defectController.bulkDeleteDefects(request, body);
  },
  'defects',
  'delete'
);

