import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/admin/teams-channels/[channelId]
 * Get a single Teams channel configuration
 * Required: Admin role
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.roleName !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { channelId } = await params;

    const config = await prisma.teamsChannelConfig.findUnique({
      where: { channelId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            key: true,
            description: true,
            createdAt: true,
          },
        },
      },
    });

    if (!config) {
      return Response.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    return Response.json(config);
  } catch (error) {
    console.error('Error fetching Teams channel config:', error);
    return Response.json(
      { error: 'Failed to fetch channel configuration' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/teams-channels/[channelId]
 * Update a Teams channel configuration
 * Required: Admin role
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.roleName !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { channelId } = await params;
    const body = await request.json();
    const { projectId } = body;

    if (!projectId) {
      return Response.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return Response.json({ error: 'Project not found' }, { status: 404 });
    }

    // Update configuration
    const config = await prisma.teamsChannelConfig.update({
      where: { channelId },
      data: {
        projectId,
        updatedAt: new Date(),
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            key: true,
          },
        },
      },
    });

    return Response.json(config);
  } catch (error) {
    console.error('Error updating Teams channel config:', error);
    return Response.json(
      { error: 'Failed to update channel configuration' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/teams-channels/[channelId]
 * Delete a Teams channel configuration
 * Required: Admin role
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.roleName !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { channelId } = await params;

    await prisma.teamsChannelConfig.delete({
      where: { channelId },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting Teams channel config:', error);
    return Response.json(
      { error: 'Failed to delete channel configuration' },
      { status: 500 }
    );
  }
}

