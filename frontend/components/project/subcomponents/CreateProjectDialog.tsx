'use client';

import { BaseDialog, BaseDialogField, BaseDialogConfig } from '@/frontend/reusable-components/dialogs/BaseDialog';
import { Project } from '../types';

interface CreateProjectDialogProps {
  onProjectCreated: (project: Project) => void;
  triggerOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const CreateProjectDialog = ({ onProjectCreated, triggerOpen, onOpenChange }: CreateProjectDialogProps) => {
  const fields: BaseDialogField[] = [
    {
      name: 'name',
      label: 'Название проекта',
      placeholder: 'Мой отличный проект',
      type: 'text',
      required: true,
      minLength: 3,
      maxLength: 50,
    },
    {
      name: 'key',
      label: 'Ключ проекта',
      placeholder: 'ECOM',
      type: 'text',
      required: true,
      minLength: 2,
      maxLength: 10,
      transform: 'uppercase',
      pattern: '^[A-Z0-9]+$',
    },
    {
      name: 'description',
      label: 'Описание',
      placeholder: 'Краткое описание проекта...',
      type: 'textarea',
      rows: 3,
      maxLength: 250,
    },
  ];

  const handleSubmit = async (formData: Record<string, string>) => {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.name,
        key: formData.key,
        description: formData.description || undefined,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Не удалось создать проект');
    }

    // Ensure the project has the required structure
    const project: Project = {
      ...data.data,
      createdBy: data.data.createdBy || { id: '', name: '', email: '', avatar: null },
      members: data.data.members || [],
    };

    return project;
  };

  const config: BaseDialogConfig<Project> = {
    title: 'Создать новый проект',
    description: 'Создайте новый проект для организации тест-кейсов и тест-ранов.',
    fields,
    submitLabel: 'Создать проект',
    cancelLabel: 'Отмена',
    triggerOpen,
    onOpenChange,
    onSubmit: handleSubmit,
    onSuccess: (project) => {
      if (project) {
        onProjectCreated(project);
      }
    },
    submitButtonName: 'Create Project Dialog - Create Project',
    cancelButtonName: 'Create Project Dialog - Cancel',
  };

  return <BaseDialog {...config} />;
};
