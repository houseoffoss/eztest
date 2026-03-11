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
    title: 'ユーザーを削除',
    description: `「${userName}」を削除してもよろしいですか？この操作は取り消せません。`,
    submitLabel: '削除',
    cancelLabel: 'キャンセル',
    triggerOpen: open,
    onOpenChange,
    onSubmit: onConfirm,
    destructive: true,
    dialogName: 'Delete User Dialog',
    submitButtonName: 'Delete User Dialog - Delete',
    cancelButtonName: 'Delete User Dialog - Cancel',
  };

  return <BaseConfirmDialog {...config} />;
}
