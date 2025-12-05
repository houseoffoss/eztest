import { defectController } from '@/backend/controllers/defect/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';

export const GET = hasPermission(
  async (request, context) => {
    const { id: projectId } = await context.params;
    const searchParams = request.nextUrl.searchParams;
    const queryParams = {
      severity: searchParams.get('severity') || undefined,
      priority: searchParams.get('priority') || undefined,
      status: searchParams.get('status') || undefined,
      assignedToId: searchParams.get('assignedToId') || undefined,
      search: searchParams.get('search') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
    };
    return defectController.getProjectDefects(request, projectId, queryParams);
  },
  'defects',
  'read'
);

export const POST = hasPermission(
  async (request, context) => {
    const { id: projectId } = await context.params;
    const body = await request.json();
    return defectController.createDefect(request, projectId, body);
  },
  'defects',
  'create'
);
