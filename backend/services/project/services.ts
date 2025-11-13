import { prisma } from '@/lib/prisma';
import { ProjectRole, UserRole } from '@prisma/client';

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
  email?: string; // Email address of the user to add
  role?: ProjectRole; // Optional, defaults to TESTER
}

export class ProjectService {
  /**
   * Get all projects accessible to a user
   * ADMINs see all projects, others see only their projects
   */
  async getAllProjects(userId: string, userRole: UserRole) {
    if (userRole === 'ADMIN') {
      return await prisma.project.findMany({
        where: {
          isDeleted: false, // Only non-deleted projects
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
          _count: {
            select: {
              testCases: true,
              testRuns: true,
              testSuites: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });
    }

    // Non-admins only see projects they're members of
    return await prisma.project.findMany({
      where: {
        isDeleted: false, // Only non-deleted projects
        members: {
          some: {
            userId: userId,
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
        _count: {
          select: {
            testCases: true,
            testRuns: true,
            testSuites: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
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

    // Create project and automatically add creator as OWNER
    return await prisma.project.create({
      data: {
        name: data.name,
        key: data.key.toUpperCase(),
        description: data.description,
        createdById: data.createdById,
        members: {
          create: {
            userId: data.createdById,
            role: 'OWNER',
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
   */
  async getProjectById(projectId: string, includeStats: boolean = false) {
    return await prisma.project.findFirst({
      where: { 
        id: projectId,
        isDeleted: false, // Only non-deleted projects
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
   */
  async deleteProject(projectId: string) {
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
    // Find user by email or userId
    let user;
    
    if (data.email) {
      // Find user by email
      user = await prisma.user.findUnique({
        where: { email: data.email },
      });
      
      if (!user) {
        throw new Error('User with this email not found');
      }
    } else if (data.userId) {
      // Find user by ID (fallback for backward compatibility)
      user = await prisma.user.findUnique({
        where: { id: data.userId },
      });
      
      if (!user) {
        throw new Error('User not found');
      }
    } else {
      throw new Error('Either email or userId is required');
    }

    // Check if member already exists
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: user.id,
        },
      },
    });

    if (existingMember) {
      throw new Error('User is already a member of this project');
    }

    return await prisma.projectMember.create({
      data: {
        projectId,
        userId: user.id,
        role: data.role || 'TESTER', // Default to TESTER if not specified
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
    });
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

    // Prevent removing the last OWNER
    if (member.role === 'OWNER') {
      const ownerCount = await prisma.projectMember.count({
        where: {
          projectId,
          role: 'OWNER',
        },
      });

      if (ownerCount <= 1) {
        throw new Error('Cannot remove the last owner of the project');
      }
    }

    return await prisma.projectMember.delete({
      where: { id: memberId },
    });
  }

  /**
   * Check if user has access to project
   */
  async hasProjectAccess(projectId: string, userId: string, userRole: UserRole): Promise<boolean> {
    // Admins have access to all non-deleted projects
    if (userRole === 'ADMIN') {
      const project = await prisma.project.findFirst({
        where: { 
          id: projectId,
          isDeleted: false,
        },
      });
      return !!project;
    }

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

  /**
   * Get user's role in a project
   */
  async getUserProjectRole(projectId: string, userId: string): Promise<ProjectRole | null> {
    const membership = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId,
        project: {
          isDeleted: false, // Only non-deleted projects
        },
      },
    });

    return membership?.role || null;
  }

  /**
   * Check if user can modify project (OWNER or ADMIN role in project)
   */
  async canModifyProject(projectId: string, userId: string, userRole: UserRole): Promise<boolean> {
    // System admins can modify any project
    if (userRole === 'ADMIN') {
      return true;
    }

    const projectRole = await this.getUserProjectRole(projectId, userId);
    return projectRole === 'OWNER' || projectRole === 'ADMIN';
  }

  /**
   * Check if user can manage members (OWNER or ADMIN role in project)
   */
  async canManageMembers(projectId: string, userId: string, userRole: UserRole): Promise<boolean> {
    return await this.canModifyProject(projectId, userId, userRole);
  }
}

export const projectService = new ProjectService();
