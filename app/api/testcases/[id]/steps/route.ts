import { testCaseController } from '@/backend/controllers/testcase/controller';
import { authenticateRequest } from '@/lib/auth-middleware';
import { NextRequest } from 'next/server';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const testCaseId = (await params).id;
  const auth = await authenticateRequest();

  if (auth.error) {
    return auth.error;
  }

  return testCaseController.updateTestSteps(
    testCaseId,
    req,
    auth.session.user.id,
    auth.session.user.role
  );
}
