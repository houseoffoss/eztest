'use client';

import { BaseDialog, BaseDialogField, BaseDialogConfig } from '@/frontend/reusable-components/dialogs/BaseDialog';
import { Module } from '../types';

export interface CreateModuleDialogProps {
  projectId: string;
  triggerOpen?: boolean;
  onOpenChange: (open: boolean) => void;
  onModuleCreated: (module: Module) => void;
}

export function CreateModuleDialog({
  projectId,
  triggerOpen,
  onOpenChange,
  onModuleCreated,
}: CreateModuleDialogProps) {
  const fields: BaseDialogField[] = [
    {
      name: 'name',
      label: 'Module Name',
      placeholder: 'Enter module name',
      type: 'text',
      required: true,
      minLength: 1,
      maxLength: 50,
      cols: 2,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Enter module description (optional)',
      rows: 3,
      cols: 2,
      maxLength: 250,
    },
  ];

  const handleSubmit = async (data: Record<string, unknown>) => {
    const response = await fetch(`/api/projects/${projectId}/modules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        description: data.description || undefined,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || 'Failed to create module');
    }

    const result = await response.json();
    return result.data;
  };

  const config: BaseDialogConfig = {
    title: 'Create Module',
    description: 'Organize your test cases into modules for better structure and management.',
    fields,
    submitLabel: 'Create Module',
    cancelLabel: 'Cancel',
    triggerOpen,
    onOpenChange,
    onSubmit: handleSubmit,
    onSuccess: (module) => {
      if (module && typeof module === 'object') {
        onModuleCreated(module as Module);
      }
    },
  };

  return <BaseDialog {...config} />;
}
