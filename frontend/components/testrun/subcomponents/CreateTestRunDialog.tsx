'use client';

import { useState, useEffect } from 'react';
import { BaseDialog, BaseDialogField, BaseDialogConfig } from '@/frontend/reusable-components/dialogs/BaseDialog';
import { TestRun } from '../types';
import { useDropdownOptions } from '@/hooks/useDropdownOptions';

interface ProjectMember {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

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

  // Fetch project members for tester assignment
  const [memberOptions, setMemberOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/members`);
        if (response.ok) {
          const data = await response.json();
          const members: ProjectMember[] = data.data || [];
          setMemberOptions(
            members.map((m) => ({
              value: m.user.id,
              label: m.user.name || m.user.email,
            }))
          );
        }
      } catch {
        // Failed to fetch members - select will only show placeholder
      }
    };
    if (projectId) {
      fetchMembers();
    }
  }, [projectId]);

  const fields: BaseDialogField[] = [
    {
      name: 'name',
      label: 'テストラン名',
      placeholder: '例: ログイン機能 - ビルド #123',
      type: 'text',
      required: true,
      minLength: 3,
      maxLength: 50,
      cols: 2,
    },
    {
      name: 'environment',
      label: '環境',
      type: 'select',
      placeholder: '環境を選択',
      required: true,
      defaultValue: 'none',
      options: [
        { value: 'none', label: '環境を選択' },
        ...environmentOptions.map(opt => ({ value: opt.value, label: opt.label })),
      ],
      cols: 2,
    },
    {
      name: 'assignedToId',
      label: 'テスター割り当て',
      type: 'select',
      placeholder: 'テスターを選択',
      defaultValue: 'none',
      options: [
        { value: 'none', label: '未割り当て' },
        ...memberOptions,
      ],
      cols: 2,
    },
    {
      name: 'platform',
      label: 'プラットフォーム',
      type: 'select',
      placeholder: 'プラットフォームを選択',
      defaultValue: 'none',
      options: [
        { value: 'none', label: 'プラットフォームを選択' },
        { value: 'Web', label: 'Web' },
        { value: 'Web(SP)', label: 'Web(SP)' },
        { value: 'iOS Native', label: 'iOS Native' },
        { value: 'Android Native', label: 'Android Native' },
      ],
      cols: 1,
    },
    {
      name: 'device',
      label: '端末',
      type: 'select',
      placeholder: '端末を選択',
      defaultValue: 'none',
      options: [
        { value: 'none', label: '端末を選択' },
        { value: 'iPhone', label: 'iPhone' },
        { value: 'Android', label: 'Android' },
        { value: 'PC', label: 'PC' },
      ],
      cols: 1,
    },
    {
      name: 'version',
      label: 'バージョン',
      placeholder: '例: v1.2.3',
      type: 'text',
      maxLength: 100,
      cols: 2,
    },
    {
      name: 'description',
      label: '説明',
      placeholder: 'テストランの説明を入力',
      type: 'textarea',
      rows: 3,
      cols: 2,
      maxLength: 250,
    },
  ];

  const handleSubmit = async (formData: Record<string, string>) => {
    // Validate environment is selected
    if (formData.environment === 'none' || !formData.environment) {
      throw new Error('環境を選択してください');
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
        version: formData.version || undefined,
        assignedToId: formData.assignedToId && formData.assignedToId !== 'none' ? formData.assignedToId : undefined,
        platform: formData.platform && formData.platform !== 'none' ? formData.platform : undefined,
        device: formData.device && formData.device !== 'none' ? formData.device : undefined,
        executionType: 'MANUAL',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'テストランの作成に失敗しました');
    }

    return data.data;
  };

  const config: BaseDialogConfig<TestRun> = {
    title: 'テストランを作成',
    description: 'テストケースを実行し、結果を記録するための新しいテストランを作成します。',
    fields,
    submitLabel: 'テストランを作成',
    cancelLabel: 'キャンセル',
    triggerOpen,
    onOpenChange,
    onSubmit: handleSubmit,
    onSuccess: (testRun) => {
      if (testRun) {
        onTestRunCreated(testRun);
      }
    },
    submitButtonName: 'Create Test Run Dialog - Create Test Run',
    cancelButtonName: 'Create Test Run Dialog - Cancel',
  };

  return <BaseDialog {...config} />;
}

export type { CreateTestRunDialogProps };
