import { prisma } from '@/lib/prisma';
import { ParsedRow } from '@/lib/file-parser';
import { ValidationException } from '@/backend/utils/exceptions';

export type ImportType = 'testcases' | 'defects';

export interface MigrationResult {
  success: number;
  failed: number;
  skipped: number;
  errors: Array<{
    row: number;
    title: string;
    error: string;
  }>;
  skippedItems: Array<{
    row: number;
    title: string;
    reason: string;
  }>;
  imported: Array<{
    tcId?: string;
    defectId?: string;
    title: string;
  }>;
}

export class ImportService {
  /**
   * Normalize column names to handle both export format and import format
   */
  private normalizeColumnName(columnName: string): string {
    const normalized = columnName.trim().toLowerCase();
    
    // Map export format column names to import format
    const columnMap: Record<string, string> = {
      'title': 'title',
      'description': 'description',
      'expected result': 'expectedResult',
      'priority': 'priority',
      'status': 'status',
      'estimated time (minutes)': 'estimatedTime',
      'estimated time': 'estimatedTime',
      'preconditions': 'preconditions',
      'postconditions': 'postconditions',
      'module': 'module',
      'test suites': 'testsuite',
      'testsuite': 'testsuite',
      'test suite': 'testsuite',
      // Defect columns
      'defect id': 'defectId',
      'severity': 'severity',
      'assigned to': 'assignedTo',
      'environment': 'environment',
      'due date': 'dueDate',
      'test case': 'testCase',
      'testcase': 'testCase',
      'linked test cases': 'testCase',
    };
    
    return columnMap[normalized] || normalized;
  }

  /**
   * Get value from row using normalized column name
   */
  private getRowValue(row: ParsedRow, normalizedKey: string): string | number | null | undefined {
    // Try normalized key first
    if (row[normalizedKey] !== undefined) {
      return row[normalizedKey];
    }
    
    // Try to find by case-insensitive match
    const foundKey = Object.keys(row).find(
      (key) => this.normalizeColumnName(key) === normalizedKey
    );
    
    return foundKey ? row[foundKey] : undefined;
  }

  /**
   * Import data based on type
   */
  async importData(
    type: ImportType,
    projectId: string,
    userId: string,
    data: ParsedRow[]
  ): Promise<MigrationResult> {
    switch (type) {
      case 'testcases':
        return this.importTestCases(projectId, userId, data);
      case 'defects':
        return this.importDefects(projectId, userId, data);
      default:
        throw new ValidationException(`Unsupported import type: ${type}`);
    }
  }

  /**
   * Import test cases from parsed data
   */
  private async importTestCases(
    projectId: string,
    userId: string,
    data: ParsedRow[]
  ): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: 0,
      failed: 0,
      skipped: 0,
      errors: [],
      skippedItems: [],
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
        // Get values using normalized column names
        const title = this.getRowValue(row, 'title');
        const description = this.getRowValue(row, 'description');
        const expectedResult = this.getRowValue(row, 'expectedResult');
        const priority = this.getRowValue(row, 'priority');
        const status = this.getRowValue(row, 'status');
        const estimatedTime = this.getRowValue(row, 'estimatedTime');
        const preconditions = this.getRowValue(row, 'preconditions');
        const postconditions = this.getRowValue(row, 'postconditions');
        const moduleValue = this.getRowValue(row, 'module');
        const testsuite = this.getRowValue(row, 'testsuite');

        // Validate required field
        if (!title || typeof title !== 'string' || title.toString().trim() === '') {
          throw new Error('Title is required');
        }

        const testCaseTitle = title.toString().trim();

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
          result.skipped++;
          result.skippedItems.push({
            row: rowNumber,
            title: testCaseTitle,
            reason: `Already exists (${existingTestCase.tcId})`,
          });
          continue; // Skip this row
        }

        // Find or create module
        let moduleId: string | undefined;
        if (moduleValue && typeof moduleValue === 'string' && moduleValue.toString().trim()) {
          const moduleName = moduleValue.toString().trim();
          let foundModule = project.modules.find(
            (m) => m.name.toLowerCase() === moduleName.toLowerCase()
          );

          if (!foundModule) {
            // Create module
            foundModule = await prisma.module.create({
              data: {
                name: moduleName,
                projectId,
              },
            });
            // Add to project modules array to avoid duplicate creation
            project.modules.push(foundModule);
          }
          moduleId = foundModule.id;
        }

        // Find or create suite
        let suiteId: string | undefined;
        if (testsuite && typeof testsuite === 'string' && testsuite.toString().trim()) {
          const suiteName = testsuite.toString().trim();
          let foundSuite = project.testSuites.find(
            (s) => s.name.toLowerCase() === suiteName.toLowerCase()
          );

          if (!foundSuite) {
            // Create suite
            foundSuite = await prisma.testSuite.create({
              data: {
                name: suiteName,
                projectId,
              },
            });
            // Add to project test suites array to avoid duplicate creation
            project.testSuites.push(foundSuite);
          }
          suiteId = foundSuite.id;
        }

        // Validate priority
        const priorityValue = priority
          ? priority.toString().toUpperCase()
          : 'MEDIUM';
        if (!validPriorities.has(priorityValue)) {
          throw new Error(
            `Invalid priority: ${priority}. Valid values are: ${Array.from(validPriorities).join(', ')}`
          );
        }

        // Validate status
        const statusValue = status ? status.toString().toUpperCase() : 'ACTIVE';
        if (!validStatuses.has(statusValue)) {
          throw new Error(
            `Invalid status: ${status}. Valid values are: ${Array.from(validStatuses).join(', ')}`
          );
        }

        // Parse estimated time
        let estimatedTimeValue: number | undefined;
        if (estimatedTime) {
          const parsed = parseInt(estimatedTime.toString(), 10);
          if (!isNaN(parsed) && parsed > 0) {
            estimatedTimeValue = parsed;
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
            description: description
              ? description.toString().trim()
              : null,
            expectedResult: expectedResult
              ? expectedResult.toString().trim()
              : null,
            priority: priorityValue,
            status: statusValue,
            estimatedTime: estimatedTimeValue,
            preconditions: preconditions
              ? preconditions.toString().trim()
              : null,
            postconditions: postconditions
              ? postconditions.toString().trim()
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
        const titleValue = this.getRowValue(row, 'title');
        result.errors.push({
          row: rowNumber,
          title: titleValue ? titleValue.toString() : 'N/A',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Debug: Log the test case import result before returning
    console.log('Test case import result:', {
      success: result.success,
      failed: result.failed,
      skipped: result.skipped,
      errorsCount: result.errors.length,
      skippedItemsCount: result.skippedItems.length,
      importedCount: result.imported.length,
    });

    return result;
  }

  /**
   * Import defects from parsed data
   */
  private async importDefects(
    projectId: string,
    userId: string,
    data: ParsedRow[]
  ): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: 0,
      failed: 0,
      skipped: 0,
      errors: [],
      skippedItems: [],
      imported: [],
    };

    // Get project to validate
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!project) {
      throw new ValidationException('Project not found');
    }

    // Get existing defects to generate next defectId
    const existingDefects = await prisma.defect.findMany({
      where: { projectId },
      select: { defectId: true },
      orderBy: { defectId: 'desc' },
    });

    // Create a set of existing defectIds for quick lookup
    const existingDefectIds = new Set(existingDefects.map((d) => d.defectId));

    let nextDefectIdNumber = 1;
    if (existingDefects.length > 0) {
      const lastDefectId = existingDefects[0].defectId;
      const match = lastDefectId.match(/\d+/);
      if (match) {
        nextDefectIdNumber = parseInt(match[0], 10) + 1;
      }
    }

    // Get dropdown options for validation
    const [severities, priorities, statuses, environments] = await Promise.all([
      prisma.dropdownOption.findMany({
        where: { entity: 'Defect', field: 'severity' },
        select: { value: true },
      }),
      prisma.dropdownOption.findMany({
        where: { entity: 'Defect', field: 'priority' },
        select: { value: true },
      }),
      prisma.dropdownOption.findMany({
        where: { entity: 'Defect', field: 'status' },
        select: { value: true },
      }),
      prisma.dropdownOption.findMany({
        where: { entity: 'TestRun', field: 'environment' },
        select: { value: true },
      }),
    ]);

    const validSeverities = new Set(severities.map((s) => s.value.toUpperCase()));
    const validPriorities = new Set(priorities.map((p) => p.value.toUpperCase()));
    const validStatuses = new Set(statuses.map((s) => s.value.toUpperCase()));
    const validEnvironments = new Set(
      environments.map((e) => e.value.toUpperCase())
    );

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2; // +2 because of header row and 1-based indexing

      try {
        // Get values using normalized column names
        const title = this.getRowValue(row, 'title');
        const description = this.getRowValue(row, 'description');
        const severity = this.getRowValue(row, 'severity');
        const priority = this.getRowValue(row, 'priority');
        const status = this.getRowValue(row, 'status');
        const environment = this.getRowValue(row, 'environment');
        const assignedTo = this.getRowValue(row, 'assignedTo');
        const dueDate = this.getRowValue(row, 'dueDate');
        const testCase = this.getRowValue(row, 'testCase');

        // Validate required field
        if (!title || typeof title !== 'string' || title.toString().trim() === '') {
          throw new Error('Title is required');
        }

        const defectTitle = title.toString().trim();

        // Check if defect with same title already exists
        const existingDefect = await prisma.defect.findFirst({
          where: {
            projectId,
            title: {
              equals: defectTitle,
              mode: 'insensitive',
            },
          },
        });

        if (existingDefect) {
          result.skipped++;
          result.skippedItems.push({
            row: rowNumber,
            title: defectTitle,
            reason: `Already exists (${existingDefect.defectId})`,
          });
          continue; // Skip this row
        }

        // Validate severity
        const severityValue = severity
          ? severity.toString().toUpperCase()
          : 'MEDIUM';
        if (!validSeverities.has(severityValue)) {
          throw new Error(
            `Invalid severity: ${severity}. Valid values are: ${Array.from(validSeverities).join(', ')}`
          );
        }

        // Validate priority
        const priorityValue = priority
          ? priority.toString().toUpperCase()
          : 'MEDIUM';
        if (!validPriorities.has(priorityValue)) {
          throw new Error(
            `Invalid priority: ${priority}. Valid values are: ${Array.from(validPriorities).join(', ')}`
          );
        }

        // Validate status
        const statusValue = status ? status.toString().toUpperCase() : 'NEW';
        if (!validStatuses.has(statusValue)) {
          throw new Error(
            `Invalid status: ${status}. Valid values are: ${Array.from(validStatuses).join(', ')}`
          );
        }

        // Validate environment
        let environmentValue: string | undefined;
        if (environment && typeof environment === 'string') {
          environmentValue = environment.toString().toUpperCase();
          if (!validEnvironments.has(environmentValue)) {
            throw new Error(
              `Invalid environment: ${environment}. Valid values are: ${Array.from(validEnvironments).join(', ')}`
            );
          }
        }

        // Find assignee by email
        let assignedToId: string | undefined;
        if (assignedTo && typeof assignedTo === 'string') {
          const email = assignedTo.toString().trim().toLowerCase();
          const projectMember = project.members.find(
            (m) => m.user.email.toLowerCase() === email
          );

          if (projectMember) {
            assignedToId = projectMember.userId;
          } else {
            // Log warning but don't fail
            console.warn(
              `User with email ${email} not found in project members. Defect will be unassigned.`
            );
          }
        }

        // Parse due date
        let dueDateValue: Date | undefined;
        if (dueDate && typeof dueDate === 'string') {
          const parsedDate = new Date(dueDate);
          if (!isNaN(parsedDate.getTime())) {
            dueDateValue = parsedDate;
          }
        }

        // Generate defectId - skip existing ones
        let defectId = `DEF-${String(nextDefectIdNumber).padStart(3, '0')}`;
        while (existingDefectIds.has(defectId)) {
          nextDefectIdNumber++;
          defectId = `DEF-${String(nextDefectIdNumber).padStart(3, '0')}`;
        }
        nextDefectIdNumber++;
        existingDefectIds.add(defectId);

        // Find test case by title if provided
        let testCaseId: string | undefined;
        if (testCase && typeof testCase === 'string' && testCase.toString().trim()) {
          const testCaseName = testCase.toString().trim();
          const foundTestCase = await prisma.testCase.findFirst({
            where: {
              projectId,
              title: {
                equals: testCaseName,
                mode: 'insensitive',
              },
            },
            select: { id: true },
          });

          if (!foundTestCase) {
            console.warn(
              `Test case "${testCaseName}" not found in project. Defect will be created without test case link.`
            );
          } else {
            testCaseId = foundTestCase.id;
          }
        }

        // Create defect
        const defect = await prisma.defect.create({
          data: {
            defectId,
            projectId,
            title: title.toString().trim(),
            description: description
              ? description.toString().trim()
              : null,
            severity: severityValue,
            priority: priorityValue,
            status: statusValue,
            assignedToId,
            environment: environmentValue,
            dueDate: dueDateValue,
            createdById: userId,
          },
        });

        // Link to test case if found
        if (testCaseId) {
          await prisma.testCaseDefect.create({
            data: {
              testCaseId,
              defectId: defect.id,
            },
          });
        }

        result.success++;
        result.imported.push({
          defectId: defect.defectId,
          title: defect.title,
        });
      } catch (error) {
        result.failed++;
        const titleValue = this.getRowValue(row, 'title');
        result.errors.push({
          row: rowNumber,
          title: titleValue ? titleValue.toString() : 'N/A',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Debug: Log the result before returning
    console.log('Defect import result:', {
      success: result.success,
      failed: result.failed,
      skipped: result.skipped,
      errorsCount: result.errors.length,
      skippedItemsCount: result.skippedItems.length,
      importedCount: result.imported.length,
    });

    return result;
  }
}

export const importService = new ImportService();

