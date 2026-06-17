import { prisma } from '@/lib/prisma';

interface CreateProjectInput {
  name: string;
  key: string;
  description?: string;
  createdById: string;
}

interface UpdateProjectInput {
  name?: string;
  description?: string;
}

interface AddMemberInput {
  userId?: string; // Optional, for backward compatibility
  userIds?: string[];
  email?: string; // Email address of the user to add
}

export class ProjectService {
  /**
   * Get all projects accessible to a user
   * Scope-based filtering:
   * - 'all': All projects (admin access)
   * - 'project': Projects user is a member of
   */
  async getAllProjects(userId: string, scope: string) {
    const baseInclude = {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      },
      _count: {
        select: {
          testCases: true,
          testRuns: true,
          testSuites: true,
        },
      },
    };

    // Build where clause based on scope
    let whereClause: Record<string, unknown> = {
      isDeleted: false,
    };

    if (scope === 'project') {
      // Only projects user is a member of
      whereClause = {
        ...whereClause,
        members: {
          some: {
            userId: userId,
          },
        },
      };
    }
    // 'all' scope: no additional filtering (admin access)

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: baseInclude,
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Get defect counts for all projects (non-closed defects only)
    if (projects.length > 0) {
      const projectIds = projects.map(p => p.id);
      const defectCounts = await prisma.defect.groupBy({
        by: ['projectId'],
        where: {
          projectId: { in: projectIds },
          status: { not: 'CLOSED' },
        },
        _count: {
          id: true,
        },
      });

      // Create a map of projectId -> defect count
      const defectCountMap = new Map(
        defectCounts.map(dc => [dc.projectId, dc._count.id])
      );

      // Add defect counts to each project's _count
      return projects.map(project => ({
        ...project,
        _count: {
          ...project._count,
          defects: defectCountMap.get(project.id) || 0,
        },
      }));
    }

    return projects;
  }

  /**
   * Create a new project
   */
  async createProject(data: CreateProjectInput) {
    // Check if project key already exists (including soft-deleted projects)
    const existingProject = await prisma.project.findUnique({
      where: { key: data.key },
    });

    if (existingProject && !existingProject.isDeleted) {
      throw new Error('Project key already exists');
    }

    // If a soft-deleted project with this key exists, we could either:
    // 1. Prevent creating a new one with the same key
    // 2. Update the key to be unique (e.g., append timestamp)
    // For now, we'll prevent it to maintain key uniqueness
    if (existingProject && existingProject.isDeleted) {
      throw new Error('Project key already exists (in deleted projects). Please choose a different key.');
    }

    // Create project and automatically add creator as member
    return await prisma.project.create({
      data: {
        name: data.name,
        key: data.key.toUpperCase(),
        description: data.description,
        createdById: data.createdById,
        members: {
          create: {
            userId: data.createdById,
          },
        },
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Get project by ID with optional stats
   * Scope filtering applied in query
   */
  async getProjectById(projectId: string, userId: string, scope: string, includeStats: boolean = false) {
    // Build where clause based on scope
    let whereClause: Record<string, unknown> = { 
      id: projectId,
      isDeleted: false,
    };

    if (scope === 'project') {
      whereClause = {
        ...whereClause,
        members: {
          some: {
            userId: userId,
          },
        },
      };
    }
    // 'all' scope: no additional filtering

    const project = await prisma.project.findFirst({
      where: whereClause,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true,
              },
            },
          },
          orderBy: {
            joinedAt: 'asc',
          },
        },
        ...(includeStats && {
          _count: {
            select: {
              testCases: true,
              testRuns: true,
              testSuites: true,
              requirements: true,
            },
          },
        }),
      },
    });

    // Add defect count if stats are included
    if (project && includeStats && project._count) {
      const defectCount = await prisma.defect.count({
        where: {
          projectId: project.id,
          status: { not: 'CLOSED' },
        },
      });

      return {
        ...project,
        _count: {
          ...project._count,
          defects: defectCount,
        },
      };
    }

    return project;
  }

  /**
   * Update project information
   */
  async updateProject(projectId: string, data: UpdateProjectInput) {
    // First check if project exists and is not deleted
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        isDeleted: false,
      },
    });

    if (!project) {
      throw new Error('Project not found or has been deleted');
    }

    return await prisma.project.update({
      where: { 
        id: projectId,
      },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Soft delete a project (set isDeleted to true)
   * Scope filtering: only allow deletion if user has appropriate scope
   */
  async deleteProject(projectId: string, userId: string, scope: string) {
    // Build where clause based on scope
    let whereClause: Record<string, unknown> = { 
      id: projectId,
      isDeleted: false,
    };

    if (scope === 'project') {
      // User must be a member to delete (though only ADMIN has this permission)
      whereClause = {
        ...whereClause,
        members: {
          some: {
            userId: userId,
          },
        },
      };
    }
    // 'all' scope: no additional filtering (admin can delete any)

    // Verify project exists and user has access based on scope
    const project = await prisma.project.findFirst({
      where: whereClause,
    });

    if (!project) {
      throw new Error('Project not found or access denied');
    }

    return await prisma.project.update({
      where: { id: projectId },
      data: {
        isDeleted: true,
      },
    });
  }

  /**
   * Get project members
   */
  async getProjectMembers(projectId: string) {
    return await prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
      },
      orderBy: {
        joinedAt: 'asc',
      },
    });
  }

  /**
   * Add member to project
   */
  async addProjectMember(projectId: string, data: AddMemberInput) {
    const candidateUserIds = new Set<string>();

    if (data.userIds && data.userIds.length > 0) {
      data.userIds.forEach((id) => candidateUserIds.add(id));
    }

    if (data.userId) {
      candidateUserIds.add(data.userId);
    }

    if (data.email) {
      const userByEmail = await prisma.user.findUnique({
        where: { email: data.email },
        select: { id: true },
      });

      if (!userByEmail) {
        throw new Error('User with this email not found');
      }

      candidateUserIds.add(userByEmail.id);
    }

    if (candidateUserIds.size === 0) {
      throw new Error('Either email, userId, or userIds is required');
    }

    const userIds = Array.from(candidateUserIds);
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: { id: true },
    });

    if (users.length !== userIds.length) {
      throw new Error('User not found');
    }

    const existingMembers = await prisma.projectMember.findMany({
      where: {
        projectId,
        userId: { in: userIds },
      },
      select: { userId: true },
    });

    if (existingMembers.length > 0) {
      throw new Error('User is already a member of this project');
    }

    const createdMembers = await prisma.$transaction(
      userIds.map((userId) =>
        prisma.projectMember.create({
          data: {
            projectId,
            userId,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true,
              },
            },
          },
        })
      )
    );

    return createdMembers;
  }

  /**
   * Remove member from project
   */
  async removeProjectMember(projectId: string, memberId: string) {
    // Check if member exists
    const member = await prisma.projectMember.findUnique({
      where: { id: memberId },
    });

    if (!member || member.projectId !== projectId) {
      throw new Error('Member not found in this project');
    }

    // Check if this is the project creator
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { createdById: true },
    });

    if (project?.createdById === member.userId) {
      const memberCount = await prisma.projectMember.count({
        where: { projectId },
      });

      if (memberCount <= 1) {
        throw new Error('Cannot remove the project creator when they are the only member');
      }
    }

    // Store userId before deletion for email notification
    const removedUserId = member.userId;

    await prisma.projectMember.delete({
      where: { id: memberId },
    });

    // Return the removed user's ID for email notification
    return { removedUserId };
  }

  /**
   * Check if user is a member of a project
   * Used for internal checks and member management
   */
  async isProjectMember(projectId: string, userId: string): Promise<boolean> {
    const membership = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId,
        project: {
          isDeleted: false, // Only non-deleted projects
        },
      },
    });

    return !!membership;
  }
}

export const projectService = new ProjectService();
