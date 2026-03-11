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
   * _2, _3 等の重複サフィックスを除去（Excel等で全列に _2 が付く場合に対応）
   */
  private normalizeColumnName(columnName: string): string {
    const base = columnName.trim().replace(/_[0-9]+$/, '');
    const normalized = base.toLowerCase();
    
    // Map export format column names to import format
    const columnMap: Record<string, string> = {
      // 日本語列名（CSV/画面）
      'テストケースid': 'testCaseId',
      'テストケース名': 'title',
      'モジュール・機能': 'module',
      '優先度': 'priority',
      '前提条件': 'preconditions',
      'テスト手順': 'testSteps',
      'テストデータ': 'testData',
      '期待結果': 'expectedResult',
      '状態': 'status',
      '不具合id': 'defectId',
      '説明': 'description',
      'テスト実行時間（秒）': 'estimatedTime',
      '事後条件': 'postconditions',
      'テストスイート': 'testsuite',
      // English (backward compatibility)
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
      'defect id': 'defectId',
      'defectid': 'defectId',
      'defect': 'defectId',
      'description': 'description',
      'estimated time (minutes)': 'estimatedTime',
      'estimated time': 'estimatedTime',
      'postconditions': 'postconditions',
      'test suites': 'testsuite',
      'testsuite': 'testsuite',
      'test suite': 'testsuite',
      // New test case fields for enhanced test case management
      'rtc-id': 'rtcId',
      'rtc id': 'rtcId',
      'rtcid': 'rtcId',
      'flow-id': 'flowId',
      'flow id': 'flowId',
      'flowid': 'flowId',
      'layer': 'layer',
      '根拠': 'evidence',
      '根拠（ドキュメント）': 'evidence',
      '根拠コード': 'evidence',
      'evidence': 'evidence',
      '備考': 'notes',
      'notes': 'notes',
      '端末': 'device',
      'device': 'device',
      'プラットフォーム': 'platform',
      'platform': 'platform',
      'ドメイン': 'domain',
      'domain': 'domain',
      '機能': 'functionName',
      'functionname': 'functionName',
      'function name': 'functionName',
      '実行方式': 'executionType',
      'executiontype': 'executionType',
      'execution type': 'executionType',
      '自動化状況': 'automationStatus',
      'automationstatus': 'automationStatus',
      'automation status': 'automationStatus',
      // Test Type (テスト種別)
      'テスト種別': 'testType',
      'test type': 'testType',
      'testtype': 'testType',
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
    data: ParsedRow[],
    options?: { updateExisting?: boolean }
  ): Promise<MigrationResult> {
    switch (type) {
      case 'testcases':
        return this.importTestCases(projectId, userId, data, options?.updateExisting ?? false);
      case 'defects':
        return this.importDefects(projectId, userId, data);
      default:
        throw new ValidationException(`Unsupported import type: ${type}`);
    }
  }

  /**
   * Import test cases from parsed data
   * @param updateExisting - 同一タイトルの既存テストケースをスキップせず更新する
   */
  private async importTestCases(
    projectId: string,
    userId: string,
    data: ParsedRow[],
    updateExisting: boolean = false
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

    // インポートデータのステータスを正規化（他システムの値 → 有効な値）
    const statusAliasToCanonical: Record<string, string> = {
      ACTIVE_IOS: 'ACTIVE',
      ACTIVE_ANDROID: 'ACTIVE',
      ACTIVE_WEB: 'ACTIVE',
    };

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
        // テストスイート列: 正規化キーで取得、なければ日本語/英語ヘッダ名で取得
        const testsuiteRaw =
          this.getRowValue(row, 'testsuite') ??
          (row as Record<string, unknown>)['テストスイート'] ??
          (row as Record<string, unknown>)['Test Suites'] ??
          (row as Record<string, unknown>)['Test Suite'];
        const testsuite =
          testsuiteRaw !== undefined && testsuiteRaw !== null && String(testsuiteRaw).trim() !== ''
            ? String(testsuiteRaw).trim()
            : null;
        const testSteps = this.getRowValue(row, 'testSteps');
        const testData = this.getRowValue(row, 'testData');
        const defectId = this.getRowValue(row, 'defectId');
        // New fields for enhanced test case management
        const rtcId = this.getRowValue(row, 'rtcId');
        const flowId = this.getRowValue(row, 'flowId');
        const layer = this.getRowValue(row, 'layer');
        const evidence = this.getRowValue(row, 'evidence');
        const notes = this.getRowValue(row, 'notes');
        const testType = this.getRowValue(row, 'testType');
        const device = this.getRowValue(row, 'device');
        const platformCol = this.getRowValue(row, 'platform');
        const domainCol = this.getRowValue(row, 'domain');
        const functionNameCol = this.getRowValue(row, 'functionName');
        const executionTypeCol = this.getRowValue(row, 'executionType');
        const automationStatusCol = this.getRowValue(row, 'automationStatus');

        // 必須: テストケース名
        let testCaseTitle: string;
        if (title && typeof title === 'string' && title.toString().trim() !== '') {
          testCaseTitle = title.toString().trim();
        } else {
          throw new Error('必須列「テストケース名」がありません。');
        }

        // RTC-ID の文字列（既存テストケース判定に使用）
        const rtcIdStr =
          rtcId != null && typeof rtcId === 'string' && rtcId.toString().trim() !== ''
            ? rtcId.toString().trim()
            : null;

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

        // 既存テストケースの判定:
        // RTC-ID があれば RTC-ID 優先、なければタイトルで照合。
        // ただし suite が異なる場合は別テストケースとして扱い、既存を上書きしない。
        let existingTestCase: {
          id: string;
          tcId: string;
          suiteId: string | null;
          testCaseSuites: Array<{ testSuiteId: string }>;
        } | null = null;
        if (rtcIdStr) {
          existingTestCase = await prisma.testCase.findFirst({
            where: { projectId, rtcId: rtcIdStr },
            select: {
              id: true,
              tcId: true,
              suiteId: true,
              testCaseSuites: {
                select: { testSuiteId: true },
              },
            },
          });
        } else {
          existingTestCase = await prisma.testCase.findFirst({
            where: {
              projectId,
              title: { equals: testCaseTitle, mode: 'insensitive' },
            },
            select: {
              id: true,
              tcId: true,
              suiteId: true,
              testCaseSuites: {
                select: { testSuiteId: true },
              },
            },
          });
        }

        // Different suite should not overwrite existing test case.
        if (existingTestCase && suiteId) {
          const inTargetSuite =
            existingTestCase.suiteId === suiteId ||
            existingTestCase.testCaseSuites.some((tcs) => tcs.testSuiteId === suiteId);
          if (!inTargetSuite) {
            existingTestCase = null;
          }
        }

        let existingTestCaseToUpdate: { id: string; tcId: string } | null = null;
        if (existingTestCase) {
          if (updateExisting) {
            existingTestCaseToUpdate = { id: existingTestCase.id, tcId: existingTestCase.tcId };
          } else {
            result.skipped++;
            result.skippedItems.push({
              row: rowNumber,
              title: testCaseTitle,
              reason: `Already exists (${existingTestCase.tcId})`,
            });
            continue; // Skip this row
          }
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

        // Validate status（エイリアスを正規化: ACTIVE_iOS 等 → ACTIVE）
        let statusValue = status ? status.toString().toUpperCase() : 'ACTIVE';
        if (!validStatuses.has(statusValue)) {
          const normalized = statusAliasToCanonical[statusValue];
          if (normalized && validStatuses.has(normalized)) {
            statusValue = normalized;
          } else {
            throw new Error(
              `Invalid status: ${status}. Valid values are: ${Array.from(validStatuses).join(', ')}`
            );
          }
        }

        // Parse estimated time
        let estimatedTimeValue: number | undefined;
        if (estimatedTime) {
          const parsed = parseInt(estimatedTime.toString(), 10);
          if (!isNaN(parsed) && parsed > 0) {
            estimatedTimeValue = parsed;
          }
        }

        // Parse expected results with step number mapping to maintain 1-to-1 correspondence
        // Format: "1. Result1\n2. Result2\n3. " (step 3 has empty result)
        // This maintains the correspondence between step numbers and expected results
        const expectedResultsByStepNumber = new Map<number, string>();
        let singleExpectedResult: string | null = null;

        if (expectedResult && typeof expectedResult === 'string' && expectedResult.toString().trim()) {
          const expectedResultText = expectedResult.toString().trim();

          // Check if it contains numbered points (1., 2., etc.) or newlines
          const hasNumberedPoints = /\d+\./.test(expectedResultText);
          const hasNewlines = expectedResultText.includes('\n');

          if (hasNewlines || hasNumberedPoints) {
            // Format with step numbers: "1. Result1\n2. Result2\n3. "
            // Split by newlines and parse each line
            const lines = expectedResultText.split('\n');

            for (const line of lines) {
              const trimmedLine = line.trim();
              if (!trimmedLine) continue;

              // Try to extract step number and result: "1. Result text"
              const match = trimmedLine.match(/^(\d+)\.\s*(.*)$/);
              if (match) {
                const stepNumber = parseInt(match[1], 10);
                const result = match[2].trim();
                // Store even empty results to maintain correspondence
                expectedResultsByStepNumber.set(stepNumber, result);
              } else if (!hasNumberedPoints) {
                // Line without number - treat as content for next step
                // This handles cases where results are just newline-separated without numbers
                const stepNumber = expectedResultsByStepNumber.size + 1;
                expectedResultsByStepNumber.set(stepNumber, trimmedLine);
              }
            }

            // If no numbered results were found but we have text, treat as single result
            if (expectedResultsByStepNumber.size === 0 && expectedResultText) {
              singleExpectedResult = expectedResultText;
            }
          } else {
            // No newlines and no numbering - single expected result for all steps
            singleExpectedResult = expectedResultText;
          }
        }

        // Parse test steps if provided
        // Also handle case where Expected Result column has values but Test Steps is empty
        let testStepsData: Array<{ stepNumber: number; action: string; expectedResult: string }> | undefined;

        // If Test Steps is empty but Expected Result has values, create steps from expected results
        if (!testSteps && (expectedResultsByStepNumber.size > 0 || singleExpectedResult)) {
          if (expectedResultsByStepNumber.size > 0) {
            // Create steps from numbered expected results
            testStepsData = Array.from(expectedResultsByStepNumber.entries())
              .sort((a, b) => a[0] - b[0]) // Sort by step number
              .map(([stepNumber, result]) => ({
                stepNumber,
                action: '', // No action, only expected result
                expectedResult: result,
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
                  const stepNumber = step.stepNumber || (typeof step === 'object' && step !== null ? index + 1 : index + 1);
                  const stepAction = (typeof step === 'object' && step !== null)
                    ? (step.action || step.step || '')
                    : String(step);
                  const stepExpectedResult = (typeof step === 'object' && step !== null)
                    ? (step.expectedResult || step.expected || '')
                    : '';
                  // Use Expected Result column by step number if step doesn't have expected result
                  const finalExpectedResult = stepExpectedResult
                    || expectedResultsByStepNumber.get(stepNumber)
                    || singleExpectedResult
                    || '';

                  return {
                    stepNumber,
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
                      const stepNumber = step.stepNumber || index + 1;
                      const stepAction = step.action || step.step || '';
                      const stepExpectedResult = step.expectedResult || step.expected || '';
                      // Use Expected Result column by step number if step doesn't have expected result
                      const finalExpectedResult = stepExpectedResult
                        || expectedResultsByStepNumber.get(stepNumber)
                        || singleExpectedResult
                        || '';

                      return {
                        stepNumber,
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

                    // Extract step number if numbered, otherwise use index + 1
                    let stepNumber = index + 1;
                    let action = line;

                    if (isNumbered) {
                      const match = line.match(/^(\d+)\.\s*(.*)$/);
                      if (match) {
                        stepNumber = parseInt(match[1], 10);
                        action = match[2].trim();
                      } else {
                        action = line.replace(/^\d+\.\s*/, '').trim();
                      }
                    }

                    // Remove expected result from action if it's separated by semicolon or colon
                    // We only want the action, expected result comes from Expected Result column
                    const parts = action.split(/[;:]/).map(p => p.trim()).filter(p => p);
                    action = parts[0] || action; // Take only the action part (before semicolon/colon)

                    // Get expected result from Expected Result column by step number
                    const expectedResultValue = expectedResultsByStepNumber.get(stepNumber) || singleExpectedResult || '';

                    // If action is empty but expected result exists, use expected result as the content
                    // If expected result is empty but action exists, use action only
                    const finalAction = action || '';
                    const finalExpectedResult = expectedResultValue || '';

                    return {
                      stepNumber,
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

                      // Extract step number if numbered, otherwise use index + 1
                      let stepNumber = index + 1;
                      let cleanLine = line;

                      if (isNumbered) {
                        const match = line.match(/^(\d+)\.\s*(.*)$/);
                        if (match) {
                          stepNumber = parseInt(match[1], 10);
                          cleanLine = match[2].trim();
                        } else {
                          cleanLine = line.replace(/^\d+\.\s*/, '').trim();
                        }
                      }

                      // Remove expected result from action if it's separated by semicolon or colon
                      // We only want the action, expected result comes from Expected Result column
                      const parts = cleanLine.split(/[;:]/).map(p => p.trim()).filter(p => p);
                      cleanLine = parts[0] || cleanLine; // Take only the action part (before semicolon/colon)

                      // Get expected result from Expected Result column by step number
                      const expectedResultValue = expectedResultsByStepNumber.get(stepNumber) || singleExpectedResult || '';

                      // If action is empty but expected result exists, use expected result as the content
                      // If expected result is empty but action exists, use action only
                      const finalAction = cleanLine || '';
                      const finalExpectedResult = expectedResultValue || '';

                      return {
                        stepNumber,
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

        // Parse new fields for enhanced test case management
        // RTC-ID, Flow-ID (strings)
        const rtcIdValue = rtcId && typeof rtcId === 'string' && rtcId.toString().trim()
          ? rtcId.toString().trim()
          : null;
        const flowIdValue = flowId && typeof flowId === 'string' && flowId.toString().trim()
          ? flowId.toString().trim()
          : null;

        // Layer (convert to uppercase: "Smoke" -> "SMOKE", unknown values default to "UNKNOWN")
        let layerValue: 'SMOKE' | 'CORE' | 'EXTENDED' | 'UNKNOWN' = 'UNKNOWN';
        if (layer && typeof layer === 'string' && layer.toString().trim()) {
          const layerUpper = layer.toString().trim().toUpperCase();
          if (layerUpper === 'SMOKE' || layerUpper === 'CORE' || layerUpper === 'EXTENDED' || layerUpper === 'UNKNOWN') {
            layerValue = layerUpper as 'SMOKE' | 'CORE' | 'EXTENDED' | 'UNKNOWN';
          } else {
            // Try to map common variations, default to UNKNOWN if not found
            const layerMap: Record<string, 'SMOKE' | 'CORE' | 'EXTENDED' | 'UNKNOWN'> = {
              'SMOKE': 'SMOKE',
              'CORE': 'CORE',
              'EXTENDED': 'EXTENDED',
              'UNKNOWN': 'UNKNOWN',
            };
            layerValue = layerMap[layerUpper] || 'UNKNOWN';
          }
        }

        // Evidence (根拠コード)
        const evidenceValue = evidence && typeof evidence === 'string' && evidence.toString().trim()
          ? evidence.toString().trim()
          : null;

        // Notes (備考)
        const notesValue = notes && typeof notes === 'string' && notes.toString().trim()
          ? notes.toString().trim()
          : null;

        // Test Type (テスト種別) - preserve Japanese labels, normalize English to Japanese
        let testTypeValue: string | null = null;
        if (testType && typeof testType === 'string' && testType.toString().trim()) {
          const testTypeStr = testType.toString().trim();
          const testTypeUpper = testTypeStr.toUpperCase();
          
          // Map to Japanese labels (CSV の日本語値はそのまま保持)
          const testTypeMap: Record<string, string> = {
            // English values → Japanese labels
            'NORMAL': '正常系',
            'ABNORMAL': '異常系',
            'NON_FUNCTIONAL': '非機能',
            'NONFUNCTIONAL': '非機能',
            'NON-FUNCTIONAL': '非機能',
            'REGRESSION': '回帰',
            'DATA_INTEGRITY': 'データ整合性確認',
            'DATAINTEGRITY': 'データ整合性確認',
            'DATA-INTEGRITY': 'データ整合性確認',
            'STATE_TRANSITION': '状態遷移確認',
            'STATETRANSITION': '状態遷移確認',
            'STATE-TRANSITION': '状態遷移確認',
            'OPERATIONAL': '運用確認',
            'FAILURE': '障害時確認',
            // Japanese labels → そのまま保持
            '正常系': '正常系',
            '異常系': '異常系',
            '非機能': '非機能',
            '回帰': '回帰',
            'データ整合性確認': 'データ整合性確認',
            '状態遷移確認': '状態遷移確認',
            '運用確認': '運用確認',
            '障害時確認': '障害時確認',
          };
          
          // Try direct match first (English uppercase)
          if (testTypeMap[testTypeUpper]) {
            testTypeValue = testTypeMap[testTypeUpper];
          } else if (testTypeMap[testTypeStr]) {
            // Try original case for Japanese labels
            testTypeValue = testTypeMap[testTypeStr];
          }
          // If no match found, leave as null (don't import invalid values)
        }

        // Device (端末) - iPhone, Android, PC
        let deviceValue: 'iPhone' | 'Android' | 'PC' | null = null;
        if (device != null && typeof device === 'string' && device.toString().trim()) {
          const deviceStr = device.toString().trim();
          const deviceLower = deviceStr.toLowerCase();
          if (deviceLower === 'iphone' || deviceStr === 'iPhone') deviceValue = 'iPhone';
          else if (deviceLower === 'android' || deviceStr === 'Android') deviceValue = 'Android';
          else if (deviceLower === 'pc' || deviceStr === 'PC') deviceValue = 'PC';
        }

        // Platform (プラットフォーム) - single: Web, Web(SP), iOS Native, Android Native
        let platformValue: 'Web' | 'Web(SP)' | 'iOS Native' | 'Android Native' | null = null;
        if (platformCol != null && typeof platformCol === 'string' && platformCol.toString().trim()) {
          const platformStr = platformCol.toString().trim();
          const platformLower = platformStr.toLowerCase();
          if (platformLower === 'web(sp)' || platformStr === 'Web(SP)' || platformLower === 'web (sp)') platformValue = 'Web(SP)';
          else if (platformLower === 'ios native' || platformStr === 'iOS Native' || platformLower === 'ios') platformValue = 'iOS Native';
          else if (platformLower === 'android native' || platformStr === 'Android Native' || platformLower === 'android') platformValue = 'Android Native';
          else if (platformLower === 'web' || platformStr === 'Web') platformValue = 'Web';
        }

        // Domain (ドメイン) and Function (機能) - free text
        console.log(`[Import Row ${rowNumber}] domainCol raw:`, JSON.stringify(domainCol), `type: ${typeof domainCol}`);
        console.log(`[Import Row ${rowNumber}] functionNameCol raw:`, JSON.stringify(functionNameCol), `type: ${typeof functionNameCol}`);
        console.log(`[Import Row ${rowNumber}] Row keys:`, Object.keys(row).join(', '));
        const domainValue = domainCol != null && String(domainCol).trim()
          ? String(domainCol).trim()
          : null;
        const functionNameValue = functionNameCol != null && String(functionNameCol).trim()
          ? String(functionNameCol).trim()
          : null;
        console.log(`[Import Row ${rowNumber}] domainValue:`, JSON.stringify(domainValue), `functionNameValue:`, JSON.stringify(functionNameValue));

        // 実行方式: 手動 / 自動
        let executionTypeValue: '手動' | '自動' | null = null;
        if (executionTypeCol != null && typeof executionTypeCol === 'string' && executionTypeCol.toString().trim()) {
          const s = executionTypeCol.toString().trim();
          if (s === '手動') executionTypeValue = '手動';
          else if (s === '自動') executionTypeValue = '自動';
        }
        // 自動化状況: 自動化済 / 自動化対象 / 自動化対象外 / 検討中
        let automationStatusValue: '自動化済' | '自動化対象' | '自動化対象外' | '検討中' | null = null;
        if (automationStatusCol != null && typeof automationStatusCol === 'string' && automationStatusCol.toString().trim()) {
          const s = automationStatusCol.toString().trim();
          if (s === '自動化済') automationStatusValue = '自動化済';
          else if (s === '自動化対象') automationStatusValue = '自動化対象';
          else if (s === '自動化対象外') automationStatusValue = '自動化対象外';
          else if (s === '検討中') automationStatusValue = '検討中';
        }

        // Determine the expected result value to use for the test case
        // If there are no test steps, use the parsed expected result (singleExpectedResult) or original value
        // If there are test steps with individual expected results, only set test case level if single value
        let finalExpectedResult: string | null = null;
        if (!testStepsData || testStepsData.length === 0) {
          // No test steps - use the parsed expected result if available, otherwise use original value
          finalExpectedResult = singleExpectedResult || (expectedResult && typeof expectedResult === 'string' && expectedResult.toString().trim() ? expectedResult.toString().trim() : null);
        } else {
          // Has test steps - check if multiple expected results were parsed
          if (expectedResultsByStepNumber.size > 1) {
            // Multiple expected results assigned to steps - don't set test case level expectedResult
            // to avoid overwriting first step's individual expected result in the UI
            finalExpectedResult = null;
          } else if (expectedResultsByStepNumber.size === 1) {
            // Single expected result mapped to a specific step - don't set test case level
            // to avoid duplication (the step already has the expected result)
            finalExpectedResult = null;
          } else if (singleExpectedResult) {
            // Single expected result applied to all steps - use it for test case level
            finalExpectedResult = singleExpectedResult;
          } else {
            // No expected results parsed - use original value if provided
            finalExpectedResult = expectedResult && typeof expectedResult === 'string' && expectedResult.toString().trim() ? expectedResult.toString().trim() : null;
          }
        }

        const filteredSteps =
          testStepsData && testStepsData.length > 0
            ? testStepsData
                .filter((step) => (step.action && step.action.trim()) || (step.expectedResult && step.expectedResult.trim()))
                .map((step) => ({
                  stepNumber: step.stepNumber,
                  action: step.action && step.action.trim() ? step.action.trim() : '',
                  expectedResult: step.expectedResult && step.expectedResult.trim() ? step.expectedResult.trim() : '',
                }))
            : [];

        // DB の一意制約 (testCaseId, stepNumber) に抵触しないよう、
        // 取り込み時は空行除去後の順序で手順番号を連番に正規化する
        const normalizedSteps = filteredSteps.map((step, index) => ({
          stepNumber: index + 1,
          action: step.action,
          expectedResult: step.expectedResult,
        }));

        const baseUpdateData = {
          title: testCaseTitle,
          description: description ? description.toString().trim() : null,
          expectedResult: finalExpectedResult,
          priority: priorityValue,
          status: statusValue,
          estimatedTime: estimatedTimeValue,
          preconditions: preconditions ? preconditions.toString().trim() : null,
          postconditions: postconditions ? postconditions.toString().trim() : null,
          testData: testDataValue,
          pendingDefectIds: pendingDefectIds.length > 0 ? pendingDefectIds.join(', ') : null,
          moduleId: moduleId ?? null,
          suiteId: suiteId ?? null,
          rtcId: rtcIdValue,
          flowId: flowIdValue,
          layer: layerValue,
          testType: testTypeValue,
          evidence: evidenceValue,
          notes: notesValue,
          domain: domainValue,
          functionName: functionNameValue,
        };
        const extendedUpdateData = {
          platform: platformValue,
          device: deviceValue,
          executionType: executionTypeValue,
          automationStatus: automationStatusValue,
        };

        if (existingTestCaseToUpdate) {
          try {
            await prisma.testCase.update({
              where: { id: existingTestCaseToUpdate.id },
              data: { ...baseUpdateData, ...extendedUpdateData },
            });
          } catch (extendedErr) {
            const errMsg = extendedErr instanceof Error ? extendedErr.message : '';
            console.warn(`Failed to update test case with extended fields:`, errMsg);
            if (errMsg.includes('Unknown argument')) {
              console.warn('Retrying update without extended fields...');
              await prisma.testCase.update({
                where: { id: existingTestCaseToUpdate.id },
                data: baseUpdateData,
              });
            } else {
              throw extendedErr;
            }
          }
          await prisma.testStep.deleteMany({ where: { testCaseId: existingTestCaseToUpdate.id } });
          if (normalizedSteps.length > 0) {
            await prisma.testStep.createMany({
              data: normalizedSteps.map((step) => ({
                testCaseId: existingTestCaseToUpdate!.id,
                stepNumber: step.stepNumber,
                action: step.action,
                expectedResult: step.expectedResult,
              })),
            });
          }
          if (suiteId) {
            await prisma.testCaseSuite.createMany({
              data: [{ testCaseId: existingTestCaseToUpdate.id, testSuiteId: suiteId }],
              skipDuplicates: true,
            });
          }
          for (const defect of defectsToLink) {
            try {
              await prisma.testCaseDefect.create({
                data: { testCaseId: existingTestCaseToUpdate.id, defectId: defect.id },
              });
            } catch {
              // already linked
            }
          }
          result.success++;
          result.imported.push({ tcId: existingTestCaseToUpdate.tcId, title: testCaseTitle });
        } else {
          let tcId = `TC-${nextTcIdNumber}`;
          while (existingTcIds.has(tcId)) {
            nextTcIdNumber++;
            tcId = `TC-${nextTcIdNumber}`;
          }
          nextTcIdNumber++;
          existingTcIds.add(tcId);

          // Create test case
          const baseCreateData = {
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
            rtcId: rtcIdValue,
            flowId: flowIdValue,
            layer: layerValue,
            testType: testTypeValue,
            evidence: evidenceValue,
            notes: notesValue,
            domain: domainValue,
            functionName: functionNameValue,
            steps: normalizedSteps.length > 0 ? { create: normalizedSteps } : undefined,
          };
          // platform, device 等は Prisma クライアントが未対応の環境で
          // Unknown argument エラーになるため、まず基本フィールドのみで作成し、
          // 続けて update で拡張フィールドを反映する（両方とも Unknown argument 時はスキップ）
          const testCase = await prisma.testCase.create({ data: baseCreateData });

          const extendedUpdateData = {
            platform: platformValue,
            device: deviceValue,
            executionType: executionTypeValue,
            automationStatus: automationStatusValue,
          };
          const hasExtended = Object.values(extendedUpdateData).some((v) => v != null);
          if (hasExtended) {
            try {
              await prisma.testCase.update({
                where: { id: testCase.id },
                data: extendedUpdateData,
              });
              console.log(`[Import Row ${rowNumber}] Extended fields updated successfully for test case ${testCase.id}`);
            } catch (updateErr) {
              console.error(`[Import Row ${rowNumber}] Failed to update extended fields for test case ${testCase.id}:`, updateErr);
            }
          }

          if (suiteId) {
            await prisma.testCaseSuite.create({
              data: { testCaseId: testCase.id, testSuiteId: suiteId },
            });
          }

          if (defectsToLink.length > 0) {
            for (const defect of defectsToLink) {
              try {
                await prisma.testCaseDefect.create({
                  data: { testCaseId: testCase.id, defectId: defect.id },
                });
              } catch {
                console.warn(`Defect ${defect.defectId} (${defect.id}) already linked to test case ${testCase.id}`);
              }
            }
          }

          result.success++;
          result.imported.push({ tcId: testCase.tcId, title: testCase.title });
        }
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

    // Cleanup: Delete modules that have no test cases
    try {
      const emptyModules = await prisma.module.findMany({
        where: {
          projectId,
          testCases: { none: {} },
        },
        select: { id: true, name: true },
      });

      if (emptyModules.length > 0) {
        await prisma.module.deleteMany({
          where: {
            id: { in: emptyModules.map((m) => m.id) },
          },
        });
        console.log(`[Import] Deleted ${emptyModules.length} empty module(s):`, emptyModules.map((m) => m.name));
      }
    } catch (error) {
      console.warn('[Import] Failed to clean up empty modules:', error instanceof Error ? error.message : error);
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

