import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';
import { testRunController } from '@/backend/controllers/testrun/controller';

/**
 * GET /api/testruns/[id]
 * Get a single test run by ID
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

  return testRunController.getTestRunById(
    id,
    auth.session.user.id,
    auth.session.user.role
  );
}

/**
 * PATCH /api/testruns/[id]
 * Update a test run
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

  return testRunController.updateTestRun(
    request,
    id,
    auth.session.user.id,
    auth.session.user.role
  );
}

/**
 * DELETE /api/testruns/[id]
 * Delete a test run
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

  return testRunController.deleteTestRun(
    id,
    auth.session.user.id,
    auth.session.user.role
  );
}
