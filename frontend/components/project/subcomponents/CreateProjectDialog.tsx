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
      label: 'プロジェクト名',
      placeholder: '例: マイプロジェクト',
      type: 'text',
      required: true,
      minLength: 3,
      maxLength: 50,
    },
    {
      name: 'key',
      label: 'プロジェクトキー',
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
      label: '説明',
      placeholder: 'プロジェクトの簡単な説明...',
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
      throw new Error(data.message || data.error || 'プロジェクトの作成に失敗しました');
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
    title: '新規プロジェクトを作成',
    description: 'テストケースとテストランを整理するための新しいプロジェクトを設定します。',
    fields,
    submitLabel: 'プロジェクトを作成',
    cancelLabel: 'キャンセル',
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
