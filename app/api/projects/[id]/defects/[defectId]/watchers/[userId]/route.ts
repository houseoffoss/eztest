import { defectController } from '@/backend/controllers/defect/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';

export const DELETE = hasPermission(
  async (request, context) => {
    const { defectId, userId } = await context.params;
    return defectController.removeWatcher(request, defectId, userId);
  },
  'defects',
  'update'
);
