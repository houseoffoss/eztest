import { testCaseController } from '@/backend/controllers/testcase/controller';
import { getSessionUser } from '@/lib/auth/getSessionUser';
import { hasPermission } from '@/lib/rbac/hasPermission';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  const user = await getSessionUser();
  const rbacUser = user && user.roleObj ? { id: user.id, email: user.email, name: user.name, role: user.roleObj } : null;
  if (!rbacUser || !hasPermission(rbacUser, 'tc', 'r')) {
    return new Response('Forbidden', { status: 403 });
  }
  const projectId = context.params.id;
  const customRequest = Object.assign(request, {
    scopeInfo: { access: true, scope_name: 'all' },
    userInfo: {
      id: user!.id,
      email: user!.email,
      name: user!.name,
      role: user!.roleEnum,
    },
  });
  return testCaseController.getProjectTestCases(customRequest, projectId);
}

export async function POST(request: NextRequest, context: { params: { id: string } }) {
  const user = await getSessionUser();
  const rbacUser = user && user.roleObj ? { id: user.id, email: user.email, name: user.name, role: user.roleObj } : null;
  if (!rbacUser || !hasPermission(rbacUser, 'tc', 'w')) {
    return new Response('Forbidden', { status: 403 });
  }
  const projectId = context.params.id;
  const customRequest = Object.assign(request, {
    scopeInfo: { access: true, scope_name: 'all' },
    userInfo: {
      id: user!.id,
      email: user!.email,
      name: user!.name,
      role: user!.roleEnum,
    },
  });
  return testCaseController.createTestCase(customRequest, projectId);
}
