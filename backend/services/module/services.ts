import { prisma } from '@/lib/prisma';

interface CreateModuleInput {
  projectId: string;
  name: string;
  description?: string;
  order?: number;
}

interface UpdateModuleInput {
  name?: string;
  description?: string;
  order?: number;
}

export class ModuleService {
  /**
   * Get all modules for a project
   */
  async getProjectModules(projectId: string) {
    const modules = await prisma.module.findMany({
      where: { projectId },
      include: {
        _count: {
          select: {
            testCases: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return modules;
  }

  /**
   * Get module by ID
   */
  async getModuleById(moduleId: string, projectId: string) {
    const mod = await prisma.module.findFirst({
      where: {
        id: moduleId,
        projectId,
      },
      include: {
        testCases: {
          select: {
            id: true,
            tcId: true,
            title: true,
            priority: true,
            status: true,
          },
        },
        _count: {
          select: {
            testCases: true,
          },
        },
      },
    });

    if (!mod) {
      throw new Error('Module not found');
    }

    return mod;
  }

  /**
   * Create a new module
   */
  async createModule(data: CreateModuleInput) {
    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
    });

    if (!project || project.isDeleted) {
      throw new Error('Project not found');
    }

    // Check if module name already exists in project
    const existingModule = await prisma.module.findFirst({
      where: {
        projectId: data.projectId,
        name: data.name,
      },
    });

    if (existingModule) {
      throw new Error('Module with this name already exists in the project');
    }

    // Get the next order number
    const lastModule = await prisma.module.findFirst({
      where: { projectId: data.projectId },
      orderBy: { order: 'desc' },
    });

    const nextOrder = (lastModule?.order ?? -1) + 1;

    const mod = await prisma.module.create({
      data: {
        projectId: data.projectId,
        name: data.name,
        description: data.description,
        order: data.order ?? nextOrder,
      },
      include: {
        _count: {
          select: {
            testCases: true,
          },
        },
      },
    });

    return mod;
  }

  /**
   * Update module
   */
  async updateModule(moduleId: string, projectId: string, data: UpdateModuleInput) {
    // Check if module exists
    const existingModule = await prisma.module.findFirst({
      where: {
        id: moduleId,
        projectId,
      },
    });

    if (!existingModule) {
      throw new Error('Module not found');
    }

    // Check if new name already exists in project (if changing name)
    if (data.name && data.name !== existingModule.name) {
      const duplicate = await prisma.module.findFirst({
        where: {
          projectId,
          name: data.name,
        },
      });

      if (duplicate) {
        throw new Error('Module with this name already exists in the project');
      }
    }

    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.order !== undefined) updateData.order = data.order;

    const mod = await prisma.module.update({
      where: { id: moduleId },
      data: updateData,
      include: {
        _count: {
          select: {
            testCases: true,
          },
        },
      },
    });

    return mod;
  }

  /**
   * Delete module
   */
  async deleteModule(moduleId: string, projectId: string) {
    // Check if module exists
    const existingModule = await prisma.module.findFirst({
      where: {
        id: moduleId,
        projectId,
      },
      include: {
        _count: {
          select: {
            testCases: true,
          },
        },
      },
    });

    if (!existingModule) {
      throw new Error('Module not found');
    }

    if (existingModule._count.testCases > 0) {
      throw new Error('Cannot delete module with associated test cases');
    }

    await prisma.module.delete({
      where: { id: moduleId },
    });

    return existingModule;
  }

  /**
   * Reorder modules
   */
  async reorderModules(projectId: string, moduleOrders: Array<{ id: string; order: number }>) {
    // Verify all modules belong to the project
    const modules = await prisma.module.findMany({
      where: { projectId },
    });

    const moduleIds = modules.map((m: { id: string; }) => m.id);

    for (const item of moduleOrders) {
      if (!moduleIds.includes(item.id)) {
        throw new Error('Invalid module ID');
      }
    }

    // Update all modules
    const updatePromises = moduleOrders.map(item =>
      prisma.module.update({
        where: { id: item.id },
        data: { order: item.order },
      })
    );

    await Promise.all(updatePromises);

    // Return updated modules
    return await prisma.module.findMany({
      where: { projectId },
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: {
            testCases: true,
          },
        },
      },
    });
  }

  /**
   * Get test cases for a specific module
   */
  async getModuleTestCases(moduleId: string, projectId: string) {
    // Verify module exists and belongs to project
    const mod = await prisma.module.findFirst({
      where: {
        id: moduleId,
        projectId,
      },
    });

    if (!mod) {
      throw new Error('Module not found');
    }

    // Get test cases
    const testCases = await prisma.testCase.findMany({
      where: { moduleId },
      select: {
        id: true,
        tcId: true,
        title: true,
        description: true,
        priority: true,
        status: true,
        estimatedTime: true,
        suiteId: true,
        _count: {
          select: {
            steps: true,
          },
        },
        module: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        suite: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        tcId: 'asc',
      },
    });

    return {
      testCases,
      module: {
        id: mod.id,
        name: mod.name,
        description: mod.description,
      },
      total: testCases.length,
    };
  }
}

export const moduleService = new ModuleService();
