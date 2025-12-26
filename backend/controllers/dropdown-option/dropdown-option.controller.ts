import dropdownOptionService from '../../services/dropdown-option/dropdown-option.service';
import {
  CreateDropdownOptionInput,
  UpdateDropdownOptionInput,
  QueryDropdownOptionsInput,
  BulkUpdateOrderInput,
} from '../../validators/dropdown-option.validator';
import { NotFoundException } from '../../utils/exceptions';

export class DropdownOptionController {
  /**
   * GET /api/dropdown-options
   * Get all dropdown options with optional filtering
   */
  async getAll(query: QueryDropdownOptionsInput) {
    const options = await dropdownOptionService.getAll(query);

    return {
      success: true,
      data: options,
    };
  }

  /**
   * GET /api/dropdown-options/grouped
   * Get grouped dropdown options by entity and field
   */
  async getGrouped() {
    const grouped = await dropdownOptionService.getGrouped();

    return {
      success: true,
      data: grouped,
    };
  }

  /**
   * GET /api/dropdown-options/entities
   * Get all unique entities
   */
  async getEntities() {
    const entities = await dropdownOptionService.getEntities();

    return {
      success: true,
      data: entities,
    };
  }

  /**
   * GET /api/dropdown-options/entities/:entity/fields
   * Get all fields for a specific entity
   */
  async getFieldsByEntity(entity: string) {
    const fields = await dropdownOptionService.getFieldsByEntity(entity);

    return {
      success: true,
      data: fields,
    };
  }

  /**
   * GET /api/dropdown-options/:id
   * Get a single dropdown option by ID
   */
  async getById(id: string) {
    const option = await dropdownOptionService.getById(id);

    if (!option) {
      throw new NotFoundException('Dropdown option not found');
    }

    return {
      success: true,
      data: option,
    };
  }

  /**
   * POST /api/dropdown-options
   * Create a new dropdown option
   */
  async create(data: CreateDropdownOptionInput) {
    const option = await dropdownOptionService.create(data);

    return {
      success: true,
      message: 'Dropdown option created successfully',
      data: option,
    };
  }

  /**
   * PUT /api/dropdown-options/:id
   * Update a dropdown option
   */
  async update(id: string, data: UpdateDropdownOptionInput) {
    const option = await dropdownOptionService.update(id, data);

    return {
      success: true,
      message: 'Dropdown option updated successfully',
      data: option,
    };
  }

  /**
   * DELETE /api/dropdown-options/:id
   * Soft delete a dropdown option
   */
  async delete(id: string) {
    const option = await dropdownOptionService.delete(id);

    return {
      success: true,
      message: 'Dropdown option deleted successfully',
      data: option,
    };
  }

  /**
   * POST /api/dropdown-options/bulk-update-order
   * Bulk update order of dropdown options
   */
  async bulkUpdateOrder(data: BulkUpdateOrderInput) {
    await dropdownOptionService.bulkUpdateOrder(data);

    return {
      success: true,
      message: 'Dropdown options order updated successfully',
    };
  }
}

const dropdownOptionController = new DropdownOptionController();
export default dropdownOptionController;

