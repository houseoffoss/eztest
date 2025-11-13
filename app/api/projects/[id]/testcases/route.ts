import { testCaseController } from '@/backend/controllers/testcase/controller';
import { authenticateRequest } from '@/lib/auth-middleware';
import { NextRequest } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const projectId = (await params).id;
  const auth = await authenticateRequest();

  if (auth.error) {
    return auth.error;
  }

  return testCaseController.getProjectTestCases(
    req,
    projectId
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const projectId = (await params).id;
  const auth = await authenticateRequest();

  if (auth.error) {
    return auth.error;
  }

  return testCaseController.createTestCase(
    req,
    projectId,
    auth.session.user.id
  );
}
