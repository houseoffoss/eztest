import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';
import { projectController } from '@/backend/controllers/project/controller';

/**
 * DELETE /api/projects/[id]/members/[memberId]
 * Remove a member from a project
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  const auth = await authenticateRequest();
  
  if (auth.error) {
    return auth.error;
  }

  const { id, memberId } = await params;

  return projectController.removeProjectMember(
    id,
    memberId,
    auth.session.user.id,
    auth.session.user.role
  );
}
