'use client';

import { BaseConfirmDialog, BaseConfirmDialogConfig } from '@/components/design/BaseConfirmDialog';

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
  };

  return <BaseConfirmDialog {...config} />;
}
