'use client';

import { BaseConfirmDialog, BaseConfirmDialogConfig } from '@/frontend/reusable-components/dialogs/BaseConfirmDialog';

interface RemoveMemberDialogProps {
  member: { id: string; name: string } | null;
  triggerOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}

export type { RemoveMemberDialogProps };

/**
 * Reusable dialog for removing project members
 * Uses BaseConfirmDialog pattern for consistency with test suite and test case delete dialogs
 */
export function RemoveMemberDialog({
  member,
  triggerOpen,
  onOpenChange,
  onConfirm,
}: RemoveMemberDialogProps) {
  if (!member) return null;

  const content = (
    <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
      <p className="font-semibold mb-2">Это действие:</p>
      <ul className="list-disc list-inside space-y-1">
        <li>Удалит доступ участника к проекту</li>
        <li>Сразу отзовет его права</li>
        <li>Доступ можно вернуть, снова добавив участника</li>
      </ul>
    </div>
  );

  const config: BaseConfirmDialogConfig = {
    title: 'Удалить участника',
    description: `Вы уверены, что хотите удалить ${member.name} из этого проекта?`,
    content,
    submitLabel: 'Удалить',
    cancelLabel: 'Отмена',
    triggerOpen,
    onOpenChange,
    onSubmit: onConfirm,
    destructive: true,
  };

  return <BaseConfirmDialog {...config} />;
}
