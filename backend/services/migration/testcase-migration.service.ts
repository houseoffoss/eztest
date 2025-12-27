import { prisma } from '@/lib/prisma';
import { ParsedRow } from '@/lib/file-parser';
import { ValidationException } from '@/backend/utils/exceptions';

export interface TestCaseMigrationRow {
  title: string;
  description?: string;
  expectedResult?: string;
  priority?: string;
  status?: string;
  estimatedTime?: number;
  preconditions?: string;
  postconditions?: string;
  module?: string;
  testsuite?: string;
}

export interface MigrationResult {
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    title: string;
    error: string;
  }>;
  imported: Array<{
    tcId: string;
    title: string;
  }>;
}

export class TestCaseMigrationService {
  /**
   * Import test cases from parsed data
   */
  async importTestCases(
    projectId: string,
    userId: string,
    data: ParsedRow[]
  ): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: 0,
      failed: 0,
      errors: [],
      imported: [],
    };

    // Get project to validate
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        modules: true,
        testSuites: true,
      },
    });

    if (!project) {
      throw new ValidationException('Project not found');
    }

    // Get existing test cases to generate next tcId
    const existingTestCases = await prisma.testCase.findMany({
      where: { projectId },
      select: { tcId: true },
      orderBy: { tcId: 'desc' },
    });

    // Create a set of existing tcIds for quick lookup
    const existingTcIds = new Set(existingTestCases.map((tc) => tc.tcId));

    let nextTcIdNumber = 1;
    if (existingTestCases.length > 0) {
      const lastTcId = existingTestCases[0].tcId;
      const match = lastTcId.match(/\d+/);
      if (match) {
        nextTcIdNumber = parseInt(match[0], 10) + 1;
      }
    }

    // Get dropdown options for validation
    const [priorities, statuses] = await Promise.all([
      prisma.dropdownOption.findMany({
        where: { entity: 'TestCase', field: 'priority' },
        select: { value: true },
      }),
      prisma.dropdownOption.findMany({
        where: { entity: 'TestCase', field: 'status' },
        select: { value: true },
      }),
    ]);

    const validPriorities = new Set(priorities.map((p) => p.value.toUpperCase()));
    const validStatuses = new Set(statuses.map((s) => s.value.toUpperCase()));

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2; // +2 because of header row and 1-based indexing

      try {
        // Validate required field
        if (!row.title || typeof row.title !== 'string' || row.title.trim() === '') {
          throw new Error('Title is required');
        }

        const testCaseTitle = row.title.toString().trim();

        // Check if test case with same title already exists
        const existingTestCase = await prisma.testCase.findFirst({
          where: {
            projectId,
            title: {
              equals: testCaseTitle,
              mode: 'insensitive',
            },
          },
        });

        if (existingTestCase) {
          result.failed++;
          result.errors.push({
            row: rowNumber,
            title: testCaseTitle,
            error: `Test case with title "${testCaseTitle}" already exists (${existingTestCase.tcId})`,
          });
          continue; // Skip this row
        }

        // Find or create module
        let moduleId: string | undefined;
        if (row.module && typeof row.module === 'string' && row.module.trim()) {
          const moduleName = row.module.trim();
          let module = project.modules.find(
            (m) => m.name.toLowerCase() === moduleName.toLowerCase()
          );

          if (!module) {
            // Create module
            module = await prisma.module.create({
              data: {
                name: moduleName,
                projectId,
              },
            });
            // Add to project modules array to avoid duplicate creation
            project.modules.push(module);
          }
          moduleId = module.id;
        }

        // Find or create suite
        let suiteId: string | undefined;
        if (row.testsuite && typeof row.testsuite === 'string' && row.testsuite.trim()) {
          const suiteName = row.testsuite.trim();
          let suite = project.testSuites.find(
            (s) => s.name.toLowerCase() === suiteName.toLowerCase()
          );

          if (!suite) {
            // Create suite
            suite = await prisma.testSuite.create({
              data: {
                name: suiteName,
                projectId,
              },
            });
            // Add to project test suites array to avoid duplicate creation
            project.testSuites.push(suite);
          }
          suiteId = suite.id;
        }

        // Validate priority
        const priority = row.priority
          ? row.priority.toString().toUpperCase()
          : 'MEDIUM';
        if (!validPriorities.has(priority)) {
          throw new Error(
            `Invalid priority: ${row.priority}. Valid values are: ${Array.from(validPriorities).join(', ')}`
          );
        }

        // Validate status
        const status = row.status ? row.status.toString().toUpperCase() : 'ACTIVE';
        if (!validStatuses.has(status)) {
          throw new Error(
            `Invalid status: ${row.status}. Valid values are: ${Array.from(validStatuses).join(', ')}`
          );
        }

        // Parse estimated time
        let estimatedTime: number | undefined;
        if (row.estimatedTime) {
          const parsed = parseInt(row.estimatedTime.toString(), 10);
          if (!isNaN(parsed) && parsed > 0) {
            estimatedTime = parsed;
          }
        }

        // Generate tcId - skip existing ones
        let tcId = `tc${nextTcIdNumber}`;
        while (existingTcIds.has(tcId)) {
          nextTcIdNumber++;
          tcId = `tc${nextTcIdNumber}`;
        }
        nextTcIdNumber++;
        existingTcIds.add(tcId);

        // Create test case
        const testCase = await prisma.testCase.create({
          data: {
            tcId,
            projectId,
            title: testCaseTitle,
            description: row.description
              ? row.description.toString().trim()
              : null,
            expectedResult: row.expectedResult
              ? row.expectedResult.toString().trim()
              : null,
            priority,
            status,
            estimatedTime,
            preconditions: row.preconditions
              ? row.preconditions.toString().trim()
              : null,
            postconditions: row.postconditions
              ? row.postconditions.toString().trim()
              : null,
            moduleId,
            suiteId,
            createdById: userId,
          },
        });

        // Link to test suite via junction table if suite exists
        if (suiteId) {
          await prisma.testCaseSuite.create({
            data: {
              testCaseId: testCase.id,
              testSuiteId: suiteId,
            },
          });
        }

        result.success++;
        result.imported.push({
          tcId: testCase.tcId,
          title: testCase.title,
        });
      } catch (error) {
        result.failed++;
        result.errors.push({
          row: rowNumber,
          title: row.title ? row.title.toString() : 'N/A',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return result;
  }
}

export const testCaseMigrationService = new TestCaseMigrationService();
