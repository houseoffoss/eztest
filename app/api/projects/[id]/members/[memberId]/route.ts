import { projectController } from '@/backend/controllers/project/controller';
import { baseInterceptor } from '@/backend/utils/baseInterceptor';
import { CustomRequest } from '@/backend/utils/interceptor';
import { hasPermission } from '@/lib/rbac/hasPermission';
import { NextRequest } from 'next/server';

/**
 * DELETE /api/projects/[id]/members/[memberId]
 * Remove a member from a project
 * Required permission: projects:manage_members
 */
export const DELETE = hasPermission(
  baseInterceptor(async (request: NextRequest, context: { params: { id: string, memberId: string } }) => {
    const { id, memberId } = context.params;
    return projectController.removeProjectMember(request as CustomRequest, id, memberId);
  }),
  'projects',
  'manage_members'
);
