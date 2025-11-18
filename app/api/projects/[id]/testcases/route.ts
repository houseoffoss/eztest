import { testCaseController } from '@/backend/controllers/testcase/controller';
import { baseInterceptor } from '@/backend/utils/baseInterceptor';
import { CustomRequest } from '@/backend/utils/interceptor';
import { hasPermission } from '@/lib/rbac/hasPermission';
import { NextRequest } from 'next/server';

export const GET = hasPermission(
  baseInterceptor(async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    const { id: projectId } = await context.params;
    return testCaseController.getProjectTestCases(request as CustomRequest, projectId);
  }),
  'testcases',
  'read'
);

export const POST = hasPermission(
  baseInterceptor(async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    const { id: projectId } = await context.params;
    return testCaseController.createTestCase(request as CustomRequest, projectId);
  }),
  'testcases',
  'create'
);
