import { testSuiteController } from '@/backend/controllers/testsuite/controller';
import { hasPermission } from '@/lib/rbac';

/**
 * GET /api/projects/[id]/testsuites
 * Get all test suites for a project
 * Required permission: testsuites:read
 */
export const GET = hasPermission(
  async (request, context) => {
    const { id } = await context!.params;
    return testSuiteController.getProjectTestSuites(id);
  },
  'testsuites',
  'read'
);

/**
 * POST /api/projects/[id]/testsuites
 * Create a new test suite for a project
 * Required permission: testsuites:create
 */
export const POST = hasPermission(
  async (request, context) => {
    const { id } = await context!.params;
    return testSuiteController.createTestSuite(request, id);
  },
  'testsuites',
  'create'
);
