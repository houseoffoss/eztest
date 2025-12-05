import { defectController } from '@/backend/controllers/defect/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';

export const GET = hasPermission(
  async (request, context) => {
    const { defectId } = await context.params;
    return defectController.getDefectById(request, defectId);
  },
  'defects',
  'read'
);

export const PUT = hasPermission(
  async (request, context) => {
    const { defectId } = await context.params;
    const body = await request.json();
    return defectController.updateDefect(request, defectId, body);
  },
  'defects',
  'update'
);

export const DELETE = hasPermission(
  async (request, context) => {
    const { defectId } = await context.params;
    return defectController.deleteDefect(request, defectId);
  },
  'defects',
  'delete'
);
