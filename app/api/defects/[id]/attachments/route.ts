import { defectController } from '@/backend/controllers/defect/controller';
import { hasPermission } from '@/lib/rbac';

/**
 * POST /api/defects/[id]/attachments
 * Associate S3 attachments with a defect
 * Required permission: defects:update
 */
export const POST = hasPermission(
  async (request, context) => {
    const { id: defectId } = await context.params;
    return defectController.associateAttachments(request, defectId);
  },
  'defects',
  'update'
);

/**
 * GET /api/defects/[id]/attachments
 * Get all attachments for a defect
 * Required permission: defects:read
 */
export const GET = hasPermission(
  async (request, context) => {
    const { id: defectId } = await context.params;
    return defectController.getDefectAttachments(request, defectId);
  },
  'defects',
  'read'
);

/**
 * DELETE /api/defects/[id]/attachments/:attachmentId
 * Delete an attachment from a defect
 * Required permission: defects:update
 */
export const DELETE = hasPermission(
  async (request, context) => {
    const { id: defectId } = await context.params;
    // Get attachmentId from query params
    const url = new URL(request.url);
    const attachmentId = url.searchParams.get('attachmentId');
    return defectController.deleteAttachment(request, defectId, attachmentId);
  },
  'defects',
  'update'
);
