import { prisma } from '@/lib/prisma';
import { DefectSeverity, DefectStatus, DefectType, Priority } from '@prisma/client';

interface CreateDefectInput {
  projectId: string;
  testCaseId?: string;
  testRunId?: string;
  title: string;
  description?: string;
  defectType: DefectType;
  stepsToReproduce?: string;
  expectedResult?: string;
  actualResult?: string;
  severity: DefectSeverity;
  priority: Priority;
  status?: DefectStatus;
  assignedToId?: string;
  createdById: string;
  environment?: string;
}

interface UpdateDefectInput {
  title?: string;
  description?: string | null;
  defectType?: DefectType;
  stepsToReproduce?: string | null;
  expectedResult?: string | null;
  actualResult?: string | null;
  severity?: DefectSeverity;
  priority?: Priority;
  status?: DefectStatus;
  assignedToId?: string | null;
  environment?: string | null;
  testCaseId?: string | null;
  testRunId?: string | null;
}

interface DefectFilters {
  severity?: DefectSeverity[];
  priority?: Priority[];
  status?: DefectStatus[];
  assignedToId?: string[];
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export class DefectService {
  /**
   * Generate next defect ID for a project (e.g., DEF-1, DEF-2, DEF-3...)
   */
  private async generateDefectId(projectId: string): Promise<string> {
    const count = await prisma.defect.count({
      where: { projectId },
    });
    
    let defectNumber = count + 1;
    let defectId = `DEF-${defectNumber}`;
    
    let exists = await prisma.defect.findFirst({
      where: {
        projectId,
        defectId,
      },
    });
    
    while (exists) {
      defectNumber++;
      defectId = `DEF-${defectNumber}`;
      exists = await prisma.defect.findFirst({
        where: {
          projectId,
          defectId,
        },
      });
    }
    
    return defectId;
  }

  /**
   * Get all defects for a project with optional filters
   */
  async getProjectDefects(
    projectId: string,
    filters?: DefectFilters
  ) {
    const where: Record<string, unknown> = {
      projectId,
    };

    if (filters?.severity && filters.severity.length > 0) {
      where.severity = { in: filters.severity };
    }

    if (filters?.priority && filters.priority.length > 0) {
      where.priority = { in: filters.priority };
    }

    if (filters?.status && filters.status.length > 0) {
      where.status = { in: filters.status };
    }

    if (filters?.assignedToId && filters.assignedToId.length > 0) {
      if (filters.assignedToId.includes('unassigned')) {
        where.OR = [
          { assignedToId: { in: filters.assignedToId.filter(id => id !== 'unassigned') } },
          { assignedToId: null }
        ];
      } else {
        where.assignedToId = { in: filters.assignedToId };
      }
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { defectId: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.dateFrom) {
      where.createdAt = {
        ...(typeof where.createdAt === 'object' ? where.createdAt : {}),
        gte: new Date(filters.dateFrom),
      };
    }

    if (filters?.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      where.createdAt = {
        ...(typeof where.createdAt === 'object' ? where.createdAt : {}),
        lte: toDate,
      };
    }

    const defects = await prisma.defect.findMany({
      where,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        testCase: {
          select: {
            id: true,
            tcId: true,
            title: true,
          },
        },
        testRun: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return defects;
  }

  /**
   * Create a new defect
   */
  async createDefect(data: CreateDefectInput) {
    const defectId = await this.generateDefectId(data.projectId);

    const defect = await prisma.defect.create({
      data: {
        defectId,
        projectId: data.projectId,
        testCaseId: data.testCaseId,
        testRunId: data.testRunId,
        title: data.title,
        description: data.description,
        stepsToReproduce: data.stepsToReproduce,
        expectedResult: data.expectedResult,
        actualResult: data.actualResult,
        severity: data.severity,
        priority: data.priority,
        status: data.status || 'NEW',
        assignedToId: data.assignedToId,
        createdById: data.createdById,
        environment: data.environment,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        testCase: {
          select: {
            id: true,
            tcId: true,
            title: true,
          },
        },
        testRun: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return defect;
  }

  /**
   * Get defect by ID
   */
  async getDefectById(defectId: string) {
    const defect = await prisma.defect.findUnique({
      where: { id: defectId },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        testCase: {
          select: {
            id: true,
            tcId: true,
            title: true,
          },
        },
        testRun: {
          select: {
            id: true,
            name: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            key: true,
          },
        },
        attachments: true,
        comments: {
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
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!defect) {
      throw new Error('Defect not found');
    }

    return defect;
  }

  /**
   * Update defect
   */
  async updateDefect(defectId: string, data: UpdateDefectInput) {
    const defect = await prisma.defect.update({
      where: { id: defectId },
      data: {
        title: data.title,
        description: data.description,
        stepsToReproduce: data.stepsToReproduce,
        expectedResult: data.expectedResult,
        actualResult: data.actualResult,
        severity: data.severity,
        priority: data.priority,
        status: data.status,
        assignedToId: data.assignedToId,
        environment: data.environment,
        testCaseId: data.testCaseId,
        testRunId: data.testRunId,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        testCase: {
          select: {
            id: true,
            tcId: true,
            title: true,
          },
        },
        testRun: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return defect;
  }

  /**
   * Delete defect
   */
  async deleteDefect(defectId: string) {
    await prisma.defect.delete({
      where: { id: defectId },
    });
  }

  /**
   * Get defect statistics for a project
   */
  async getDefectStatistics(projectId: string) {
    const [total, bySeverity, byStatus, byPriority] = await Promise.all([
      prisma.defect.count({ where: { projectId } }),
      prisma.defect.groupBy({
        by: ['severity'],
        where: { projectId },
        _count: true,
      }),
      prisma.defect.groupBy({
        by: ['status'],
        where: { projectId },
        _count: true,
      }),
      prisma.defect.groupBy({
        by: ['priority'],
        where: { projectId },
        _count: true,
      }),
    ]);

    return {
      total,
      bySeverity,
      byStatus,
      byPriority,
    };
  }
}

export const defectService = new DefectService();
