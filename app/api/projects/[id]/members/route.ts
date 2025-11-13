import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';
import { projectController } from '@/backend/controllers/project/controller';

/**
 * GET /api/projects/[id]/members
 * Get all members of a project
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest();
  
  if (auth.error) {
    return auth.error;
  }

  const { id } = await params;

  return projectController.getProjectMembers(
    id,
    auth.session.user.id,
    auth.session.user.role
  );
}

/**
 * POST /api/projects/[id]/members
 * Add a member to a project
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest();
  
  if (auth.error) {
    return auth.error;
  }

  const { id } = await params;

  return projectController.addProjectMember(
    request,
    id,
    auth.session.user.id,
    auth.session.user.role
  );
}
