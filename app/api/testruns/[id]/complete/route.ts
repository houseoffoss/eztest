import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';
import { testRunController } from '@/backend/controllers/testrun/controller';

/**
 * POST /api/testruns/[id]/complete
 * Complete a test run
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

  return testRunController.completeTestRun(
    id,
    auth.session.user.id,
    auth.session.user.role
  );
}
