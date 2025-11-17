import { testCaseController } from '@/backend/controllers/testcase/controller';
import { getSessionUser } from '@/lib/auth/getSessionUser';
import { checkPermission } from '@/lib/rbac';
import { baseInterceptor } from '@/backend/utils/baseInterceptor';
import { NextRequest, NextResponse } from 'next/server';

export const PUT = baseInterceptor(async (request: NextRequest, context: { params: { id: string } }) => {
  const user = await getSessionUser();
  
  if (!checkPermission(user, 'testcases:update')) {
    return NextResponse.json(
      { error: 'Forbidden: Missing testcases:update permission' },
      { status: 403 }
    );
  }
  
  const testCaseId = context.params.id;
  
  // Determine scope based on role
  const scope = user!.role.name === 'ADMIN' ? 'all' : 'project';
  
  const customRequest = Object.assign(request, {
    scopeInfo: { access: true, scope_name: scope },
    userInfo: {
      id: user!.id,
      email: user!.email,
      name: user!.name,
      role: user!.role.name,
    },
  });
  
  return testCaseController.updateTestSteps(customRequest, testCaseId);
});
