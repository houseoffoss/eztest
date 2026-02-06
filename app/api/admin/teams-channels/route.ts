import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/admin/teams-channels
 * List all Teams channel configurations
 * Required: Admin role
 */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.roleName !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const configs = await prisma.teamsChannelConfig.findMany({
      include: {
        project: {
          select: {
            id: true,
            name: true,
            key: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return Response.json(configs);
  } catch (error) {
    console.error('Error fetching Teams channel configs:', error);
    return Response.json(
      { error: 'Failed to fetch channel configurations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/teams-channels
 * Create a new Teams channel configuration
 * Required: Admin role
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.roleName !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { teamId, channelId, projectId } = body;

    if (!teamId || !channelId || !projectId) {
      return Response.json(
        { error: 'Missing required fields: teamId, channelId, projectId' },
        { status: 400 }
      );
    }

    // Check if channel already configured
    const existing = await prisma.teamsChannelConfig.findUnique({
      where: { channelId },
    });

    if (existing) {
      return Response.json(
        { error: 'Channel already configured' },
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

    // Create configuration
    const config = await prisma.teamsChannelConfig.create({
      data: {
        teamId,
        channelId,
        projectId,
        configuredBy: session.user.id,
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

    return Response.json(config, { status: 201 });
  } catch (error) {
    console.error('Error creating Teams channel config:', error);
    return Response.json(
      { error: 'Failed to create channel configuration' },
      { status: 500 }
    );
  }
}

