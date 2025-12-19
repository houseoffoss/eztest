'use client';

import { BaseConfirmDialog, BaseConfirmDialogConfig } from '@/components/design/BaseConfirmDialog';
import { TestRun } from '../types';

interface DeleteTestRunDialogProps {
  testRun: TestRun | null;
  triggerOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}

export type { DeleteTestRunDialogProps };

export function DeleteTestRunDialog({
  testRun,
  triggerOpen,
  onOpenChange,
  onConfirm,
}: DeleteTestRunDialogProps) {
  const config: BaseConfirmDialogConfig = {
    title: 'Delete Test Run',
    description: `Are you sure you want to delete "${testRun?.name}"? This will also delete all test results. This action cannot be undone.`,
    submitLabel: 'Delete',
    cancelLabel: 'Cancel',
    triggerOpen,
    onOpenChange,
    onSubmit: onConfirm,
    destructive: true,
  };

  return <BaseConfirmDialog {...config} />;
}
