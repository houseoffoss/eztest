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
    title: 'Delete User',
    description: `Are you sure you want to delete "${userName}"? This action cannot be undone.`,
    submitLabel: 'Delete',
    cancelLabel: 'Cancel',
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
