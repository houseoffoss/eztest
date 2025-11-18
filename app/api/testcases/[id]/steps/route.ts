import { testCaseController } from '@/backend/controllers/testcase/controller';
import { baseInterceptor } from '@/backend/utils/baseInterceptor';
import { CustomRequest } from '@/backend/utils/interceptor';
import { hasPermission } from '@/lib/rbac/hasPermission';
import { NextRequest } from 'next/server';

export const PUT = hasPermission(
  baseInterceptor(async (request: NextRequest, context: { params: { id: string } }) => {
    const testCaseId = context.params.id;
    return testCaseController.updateTestSteps(request as CustomRequest, testCaseId);
  }),
  'testcases',
  'update'
);
