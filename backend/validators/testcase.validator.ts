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
});

/**
 * Type exports
 */
export type TestStepInput = z.infer<typeof testStepSchema>;
export type CreateTestCaseInput = z.infer<typeof createTestCaseSchema>;
export type UpdateTestCaseInput = z.infer<typeof updateTestCaseSchema>;
export type UpdateTestStepsInput = z.infer<typeof updateTestStepsSchema>;
export type TestCaseQueryParams = z.infer<typeof testCaseQuerySchema>;
