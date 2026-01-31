/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * NOTE: This file uses @ts-expect-error and 'any' types as temporary workarounds
 * because the Prisma client needs to be regenerated after adding the DropdownOption model.
 * 
 * TO FIX: Run the following command:
 * npx prisma generate
 * 
 * After regenerating, all type errors will be resolved automatically.
 */

import { PrismaClient } from '@prisma/client';
import {
  CreateDropdownOptionInput,
  UpdateDropdownOptionInput,
  QueryDropdownOptionsInput,
  BulkUpdateOrderInput,
} from '../../validators/dropdown-option.validator';

const prisma = new PrismaClient();

// Type definition for DropdownOption (will be generated after prisma generate)
interface DropdownOption {
  id: string;
  entity: string;
  field: string;
  value: string;
  label: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class DropdownOptionService {
  /**
   * Get all dropdown options with optional filtering
   */
  async getAll(query: QueryDropdownOptionsInput): Promise<DropdownOption[]> {
    const { entity, field, isActive } = query;

    const where: any = {};

    if (entity) {
      where.entity = entity;
    }

    if (field) {
      where.field = field;
    }

    if (isActive === 'true') {
      where.isActive = true;
    } else if (isActive === 'false') {
      where.isActive = false;
    }
    // If isActive === 'all', don't filter by isActive

    const options = await prisma.dropdownOption.findMany({
      where,
      orderBy: [{ entity: 'asc' }, { field: 'asc' }, { order: 'asc' }] as any,
    });

    return options as unknown as DropdownOption[];
  }

  /**
   * Get grouped dropdown options by entity and field
   */
  async getGrouped() {
    const options = await prisma.dropdownOption.findMany({
      where: { isActive: true },
      orderBy: [{ entity: 'asc' }, { field: 'asc' }, { order: 'asc' }] as any,
    }) as unknown as DropdownOption[];

    // Group by entity and field
    const grouped: Record<string, Record<string, DropdownOption[]>> = {};

    options.forEach((option) => {
      if (!grouped[option.entity]) {
        grouped[option.entity] = {};
      }
      if (!grouped[option.entity][option.field]) {
        grouped[option.entity][option.field] = [];
      }
      grouped[option.entity][option.field].push(option);
    });

    return grouped;
  }

  /**
   * Get dropdown options for a specific entity and field
   */
  async getByEntityAndField(entity: string, field: string): Promise<DropdownOption[]> {
    const options = await prisma.dropdownOption.findMany({
      where: {
        entity,
        field,
        isActive: true,
      } as any,
      orderBy: { order: 'asc' },
    });

    return options as unknown as DropdownOption[];
  }

  /**
   * Get a single dropdown option by ID
   */
  async getById(id: string): Promise<DropdownOption | null> {
    const option = await prisma.dropdownOption.findUnique({
      where: { id },
    });

    return option as unknown as DropdownOption | null;
  }

  /**
   * Create a new dropdown option
   */
  async create(data: CreateDropdownOptionInput): Promise<DropdownOption> {
    // Check if option with same entity, field, and value already exists
    const existing = await prisma.dropdownOption.findUnique({
      where: {
        entity_field_value: {
          entity: data.entity,
          field: data.field,
          value: data.value,
        },
      } as any,
    });

    if (existing) {
      // If the option exists but is inactive, reactivate it
      if (!(existing as any).isActive) {
        const reactivatedOption = await prisma.dropdownOption.update({
          where: { id: (existing as any).id },
          data: {
            label: data.label,
            order: data.order ?? 0,
            isActive: true,
          },
        });
        return reactivatedOption as unknown as DropdownOption;
      }
      
      // If the option exists and is active, throw an error
      throw new Error(
        `Dropdown option with entity "${data.entity}", field "${data.field}", and value "${data.value}" already exists`
      );
    }

    const option = await prisma.dropdownOption.create({
      data: {
        entity: data.entity,
        field: data.field,
        value: data.value,
        label: data.label,
        order: data.order ?? 0,
      } as any,
    });

    return option as unknown as DropdownOption;
  }

  /**
   * Update a dropdown option
   */
  async update(id: string, data: UpdateDropdownOptionInput): Promise<DropdownOption> {
    // Check if option exists
    const existing = await prisma.dropdownOption.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Dropdown option not found');
    }

    const option = await prisma.dropdownOption.update({
      where: { id },
      data,
    });

    return option as unknown as DropdownOption;
  }

  /**
   * Delete a dropdown option (soft delete by setting isActive to false)
   */
  async delete(id: string): Promise<DropdownOption> {
    // Check if option exists
    const existing = await prisma.dropdownOption.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Dropdown option not found');
    }

    const option = await prisma.dropdownOption.update({
      where: { id },
      data: { isActive: false },
    });

    return option as unknown as DropdownOption;
  }

  /**
   * Hard delete a dropdown option
   */
  async hardDelete(id: string): Promise<void> {
    await prisma.dropdownOption.delete({
      where: { id },
    });
  }

  /**
   * Bulk update order of dropdown options
   */
  async bulkUpdateOrder(data: BulkUpdateOrderInput): Promise<void> {
    const updatePromises = data.updates.map((update) =>
      prisma.dropdownOption.update({
        where: { id: update.id },
        data: { order: update.order },
      })
    );

    await Promise.all(updatePromises);
  }

  /**
   * Get all unique entities
   */
  async getEntities(): Promise<string[]> {
    const options = await prisma.dropdownOption.findMany({
      select: { entity: true } as any,
      distinct: ['entity'] as any,
      orderBy: { entity: 'asc' } as any,
    });

    return options.map((opt: any) => opt.entity);
  }

  /**
   * Get all fields for a specific entity
   */
  async getFieldsByEntity(entity: string): Promise<string[]> {
    const options = await prisma.dropdownOption.findMany({
      where: { entity } as any,
      select: { field: true } as any,
      distinct: ['field'] as any,
      orderBy: { field: 'asc' } as any,
    });

    return options.map((opt: any) => opt.field);
  }
}

const dropdownOptionService = new DropdownOptionService();
export default dropdownOptionService;

