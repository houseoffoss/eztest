import { testCaseController } from '@/backend/controllers/testcase/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';

/**
 * GET /api/projects/[id]/testcases/[tcId]/defects
 * Get defects linked to a test case
 */
export const GET = hasPermission(
  async (request, context) => {
    const { tcId: testCaseId } = await context.params;
    return testCaseController.getTestCaseDefects(request, testCaseId);
  },
  'testcases',
  'read'
);

/**
 * POST /api/projects/[id]/testcases/[tcId]/defects
 * Link defects to a test case
 */
export const POST = hasPermission(
  async (request, context) => {
    const { tcId: testCaseId } = await context.params;
    const body = await request.json();
    return testCaseController.linkDefectsToTestCase(request, testCaseId, body);
  },
  'testcases',
  'update'
);

