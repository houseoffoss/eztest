import dropdownOptionController from '@/backend/controllers/dropdown-option/dropdown-option.controller';
import { hasPermission } from '@/lib/rbac';

/**
 * GET /api/dropdown-options/grouped
 * Get grouped dropdown options by entity and field
 * Required permission: dropdowns:read
 */
export const GET = hasPermission(
  async () => {
    return dropdownOptionController.getGrouped();
  },
  'dropdowns',
  'read'
);

