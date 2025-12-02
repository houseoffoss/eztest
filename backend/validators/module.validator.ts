import { z } from 'zod';

/**
 * Module Creation Schema
 */
export const createModuleSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must not exceed 255 characters')
    .trim(),
  description: z.string().max(1000, 'Description must not exceed 1000 characters').optional(),
  order: z.number().int().min(0, 'Order must be a non-negative integer').optional(),
});

/**
 * Module Update Schema
 */
export const updateModuleSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must not exceed 255 characters')
    .trim()
    .optional(),
  description: z.string().max(1000, 'Description must not exceed 1000 characters').optional(),
  order: z.number().int().min(0, 'Order must be a non-negative integer').optional(),
});

/**
 * Reorder Modules Schema
 */
export const reorderModulesSchema = z.object({
  modules: z.array(
    z.object({
      id: z.string().cuid('Invalid module ID'),
      order: z.number().int().min(0, 'Order must be a non-negative integer'),
    })
  ).min(1, 'At least one module must be provided'),
});

/**
 * Type exports
 */
export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;
export type ReorderModulesInput = z.infer<typeof reorderModulesSchema>;
