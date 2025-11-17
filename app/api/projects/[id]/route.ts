import { getSessionUser } from '@/lib/auth/getSessionUser';
import { hasPermission } from '@/lib/rbac/hasPermission';
import { projectController } from '@/backend/controllers/project/controller';
import { baseInterceptor } from '@/backend/utils/baseInterceptor';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/projects/[id]
 * Get project details with optional stats
 * Required permission: projects:read
 */
export const GET = baseInterceptor(async (request: NextRequest, context: { params: { id: string } }) => {
  const user = await getSessionUser();
  
  if (!hasPermission(user, 'projects:read')) {
    return NextResponse.json(
      { error: 'Forbidden: Missing projects:read permission' },
      { status: 403 }
    );
  }
  
  const { id } = context.params;
  const { searchParams } = new URL(request.url);
  const includeStats = searchParams.get('stats') === 'true';
  
  const customRequest = Object.assign(request, {
    scopeInfo: { access: true, scope_name: 'all' },
    userInfo: {
      id: user!.id,
      email: user!.email,
      name: user!.name,
      role: user!.role.name,
    },
  });
  
  return projectController.getProject(customRequest, id, includeStats);
});

/**
 * PUT /api/projects/[id]
 * Update project information
 * Required permission: projects:update
 */
export const PUT = baseInterceptor(async (request: NextRequest, context: { params: { id: string } }) => {
  const user = await getSessionUser();
  
  if (!hasPermission(user, 'projects:update')) {
    return NextResponse.json(
      { error: 'Forbidden: Missing projects:update permission' },
      { status: 403 }
    );
  }
  
  const { id } = context.params;
  
  const customRequest = Object.assign(request, {
    scopeInfo: { access: true, scope_name: 'all' },
    userInfo: {
      id: user!.id,
      email: user!.email,
      name: user!.name,
      role: user!.role.name,
    },
  });
  
  return projectController.updateProject(customRequest, id);
});

/**
 * DELETE /api/projects/[id]
 * Delete a project
 * Required permission: projects:delete
 */
export const DELETE = baseInterceptor(async (request: NextRequest, context: { params: { id: string } }) => {
  const user = await getSessionUser();
  
  if (!hasPermission(user, 'projects:delete')) {
    return NextResponse.json(
      { error: 'Forbidden: Missing projects:delete permission' },
      { status: 403 }
    );
  }
  
  const { id } = context.params;
  
  const customRequest = Object.assign(request, {
    scopeInfo: { access: true, scope_name: 'all' },
    userInfo: {
      id: user!.id,
      email: user!.email,
      name: user!.name,
      role: user!.role.name,
    },
  });
  
  return projectController.deleteProject(customRequest, id);
});
