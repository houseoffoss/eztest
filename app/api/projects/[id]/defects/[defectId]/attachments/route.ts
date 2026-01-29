import { defectController } from '@/backend/controllers/defect/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';

/**
 * GET /api/projects/[id]/defects/[defectId]/attachments
 * Get all attachments for a defect
 */
export const GET = hasPermission(
  async (request, context) => {
    const { defectId } = await context.params;
    return defectController.getDefectAttachments(request, defectId);
  },
  'defects',
  'read'
);

/**
 * POST /api/projects/[id]/defects/[defectId]/attachments
 * Add attachment to defect
 */
export const POST = hasPermission(
  async (request, context) => {
    const { defectId } = await context.params;
    return defectController.associateAttachments(request, defectId);
  },
  'defects',
  'update'
);

/**
 * DELETE /api/projects/[id]/defects/[defectId]/attachments
 * Delete an attachment from a defect
 * Required permission: defects:update
 */
export const DELETE = hasPermission(
  async (request, context) => {
    const { defectId } = await context.params;
    // Get attachmentId from query params
    const url = new URL(request.url);
    const attachmentId = url.searchParams.get('attachmentId');
    return defectController.deleteAttachment(request, defectId, attachmentId);
  },
  'defects',
  'update'
);

