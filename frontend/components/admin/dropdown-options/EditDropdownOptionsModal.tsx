'use client';

import { useState } from 'react';
import { DropdownOptionsEditor, type CreateOptionData, type UpdateOptionData } from '@/frontend/reusable-components/editors';
import { DropdownOption, CreateDropdownOptionInput, UpdateDropdownOptionInput } from './types';

interface EditDropdownOptionsModalProps {
  entity: string;
  field: string;
  options: DropdownOption[];
  onClose: () => void;
  onSaveSuccess: () => void;
}

export default function EditDropdownOptionsModal({
  entity,
  field,
  options,
  onClose,
  onSaveSuccess,
}: EditDropdownOptionsModalProps) {
  const [open, setOpen] = useState(true);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      onClose();
    }
  };

  const handleSave = async (
    toCreate: CreateOptionData[],
    toUpdate: UpdateOptionData[],
    orderUpdates: Array<{ id: string; order: number }>
  ) => {
    // Create new options
    for (const option of toCreate) {
      const createData: CreateDropdownOptionInput = {
        entity: option.entity,
        field: option.field,
        value: option.value.toUpperCase().replace(/\s+/g, '_'),
        label: option.label,
        order: option.order,
      };

      const response = await fetch('/api/dropdown-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create option');
      }
    }

    // Update existing options
    for (const option of toUpdate) {
      const original = options.find((opt) => opt.id === option.id);
      if (!original) continue;

      // Check if anything changed
      const hasChanges =
        original.label !== option.label ||
        original.isActive !== option.isActive;

      if (hasChanges) {
        const updateData: UpdateDropdownOptionInput = {
          label: option.label,
          order: option.order,
          isActive: option.isActive,
        };

        const response = await fetch(`/api/dropdown-options/${option.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to update option');
        }
      }
    }

    // Bulk update order if needed
    if (orderUpdates.length > 0) {
      const response = await fetch('/api/dropdown-options/bulk-update-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: orderUpdates }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update order');
      }
    }
  };

  const formatFieldName = (field: string): string => {
    return field
      .split(/(?=[A-Z])/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatEntityName = (entity: string): string => {
    return entity
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <DropdownOptionsEditor
      title={`Edit ${formatEntityName(entity)} - ${formatFieldName(field)}`}
      description="Manage dropdown values and order"
      entity={entity}
      field={field}
      options={options}
      open={open}
      onOpenChange={handleOpenChange}
      onSave={handleSave}
      onSuccess={onSaveSuccess}
    />
  );
}
