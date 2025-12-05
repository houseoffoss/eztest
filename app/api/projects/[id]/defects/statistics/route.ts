import { defectController } from '@/backend/controllers/defect/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';

export const GET = hasPermission(
  async (request, context) => {
    const { id: projectId } = await context.params;
    return defectController.getDefectStatistics(request, projectId);
  },
  'defects',
  'read'
);
