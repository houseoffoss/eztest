import { exportService, ExportType } from '@/backend/services/migration/export/services';
import { ValidationException, InternalServerException } from '@/backend/utils/exceptions';
import { TestCaseMessages, DefectMessages, TestRunMessages } from '@/backend/constants/static_messages';
import { NextResponse } from 'next/server';

export interface ExportQueryParams {
  type: ExportType;
  format?: string;
  moduleId?: string;
  suiteId?: string;
  status?: string;
  priority?: string;
  severity?: string;
  assignedToId?: string;
  environment?: string;
}

export class ExportController {
  /**
   * Export data to CSV or Excel
   */
  async exportData(projectId: string, queryParams: ExportQueryParams): Promise<NextResponse> {
    try {
      const format = queryParams.format || 'csv';
      const type = queryParams.type;

      if (format !== 'csv' && format !== 'excel') {
        throw new ValidationException(TestCaseMessages.InvalidExportFormat);
      }

      if (!['testcases', 'defects', 'testruns'].includes(type)) {
        throw new ValidationException('Invalid export type. Use "testcases", "defects", or "testruns"');
      }

      const buffer = await exportService.exportData({
        type,
        format: format as 'csv' | 'excel',
        projectId,
        filters: {
          moduleId: queryParams.moduleId,
          suiteId: queryParams.suiteId,
          status: queryParams.status,
          priority: queryParams.priority,
          severity: queryParams.severity,
          assignedToId: queryParams.assignedToId,
          environment: queryParams.environment,
        },
      });

      // Generate filename based on type
      const typeNames: Record<ExportType, string> = {
        testcases: 'test-cases',
        defects: 'defects',
        testruns: 'test-runs',
      };
      const filename = `${typeNames[type]}-${Date.now()}.${format === 'csv' ? 'csv' : 'xlsx'}`;
      const contentType = format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

      // Convert buffer to Uint8Array for proper binary response
      const uint8Array = new Uint8Array(buffer);

      return new NextResponse(uint8Array, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    } catch (error) {
      if (error instanceof ValidationException) {
        throw error;
      }
      
      // Get appropriate error message based on type
      const errorMessage = queryParams.type === 'testcases' 
        ? TestCaseMessages.FailedToExportTestCases
        : queryParams.type === 'defects'
        ? DefectMessages.FailedToExportDefects
        : TestRunMessages.FailedToExportTestRuns;
      
      throw new InternalServerException(errorMessage);
    }
  }

  /**
   * Export a single test run with detailed report
   */
  async exportTestRunDetail(testRunId: string, format: 'csv' | 'excel'): Promise<NextResponse> {
    try {
      if (format !== 'csv' && format !== 'excel') {
        throw new ValidationException(TestCaseMessages.InvalidExportFormat);
      }

      const buffer = await exportService.exportTestRunDetail(testRunId, format);

      const filename = `test-run-report-${testRunId}-${Date.now()}.${format === 'csv' ? 'csv' : 'xlsx'}`;
      const contentType = format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

      // Convert buffer to Uint8Array for proper binary response
      const uint8Array = new Uint8Array(buffer);

      return new NextResponse(uint8Array, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    } catch (error) {
      if (error instanceof ValidationException) {
        throw error;
      }
      
      throw new InternalServerException(TestRunMessages.FailedToExportTestRuns);
    }
  }
}

export const exportController = new ExportController();

