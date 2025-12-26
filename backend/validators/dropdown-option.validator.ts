import { z } from 'zod';

/**
 * Validation schema for creating a dropdown option
 */
export const createDropdownOptionSchema = z.object({
  entity: z.string().min(1, 'Entity is required'),
  field: z.string().min(1, 'Field is required'),
  value: z.string().min(1, 'Value is required'),
  label: z.string().min(1, 'Label is required'),
  order: z.number().int().min(0).optional(),
});

/**
 * Validation schema for updating a dropdown option
 */
export const updateDropdownOptionSchema = z.object({
  label: z.string().min(1, 'Label is required').optional(),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

/**
 * Validation schema for querying dropdown options
 */
export const queryDropdownOptionsSchema = z.object({
  entity: z.string().optional(),
  field: z.string().optional(),
  isActive: z.enum(['true', 'false', 'all']).optional(),
});

/**
 * Validation schema for bulk update of dropdown options order
 */
export const bulkUpdateOrderSchema = z.object({
  updates: z.array(
    z.object({
      id: z.string(),
      order: z.number().int().min(0),
    })
  ),
});

export type CreateDropdownOptionInput = z.infer<typeof createDropdownOptionSchema>;
export type UpdateDropdownOptionInput = z.infer<typeof updateDropdownOptionSchema>;
export type QueryDropdownOptionsInput = z.infer<typeof queryDropdownOptionsSchema>;
export type BulkUpdateOrderInput = z.infer<typeof bulkUpdateOrderSchema>;

