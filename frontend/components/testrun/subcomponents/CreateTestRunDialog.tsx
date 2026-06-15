'use client';

import { BaseDialog, BaseDialogField, BaseDialogConfig } from '@/frontend/reusable-components/dialogs/BaseDialog';
import { TestRun } from '../types';
import { useDropdownOptions } from '@/hooks/useDropdownOptions';

interface CreateTestRunDialogProps {
  projectId: string;
  triggerOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onTestRunCreated: (testRun: TestRun) => void;
}

export function CreateTestRunDialog({
  projectId,
  triggerOpen,
  onOpenChange,
  onTestRunCreated,
}: CreateTestRunDialogProps) {
  // Fetch dynamic dropdown options
  const { options: environmentOptions } = useDropdownOptions('TestRun', 'environment');

  const fields: BaseDialogField[] = [
    {
      name: 'name',
      label: 'Название тест-рана',
      placeholder: 'Например: Login Feature - Build #123',
      type: 'text',
      required: true,
      minLength: 3,
      maxLength: 50,
      cols: 2,
    },
    {
      name: 'environment',
      label: 'Окружение',
      type: 'select',
      placeholder: 'Выберите окружение',
      required: true,
      defaultValue: 'none',
      options: [
        { value: 'none', label: 'Выберите окружение' },
        ...environmentOptions.map(opt => ({ value: opt.value, label: opt.label })),
      ],
      cols: 2,
    },
    {
      name: 'description',
      label: 'Описание',
      placeholder: 'Введите описание тест-рана',
      type: 'textarea',
      rows: 3,
      cols: 2,
      maxLength: 250,
    },
  ];

  const handleSubmit = async (formData: Record<string, string>) => {
    // Validate environment is selected
    if (formData.environment === 'none' || !formData.environment) {
      throw new Error('Окружение обязательно');
    }

    const response = await fetch(`/api/projects/${projectId}/testruns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.name,
        description: formData.description || undefined,
        environment: formData.environment,
        executionType: 'MANUAL',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Не удалось создать тест-ран');
    }

    return data.data;
  };

  const config: BaseDialogConfig<TestRun> = {
    title: 'Создать тест-ран',
    description: 'Создайте новый тест-ран для выполнения тест-кейсов и отслеживания результатов.',
    fields,
    submitLabel: 'Создать тест-ран',
    cancelLabel: 'Отмена',
    triggerOpen,
    onOpenChange,
    onSubmit: handleSubmit,
    onSuccess: (testRun) => {
      if (testRun) {
        onTestRunCreated(testRun);
      }
    },
    submitButtonName: 'Диалог создания тест-рана - Создать',
    cancelButtonName: 'Диалог создания тест-рана - Отмена',
  };

  return <BaseDialog {...config} />;
}

export type { CreateTestRunDialogProps };
