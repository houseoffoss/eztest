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
      <p className="font-semibold mb-2">Будет удалено навсегда:</p>
      <ul className="list-disc list-inside space-y-1">
        <li>Все тест-кейсы</li>
        <li>Все тест-раны</li>
        <li>Все тест-сьюты</li>
        <li>Все требования</li>
        <li>Все данные проекта</li>
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
      throw new Error(data.message || data.error || 'Не удалось удалить проект');
    }
  };

  const config: BaseConfirmDialogConfig = {
    title: 'Удаление проекта',
    description: `Вы уверены, что хотите удалить "${project?.name}"? Это действие нельзя отменить.`,
    content,
    submitLabel: 'Удалить проект',
    cancelLabel: 'Отмена',
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
