import { testCaseController } from '@/backend/controllers/testcase/controller';
import { getSessionUser } from '@/lib/auth/getSessionUser';
import { checkPermission } from '@/lib/rbac';
import { baseInterceptor } from '@/backend/utils/baseInterceptor';
import { NextRequest, NextResponse } from 'next/server';

export const GET = baseInterceptor(async (request: NextRequest, context: { params: { id: string } }) => {
  const user = await getSessionUser();
  
  if (!checkPermission(user, 'testcases:read')) {
    return NextResponse.json(
      { error: 'Forbidden: Missing testcases:read permission' },
      { status: 403 }
    );
  }
  
  const projectId = context.params.id;
  
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
  
  return testCaseController.getProjectTestCases(customRequest, projectId);
});

export const POST = baseInterceptor(async (request: NextRequest, context: { params: { id: string } }) => {
  const user = await getSessionUser();
  
  if (!checkPermission(user, 'testcases:create')) {
    return NextResponse.json(
      { error: 'Forbidden: Missing testcases:create permission' },
      { status: 403 }
    );
  }
  
  const projectId = context.params.id;
  
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
  
  return testCaseController.createTestCase(customRequest, projectId);
});
