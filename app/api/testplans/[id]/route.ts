import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';
import { testPlanController } from '@/backend/controllers/testplan/controller';

/**
 * GET /api/testplans/[id]
 * Get a single test plan by ID
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

  return testPlanController.getTestPlanById(
    id,
    auth.session.user.id,
    auth.session.user.role
  );
}

/**
 * PATCH /api/testplans/[id]
 * Update a test plan
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

  return testPlanController.updateTestPlan(
    request,
    id,
    auth.session.user.id,
    auth.session.user.role
  );
}

/**
 * DELETE /api/testplans/[id]
 * Delete a test plan
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

  return testPlanController.deleteTestPlan(
    id,
    auth.session.user.id,
    auth.session.user.role
  );
}
