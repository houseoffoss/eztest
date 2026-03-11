'use client';

import { BaseConfirmDialog, BaseConfirmDialogConfig } from '@/frontend/reusable-components/dialogs/BaseConfirmDialog';

interface DeleteProjectDialogProps {
  project: {
    id: string;
    name: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectDeleted: (projectId: string) => void;
}

export const DeleteProjectDialog = ({ project, open, onOpenChange, onProjectDeleted }: DeleteProjectDialogProps) => {
  const content = (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-red-300">
      <p className="font-semibold mb-2">以下が完全に削除されます：</p>
      <ul className="list-disc list-inside space-y-1">
        <li>すべてのテストケース</li>
        <li>すべてのテストラン</li>
        <li>すべてのテストスイート</li>
        <li>すべての要件</li>
        <li>プロジェクトのすべてのデータ</li>
      </ul>
    </div>
  );

  const handleSubmit = async () => {
    if (!project) return;

    const response = await fetch(`/api/projects/${project.id}`, {
      method: 'DELETE',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'プロジェクトの削除に失敗しました');
    }
  };

  const config: BaseConfirmDialogConfig = {
    title: 'プロジェクトを削除',
    description: `「${project?.name}」を削除してもよろしいですか？この操作は取り消せません。`,
    content,
    submitLabel: 'プロジェクトを削除',
    cancelLabel: 'キャンセル',
    triggerOpen: open,
    onOpenChange,
    onSubmit: handleSubmit,
    onSuccess: () => {
      if (project) {
        onProjectDeleted(project.id);
      }
    },
    destructive: true,
    dialogName: 'Delete Project Dialog',
    submitButtonName: 'Delete Project Dialog - Delete Project',
    cancelButtonName: 'Delete Project Dialog - Cancel',
  };

  return <BaseConfirmDialog {...config} />;
};
