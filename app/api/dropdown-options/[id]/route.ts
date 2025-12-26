import { NextRequest } from 'next/server';
import dropdownOptionController from '@/backend/controllers/dropdown-option/dropdown-option.controller';
import { hasPermission } from '@/lib/rbac';
import { updateDropdownOptionSchema } from '@/backend/validators/dropdown-option.validator';
import { ValidationException } from '@/backend/utils/exceptions';

/**
 * GET /api/dropdown-options/:id
 * Get a single dropdown option by ID
 * Required permission: dropdowns:read
 */
export const GET = hasPermission(
  async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    const params = await context.params;
    return dropdownOptionController.getById(params.id);
  },
  'dropdowns',
  'read'
);

/**
 * PUT /api/dropdown-options/:id
 * Update a dropdown option
 * Required permission: dropdowns:manage
 */
export const PUT = hasPermission(
  async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    const params = await context.params;
    const body = await request.json();

    const validationResult = updateDropdownOptionSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationException(
        'Validation failed',
        validationResult.error.issues
      );
    }

    return dropdownOptionController.update(params.id, validationResult.data);
  },
  'dropdowns',
  'manage'
);

/**
 * DELETE /api/dropdown-options/:id
 * Soft delete a dropdown option
 * Required permission: dropdowns:manage
 */
export const DELETE = hasPermission(
  async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    const params = await context.params;
    return dropdownOptionController.delete(params.id);
  },
  'dropdowns',
  'manage'
);
