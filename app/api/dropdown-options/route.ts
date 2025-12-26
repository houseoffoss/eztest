import { NextRequest } from 'next/server';
import dropdownOptionController from '@/backend/controllers/dropdown-option/dropdown-option.controller';
import { hasPermission } from '@/lib/rbac';
import {
  createDropdownOptionSchema,
  queryDropdownOptionsSchema,
} from '@/backend/validators/dropdown-option.validator';
import { ValidationException } from '@/backend/utils/exceptions';

/**
 * GET /api/dropdown-options
 * Get all dropdown options with optional filtering
 * Required permission: dropdowns:read
 */
export const GET = hasPermission(
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const query = {
      entity: searchParams.get('entity') || undefined,
      field: searchParams.get('field') || undefined,
      isActive: (searchParams.get('isActive') as 'true' | 'false' | 'all') || undefined,
    };

    const validationResult = queryDropdownOptionsSchema.safeParse(query);
    if (!validationResult.success) {
      throw new ValidationException(
        'Invalid query parameters',
        validationResult.error.issues
      );
    }

    return dropdownOptionController.getAll(validationResult.data);
  },
  'dropdowns',
  'read'
);

/**
 * POST /api/dropdown-options
 * Create a new dropdown option
 * Required permission: dropdowns:manage
 */
export const POST = hasPermission(
  async (request: NextRequest) => {
    const body = await request.json();

    const validationResult = createDropdownOptionSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationException(
        'Validation failed',
        validationResult.error.issues
      );
    }

    return dropdownOptionController.create(validationResult.data);
  },
  'dropdowns',
  'manage'
);
