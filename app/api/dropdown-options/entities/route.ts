import dropdownOptionController from '@/backend/controllers/dropdown-option/dropdown-option.controller';
import { hasPermission } from '@/lib/rbac';

/**
 * GET /api/dropdown-options/entities
 * Get all unique entities
 * Required permission: dropdowns:read
 */
export const GET = hasPermission(
  async () => {
    return dropdownOptionController.getEntities();
  },
  'dropdowns',
  'read'
);

