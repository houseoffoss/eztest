'use client';

import { BaseDialog, BaseDialogField, BaseDialogConfig } from '@/components/design/BaseDialog';
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
      label: 'Project Name',
      placeholder: 'E-Commerce Platform',
      type: 'text',
      required: true,
      minLength: 3,
      maxLength: 255,
    },
    {
      name: 'key',
      label: 'Project Key',
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
      label: 'Description',
      placeholder: 'Brief description of the project...',
      type: 'textarea',
      rows: 3,
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
      throw new Error(data.message || data.error || 'Failed to create project');
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
    title: 'Create New Project',
    description: 'Set up a new project to organize your test cases and test runs.',
    fields,
    submitLabel: 'Create Project',
    cancelLabel: 'Cancel',
    triggerOpen,
    onOpenChange,
    onSubmit: handleSubmit,
    onSuccess: (project) => {
      if (project) {
        onProjectCreated(project);
      }
    },
  };

  return <BaseDialog {...config} />;
};
