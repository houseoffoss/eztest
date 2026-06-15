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
      label: 'Название папки',
      placeholder: 'Введите название папки',
      type: 'text',
      required: true,
      minLength: 1,
      maxLength: 150,
      cols: 2,
    },
    {
      name: 'description',
      label: 'Описание',
      type: 'textarea',
      placeholder: 'Введите описание папки (необязательно)',
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
      throw new Error(error.error || error.message || 'Не удалось создать папку');
    }

    const result = await response.json();
    return result.data;
  };

  const config: BaseDialogConfig = {
    title: 'Создать папку',
    description: 'Организуйте тест-кейсы по папкам для удобной структуры и управления.',
    fields,
    submitLabel: 'Создать папку',
    cancelLabel: 'Отмена',
    triggerOpen,
    onOpenChange,
    onSubmit: handleSubmit,
    onSuccess: (module) => {
      if (module && typeof module === 'object') {
        onModuleCreated(module as Module);
      }
    },
    submitButtonName: 'Диалог создания папки - Создать',
    cancelButtonName: 'Диалог создания папки - Отмена',
  };

  return <BaseDialog {...config} />;
}
