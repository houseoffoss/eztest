import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';
import { testPlanController } from '@/backend/controllers/testplan/controller';

/**
 * POST /api/testplans/[id]/testcases
 * Add test cases to a test plan
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

  return testPlanController.addTestCasesToPlan(
    request,
    id,
    auth.session.user.id,
    auth.session.user.role
  );
}

/**
 * DELETE /api/testplans/[id]/testcases
 * Remove test cases from a test plan
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

  return testPlanController.removeTestCasesFromPlan(
    request,
    id,
    auth.session.user.id,
    auth.session.user.role
  );
}
