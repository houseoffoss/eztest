import { defectController } from '@/backend/controllers/defect/controller';

/**
 * GET /api/defects/[defectId]
 * Fetch a single defect by ID
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ defectId: string }> }
) {
  const { defectId } = await context.params;
  return defectController.getDefectById(request, defectId);
}

/**
 * PUT /api/defects/[defectId]
 * Update a defect
 */
export async function PUT(
  request: Request,
  context: { params: Promise<{ defectId: string }> }
) {
  const { defectId } = await context.params;
  const body = await request.json();
  return defectController.updateDefect(request, defectId, body);
}

/**
 * DELETE /api/defects/[defectId]
 * Delete a defect (soft delete)
 */
export async function DELETE(
  request: Request,
  context: { params: Promise<{ defectId: string }> }
) {
  const { defectId } = await context.params;
  return defectController.deleteDefect(request, defectId);
}
