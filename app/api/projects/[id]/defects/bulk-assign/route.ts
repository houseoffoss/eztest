import { defectController } from '@/backend/controllers/defect/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';

/**
 * POST /api/projects/[id]/defects/bulk-assign
 * Bulk assign defects to a user
 * Required permission: defects:update
 */
export const POST = hasPermission(
  async (request) => {
    const body = await request.json();
    return defectController.bulkAssignDefects(request, body);
  },
  'defects',
  'update'
);

