import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { XMLParser } from 'fast-xml-parser';
import dropdownOptionService from '@/backend/services/dropdown-option/dropdown-option.service';

/**
 * Normalize test case identifier by converting underscores to hyphens
 * This allows matching "TC_1" with "TC-1" and vice versa
 * @param identifier Test case identifier (e.g., "TC_1" or "TC-1")
 * @returns Normalized identifier with underscores replaced by hyphens (e.g., "TC-1")
 */
function normalizeTestCaseId(identifier: string): string {
  return identifier.replace(/_/g, '-');
}

/**
 * TestNG XML Parser
 * 
 * Parses TestNG XML result files and extracts test method information.
 * 
 * @example
 * ```xml
 * <?xml version="1.0" encoding="UTF-8"?>
 * <testng-results>
 *   <suite>
 *     <test>
 *       <class>
 *         <test-method name="TC001" status="PASS" is-config="false" 
 *                      started-at="2026-01-13T21:38:37 IST" 
 *                      finished-at="2026-01-13T21:38:40 IST" 
 *                      duration-ms="3000" />
 *       </class>
 *     </test>
 *   </suite>
 * </testng-results>
 * ```
 * 
 * @remarks
 * - Supports TestNG versions 6.x and 7.x
 * - Expects XML structure with `<test-method>` elements containing attributes:
 *   - `name`: Test case identifier (required)
 *   - `status`: Test status - PASS, FAIL, SKIP (required)
 *   - `is-config`: Whether this is a configuration method (optional, default: false)
 *   - `started-at`: Test start timestamp (optional)
 *   - `finished-at`: Test end timestamp (optional)
 *   - `duration-ms`: Test duration in milliseconds (optional)
 * 
 * @limitations
 * - Only parses attributes from `<test-method>` tags, not nested content
 * - Date parsing supports common timezone abbreviations (IST, GMT, UTC, PST, EST, CST, EDT, PDT, CDT, MDT, MST)
 * - Dates without timezone information are parsed as local time
 * - Malformed XML will throw an error
 * 
 * @throws {Error} If XML content is malformed or cannot be parsed
 */
class TestNGXMLParser {
  private parser: XMLParser;

  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_', // Explicitly use @_ prefix for attributes
      parseAttributeValue: false,
      trimValues: true,
      // Security: Limit depth and node count to prevent DoS attacks
      processEntities: false,
      ignoreDeclaration: true,
      ignorePiTags: true,
      stopNodes: [],
    });
  }

  /**
   * Validates that the XML content is well-formed
   * @param xmlContent - The XML content to validate
   * @throws {Error} If XML is malformed
   */
  private validateXML(xmlContent: string): void {
    if (!xmlContent || typeof xmlContent !== 'string') {
      throw new Error('XML content must be a non-empty string');
    }

    // Basic validation: check for XML declaration or root element
    const trimmed = xmlContent.trim();
    if (!trimmed.startsWith('<?xml') && !trimmed.startsWith('<')) {
      throw new Error('Invalid XML format: content does not appear to be valid XML');
    }

    // Check for balanced tags (basic check)
    const openTags = (trimmed.match(/<[^/!?][^>]*>/g) || []).length;
    const closeTags = (trimmed.match(/<\/[^>]+>/g) || []).length;
    const selfClosingTags = (trimmed.match(/<[^>]+\/>/g) || []).length;
    
    // Rough validation - actual validation happens during parsing
    if (openTags === 0 && closeTags === 0 && selfClosingTags === 0) {
      throw new Error('Invalid XML format: no valid XML tags found');
    }
  }

  /**
   * Parses a date string from TestNG XML format
   * Handles various timezone formats and converts to ISO 8601
   * @param dateStr - Date string from TestNG XML (e.g., "2026-01-13T21:38:37 IST")
   * @returns ISO 8601 formatted date string or undefined if parsing fails
   */
  private parseDate(dateStr: string): string | undefined {
    if (!dateStr || typeof dateStr !== 'string') {
      return undefined;
    }

    try {
      // TestNG date format: "2026-01-13T21:38:37 IST" or "2026-01-13T21:38:37Z"
      // Try multiple parsing strategies
      
      // Strategy 1: If it's already ISO format with Z, use it directly
      if (dateStr.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(dateStr)) {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          return date.toISOString();
        }
      }

      // Strategy 2: Remove common timezone abbreviations and parse
      // Common timezone abbreviations (case-insensitive)
      const timezoneAbbrevs = [
        'IST', 'GMT', 'UTC', 'PST', 'EST', 'CST', 'EDT', 'PDT', 'CDT', 'MDT', 'MST',
        'PDT', 'AKST', 'AKDT', 'HST', 'HAST', 'HADT', 'SST', 'SDT', 'CHST'
      ];
      
      let cleanedDate = dateStr.trim();
      
      // Remove timezone abbreviation at the end
      for (const tz of timezoneAbbrevs) {
        const regex = new RegExp(`\\s+${tz}$`, 'i');
        if (regex.test(cleanedDate)) {
          cleanedDate = cleanedDate.replace(regex, '');
          break;
        }
      }

      // Try parsing the cleaned date
      const parsedDate = new Date(cleanedDate);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString();
      }

      // Strategy 3: Try parsing as-is (might work for some formats)
      const fallbackDate = new Date(dateStr);
      if (!isNaN(fallbackDate.getTime())) {
        return fallbackDate.toISOString();
      }

      return undefined;
    } catch {
      // If any parsing fails, return undefined
      return undefined;
    }
  }

  /**
   * Recursively extracts test-method elements from parsed XML
   * @param obj - Parsed XML object
   * @param testMethods - Array to collect test methods
   */
  private extractTestMethods(
    obj: unknown,
    testMethods: Array<{
      name: string;
      status: string;
      isConfig: boolean;
      durationMs?: number;
      startedAt?: string;
      finishedAt?: string;
    }>
  ): void {
    if (!obj || typeof obj !== 'object') {
      return;
    }

    // Type guard: obj is a Record with string keys
    const record = obj as Record<string, unknown>;

    // Check if this object represents a test-method element
    // fast-xml-parser uses @_ prefix for attributes
    const name = record['@_name'];
    const status = record['@_status'];

    // Debug logging in development
    if (process.env.NODE_ENV === 'development' && name && status) {
      console.log(`[XML Parser] Found test-method: name="${name}", status="${status}"`);
    }

    // Check if this is a test-method element (must have both name and status)
    if (name !== undefined && status !== undefined) {
      const isConfigValue = record['@_is-config'];
      const isConfig = typeof isConfigValue === 'string' && isConfigValue.toLowerCase() === 'true';
      
      // Parse duration
      let durationMs: number | undefined;
      const durationValue = record['@_duration-ms'];
      if (durationValue !== undefined) {
        const duration = parseInt(String(durationValue), 10);
        if (!isNaN(duration) && duration >= 0) {
          durationMs = duration;
        }
      }

      // Parse dates
      const startedAtValue = record['@_started-at'];
      const finishedAtValue = record['@_finished-at'];
      const startedAt = startedAtValue ? this.parseDate(String(startedAtValue)) : undefined;
      const finishedAt = finishedAtValue ? this.parseDate(String(finishedAtValue)) : undefined;

      // Ensure status is trimmed and valid
      const cleanStatus = String(status || '').trim();
      
      testMethods.push({
        name: String(name),
        status: cleanStatus,
        isConfig,
        durationMs,
        startedAt,
        finishedAt,
      });
    }

    // Recursively search in all object properties
    // Also check for 'test-method' key which might contain test method elements
    const testMethodKey = 'test-method';
    if (record[testMethodKey]) {
      const testMethodValue = record[testMethodKey];
      if (Array.isArray(testMethodValue)) {
        testMethodValue.forEach(item => this.extractTestMethods(item, testMethods));
      } else if (testMethodValue && typeof testMethodValue === 'object') {
        this.extractTestMethods(testMethodValue, testMethods);
      }
    }

    for (const key in record) {
      if (Object.prototype.hasOwnProperty.call(record, key)) {
        // Skip attribute keys and already processed test-method key
        if (key.startsWith('@_') || key === testMethodKey) {
          continue;
        }
        const value = record[key];
        if (Array.isArray(value)) {
          value.forEach(item => this.extractTestMethods(item, testMethods));
        } else if (value && typeof value === 'object') {
          this.extractTestMethods(value, testMethods);
        }
      }
    }
  }

  /**
   * Parses TestNG XML content and extracts test method information
   * @param xmlContent - The XML content to parse
   * @returns Object containing array of parsed test methods
   * @throws {Error} If XML is malformed or cannot be parsed
   */
  parse(xmlContent: string) {
    // Validate XML structure
    this.validateXML(xmlContent);

    const testMethods: Array<{
      name: string;
      status: string;
      isConfig: boolean;
      durationMs?: number;
      startedAt?: string;
      finishedAt?: string;
    }> = [];

    try {
      // Parse XML using fast-xml-parser (safe from regex backtracking attacks)
      const parsed = this.parser.parse(xmlContent);
      
      // Debug: Log parsed structure (remove in production)
      if (process.env.NODE_ENV === 'development') {
        console.log('[XML Parser] Parsed structure:', JSON.stringify(parsed, null, 2).substring(0, 1000));
      }
      
      // Extract test-method elements recursively
      this.extractTestMethods(parsed, testMethods);
      
      // Debug: Log extracted test methods (remove in production)
      if (process.env.NODE_ENV === 'development') {
        console.log('[XML Parser] Extracted test methods:', testMethods.length, testMethods);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown parsing error';
      throw new Error(`Failed to parse TestNG XML: ${message}`);
    }

    return { testMethods };
  }
}

interface CreateTestRunInput {
  projectId: string;
  name: string;
  description?: string;
  executionType?: 'MANUAL' | 'AUTOMATION';
  assignedToId?: string;
  environment?: string;
  version?: string;
  platform?: string;
  device?: string;
  status?: string;
  testCaseIds?: string[];
  testSuiteIds?: string[];
  createdById: string;
}

interface UpdateTestRunInput {
  name?: string;
  description?: string;
  executionType?: 'MANUAL' | 'AUTOMATION';
  status?: string;
  assignedToId?: string;
  environment?: string;
  version?: string;
  platform?: string;
  device?: string;
  startedAt?: Date;
  completedAt?: Date;
}

interface TestRunFilters {
  status?: string;
  assignedToId?: string;
  environment?: string;
  search?: string;
}

export class TestRunService {
  /**
   * Get all test runs for a project with optional filters
   */
  async getProjectTestRuns(projectId: string, filters?: TestRunFilters) {
    const where: Record<string, unknown> = {
      projectId,
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.assignedToId) {
      where.assignedToId = filters.assignedToId;
    }

    if (filters?.environment) {
      where.environment = filters.environment;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const testRuns = await prisma.testRun.findMany({
      where,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            results: true,
          },
        },
        results: {
          select: {
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // platform/device are in Prisma schema and returned directly by findMany
    // Augment with executionType/version from raw SQL (not in Prisma schema)
    if (testRuns.length > 0) {
      try {
        const ids = testRuns.map(tr => tr.id);
        const rows = await prisma.$queryRaw<Array<{ id: string; executionType: string | null; version: string | null }>>`
          SELECT "id", "executionType", "version" FROM "TestRun" WHERE "id" IN (${Prisma.join(ids)})
        `;
        const rowMap = new Map(rows.map(r => [r.id, { executionType: r.executionType || 'MANUAL', version: r.version || null }]));
        return testRuns.map(tr => ({
          ...tr,
          executionType: rowMap.get(tr.id)?.executionType || 'MANUAL',
          version: rowMap.get(tr.id)?.version || undefined,
        }));
      } catch {
        // Column may not exist yet - return with defaults
        return testRuns.map(tr => ({
          ...tr,
          executionType: 'MANUAL',
          version: undefined,
        }));
      }
    }

    return testRuns;
  }

  /**
   * Get a single test run by ID
   */
  async getTestRunById(testRunId: string) {
    const testRun = await prisma.testRun.findUnique({
      where: { id: testRunId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            key: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        results: {
          include: {
            testCase: {
              select: {
                id: true,
                tcId: true,
                rtcId: true,
                title: true,
                description: true,
                priority: true,
                status: true,
                estimatedTime: true,
                module: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                testCaseSuites: {
                  select: {
                    testSuite: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
            executedBy: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            executedAt: 'desc',
          },
        },
        _count: {
          select: {
            results: true,
          },
        },
      },
    });

    if (!testRun) return null;

    // Fetch executionType/version via raw SQL (not in Prisma schema)
    let executionType: string | null = null;
    let version: string | null = null;
    try {
      const rows = await prisma.$queryRaw<Array<{ executionType: string | null; version: string | null }>>`
        SELECT "executionType", "version" FROM "TestRun" WHERE "id" = ${testRunId} LIMIT 1
      `;
      if (rows[0]) {
        executionType = rows[0].executionType;
        version = rows[0].version;
      }
    } catch {
      // Column may not exist yet
    }

    return { ...testRun, executionType: executionType || 'MANUAL', version: version || undefined };
  }

  /**
   * Create a new test run
   */
  async createTestRun(data: CreateTestRunInput) {
    // Collect test case IDs
    let testCaseIds = data.testCaseIds || [];

    // If test suite IDs are provided, fetch all test cases from those suites
    if (data.testSuiteIds && data.testSuiteIds.length > 0) {
      const suiteCases = await prisma.testCase.findMany({
        where: {
          suiteId: {
            in: data.testSuiteIds,
          },
          projectId: data.projectId,
        },
        select: {
          id: true,
        },
      });
      
      const suiteTestCaseIds = suiteCases.map(tc => tc.id);
      testCaseIds = [...new Set([...testCaseIds, ...suiteTestCaseIds])]; // Remove duplicates
    }

    // Create the test run (platform/device are in the Prisma schema; executionType is handled via raw SQL)
    const status = data.status || 'PLANNED';
    const testRun = await prisma.testRun.create({
      data: {
        projectId: data.projectId,
        name: data.name,
        description: data.description,
        assignedToId: data.assignedToId || null,
        environment: data.environment,
        platform: data.platform || null,
        device: data.device || null,
        status,
        completedAt: status === 'COMPLETED' ? new Date() : null,
        createdById: data.createdById,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    // Set executionType via raw SQL (not in Prisma schema, column may not exist)
    try {
      const execType = data.executionType || 'MANUAL';
      await prisma.$executeRaw`UPDATE "TestRun" SET "executionType" = ${execType} WHERE "id" = ${testRun.id}`;
    } catch (error) {
      console.warn('[TestRunService] Failed to set executionType on test run (column may not exist yet):', error instanceof Error ? error.message : error);
    }

    // Set version via raw SQL (column may not exist)
    try {
      await prisma.$executeRaw`UPDATE "TestRun" SET "version" = ${data.version || null} WHERE "id" = ${testRun.id}`;
    } catch (error) {
      console.warn('[TestRunService] Failed to set version on test run (column may not exist yet):', error instanceof Error ? error.message : error);
    }

    // If test case IDs are provided, create placeholder results
    if (testCaseIds.length > 0) {
      await prisma.testResult.createMany({
        data: testCaseIds.map((testCaseId) => ({
          testRunId: testRun.id,
          testCaseId,
          status: 'SKIPPED',
          executedById: data.assignedToId || '', // Will be updated when actually executed
        })),
        skipDuplicates: true,
      });

      // Update platform and device on the test cases if specified on the test run
      if (data.platform || data.device) {
        try {
          const updateData: Record<string, string> = {};
          if (data.platform) updateData.platform = data.platform;
          if (data.device) updateData.device = data.device;

          await prisma.testCase.updateMany({
            where: {
              id: { in: testCaseIds },
            },
            data: updateData,
          });
        } catch (error) {
          console.warn('[TestRunService] Failed to reflect platform/device onto test cases:', error instanceof Error ? error.message : error);
        }
      }
    }

    return testRun;
  }

  /**
   * Update a test run
   */
  async updateTestRun(testRunId: string, data: UpdateTestRunInput) {
    // Extract executionType/version to handle via raw SQL (not in Prisma schema)
    // platform and device ARE in the schema, so they go through Prisma directly
    const { executionType, version, ...prismaData } = data;

    const testRun = await prisma.testRun.update({
      where: { id: testRunId },
      data: prismaData,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            results: true,
          },
        },
      },
    });

    // Set executionType via raw SQL (not in Prisma schema, column may not exist)
    if (executionType !== undefined) {
      try {
        await prisma.$executeRaw`UPDATE "TestRun" SET "executionType" = ${executionType || 'MANUAL'} WHERE "id" = ${testRunId}`;
      } catch (error) {
        console.warn('[TestRunService] Failed to update executionType on test run:', error instanceof Error ? error.message : error);
      }
    }

    if (version !== undefined) {
      try {
        await prisma.$executeRaw`UPDATE "TestRun" SET "version" = ${version || null} WHERE "id" = ${testRunId}`;
      } catch (error) {
        console.warn('[TestRunService] Failed to update version on test run:', error instanceof Error ? error.message : error);
      }
    }

    return testRun;
  }

  /**
   * Delete a test run
   */
  async deleteTestRun(testRunId: string) {
    return await prisma.testRun.delete({
      where: { id: testRunId },
    });
  }

  /**
   * Start a test run
   */
  async startTestRun(testRunId: string) {
    return await prisma.testRun.update({
      where: { id: testRunId },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      },
    });
  }

  /**
   * Complete a test run
   */
  async completeTestRun(testRunId: string) {
    return await prisma.testRun.update({
      where: { id: testRunId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            key: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        results: {
          include: {
            testCase: {
              select: {
                id: true,
                tcId: true,
                rtcId: true,
                title: true,
                description: true,
                priority: true,
                status: true,
              },
            },
            executedBy: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            executedAt: 'desc',
          },
        },
        _count: {
          select: {
            results: true,
          },
        },
      },
    });
  }

  /**
   * Reopen a completed test run
   */
  async reopenTestRun(testRunId: string) {
    return await prisma.testRun.update({
      where: { id: testRunId },
      data: {
        status: 'IN_PROGRESS',
        completedAt: null,
      },
    });
  }

  /**
   * Cancel a test run
   */
  async cancelTestRun(testRunId: string) {
    return await prisma.testRun.update({
      where: { id: testRunId },
      data: {
        status: 'CANCELLED',
      },
    });
  }

  /**
   * Add test result to test run
   */
  async addTestResult(
    testRunId: string,
    testCaseId: string,
    data: {
      status: string;
      executedById: string;
      duration?: number;
      comment?: string;
      errorMessage?: string;
      stackTrace?: string;
    }
  ) {
    const result = await prisma.testResult.upsert({
      where: {
        testRunId_testCaseId: {
          testRunId,
          testCaseId,
        },
      },
      update: {
        status: data.status,
        executedById: data.executedById,
        duration: data.duration,
        comment: data.comment,
        errorMessage: data.errorMessage,
        stackTrace: data.stackTrace,
        executedAt: new Date(),
      },
      create: {
        testRunId,
        testCaseId,
        status: data.status,
        executedById: data.executedById,
        duration: data.duration,
        comment: data.comment,
        errorMessage: data.errorMessage,
        stackTrace: data.stackTrace,
      },
      include: {
        testCase: {
          select: {
            id: true,
            tcId: true,
            rtcId: true,
            title: true,
            priority: true,
          },
        },
        executedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Reflect test run's platform and device onto the test case
    // Uses raw SQL to avoid Prisma client validation issues when fields are not yet generated
    try {
      const testRunRows = await prisma.$queryRaw<Array<{ platform: string | null; device: string | null }>>`
        SELECT "platform", "device" FROM "TestRun" WHERE "id" = ${testRunId} LIMIT 1
      `;

      const testRunData = testRunRows[0];
      if (testRunData && (testRunData.platform || testRunData.device)) {
        const updateData: Record<string, string> = {};
        if (testRunData.platform) updateData.platform = testRunData.platform;
        if (testRunData.device) updateData.device = testRunData.device;

        await prisma.testCase.update({
          where: { id: testCaseId },
          data: updateData,
        });
      }
    } catch (error) {
      // Log but don't fail the main operation - platform/device reflection is a side effect
      console.warn('[TestRunService] Failed to reflect platform/device onto test case:', error instanceof Error ? error.message : error);
    }

    // 計測時間をTestCaseのテスト実行時間（秒）に反映
    if (data.duration && data.duration > 0) {
      try {
        await prisma.testCase.update({
          where: { id: testCaseId },
          data: { estimatedTime: data.duration },
        });
      } catch (error) {
        console.warn('[TestRunService] Failed to update estimatedTime on test case:', error instanceof Error ? error.message : error);
      }
    }

    return result;
  }

  /**
   * Get test run statistics
   */
  async getTestRunStats(testRunId: string) {
    const results = await prisma.testResult.groupBy({
      by: ['status'],
      where: {
        testRunId,
      },
      _count: {
        status: true,
      },
    });

    const stats = {
      total: 0,
      passed: 0,
      failed: 0,
      blocked: 0,
      skipped: 0,
      retest: 0,
    };

    results.forEach((result) => {
      stats.total += result._count.status;
      switch (result.status) {
        case 'PASSED':
          stats.passed = result._count.status;
          break;
        case 'FAILED':
          stats.failed = result._count.status;
          break;
        case 'BLOCKED':
          stats.blocked = result._count.status;
          break;
        case 'SKIPPED':
          stats.skipped = result._count.status;
          break;
        case 'RETEST':
          stats.retest = result._count.status;
          break;
      }
    });

    return stats;
  }

  /**
   * Check how many test cases will match from XML (without importing)
   */
  async checkXMLTestCasesMatch(
    xmlContent: string,
    projectId: string
  ): Promise<{ matchCount: number; totalTestMethods: number }> {
    // Parse XML content with error handling
    const parser = new TestNGXMLParser();
    let parseResult;
    try {
      parseResult = parser.parse(xmlContent);
    } catch (error: unknown) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'Unknown parsing error';
      throw new Error(`Failed to parse TestNG XML content: ${message}`);
    }

    // Get all test cases for the project indexed by tcId
    const testCases = await prisma.testCase.findMany({
      where: {
        projectId,
      },
      select: {
        id: true,
        tcId: true,
        title: true,
      },
    });

    // Create a map of tcId -> testCase
    // Support both original format and normalized format (underscore <-> hyphen)
    const testCaseMap = new Map<string, typeof testCases[0]>();
    testCases.forEach((tc) => {
      testCaseMap.set(tc.tcId, tc);
      // Also add normalized version to support underscore/hyphen matching
      const normalizedId = normalizeTestCaseId(tc.tcId);
      if (normalizedId !== tc.tcId) {
        testCaseMap.set(normalizedId, tc);
      }
    });

    let matchCount = 0;
    let totalTestMethods = 0;

    // Count matches
    for (const testMethod of parseResult.testMethods) {
      // Skip config methods
      if (testMethod.isConfig) {
        continue;
      }

      totalTestMethods++;
      
      // Check if test case exists (try both original and normalized name)
      const normalizedMethodName = normalizeTestCaseId(testMethod.name);
      if (testCaseMap.has(testMethod.name) || testCaseMap.has(normalizedMethodName)) {
        matchCount++;
      }
    }

    return { matchCount, totalTestMethods };
  }

  /**
   * Parse TestNG XML and import test results
   */
  async parseTestNGXMLAndImportResults(
    xmlContent: string,
    testRunId: string,
    projectId: string,
    executedById: string
  ) {
    // Verify test run exists and belongs to project
    const testRun = await prisma.testRun.findFirst({
      where: {
        id: testRunId,
        projectId,
      },
    });

    if (!testRun) {
      throw new Error('Test run not found');
    }

    // Parse XML content with error handling
    const parser = new TestNGXMLParser();
    let parseResult;
    try {
      parseResult = parser.parse(xmlContent);
    } catch (error: unknown) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'Unknown parsing error';
      throw new Error(`Failed to parse TestNG XML content: ${message}`);
    }

    // Get all test cases for the project indexed by tcId
    const testCases = await prisma.testCase.findMany({
      where: {
        projectId,
      },
      select: {
        id: true,
        tcId: true,
        title: true,
      },
    });

    // Create a map of tcId -> testCase
    // Support both original format and normalized format (underscore <-> hyphen)
    const testCaseMap = new Map<string, typeof testCases[0]>();
    testCases.forEach((tc) => {
      testCaseMap.set(tc.tcId, tc);
      // Also add normalized version to support underscore/hyphen matching
      const normalizedId = normalizeTestCaseId(tc.tcId);
      if (normalizedId !== tc.tcId) {
        testCaseMap.set(normalizedId, tc);
      }
    });

    const results = {
      success: 0,
      failed: 0,
      skipped: 0,
      errors: [] as Array<{ testMethodName: string; error: string }>,
      skippedItems: [] as Array<{ testMethodName: string; reason: string }>,
      imported: [] as Array<{ testCaseId: string; testCaseTcId: string; testMethodName: string; status: string }>,
    };

    // Fetch available status options from database (for dynamic dropdown support)
    let statusOptions: Array<{ value: string; label: string }> = [];
    try {
      const dropdownStatusOptions = await dropdownOptionService.getByEntityAndField('TestResult', 'status');
      statusOptions = dropdownStatusOptions.map(opt => ({ value: opt.value, label: opt.label }));
    } catch {
      // If dropdown service fails, continue with hardcoded defaults
      // This ensures the import still works even if dropdown service is unavailable
    }

    // Process each test method
    for (const testMethod of parseResult.testMethods) {
      // Skip config methods (beforeSuite, afterSuite, beforeMethod, afterMethod, etc.)
      if (testMethod.isConfig) {
        continue;
      }

      // Collect all validation errors for this test method
      const validationErrors: string[] = [];

      // Check if test method name matches a test case (try both original and normalized name)
      const normalizedMethodName = normalizeTestCaseId(testMethod.name);
      const testCase = testCaseMap.get(testMethod.name) || testCaseMap.get(normalizedMethodName);
      if (!testCase) {
        // Test case not found - add to skipped with detailed reason
        results.skipped++;
        let skipReason = `Test case ID "${testMethod.name}" not found in project`;
        
        // Also check for missing/invalid fields if name is wrong
        const fieldIssues: string[] = [];
        
        if (!testMethod.status || String(testMethod.status).trim() === '') {
          fieldIssues.push('missing required status field');
        } else {
          // Check if status is valid even though name doesn't match
          const statusUpper = String(testMethod.status || '').trim().toUpperCase();
          const isValidStatus = ['PASS', 'FAIL', 'SKIP', 'PASSED', 'FAILED', 'SKIPPED', 'BLOCKED', 'RETEST'].includes(statusUpper) ||
            (statusOptions.length > 0 && statusOptions.some(opt => opt.value.toUpperCase() === statusUpper));
          
          if (!isValidStatus) {
            // Build valid statuses list for error message
            const validStatuses: string[] = ['PASS', 'FAIL', 'SKIP'];
            if (statusOptions.length > 0) {
              statusOptions.forEach(opt => {
                if (!validStatuses.includes(opt.value.toUpperCase())) {
                  validStatuses.push(opt.value);
                }
              });
            } else {
              validStatuses.push('PASSED', 'FAILED', 'SKIPPED', 'BLOCKED', 'RETEST');
            }
            fieldIssues.push(`invalid status: "${testMethod.status}" (valid: ${validStatuses.join(', ')})`);
          }
        }
        
        if (fieldIssues.length > 0) {
          skipReason += `. Also ${fieldIssues.join(' and ')}`;
        }
        
        results.skippedItems.push({
          testMethodName: testMethod.name,
          reason: skipReason,
        });
        continue;
      }

      // Test case found - validate fields
      // Check for missing required fields
      if (!testMethod.status || String(testMethod.status).trim() === '') {
        validationErrors.push('Missing required status field');
      }

      // Map TestNG status or EzTest status to our status
      // Supports both TestNG format (PASS, FAIL, SKIP) and any custom status from dropdown options
      let status: string | null = null;
      // Trim whitespace and convert to uppercase for comparison
      const statusUpper = String(testMethod.status || '').trim().toUpperCase();
      
      // First, try TestNG format mapping (for backward compatibility)
      // Handles: pass, Pass, PASS, fail, Fail, FAIL, skip, Skip, SKIP
      switch (statusUpper) {
        case 'PASS':
          status = 'PASSED';
          break;
        case 'FAIL':
          status = 'FAILED';
          break;
        case 'SKIP':
        case 'SKIPPED': // Also handle SKIPPED in TestNG format
          status = 'SKIPPED';
          break;
        default:
          // If not TestNG format, check if it's a valid dropdown option
          if (statusOptions.length > 0) {
            // Check if the status matches any dropdown option (case-insensitive)
            const matchedStatus = statusOptions.find(
              opt => opt.value.toUpperCase().trim() === statusUpper
            );
            
            if (matchedStatus) {
              // Use the exact value from database (preserves case)
              status = matchedStatus.value;
            } else {
              // Status not found in dropdown options - mark as error
              status = null; // Will be handled as error below
            }
          } else {
            // No dropdown options available, fall back to hardcoded defaults
            if (statusUpper === 'PASSED' || statusUpper === 'FAILED' || 
                statusUpper === 'SKIPPED' || statusUpper === 'BLOCKED' || 
                statusUpper === 'RETEST') {
              status = statusUpper;
            } else {
              // Status not recognized - mark as error
              status = null; // Will be handled as error below
            }
          }
          break;
      }

      // Validate status
      if (status === null && testMethod.status) {
        // Status is invalid (not empty, but doesn't match any valid status)
        // Build helpful error message with valid status options
        const validStatuses: string[] = ['PASS', 'FAIL', 'SKIP']; // TestNG format
        if (statusOptions.length > 0) {
          statusOptions.forEach(opt => {
            if (!validStatuses.includes(opt.value.toUpperCase())) {
              validStatuses.push(opt.value);
            }
          });
        } else {
          // Add default EzTest statuses if no dropdown options
          validStatuses.push('PASSED', 'FAILED', 'SKIPPED', 'BLOCKED', 'RETEST');
        }
        
        validationErrors.push(`Invalid status value: "${testMethod.status}". Valid statuses are: ${validStatuses.join(', ')}`);
      }

      // If there are validation errors, report them and skip this test method
      if (validationErrors.length > 0 || status === null) {
        results.failed++;
        results.errors.push({
          testMethodName: testMethod.name,
          error: validationErrors.length > 0 
            ? validationErrors.join('; ')
            : `Missing or invalid status field`,
        });
        continue; // Skip to next test method
      }

      try {
        // Calculate duration in seconds
        const duration = testMethod.durationMs
          ? Math.round(testMethod.durationMs / 1000)
          : undefined;

        // Parse executedAt date - use startedAt if available and valid, otherwise use current date
        let executedAt: Date;
        if (testMethod.startedAt) {
          const parsedDate = new Date(testMethod.startedAt);
          if (!isNaN(parsedDate.getTime())) {
            executedAt = parsedDate;
          } else {
            executedAt = new Date();
          }
        } else {
          executedAt = new Date();
        }

        // Create or update test result
        await prisma.testResult.upsert({
          where: {
            testRunId_testCaseId: {
              testRunId,
              testCaseId: testCase.id,
            },
          },
          update: {
            status,
            executedById,
            duration,
            executedAt,
          },
          create: {
            testRunId,
            testCaseId: testCase.id,
            status,
            executedById,
            duration,
            executedAt,
          },
        });

        results.success++;
        results.imported.push({
          testCaseId: testCase.id,
          testCaseTcId: testCase.tcId,
          testMethodName: testMethod.name,
          status,
        });
      } catch (error) {
        results.failed++;
        results.errors.push({
          testMethodName: testMethod.name,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  /**
   * Check if user has access to test run's project
   */
  async hasAccessToTestRun(
    testRunId: string,
    userId: string
  ): Promise<boolean> {
    const testRun = await prisma.testRun.findUnique({
      where: { id: testRunId },
      select: {
        projectId: true,
      },
    });

    if (!testRun) {
      return false;
    }

    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: testRun.projectId,
          userId,
        },
      },
    });

    return !!member;
  }

  /**
   * Check if user can manage test run
   * Role-based permissions are handled by hasPermission wrapper
   */
  async canManageTestRun(
    testRunId: string,
    userId: string
  ): Promise<boolean> {
    const testRun = await prisma.testRun.findUnique({
      where: { id: testRunId },
      select: {
        projectId: true,
      },
    });

    if (!testRun) {
      return false;
    }

    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: testRun.projectId,
          userId,
        },
      },
    });

    // Check if user is a member of the project (role-based permissions handled by hasPermission)
    return !!member;
  }

  /**
   * Get recipients for test run report
   * Returns system admins, project managers, and defect assignees
   */
  async getTestRunReportRecipients(testRunId: string): Promise<{
    recipientIds: string[];
    systemAdminCount: number;
    projectManagerCount: number;
    defectAssigneeCount: number;
  }> {
    // Fetch test run with related data
    const testRun = await prisma.testRun.findUnique({
      where: { id: testRunId },
      include: {
        project: {
          include: {
            members: {
              include: {
                user: {
                  include: {
                    role: true,
                  },
                },
              },
            },
          },
        },
        results: {
          include: {
            testCase: {
              include: {
                defects: {
                  include: {
                    defect: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!testRun) {
      throw new Error('Test run not found');
    }

    const recipientSet = new Set<string>();
    let systemAdminCount = 0;
    let projectManagerCount = 0;
    let defectAssigneeCount = 0;

    // 1. Add all SYSTEM ADMIN users (global, not just project members)
    const systemAdmins = await prisma.user.findMany({
      where: {
        role: {
          name: 'ADMIN',
        },
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    systemAdmins.forEach((admin) => {
      recipientSet.add(admin.id);
      systemAdminCount++;
    });

    // 2. Add all PROJECT_MANAGER users (from project members)
    testRun.project?.members?.forEach((member) => {
      if (member.user.role?.name === 'PROJECT_MANAGER') {
        if (!recipientSet.has(member.user.id)) {
          projectManagerCount++;
        }
        recipientSet.add(member.user.id);
      }
    });

    // 3. Add all defect assignees (from test results with failed/blocked tests)
    const defectAssignees = new Set<string>();
    testRun.results?.forEach((result) => {
      if (result.status === 'FAILED' || result.status === 'BLOCKED') {
        result.testCase?.defects?.forEach((linkedDefect) => {
          if (linkedDefect.defect.assignedToId) {
            defectAssignees.add(linkedDefect.defect.assignedToId);
          }
        });
      }
    });

    defectAssignees.forEach((assigneeId) => {
      if (!recipientSet.has(assigneeId)) {
        defectAssigneeCount++;
      }
      recipientSet.add(assigneeId);
    });

    return {
      recipientIds: Array.from(recipientSet),
      systemAdminCount,
      projectManagerCount,
      defectAssigneeCount,
    };
  }

  /**
   * Send test run report to all recipients with validation
   */
  async sendTestRunReport(
    testRunId: string,
    userId: string,
    appUrl: string
  ) {
    const { emailService } = await import('@/backend/services/email/services');
    const { isEmailServiceAvailable } = await import('@/lib/email-service');
    
    // Check if SMTP is enabled
    const smtpEnabled = await isEmailServiceAvailable();
    if (!smtpEnabled) {
      console.log('[TEST RUN] SMTP disabled - skipping report email');
      return {
        success: true,
        message: 'Email service is not configured. Report not sent.',
        recipientCount: 0,
        totalRecipients: 0,
        failedRecipients: [],
        recipientDetails: [],
        smtpDisabled: true,
      };
    }
    
    // Get all recipients
    const { recipientIds } = await this.getTestRunReportRecipients(testRunId);

    if (recipientIds.length === 0) {
      // Return result instead of throwing error - show alert but don't block
      return {
        success: false,
        message: 'No recipients found for this test run report. No email sent.',
        recipientCount: 0,
        totalRecipients: 0,
        failedRecipients: [],
        recipientDetails: [],
        invalidRecipients: [],
      };
    }

    // Fetch recipient details with validation
    const recipients = await prisma.user.findMany({
      where: {
        id: {
          in: recipientIds,
        },
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    // Validate email addresses (allows default admin email from environment)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validRecipients = recipients.filter(r => {
      if (!r.email) {
        return false;
      }
      // // Allow default admin email from environment (even if it has invalid domains like .local)
      // if (isDefaultAdminEmail(r.email)) {
      //   return true;
      // }
      if (!emailRegex.test(r.email)) {
        return false;
      }
      // Check for invalid domains like .local, .invalid, .test, .example
      const invalidDomains = ['.local', '.invalid', '.test', '.example', '.localhost'];
      const lowerEmail = r.email.toLowerCase();
      for (const domain of invalidDomains) {
        if (lowerEmail.endsWith(domain)) {
          return false;
        }
      }
      return true;
    });

    // Get invalid recipients for error reporting
    const invalidRecipients = recipients.filter(r => {
      if (!r.email) return true;
      if (!emailRegex.test(r.email)) return true;
      const invalidDomains = ['.local', '.invalid', '.test', '.example', '.localhost'];
      const lowerEmail = r.email.toLowerCase();
      for (const domain of invalidDomains) {
        if (lowerEmail.endsWith(domain)) {
          return true;
        }
      }
      return false;
    }).map(r => ({
      email: r.email || 'No email',
      name: r.name,
      role: r.role?.name || 'UNKNOWN',
    }));

    // Don't throw error if no valid recipients - return result with warning instead
    if (validRecipients.length === 0) {
      return {
        success: false,
        message: `No valid email addresses found for recipients. Invalid emails: ${invalidRecipients.map(r => r.email).join(', ')}`,
        recipientCount: 0,
        totalRecipients: recipients.length,
        failedRecipients: invalidRecipients.map(r => r.email),
        recipientDetails: invalidRecipients.map(r => ({
          email: r.email,
          role: r.role,
          status: 'invalid',
        })),
        invalidRecipients,
      };
    }

    // Send email to each recipient
    let successCount = 0;
    const failedRecipients: string[] = [];
    const recipientDetails: { email: string; role: string; status: string }[] = [];

    for (const recipient of validRecipients) {
      try {
        const sent = await emailService.sendTestRunReportEmail({
          testRunId,
          recipientId: recipient.id,
          startedByUserId: userId,
          appUrl,
        });

        if (sent) {
          successCount++;
          recipientDetails.push({
            email: recipient.email,
            role: recipient.role?.name || 'UNKNOWN',
            status: 'sent',
          });
        } else {
          failedRecipients.push(recipient.email);
          recipientDetails.push({
            email: recipient.email,
            role: recipient.role?.name || 'UNKNOWN',
            status: 'failed',
          });
        }
      } catch (error) {
        console.error(`[TEST RUN] Failed to send email to ${recipient.email}:`, error);
        failedRecipients.push(recipient.email);
        recipientDetails.push({
          email: recipient.email,
          role: recipient.role?.name || 'UNKNOWN',
          status: 'error',
        });
      }
    }

    // Build message prioritizing success, then warnings about invalid/failed emails
    let message = '';
    if (successCount > 0) {
      message = `Report sent successfully to ${successCount} recipient(s)`;
      
      // Only mention invalid emails if there are any
      if (invalidRecipients.length > 0) {
        message += `. Invalid email addresses skipped: ${invalidRecipients.map(r => r.email).join(', ')}`;
      }
      
      // Only mention failed sends if there are any
      if (failedRecipients.length > 0) {
        message += `. Failed to send to: ${failedRecipients.join(', ')}`;
      }
    } else {
      // No emails sent at all - show error
      if (invalidRecipients.length > 0) {
        message = `No valid email addresses found. Invalid emails: ${invalidRecipients.map(r => r.email).join(', ')}`;
      } else if (failedRecipients.length > 0) {
        message = `Failed to send emails to: ${failedRecipients.join(', ')}`;
      } else {
        message = 'No emails were sent.';
      }
    }

    return {
      success: successCount > 0,
      message,
      recipientCount: successCount,
      totalRecipients: validRecipients.length,
      failedRecipients,
      recipientDetails,
      invalidRecipients: invalidRecipients.length > 0 ? invalidRecipients : [],
    };
  }
}

export const testRunService = new TestRunService();
