import { prisma } from '@/lib/prisma';
import { ParsedRow } from '@/lib/file-parser';
import { ValidationException } from '@/backend/utils/exceptions';

export interface DefectMigrationRow {
  title: string;
  description?: string;
  severity?: string;
  priority?: string;
  status?: string;
  assignedTo?: string; // Email address
  environment?: string;
  dueDate?: string;
  testCase?: string; // Test case title/name (e.g., "Login with valid credentials")
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
    defectId: string;
    title: string;
  }>;
}

export class DefectMigrationService {
  /**
   * Import defects from parsed data
   */
  async importDefects(
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
        // Validate required field
        if (!row.title || typeof row.title !== 'string' || row.title.trim() === '') {
          throw new Error('Title is required');
        }

        // Validate severity
        const severity = row.severity
          ? row.severity.toString().toUpperCase()
          : 'MEDIUM';
        if (!validSeverities.has(severity)) {
          throw new Error(
            `Invalid severity: ${row.severity}. Valid values are: ${Array.from(validSeverities).join(', ')}`
          );
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
        const status = row.status ? row.status.toString().toUpperCase() : 'NEW';
        if (!validStatuses.has(status)) {
          throw new Error(
            `Invalid status: ${row.status}. Valid values are: ${Array.from(validStatuses).join(', ')}`
          );
        }

        // Validate environment
        let environment: string | undefined;
        if (row.environment && typeof row.environment === 'string') {
          environment = row.environment.toString().toUpperCase();
          if (!validEnvironments.has(environment)) {
            throw new Error(
              `Invalid environment: ${row.environment}. Valid values are: ${Array.from(validEnvironments).join(', ')}`
            );
          }
        }

        // Find assignee by email
        let assignedToId: string | undefined;
        if (row.assignedTo && typeof row.assignedTo === 'string') {
          const email = row.assignedTo.toString().trim().toLowerCase();
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
        let dueDate: Date | undefined;
        if (row.dueDate && typeof row.dueDate === 'string') {
          const parsedDate = new Date(row.dueDate);
          if (!isNaN(parsedDate.getTime())) {
            dueDate = parsedDate;
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
        if (row.testCase && typeof row.testCase === 'string' && row.testCase.trim()) {
          const testCaseName = row.testCase.toString().trim();
          const testCase = await prisma.testCase.findFirst({
            where: {
              projectId,
              title: {
                equals: testCaseName,
                mode: 'insensitive',
              },
            },
            select: { id: true },
          });

          if (!testCase) {
            console.warn(
              `Test case "${testCaseName}" not found in project. Defect will be created without test case link.`
            );
          } else {
            testCaseId = testCase.id;
          }
        }

        // Create defect
        const defect = await prisma.defect.create({
          data: {
            defectId,
            projectId,
            title: row.title.toString().trim(),
            description: row.description
              ? row.description.toString().trim()
              : null,
            severity,
            priority,
            status,
            assignedToId,
            environment,
            dueDate,
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

export const defectMigrationService = new DefectMigrationService();
