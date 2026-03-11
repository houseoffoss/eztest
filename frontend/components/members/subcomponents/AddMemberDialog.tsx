'use client';

import { BaseDialog, BaseDialogField, BaseDialogConfig } from '@/frontend/reusable-components/dialogs/BaseDialog';

interface CreateAddMemberDialogProps {
  projectId: string;
  triggerOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onMemberAdded: (member: unknown) => void;
}

export function CreateAddMemberDialog({
  projectId,
  triggerOpen,
  onOpenChange,
  onMemberAdded,
}: CreateAddMemberDialogProps) {
  
  const fields: BaseDialogField[] = [
    {
      name: 'email',
      label: 'ユーザーのメールアドレス',
      placeholder: 'user@example.com',
      type: 'email',
      required: true,
    },
  ];

  const handleSubmit = async (formData: Record<string, string>) => {
    const response = await fetch(`/api/projects/${projectId}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: formData.email,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Failed to add member');
    }

    return data.data;
  };

  const config: BaseDialogConfig = {
    title: 'プロジェクトメンバーを追加',
    description: 'このプロジェクトにメンバーを追加します',
    fields,
    submitLabel: '追加',
    cancelLabel: 'キャンセル',
    triggerOpen,
    onOpenChange,
    onSubmit: handleSubmit,
    onSuccess: (member) => {
      if (member) {
        onMemberAdded(member);
      }
    },
  };

  return <BaseDialog {...config} />;
}

export type { CreateAddMemberDialogProps };

