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
      // New test case fields
      'test case id': 'testCaseId',
      'testcase id': 'testCaseId',
      'test case title': 'title',
      'testcase title': 'title',
      'title': 'title',
      'module / feature': 'module',
      'module/feature': 'module',
      'module': 'module',
      'feature': 'module',
      'priority': 'priority',
      'preconditions': 'preconditions',
      'test steps': 'testSteps',
      'teststeps': 'testSteps',
      'test data': 'testData',
      'testdata': 'testData',
      'expected result': 'expectedResult',
      'expectedresult': 'expectedResult',
      'status': 'status',
      // Defect linking for test cases
      'defect id': 'defectId',
      'defectid': 'defectId',
      'defect': 'defectId',
      // Older fields (kept for backward compatibility)
      'description': 'description',
      'estimated time (minutes)': 'estimatedTime',
      'estimated time': 'estimatedTime',
      'postconditions': 'postconditions',
      'test suites': 'testsuite',
      'testsuite': 'testsuite',
      'test suite': 'testsuite',
      // Defect columns (for defect import)
      'defect title / summary': 'title',
      'defect title': 'title',
      'summary': 'title',
      'severity': 'severity',
      'assigned to': 'assignedTo',
      'environment': 'environment',
      'reported by': 'reportedBy',
      'reportedby': 'reportedBy',
      'reported date': 'reportedDate',
      'reporteddate': 'reportedDate',
      'due date': 'dueDate',
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
      select: { tcId: true, title: true },
      orderBy: { tcId: 'desc' },
    });

    // Create a set of existing tcIds for quick lookup
    const existingTcIds = new Set(existingTestCases.map((tc) => tc.tcId));
    // Create a map of tcId to title for showing existing test case info
    const existingTcIdToTitle = new Map(
      existingTestCases.map((tc) => [tc.tcId, tc.title])
    );

    // Get existing defects to validate defect IDs
    const existingDefects = await prisma.defect.findMany({
      where: { projectId },
      select: { id: true, defectId: true, title: true },
    });

    // Create a map of defectId (display ID) to defect database id and title
    const defectIdToDefect = new Map(
      existingDefects.map((d) => [d.defectId.toUpperCase(), { id: d.id, title: d.title }])
    );

    let nextTcIdNumber = 1;
    if (existingTestCases.length > 0) {
      const lastTcId = existingTestCases[0].tcId;
      // Extract number from TC-XXX or tcXXX format
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
        const testCaseId = this.getRowValue(row, 'testCaseId');
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
        const testSteps = this.getRowValue(row, 'testSteps');
        const testData = this.getRowValue(row, 'testData');
        const defectId = this.getRowValue(row, 'defectId');

        // Validate required field
        if (!title || typeof title !== 'string' || title.toString().trim() === '') {
          throw new Error('Test Case Title is required');
        }

        const testCaseTitle = title.toString().trim();

        // Validate defect IDs if provided (supports multiple defects: comma or semicolon separated)
        const defectsToLink: Array<{ id: string; title: string; defectId: string }> = [];
        if (defectId && typeof defectId === 'string' && defectId.toString().trim()) {
          // Parse multiple defect IDs (comma or semicolon separated)
          const defectIdString = defectId.toString().trim();
          const defectIdList = defectIdString
            .split(/[,;]/)
            .map(id => id.trim().toUpperCase())
            .filter(id => id.length > 0);
          
          const missingDefectIds: string[] = [];
          
          for (const providedDefectId of defectIdList) {
            const foundDefect = defectIdToDefect.get(providedDefectId);
            
            if (!foundDefect) {
              missingDefectIds.push(providedDefectId);
            } else {
              defectsToLink.push({
                ...foundDefect,
                defectId: providedDefectId,
              });
            }
          }
          
          // If any defect ID is not found, skip the test case
          if (missingDefectIds.length > 0) {
            result.skipped++;
            result.skippedItems.push({
              row: rowNumber,
              title: testCaseTitle,
              reason: `Defect ID(s) not found: ${missingDefectIds.join(', ')}`,
            });
            continue; // Skip this row
          }
        }

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

        // Parse test steps if provided
        let testStepsData: Array<{ stepNumber: number; action: string; expectedResult: string }> | undefined;
        if (testSteps) {
          try {
            // Check if it's already an array
            if (Array.isArray(testSteps)) {
              testStepsData = testSteps
                .filter((step) => {
                  // Filter out invalid steps
                  if (typeof step === 'object' && step !== null) {
                    return step.action || step.step;
                  }
                  return Boolean(step);
                })
                .map((step, index) => ({
                  stepNumber: step.stepNumber || (typeof step === 'object' && step !== null ? index + 1 : index + 1),
                  action: (typeof step === 'object' && step !== null) 
                    ? (step.action || step.step || `Step ${index + 1}`) 
                    : String(step),
                  expectedResult: (typeof step === 'object' && step !== null) 
                    ? (step.expectedResult || step.expected || '') 
                    : '',
                }));
            }
            // If it's a string, try to parse it
            else if (typeof testSteps === 'string' && testSteps.trim()) {
              try {
                // Try to parse as JSON first (if it's a JSON array string)
                const parsed = JSON.parse(testSteps);
                if (Array.isArray(parsed)) {
                  testStepsData = parsed
                    .filter((step) => step && (step.action || step.step)) // Filter out invalid steps
                    .map((step, index) => ({
                      stepNumber: step.stepNumber || index + 1,
                      action: step.action || step.step || `Step ${index + 1}`,
                      expectedResult: step.expectedResult || step.expected || '',
                    }));
                }
              } catch {
                // If not JSON, try to parse as newline-separated or pipe-separated
                const stepsText = testSteps.trim();
                let stepLines: string[] = [];
                
                // Try pipe-separated format first: "Step 1; Expected 1|Step 2; Expected 2"
                if (stepsText.includes('|')) {
                  stepLines = stepsText.split('|').map(s => s.trim()).filter(s => s);
                } 
                // Try newline-separated format
                else if (stepsText.includes('\n')) {
                  stepLines = stepsText.split('\n').map(s => s.trim()).filter(s => s);
                }
                // Single step
                else {
                  stepLines = [stepsText];
                }
                
                if (stepLines.length > 0) {
                  testStepsData = stepLines.map((line, index) => {
                    // Split by semicolon or colon
                    const parts = line.split(/[;:]/).map(p => p.trim()).filter(p => p);
                    return {
                      stepNumber: index + 1,
                      action: parts[0] || `Step ${index + 1}`,
                      expectedResult: parts[1] || '', // expectedResult is optional
                    };
                  });
                }
              }
            }
          } catch (error) {
            console.warn(`Failed to parse test steps for row ${rowNumber}:`, error);
            // Continue without steps if parsing fails
          }
        }

        // Parse test data
        const testDataValue = testData && typeof testData === 'string' && testData.toString().trim()
          ? testData.toString().trim()
          : null;

        // Generate or use provided tcId
        let tcId: string;
        if (testCaseId && typeof testCaseId === 'string' && testCaseId.toString().trim()) {
          // User provided test case ID - validate format and uniqueness
          const providedTcId = testCaseId.toString().trim().toUpperCase();
          
          // Validate format: should be uppercase with hyphens (e.g., TC-LOGIN-001, TC-001)
          if (!/^TC-[A-Z0-9_-]+$/.test(providedTcId)) {
            throw new Error(`Invalid Test Case ID format: ${providedTcId}. Expected format: TC-XXX or TC-MODULE-XXX`);
          }
          
          // Check if already exists
          if (existingTcIds.has(providedTcId)) {
            const existingTitle = existingTcIdToTitle.get(providedTcId) || 'Unknown';
            result.skipped++;
            result.skippedItems.push({
              row: rowNumber,
              title: testCaseTitle,
              reason: `Test Case ID already exists: ${providedTcId} (Existing: "${existingTitle}")`,
            });
            continue;
          }
          
          tcId = providedTcId;
          existingTcIds.add(tcId);
        } else {
          // Auto-generate tcId in TC-XXX format without padding (TC-1, TC-2, etc.)
          tcId = `TC-${nextTcIdNumber}`;
          while (existingTcIds.has(tcId)) {
            nextTcIdNumber++;
            tcId = `TC-${nextTcIdNumber}`;
          }
          nextTcIdNumber++;
          existingTcIds.add(tcId);
        }

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
            testData: testDataValue,
            moduleId,
            suiteId,
            createdById: userId,
            steps: testStepsData && testStepsData.length > 0
              ? {
                  create: testStepsData
                    .filter((step) => step.action && step.action.trim()) // Only include steps with actions
                    .map((step) => ({
                      stepNumber: step.stepNumber,
                      action: step.action.trim(),
                      expectedResult: step.expectedResult && step.expectedResult.trim() 
                        ? step.expectedResult.trim() 
                        : '', // expectedResult is optional, allow empty string
                    })),
                }
              : undefined,
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

        // Link to defects if defect IDs were provided and found
        if (defectsToLink.length > 0) {
          for (const defect of defectsToLink) {
            try {
              await prisma.testCaseDefect.create({
                data: {
                  testCaseId: testCase.id,
                  defectId: defect.id,
                },
              });
            } catch {
              // If link already exists, that's okay - just log it
              console.warn(`Defect ${defect.defectId} (${defect.id}) already linked to test case ${testCase.id}`);
            }
          }
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
        const reportedBy = this.getRowValue(row, 'reportedBy');
        const reportedDate = this.getRowValue(row, 'reportedDate');
        const assignedTo = this.getRowValue(row, 'assignedTo');
        const dueDate = this.getRowValue(row, 'dueDate');

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

        // Find reported by user (name or email)
        let createdById = userId; // Default to current user
        if (reportedBy && typeof reportedBy === 'string') {
          const reportedByValue = reportedBy.toString().trim();
          // Try to find by email first, then by name
          const projectMember = project.members.find(
            (m) => 
              m.user.email.toLowerCase() === reportedByValue.toLowerCase() ||
              m.user.name?.toLowerCase() === reportedByValue.toLowerCase()
          );

          if (projectMember) {
            createdById = projectMember.userId;
          } else {
            // Log warning but use current user as fallback
            console.warn(
              `User "${reportedByValue}" not found in project members. Using current user as reporter.`
            );
          }
        }

        // Parse reported date
        let createdAtValue: Date | undefined;
        if (reportedDate && typeof reportedDate === 'string') {
          const parsedDate = new Date(reportedDate);
          if (!isNaN(parsedDate.getTime())) {
            createdAtValue = parsedDate;
          } else {
            console.warn(`Invalid reported date format: ${reportedDate}. Using current date.`);
          }
        }

        // Find assignee by name or email (required field)
        if (!assignedTo || typeof assignedTo !== 'string' || assignedTo.toString().trim() === '') {
          throw new Error('Assigned To is required');
        }

        const assignedToValue = assignedTo.toString().trim();
        // Try to find by email first, then by name
        const projectMember = project.members.find(
          (m) => 
            m.user.email.toLowerCase() === assignedToValue.toLowerCase() ||
            m.user.name?.toLowerCase() === assignedToValue.toLowerCase()
        );

        if (!projectMember) {
          throw new Error(
            `User "${assignedToValue}" not found in project members. Please provide a valid name or email of a project member.`
          );
        }

        const assignedToId = projectMember.userId;

        // Parse due date
        let dueDateValue: Date | undefined;
        if (dueDate && typeof dueDate === 'string') {
          const parsedDate = new Date(dueDate);
          if (!isNaN(parsedDate.getTime())) {
            dueDateValue = parsedDate;
          }
        }

        // Generate defectId - skip existing ones (format: DEF-1, DEF-2, etc. without padding)
        let defectId = `DEF-${nextDefectIdNumber}`;
        while (existingDefectIds.has(defectId)) {
          nextDefectIdNumber++;
          defectId = `DEF-${nextDefectIdNumber}`;
        }
        nextDefectIdNumber++;
        existingDefectIds.add(defectId);

        // Create defect
        const defectData: {
          defectId: string;
          projectId: string;
          title: string;
          description: string | null;
          severity: string;
          priority: string;
          status: string;
          assignedToId?: string;
          environment?: string;
          dueDate?: Date;
          createdById: string;
          createdAt?: Date;
        } = {
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
          createdById,
        };

        // Set createdAt if reportedDate is provided
        if (createdAtValue) {
          defectData.createdAt = createdAtValue;
        }

        const defect = await prisma.defect.create({
          data: defectData,
        });

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

