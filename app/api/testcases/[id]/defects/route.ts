import { testCaseController } from '@/backend/controllers/testcase/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';

/**
 * GET /api/testcases/[id]/defects
 * Get defects linked to a test case
 */
export const GET = hasPermission(
  async (request, context) => {
    const { id } = await context.params;
    return testCaseController.getTestCaseDefects(request, id);
  },
  'testcases',
  'read'
);

/**
 * POST /api/testcases/[id]/defects
 * Link defects to a test case
 */
export const POST = hasPermission(
  async (request, context) => {
    const { id } = await context.params;
    const body = await request.json();
    return testCaseController.linkDefectsToTestCase(request, id, body);
  },
  'defects',
  'update'
);
