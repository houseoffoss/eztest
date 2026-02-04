import { testCaseController } from '@/backend/controllers/testcase/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';

/**
 * GET /api/projects/[id]/testcases/[tcId]/attachments
 * Get all attachments for a test case
 */
export const GET = hasPermission(
  async (request, context) => {
    const { tcId: testCaseId } = await context.params;
    return testCaseController.getTestCaseAttachments(request, testCaseId);
  },
  'testcases',
  'read'
);

/**
 * POST /api/projects/[id]/testcases/[tcId]/attachments
 * Add attachment to test case
 */
export const POST = hasPermission(
  async (request, context) => {
    const { tcId: testCaseId } = await context.params;
    return testCaseController.associateAttachments(request, testCaseId);
  },
  'testcases',
  'update'
);

