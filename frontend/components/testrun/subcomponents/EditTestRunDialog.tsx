'use client';

import { useEffect, useState } from 'react';
import { BaseDialog, BaseDialogField, BaseDialogConfig } from '@/frontend/reusable-components/dialogs/BaseDialog';
import { useDropdownOptions } from '@/hooks/useDropdownOptions';

interface ProjectMember {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface EditTestRunDialogProps {
  projectId: string;
  testRun: {
    id: string;
    name: string;
    description?: string;
    environment?: string;
    version?: string;
    platform?: string;
    device?: string;
    assignedTo?: {
      id: string;
    };
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTestRunUpdated: (updatedTestRun: { id: string; name: string }) => void;
}

export function EditTestRunDialog({
  projectId,
  testRun,
  open,
  onOpenChange,
  onTestRunUpdated,
}: EditTestRunDialogProps) {
  const [key, setKey] = useState(0);
  const { options: environmentOptions } = useDropdownOptions('TestRun', 'environment');
  const [memberOptions, setMemberOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    if (open && testRun) {
      setKey((prev) => prev + 1);
    }
  }, [open, testRun]);

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
      defaultValue: testRun?.name || '',
    },
    {
      name: 'environment',
      label: '環境',
      type: 'select',
      placeholder: '環境を選択',
      defaultValue: testRun?.environment || 'none',
      options: [
        { value: 'none', label: '環境を選択' },
        ...environmentOptions.map((opt) => ({ value: opt.value, label: opt.label })),
      ],
      cols: 2,
    },
    {
      name: 'assignedToId',
      label: 'テスター割り当て',
      type: 'select',
      placeholder: 'テスターを選択',
      defaultValue: testRun?.assignedTo?.id || 'none',
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
      defaultValue: testRun?.platform || 'none',
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
      defaultValue: testRun?.device || 'none',
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
      defaultValue: testRun?.version || '',
    },
    {
      name: 'description',
      label: '説明',
      placeholder: 'テストランの説明を入力',
      type: 'textarea',
      rows: 3,
      cols: 2,
      maxLength: 250,
      defaultValue: testRun?.description || '',
    },
  ];

  const handleSubmit = async (formData: Record<string, string>) => {
    if (!testRun) {
      throw new Error('編集対象のテストランが見つかりません');
    }

    const response = await fetch(`/api/projects/${projectId}/testruns/${testRun.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.name,
        description: formData.description || undefined,
        environment: formData.environment && formData.environment !== 'none' ? formData.environment : undefined,
        version: formData.version || undefined,
        assignedToId: formData.assignedToId && formData.assignedToId !== 'none' ? formData.assignedToId : undefined,
        platform: formData.platform && formData.platform !== 'none' ? formData.platform : undefined,
        device: formData.device && formData.device !== 'none' ? formData.device : undefined,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'テストランの更新に失敗しました');
    }

    return data.data;
  };

  const config: BaseDialogConfig = {
    title: 'テストランを編集',
    description: 'テストラン情報を更新します。',
    fields,
    submitLabel: '更新する',
    cancelLabel: 'キャンセル',
    triggerOpen: open,
    onOpenChange,
    onSubmit: handleSubmit,
    onSuccess: (result) => {
      if (result && testRun) {
        const updated = result as { id: string; name: string };
        onTestRunUpdated({ id: updated.id || testRun.id, name: updated.name || testRun.name });
      }
    },
    disablePersistence: true,
    submitButtonName: 'Edit Test Run Dialog - Update',
    cancelButtonName: 'Edit Test Run Dialog - Cancel',
  };

  return <BaseDialog key={key} {...config} />;
}

export type { EditTestRunDialogProps };
