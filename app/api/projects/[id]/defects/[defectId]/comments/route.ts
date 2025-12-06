import { defectController } from '@/backend/controllers/defect/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';

export const GET = hasPermission(
  async (request, context) => {
    const { defectId } = await context.params;
    return defectController.getDefectComments(request, defectId);
  },
  'defects',
  'read'
);

export const POST = hasPermission(
  async (request, context) => {
    const { defectId } = await context.params;
    const body = await request.json();
    return defectController.addDefectComment(request, defectId, body);
  },
  'defects',
  'read'
);
