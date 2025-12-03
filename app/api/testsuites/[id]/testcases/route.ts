import { testSuiteController } from '@/backend/controllers/testsuite/controller';
import { hasPermission } from '@/lib/rbac';
import { NextRequest } from 'next/server';

/**
 * POST /api/testsuites/[id]/testcases
 * Add test cases to a test suite (many-to-many)
 * Required permission: testsuites:update
 */
export const POST = hasPermission(
  async (request: NextRequest, context) => {
    const { id: suiteId } = await context.params;
    return testSuiteController.addTestCasesToSuite(request, suiteId);
  },
  'testsuites',
  'update'
);

/**
 * DELETE /api/testsuites/[id]/testcases
 * Remove test cases from a test suite
 * Required permission: testsuites:update
 */
export const DELETE = hasPermission(
  async (request: NextRequest, context) => {
    const { id: suiteId } = await context.params;
    return testSuiteController.removeTestCasesFromSuite(request, suiteId);
  },
  'testsuites',
  'update'
);
