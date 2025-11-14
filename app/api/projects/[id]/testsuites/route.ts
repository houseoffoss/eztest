import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';
import { testSuiteController } from '@/backend/controllers/testsuite/controller';

/**
 * GET /api/projects/[id]/testsuites
 * Get all test suites for a project
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest();

  if (auth.error) {
    return auth.error;
  }

  const { id } = await params;

  return testSuiteController.getProjectTestSuites(
    id,
    auth.session.user.id
  );
}

/**
 * POST /api/projects/[id]/testsuites
 * Create a new test suite for a project
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest();

  if (auth.error) {
    return auth.error;
  }

  const { id } = await params;

  return testSuiteController.createTestSuite(
    request,
    id,
    auth.session.user.id,
    auth.session.user.role
  );
}
