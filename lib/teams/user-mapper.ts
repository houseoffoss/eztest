import { prisma } from "@/lib/prisma";

/**
 * Maps Teams user identities (AAD Object ID) to EZTest users
 * Handles user lookup and creation
 */

export interface TeamsUserIdentity {
  aadObjectId?: string;
  email?: string;
  name?: string;
  upn?: string; // User Principal Name
}

/**
 * Map Teams user to EZTest user by email or AAD ID
 * Returns the EZTest user ID if found
 */
export async function mapTeamsUserToEZTestUser(
  teamsUser: TeamsUserIdentity
): Promise<{ userId: string; email: string } | null> {
  try {
    // Try to find user by email (preferred method)
    if (teamsUser.email) {
      const user = await prisma.user.findUnique({
        where: { email: teamsUser.email },
        select: { id: true, email: true },
      });

      if (user) {
        console.log(`✓ Mapped Teams user ${teamsUser.email} to EZTest user ${user.id}`);
        return { userId: user.id, email: user.email };
      }
    }

    // Try UPN as fallback (format: user@company.onmicrosoft.com)
    if (teamsUser.upn) {
      const user = await prisma.user.findUnique({
        where: { email: teamsUser.upn },
        select: { id: true, email: true },
      });

      if (user) {
        console.log(`✓ Mapped Teams user ${teamsUser.upn} to EZTest user ${user.id}`);
        return { userId: user.id, email: user.email };
      }
    }

    console.warn(`⚠️ Could not map Teams user:`, teamsUser);
    return null;
  } catch (error) {
    console.error("Error mapping Teams user to EZTest user:", error);
    return null;
  }
}

/**
 * Check if a user has access to a specific project
 * Based on EZTest RBAC (ProjectMember relationship and permissions)
 */
export async function hasProjectAccess(
  userId: string,
  projectId: string,
  requiredPermission?: string
): Promise<boolean> {
  try {
    // Check if user is a member of the project
    const projectMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
      include: {
        user: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!projectMember) {
      console.log(`✗ User ${userId} is not a member of project ${projectId}`);
      return false;
    }

    // If specific permission required, check it
    if (requiredPermission) {
      const hasPermission = projectMember.user.role.permissions.some(
        (rp) => rp.permission.name === requiredPermission
      );

      if (!hasPermission) {
        console.log(
          `✗ User ${userId} missing permission ${requiredPermission} in project ${projectId}`
        );
        return false;
      }
    }

    console.log(`✓ User ${userId} has access to project ${projectId}`);
    return true;
  } catch (error) {
    console.error(
      `Error checking project access for user ${userId} in project ${projectId}:`,
      error
    );
    return false;
  }
}

/**
 * Get user's role in a specific project
 */
export async function getUserProjectRole(
  userId: string,
  projectId: string
): Promise<{ roleId: string; roleName: string } | null> {
  try {
    const projectMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
      include: {
        user: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!projectMember) {
      return null;
    }

    return {
      roleId: projectMember.user.role.id,
      roleName: projectMember.user.role.name,
    };
  } catch (error) {
    console.error(`Error getting user role for ${userId} in project ${projectId}:`, error);
    return null;
  }
}

/**
 * Check if user is channel admin
 * For now, we check if they are part of Teams channel admin role
 * This would need to be enhanced based on your Teams integration
 */
export async function isChannelAdmin(
  teamId: string,
  channelId: string,
  userId: string
): Promise<boolean> {
  try {
    // TODO: Implement Teams channel admin check
    // This would require storing Teams role information
    // For MVP, we can check if user is admin in the associated project
    
    console.log(`Checking if user ${userId} is admin in channel ${channelId}`);
    return false; // Placeholder
  } catch (error) {
    console.error(`Error checking channel admin status:`, error);
    return false;
  }
}

/**
 * Get user details with project permissions
 */
export async function getUserWithProjectPermissions(userId: string, projectId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
        projects: {
          where: { projectId },
          select: {
            id: true,
            projectId: true,
            userId: true,
          },
        },
      },
    });

    return user;
  } catch (error) {
    console.error(`Error getting user details for ${userId}:`, error);
    return null;
  }
}

