/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '@/lib/prisma';
import { NotFoundException } from '@/backend/utils/exceptions';

export class TestCaseDefectService {
  /**
   * Get all defects linked to a test case
   */
  async getTestCaseDefects(testCaseId: string) {
    // Verify test case exists
    const testCase = await prisma.testCase.findUnique({
      where: { id: testCaseId },
    });

    if (!testCase) {
      throw new NotFoundException('Test case not found');
    }

    // Get linked defects through join table
    const links = await (prisma as any).testCaseDefect.findMany({
      where: { testCaseId },
      include: {
        defect: {
          select: {
            id: true,
            defectId: true,
            title: true,
            description: true,
            status: true,
            severity: true,
            priority: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: {
        linkedAt: 'desc',
      },
    });

    return links.map((link: any) => link.defect);
  }

  /**
   * Link defects to a test case
   */
  async linkDefectsToTestCase(testCaseId: string, defectIds: string[]) {
    // Verify test case exists
    const testCase = await prisma.testCase.findUnique({
      where: { id: testCaseId },
    });

    if (!testCase) {
      throw new NotFoundException('Test case not found');
    }

    // Verify all defects exist
    const defects = await prisma.defect.findMany({
      where: { id: { in: defectIds } },
    });

    if (defects.length !== defectIds.length) {
      const foundIds = defects.map((d) => d.id);
      const missingIds = defectIds.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(`Defects not found: ${missingIds.join(', ')}`);
    }

    // Create links (upsert to avoid duplicates)
    const links = await Promise.all(
      defectIds.map(async (defectId) => {
        try {
          return await (prisma as any).testCaseDefect.upsert({
            where: {
              testCaseId_defectId: {
                testCaseId,
                defectId,
              },
            },
            create: {
              testCaseId,
              defectId,
            },
            update: {}, // No update needed if already exists
          });
        } catch (error) {
          console.error(`Error linking defect ${defectId}:`, error);
          return null;
        }
      })
    );

    const successfulLinks = links.filter((link: unknown) => link !== null);

    return {
      linked: successfulLinks.length,
      total: defectIds.length,
    };
  }

  /**
   * Unlink a defect from a test case
   */
  async unlinkDefectFromTestCase(testCaseId: string, defectId: string) {
    try {
      await (prisma as any).testCaseDefect.delete({
        where: {
          testCaseId_defectId: {
            testCaseId,
            defectId,
          },
        },
      });
    } catch {
      throw new NotFoundException('Link not found or already removed');
    }
  }
}

export const testCaseDefectService = new TestCaseDefectService();
