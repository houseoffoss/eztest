import { z } from 'zod';

/**
 * Create Test Run Schema
 */
export const createTestRunSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(255, 'Name must not exceed 255 characters')
    .trim(),
  description: z.string().optional(),
  executionType: z.enum(['MANUAL', 'AUTOMATION']).optional(),
  assignedToId: z.string().min(1, 'Invalid user ID format').optional(),
  environment: z.string().optional(),
  status: z.string().optional(),
  testCaseIds: z.array(z.string().min(1)).optional(),
  testSuiteIds: z.array(z.string().min(1)).optional(),
});

/**
 * Update Test Run Schema
 */
export const updateTestRunSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(255, 'Name must not exceed 255 characters')
    .trim()
    .optional(),
  description: z.string().optional(),
  executionType: z.enum(['MANUAL', 'AUTOMATION']).optional(),
  status: z.string().optional(),
  assignedToId: z.string().min(1, 'Invalid user ID format').optional(),
  environment: z.string().optional(),
});

/**
 * Add Test Result Schema
 */
export const addTestResultSchema = z.object({
  testCaseId: z.string().min(1, 'Test case ID is required'),
  status: z.enum(['PASSED', 'FAILED', 'BLOCKED', 'SKIPPED', 'RETEST', 'NOT_RUN']),
  duration: z.number().optional(),
  comment: z.string().optional(),
  errorMessage: z.string().optional(),
  stackTrace: z.string().optional(),
});

export const bulkUpdateTestResultsSchema = z
  .object({
    testCaseIds: z.array(z.string().min(1, 'ID тест-кейса обязателен')).min(1, 'Выберите хотя бы один тест-кейс'),
    status: z.enum(['PASSED', 'FAILED', 'BLOCKED', 'SKIPPED', 'RETEST', 'NOT_RUN']).optional(),
    comment: z.string().optional(),
    duration: z.number().optional(),
    errorMessage: z.string().optional(),
    stackTrace: z.string().optional(),
    executedById: z.string().min(1, 'Некорректный ID исполнителя').optional(),
    assignedToId: z.string().min(1, 'Некорректный ID назначенного пользователя').nullable().optional(),
  })
  .refine(
    (data) => data.status !== undefined || data.executedById !== undefined || data.assignedToId !== undefined,
    {
      message: 'Нужно передать хотя бы одно поле для обновления: status, executedById или assignedToId',
      path: ['status'],
    }
  );

export const bulkDeleteTestResultsSchema = z.object({
  testCaseIds: z.array(z.string().min(1, 'ID тест-кейса обязателен')).min(1, 'Выберите хотя бы один тест-кейс'),
});

/**
 * Send Test Run Report Schema
 */
export const sendTestRunReportSchema = z.object({
  // Optional: Could add specific recipients or options in the future
  includeDefectAssignees: z.boolean().optional().default(true),
  includeAdmins: z.boolean().optional().default(true),
  includeProjectManagers: z.boolean().optional().default(true),
});

/**
 * Type exports
 */
export type CreateTestRunInput = z.infer<typeof createTestRunSchema>;
export type UpdateTestRunInput = z.infer<typeof updateTestRunSchema>;
export type AddTestResultInput = z.infer<typeof addTestResultSchema>;
export type BulkUpdateTestResultsInput = z.infer<typeof bulkUpdateTestResultsSchema>;
export type BulkDeleteTestResultsInput = z.infer<typeof bulkDeleteTestResultsSchema>;
export type SendTestRunReportInput = z.infer<typeof sendTestRunReportSchema>;
