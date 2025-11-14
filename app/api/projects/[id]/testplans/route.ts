import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';
import { testPlanController } from '@/backend/controllers/testplan/controller';

/**
 * GET /api/projects/[id]/testplans
 * Get all test plans for a project
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

  return testPlanController.getProjectTestPlans(
    id,
    auth.session.user.id
  );
}

/**
 * POST /api/projects/[id]/testplans
 * Create a new test plan for a project
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

  return testPlanController.createTestPlan(
    request,
    id,
    auth.session.user.id,
    auth.session.user.role
  );
}
