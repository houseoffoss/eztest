import { defectController } from '@/backend/controllers/defect/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';

export const POST = hasPermission(
  async (request) => {
    const body = await request.json();
    return defectController.bulkUpdateStatus(request, body);
  },
  'defects',
  'update'
);
