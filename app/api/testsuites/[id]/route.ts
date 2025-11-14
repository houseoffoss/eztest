import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';
import { testSuiteController } from '@/backend/controllers/testsuite/controller';

/**
 * GET /api/testsuites/[id]
 * Get a single test suite by ID
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

  return testSuiteController.getTestSuiteById(
    id,
    auth.session.user.id,
    auth.session.user.role
  );
}

/**
 * PATCH /api/testsuites/[id]
 * Update a test suite
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest();

  if (auth.error) {
    return auth.error;
  }

  const { id } = await params;

  return testSuiteController.updateTestSuite(
    request,
    id,
    auth.session.user.id,
    auth.session.user.role
  );
}

/**
 * DELETE /api/testsuites/[id]
 * Delete a test suite
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest();

  if (auth.error) {
    return auth.error;
  }

  const { id } = await params;

  return testSuiteController.deleteTestSuite(
    id,
    auth.session.user.id,
    auth.session.user.role
  );
}
