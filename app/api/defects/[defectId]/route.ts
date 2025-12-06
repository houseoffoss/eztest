import { defectController } from '@/backend/controllers/defect/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';

/**
 * GET /api/defects/[defectId]
 * Fetch a single defect by ID
 */
export const GET = hasPermission(
  async (request, context) => {
    const { defectId } = await context.params;
    return defectController.getDefectById(request, defectId);
  },
  'defects',
  'read'
);

/**
 * PUT /api/defects/[defectId]
 * Update a defect
 */
export const PUT = hasPermission(
  async (request, context) => {
    const { defectId } = await context.params;
    const body = await request.json();
    return defectController.updateDefect(request, defectId, body);
  },
  'defects',
  'update'
);

/**
 * DELETE /api/defects/[defectId]
 * Delete a defect (soft delete)
 */
export const DELETE = hasPermission(
  async (request, context) => {
    const { defectId } = await context.params;
    return defectController.deleteDefect(request, defectId);
  },
  'defects',
  'delete'
);
