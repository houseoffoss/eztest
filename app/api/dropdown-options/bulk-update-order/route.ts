import { NextRequest } from 'next/server';
import dropdownOptionController from '@/backend/controllers/dropdown-option/dropdown-option.controller';
import { hasPermission } from '@/lib/rbac';
import { bulkUpdateOrderSchema } from '@/backend/validators/dropdown-option.validator';
import { ValidationException } from '@/backend/utils/exceptions';

/**
 * POST /api/dropdown-options/bulk-update-order
 * Bulk update order of dropdown options
 * Required permission: dropdowns:manage
 */
export const POST = hasPermission(
  async (request: NextRequest) => {
    const body = await request.json();

    const validationResult = bulkUpdateOrderSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationException(
        'Validation failed',
        validationResult.error.issues
      );
    }

    return dropdownOptionController.bulkUpdateOrder(validationResult.data);
  },
  'dropdowns',
  'manage'
);
