'use client';

import { BaseConfirmDialog, BaseConfirmDialogConfig } from '@/frontend/reusable-components/dialogs/BaseConfirmDialog';

interface DeleteUserDialogProps {
  open: boolean;
  userName: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}

export function DeleteUserDialog({ open, userName, onOpenChange, onConfirm }: DeleteUserDialogProps) {
  const config: BaseConfirmDialogConfig = {
    title: 'Удалить пользователя',
    description: `Вы уверены, что хотите удалить пользователя "${userName}"? Это действие нельзя отменить.`,
    submitLabel: 'Удалить',
    cancelLabel: 'Отмена',
    triggerOpen: open,
    onOpenChange,
    onSubmit: onConfirm,
    destructive: true,
    dialogName: 'Диалог удаления пользователя',
    submitButtonName: 'Диалог удаления пользователя - Удалить',
    cancelButtonName: 'Диалог удаления пользователя - Отмена',
  };

  return <BaseConfirmDialog {...config} />;
}
