'use client';

import { BaseConfirmDialog, BaseConfirmDialogConfig } from '@/frontend/reusable-components/dialogs/BaseConfirmDialog';

interface DeleteTestSuiteDialogProps {
  open: boolean;
  testSuiteName: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}

export function DeleteTestSuiteDialog({
  open,
  testSuiteName,
  onOpenChange,
  onConfirm,
}: DeleteTestSuiteDialogProps) {
  const content = (
    <p className="text-sm text-gray-300">
      Test cases in this suite will not be deleted, but will become unorganized.
    </p>
  );

  const config: BaseConfirmDialogConfig = {
    title: 'Delete Test Suite',
    description: `Are you sure you want to delete "${testSuiteName}"? This action cannot be undone.`,
    content,
    submitLabel: 'Delete',
    cancelLabel: 'Cancel',
    triggerOpen: open,
    onOpenChange,
    onSubmit: onConfirm,
    destructive: true,
    dialogName: 'Delete Test Suite Dialog (Detail)',
    submitButtonName: 'Delete Test Suite Dialog (Detail) - Delete',
    cancelButtonName: 'Delete Test Suite Dialog (Detail) - Cancel',
  };

  return <BaseConfirmDialog {...config} />;
}
