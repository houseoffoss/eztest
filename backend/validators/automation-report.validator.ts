import { z } from 'zod';

/**
 * Automation Report Import Schema
 * Minimal format for importing automation test results
 */
export const automationReportSchema = z.object({
  testRunName: z.string().min(1, 'Test run name is required'),
  environment: z.string().min(1, 'Environment is required'),
  description: z.string().optional(),
  results: z.array(
    z.object({
      testCaseId: z.string().min(1, 'Test case ID is required'),
      status: z.enum(['PASSED', 'FAILED', 'BLOCKED', 'SKIPPED', 'RETEST']),
      duration: z.number().nonnegative().optional().nullable(),
      comment: z.string().optional().nullable(),
      errorMessage: z.string().optional().nullable(),
      stackTrace: z.string().optional().nullable(),
    })
  ).min(1, 'At least one test result is required'),
});

/**
 * Type exports
 */
export type AutomationReportInput = z.infer<typeof automationReportSchema>;

