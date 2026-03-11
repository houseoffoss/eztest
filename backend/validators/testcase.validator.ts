import { z } from 'zod';

/**
 * Test Step Schema
 *
 * Business rule:
 * - A step must have at least one of:
 *   - action
 *   - expectedResult
 * - Either field can be empty as long as the other is provided.
 */
export const testStepSchema = z
  .object({
    id: z.string().optional(), // Allow ID for updates
    stepNumber: z
      .number()
      .int('Step number must be an integer')
      .positive('Step number must be positive'),
    action: z.string().trim().optional().default(''),
    expectedResult: z.string().trim().optional().default(''),
  })
  .refine(
    (data) => data.action.length > 0 || data.expectedResult.length > 0,
    {
      path: ['action'],
      message: 'Action or expected result is required',
    }
  );

/**
 * Test Case Creation Schema
 */
export const createTestCaseSchema = z.object({
  moduleId: z.string().optional().nullable(),
  suiteId: z.string().optional().nullable(),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less').trim(),
  description: z.string().optional(),
  expectedResult: z.string().optional(),
  testData: z.string().optional(),
  priority: z.string().optional(),
  status: z.string().optional(),
  estimatedTime: z
    .number()
    .nonnegative('Estimated time must be a positive number')
    .optional(),
  preconditions: z.string().optional(),
  postconditions: z.string().optional(),
  steps: z.array(testStepSchema).optional(),
  // New fields for enhanced test case management
  rtcId: z.string().optional().nullable(),
  flowId: z.string().optional().nullable(),
  layer: z.enum(['SMOKE', 'CORE', 'EXTENDED', 'UNKNOWN']).optional().nullable(),
  evidence: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  platform: z.enum(['Web', 'Web(SP)', 'iOS Native', 'Android Native']).optional().nullable(),
  device: z.enum(['iPhone', 'Android', 'PC']).optional().nullable(),
  domain: z.string().optional().nullable(),
  functionName: z.string().optional().nullable(),
  executionType: z.enum(['手動', '自動']).optional().nullable(),
  automationStatus: z.enum(['自動化済', '自動化対象', '自動化対象外', '検討中']).optional().nullable(),
});

/**
 * Test Case Update Schema
 */
export const updateTestCaseSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').max(200, 'Title must be 200 characters or less').trim().optional(),
  description: z.string().optional(),
  expectedResult: z.string().optional(),
  testData: z.string().optional(),
  priority: z.string().optional(),
  status: z.string().optional(),
  estimatedTime: z
    .number()
    .nonnegative('Estimated time must be a positive number')
    .optional(),
  preconditions: z.string().optional(),
  postconditions: z.string().optional(),
  moduleId: z.string().optional().nullable(),
  suiteId: z.string().optional().nullable(),
  // New fields for enhanced test case management
  rtcId: z.string().optional().nullable(),
  flowId: z.string().optional().nullable(),
  layer: z.enum(['SMOKE', 'CORE', 'EXTENDED', 'UNKNOWN']).optional().nullable(),
  evidence: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  platform: z.enum(['Web', 'Web(SP)', 'iOS Native', 'Android Native']).optional().nullable(),
  device: z.enum(['iPhone', 'Android', 'PC']).optional().nullable(),
  domain: z.string().optional().nullable(),
  functionName: z.string().optional().nullable(),
  executionType: z.enum(['手動', '自動']).optional().nullable(),
  automationStatus: z.enum(['自動化済', '自動化対象', '自動化対象外', '検討中']).optional().nullable(),
});

/**
 * Test Steps Update Schema
 */
export const updateTestStepsSchema = z.object({
  steps: z.union([
    z.array(testStepSchema),
    z.string()
  ]).optional(),
});

/**
 * Test Case Query Parameters Schema
 */
export const testCaseQuerySchema = z.object({
  suiteId: z.string().min(1, 'Suite ID cannot be empty').optional(),
  priority: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  domain: z.string().optional(),
  functionName: z.string().optional(),
});

export const bulkDeleteTestCasesSchema = z.object({
  testCaseIds: z.array(z.string().min(1)).min(1, 'At least one test case ID is required'),
});

/**
 * Type exports
 */
export type TestStepInput = z.infer<typeof testStepSchema>;
export type CreateTestCaseInput = z.infer<typeof createTestCaseSchema>;
export type UpdateTestCaseInput = z.infer<typeof updateTestCaseSchema>;
export type UpdateTestStepsInput = z.infer<typeof updateTestStepsSchema>;
export type TestCaseQueryParams = z.infer<typeof testCaseQuerySchema>;
export type BulkDeleteTestCasesInput = z.infer<typeof bulkDeleteTestCasesSchema>;
