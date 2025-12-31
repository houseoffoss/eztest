import { prisma } from '@/lib/prisma';
import { ParsedRow } from '@/lib/file-parser';
import { ValidationException } from '@/backend/utils/exceptions';
import { defectService } from '@/backend/services/defect/services';

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

    // Get existing defects to validate defect IDs
    const existingDefects = await prisma.defect.findMany({
      where: { projectId },
      select: { id: true, defectId: true, title: true },
    });

    // Create a map of defectId (display ID) to defect database id and title
    // Case-sensitive matching - preserve original case
    const defectIdToDefect = new Map(
      existingDefects.map((d) => [d.defectId, { id: d.id, title: d.title }])
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
        // Note: Test Case ID is always auto-generated, not read from import
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

        // Process defect IDs if provided (supports multiple defects: comma or semicolon separated)
        // Store all defect IDs (both existing and pending) for later linking
        const defectsToLink: Array<{ id: string; title: string; defectId: string }> = [];
        const pendingDefectIds: string[] = [];
        
        if (defectId && typeof defectId === 'string' && defectId.toString().trim()) {
          // Parse multiple defect IDs (comma or semicolon separated)
          // Preserve original case for case-sensitive matching
          const defectIdString = defectId.toString().trim();
          const defectIdList = defectIdString
            .split(/[,;]/)
            .map(id => id.trim())
            .filter(id => id.length > 0);
          
          for (const providedDefectId of defectIdList) {
            // Check for existing defect (case-sensitive match - exact case required)
            const foundDefect = defectIdToDefect.get(providedDefectId);
            
            if (foundDefect) {
              // Defect exists - link immediately
              defectsToLink.push({
                ...foundDefect,
                defectId: providedDefectId, // Preserve original case
              });
            } else {
              // Defect doesn't exist yet - store for later linking (preserve original case)
              pendingDefectIds.push(providedDefectId);
            }
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

        // Parse expected results if provided (can be numbered list, newline-separated, or single value)
        let expectedResultsList: string[] = [];
        let singleExpectedResult: string | null = null;
        
        if (expectedResult && typeof expectedResult === 'string' && expectedResult.toString().trim()) {
          const expectedResultText = expectedResult.toString().trim();
          
          // Check if it contains numbered points (1., 2., etc.) or newlines
          const hasNumberedPoints = /\d+\./.test(expectedResultText);
          const hasNewlines = expectedResultText.includes('\n');
          const numberedPointsMatches = expectedResultText.match(/\d+\./g);
          const numberedPointsCount = numberedPointsMatches ? numberedPointsMatches.length : 0;
          
          if (hasNewlines || (hasNumberedPoints && numberedPointsCount > 1)) {
            // Multi-item format - split by newlines first, then check for numbered points
            let items: string[] = [];
            
            if (hasNewlines) {
              // Split by newlines first
              items = expectedResultText.split('\n').map(l => l.trim()).filter(l => l);
            } else {
              // No newlines but has multiple numbered points - split by numbered points
              // Match pattern: number followed by dot and optional space
              items = expectedResultText.split(/(?=\d+\.\s*)/).map(l => l.trim()).filter(l => l);
            }
            
            // Process each item - remove leading number and dot if present
            expectedResultsList = items.map(item => {
              return item.replace(/^\d+\.\s*/, '').trim();
            }).filter(item => item.length > 0);
          } else if (hasNumberedPoints) {
            // Single line with number prefix - treat as single result
            singleExpectedResult = expectedResultText.replace(/^\d+\.\s*/, '').trim();
          } else {
            // Single expected result - will apply to all steps
            singleExpectedResult = expectedResultText;
          }
        }

        // Parse test steps if provided
        // Also handle case where Expected Result column has values but Test Steps is empty
        let testStepsData: Array<{ stepNumber: number; action: string; expectedResult: string }> | undefined;
        
        // If Test Steps is empty but Expected Result has values, create steps from expected results
        if (!testSteps && (expectedResultsList.length > 0 || singleExpectedResult)) {
          if (expectedResultsList.length > 0) {
            // Multiple expected results - create one step per expected result
            testStepsData = expectedResultsList.map((expectedResult, index) => ({
              stepNumber: index + 1,
              action: '', // No action, only expected result
              expectedResult: expectedResult,
            }));
          } else if (singleExpectedResult) {
            // Single expected result - create one step
            testStepsData = [{
              stepNumber: 1,
              action: '', // No action, only expected result
              expectedResult: singleExpectedResult,
            }];
          }
        } else if (testSteps) {
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
                .map((step, index) => {
                  const stepAction = (typeof step === 'object' && step !== null) 
                    ? (step.action || step.step || '') 
                    : String(step);
                  const stepExpectedResult = (typeof step === 'object' && step !== null) 
                    ? (step.expectedResult || step.expected || '') 
                    : '';
                  // Use Expected Result column if step doesn't have expected result
                  const finalExpectedResult = stepExpectedResult || expectedResultsList[index] || singleExpectedResult || '';
                  
                  return {
                    stepNumber: step.stepNumber || (typeof step === 'object' && step !== null ? index + 1 : index + 1),
                    action: stepAction,
                    expectedResult: finalExpectedResult,
                  };
                });
            }
            // If it's a string, try to parse it
            else if (typeof testSteps === 'string' && testSteps.trim()) {
              try {
                // Try to parse as JSON first (if it's a JSON array string)
                const parsed = JSON.parse(testSteps);
                if (Array.isArray(parsed)) {
                  testStepsData = parsed
                    .filter((step) => step && (step.action || step.step)) // Filter out invalid steps
                    .map((step, index) => {
                      const stepAction = step.action || step.step || '';
                      const stepExpectedResult = step.expectedResult || step.expected || '';
                      // Use Expected Result column if step doesn't have expected result
                      const finalExpectedResult = stepExpectedResult || expectedResultsList[index] || singleExpectedResult || '';
                      
                      return {
                        stepNumber: step.stepNumber || index + 1,
                        action: stepAction,
                        expectedResult: finalExpectedResult,
                      };
                    });
                }
              } catch {
                // If not JSON, try to parse as numbered list, newline-separated, or other formats
                const stepsText = testSteps.trim();
                let stepLines: string[] = [];
                
                // Check if it contains numbered points (1., 2., etc.) or newlines
                const hasNumberedPoints = /\d+\./.test(stepsText);
                const hasNewlines = stepsText.includes('\n');
                const numberedPointsCount = stepsText.match(/\d+\./g)?.length || 0;
                
                if (hasNewlines || (hasNumberedPoints && numberedPointsCount > 1)) {
                  // Multi-step format - split by newlines first, then check for numbered points
                  if (hasNewlines) {
                    // Split by newlines first - each line is a separate step
                    stepLines = stepsText.split('\n').map(s => s.trim()).filter(s => s);
                  } else {
                    // No newlines but has multiple numbered points - split by numbered points
                    // Match pattern: number followed by dot and optional space
                    stepLines = stepsText.split(/(?=\d+\.\s*)/).map(s => s.trim()).filter(s => s);
                  }
                  
                  testStepsData = stepLines.map((line, index) => {
                    // Check if line has numbered prefix (e.g., "1. Enter password")
                    const isNumbered = /^\d+\./.test(line);
                    
                    // Remove leading number and dot if present
                    let action = isNumbered ? line.replace(/^\d+\.\s*/, '').trim() : line;
                    
                    // Remove expected result from action if it's separated by semicolon or colon
                    // We only want the action, expected result comes from Expected Result column
                    const parts = action.split(/[;:]/).map(p => p.trim()).filter(p => p);
                    action = parts[0] || action; // Take only the action part (before semicolon/colon)
                    
                    // Get expected result from Expected Result column by index
                    // If multiple expected results exist, match by index; if single value, apply to all steps
                    const expectedResultValue = expectedResultsList[index] || singleExpectedResult || '';
                    
                    // If action is empty but expected result exists, use expected result as the content
                    // If expected result is empty but action exists, use action only
                    const finalAction = action || '';
                    const finalExpectedResult = expectedResultValue || '';
                    
                    return {
                      stepNumber: index + 1,
                      action: finalAction,
                      expectedResult: finalExpectedResult,
                    };
                  });
                } else {
                  // Single line - check if it's numbered or has pipe separator
                  // Try pipe-separated format first: "Step 1; Expected 1|Step 2; Expected 2"
                  if (stepsText.includes('|')) {
                    stepLines = stepsText.split('|').map(s => s.trim()).filter(s => s);
                  } else {
                    // Single step
                    stepLines = [stepsText];
                  }
                  
                  if (stepLines.length > 0) {
                    testStepsData = stepLines.map((line, index) => {
                      // Check if line has numbered prefix
                      const isNumbered = /^\d+\./.test(line);
                      let cleanLine = isNumbered ? line.replace(/^\d+\.\s*/, '').trim() : line;
                      
                      // Remove expected result from action if it's separated by semicolon or colon
                      // We only want the action, expected result comes from Expected Result column
                      const parts = cleanLine.split(/[;:]/).map(p => p.trim()).filter(p => p);
                      cleanLine = parts[0] || cleanLine; // Take only the action part (before semicolon/colon)
                      
                      // Get expected result from Expected Result column by index
                      // If multiple expected results exist, match by index; if single value, apply to all steps
                      const expectedResultValue = expectedResultsList[index] || singleExpectedResult || '';
                      
                      // If action is empty but expected result exists, use expected result as the content
                      // If expected result is empty but action exists, use action only
                      const finalAction = cleanLine || '';
                      const finalExpectedResult = expectedResultValue || '';
                      
                      return {
                        stepNumber: index + 1,
                        action: finalAction,
                        expectedResult: finalExpectedResult,
                      };
                    });
                  }
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

        // Determine the expected result value to use for the test case
        // If there are no test steps, use the parsed expected result (singleExpectedResult) or original value
        // If there are test steps, use the original expectedResult value (individual step results are stored in steps)
        let finalExpectedResult: string | null = null;
        if (!testStepsData || testStepsData.length === 0) {
          // No test steps - use the parsed expected result if available, otherwise use original value
          finalExpectedResult = singleExpectedResult || (expectedResult && typeof expectedResult === 'string' && expectedResult.toString().trim() ? expectedResult.toString().trim() : null);
        } else {
          // Has test steps - use the original expectedResult value for the test case's expectedResult field
          // (Individual step expected results are already stored in testStepsData)
          finalExpectedResult = expectedResult && typeof expectedResult === 'string' && expectedResult.toString().trim() ? expectedResult.toString().trim() : null;
        }

        // Always auto-generate tcId (Test Case ID column removed from import)
        // Auto-generate tcId in TC-XXX format without padding (TC-1, TC-2, etc.)
        let tcId = `TC-${nextTcIdNumber}`;
        while (existingTcIds.has(tcId)) {
          nextTcIdNumber++;
          tcId = `TC-${nextTcIdNumber}`;
        }
        nextTcIdNumber++;
        existingTcIds.add(tcId);

        // Create test case
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const testCase = await (prisma.testCase.create as any)({
          data: {
            tcId,
            projectId,
            title: testCaseTitle,
            description: description
              ? description.toString().trim()
              : null,
            expectedResult: finalExpectedResult,
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
            pendingDefectIds: pendingDefectIds.length > 0 ? pendingDefectIds.join(', ') : null,
            moduleId,
            suiteId,
            createdById: userId,
            steps: testStepsData && testStepsData.length > 0
              ? {
                  create: testStepsData
                    .filter((step) => (step.action && step.action.trim()) || (step.expectedResult && step.expectedResult.trim())) // Include steps with either action or expected result
                    .map((step) => ({
                      stepNumber: step.stepNumber,
                      action: step.action && step.action.trim() ? step.action.trim() : '', // Allow empty action
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
    });

    // Create a set of existing defectIds for quick lookup
    const existingDefectIds = new Set(existingDefects.map((d) => d.defectId));

    // Find the highest DEF-X number from existing defects
    // Only consider defects in DEF-X format (not custom formats like DEF-LOGIN-001)
    let nextDefectIdNumber = 1;
    const defectNumberPattern = /^DEF-(\d+)$/;
    
    for (const defect of existingDefects) {
      const match = defect.defectId.match(defectNumberPattern);
      if (match) {
        const number = parseInt(match[1], 10);
        if (number >= nextDefectIdNumber) {
          nextDefectIdNumber = number + 1;
        }
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
        const defectId = this.getRowValue(row, 'defectId');
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

        // Find assignee by name or email (optional field)
        let assignedToId: string | undefined;
        
        if (assignedTo && typeof assignedTo === 'string' && assignedTo.toString().trim() !== '') {
          const assignedToValue = assignedTo.toString().trim();
          // Try to find by email first, then by name
          const projectMember = project.members.find(
            (m) => 
              m.user.email.toLowerCase() === assignedToValue.toLowerCase() ||
              m.user.name?.toLowerCase() === assignedToValue.toLowerCase()
          );

          if (!projectMember) {
            throw new Error(
              `User "${assignedToValue}" not found in project members. Please provide a valid name or email of a project member, or leave empty if unassigned.`
            );
          }

          assignedToId = projectMember.userId;
        }

        // Parse due date
        let dueDateValue: Date | undefined;
        if (dueDate && typeof dueDate === 'string') {
          const parsedDate = new Date(dueDate);
          if (!isNaN(parsedDate.getTime())) {
            dueDateValue = parsedDate;
          }
        }

        // Prepare defectId - will be validated and used/auto-generated by defectService
        // Accept any value, preserve original case (case-sensitive matching)
        const providedDefectId = defectId && typeof defectId === 'string' && defectId.toString().trim()
          ? defectId.toString().trim() // Preserve original case
          : null;

        // Check if defect ID already exists (for better error message during import)
        if (providedDefectId && existingDefectIds.has(providedDefectId)) {
          const existingDefect = await prisma.defect.findFirst({
            where: {
              projectId,
              defectId: providedDefectId,
            },
            select: { title: true },
          });
          const existingTitle = existingDefect?.title || 'Unknown';
          result.skipped++;
          result.skippedItems.push({
            row: rowNumber,
            title: defectTitle,
            reason: `Defect ID already exists: ${providedDefectId} (Existing: "${existingTitle}")`,
          });
          continue;
        }

        // Create defect using defectService to trigger auto-linking with test cases
        // defectService will validate format, check uniqueness, and auto-generate if needed
        const defect = await defectService.createDefect({
          defectId: providedDefectId, // null if not provided, will be auto-generated
          projectId,
          title: title.toString().trim(),
          description: description
            ? description.toString().trim()
            : null,
          severity: severityValue,
          priority: priorityValue,
          status: statusValue,
          assignedToId: assignedToId || null,
          environment: environmentValue || null,
          dueDate: dueDateValue ? dueDateValue.toISOString() : null,
          createdById,
        });

        // Track the created defect ID for uniqueness check in subsequent rows
        existingDefectIds.add(defect.defectId);
        
        // Update nextDefectIdNumber if the created defect is in DEF-X format
        const match = defect.defectId.match(/^DEF-(\d+)$/);
        if (match) {
          const number = parseInt(match[1], 10);
          if (number >= nextDefectIdNumber) {
            nextDefectIdNumber = number + 1;
          }
        }

        // If reportedDate is provided, update the createdAt timestamp
        if (createdAtValue) {
          await prisma.defect.update({
            where: { id: defect.id },
            data: { createdAt: createdAtValue },
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

