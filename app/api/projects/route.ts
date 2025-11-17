import { getSessionUser } from '@/lib/auth/getSessionUser';
import { hasPermission } from '@/lib/rbac/hasPermission';
import { projectController } from '@/backend/controllers/project/controller';
import { baseInterceptor } from '@/backend/utils/baseInterceptor';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/projects
 * List all projects accessible to the current user
 * Required permission: projects:read
 */
export const GET = baseInterceptor(async (request: NextRequest) => {
  // Get user with their role and permissions
  const user = await getSessionUser();
  
  // Check permission
  if (!hasPermission(user, 'projects:read')) {
    return NextResponse.json(
      { error: 'Forbidden: Missing projects:read permission' },
      { status: 403 }
    );
  }

  // Determine scope based on role
  const scope = user!.role.name === 'ADMIN' ? 'all' : 'project';

  // Build custom request for controller
  const customRequest = Object.assign(request, {
    scopeInfo: { access: true, scope_name: scope },
    userInfo: {
      id: user!.id,
      email: user!.email,
      name: user!.name,
      role: user!.role.name, // Role name (ADMIN, TESTER, etc.)
    },
  });
  
  return projectController.listProjects(customRequest);
});

/**
 * POST /api/projects
 * Create a new project
 * Required permission: projects:create
 */
export const POST = baseInterceptor(async (request: NextRequest) => {
  // Get user with their role and permissions
  const user = await getSessionUser();
  
  // Check permission
  if (!hasPermission(user, 'projects:create')) {
    return NextResponse.json(
      { error: 'Forbidden: Missing projects:create permission' },
      { status: 403 }
    );
  }

  // Build custom request for controller
  const customRequest = Object.assign(request, {
    scopeInfo: { access: true, scope_name: 'all' },
    userInfo: {
      id: user!.id,
      email: user!.email,
      name: user!.name,
      role: user!.role.name,
    },
  });
  
  return projectController.createProject(customRequest);
});
