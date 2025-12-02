import { prisma } from '@/lib/prisma';

export class RoleService {
  /**
   * Get all roles with user count
   */
  async getAllRoles() {
    const roles = await prisma.role.findMany({
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return roles;
  }

  /**
   * Get role by ID
   */
  async getRoleById(roleId: string) {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!role) {
      throw new Error('Role not found');
    }

    return role;
  }

  /**
   * Get role by name
   */
  async getRoleByName(name: string) {
    const role = await prisma.role.findUnique({
      where: { name },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!role) {
      throw new Error('Role not found');
    }

    return role;
  }
}

export const roleService = new RoleService();
