import { defectController } from '@/backend/controllers/defect/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';

/**
 * POST /api/projects/[id]/defects/bulk-status
 * Bulk update defect status
 * Required permission: defects:update
 */
export const POST = hasPermission(
  async (request) => {
    const body = await request.json();
    return defectController.bulkUpdateStatus(request, body);
  },
  'defects',
  'update'
);

