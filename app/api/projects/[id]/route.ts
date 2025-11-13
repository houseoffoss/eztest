import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';
import { projectController } from '@/backend/controllers/project/controller';

/**
 * GET /api/projects/[id]
 * Get project details with optional stats
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
  const { searchParams } = new URL(request.url);
  const includeStats = searchParams.get('stats') === 'true';

  return projectController.getProject(
    id,
    auth.session.user.id,
    auth.session.user.role,
    includeStats
  );
}

/**
 * PUT /api/projects/[id]
 * Update project information
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest();
  
  if (auth.error) {
    return auth.error;
  }

  const { id } = await params;

  return projectController.updateProject(
    request,
    id,
    auth.session.user.id,
    auth.session.user.role
  );
}

/**
 * DELETE /api/projects/[id]
 * Delete a project
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest();
  
  if (auth.error) {
    return auth.error;
  }

  const { id } = await params;

  return projectController.deleteProject(
    id,
    auth.session.user.id,
    auth.session.user.role
  );
}
