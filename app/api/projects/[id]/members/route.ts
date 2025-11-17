import { projectController } from '@/backend/controllers/project/controller';
import { baseInterceptor } from '@/backend/utils/baseInterceptor';
import { CustomRequest } from '@/backend/utils/interceptor';
import { hasPermission } from '@/lib/rbac/hasPermission';
import { NextRequest } from 'next/server';

/**
 * GET /api/projects/[id]/members
 * Get all members of a project
 * Required permission: projects:read
 */
export const GET = hasPermission(
  baseInterceptor(async (request: NextRequest, context: { params: { id: string } }) => {
    const { id } = context.params;
    return projectController.getProjectMembers(request as CustomRequest, id);
  }),
  'projects',
  'read'
);

/**
 * POST /api/projects/[id]/members
 * Add a member to a project
 * Required permission: projects:manage_members
 */
export const POST = hasPermission(
  baseInterceptor(async (request: NextRequest, context: { params: { id: string } }) => {
    const { id } = context.params;
    return projectController.addProjectMember(request as CustomRequest, id);
  }),
  'projects',
  'manage_members'
);
