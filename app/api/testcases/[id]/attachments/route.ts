import { testCaseController } from '@/backend/controllers/testcase/controller';
import { hasPermission } from '@/lib/rbac';

/**
 * POST /api/testcases/[id]/attachments
 * Associate S3 attachments with a test case
 * Required permission: testcases:update
 */
export const POST = hasPermission(
  async (request, context) => {
    const { id: testCaseId } = await context.params;
    return testCaseController.associateAttachments(request, testCaseId);
  },
  'testcases',
  'update'
);

/**
 * GET /api/testcases/[id]/attachments
 * Get all attachments for a test case
 * Required permission: testcases:read
 */
export const GET = hasPermission(
  async (request, context) => {
    const { id: testCaseId } = await context.params;
    return testCaseController.getTestCaseAttachments(request, testCaseId);
  },
  'testcases',
  'read'
);

/**
 * DELETE /api/testcases/[id]/attachments/:attachmentId
 * Delete an attachment from a test case
 * Required permission: testcases:update
 */
export const DELETE = hasPermission(
  async (request, context) => {
    const { id: testCaseId } = await context.params;
    // Get attachmentId from query params
    const url = new URL(request.url);
    const attachmentId = url.searchParams.get('attachmentId');
    return testCaseController.deleteAttachment(request, testCaseId, attachmentId);
  },
  'testcases',
  'update'
);
