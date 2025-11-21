'use client';

import { BaseConfirmDialog, BaseConfirmDialogConfig } from '@/components/design/BaseConfirmDialog';
import { TestCase } from '../types';

interface DeleteTestCaseDialogProps {
  open: boolean;
  testCase: TestCase | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export type { DeleteTestCaseDialogProps };

export function DeleteTestCaseDialog({
  open,
  testCase,
  onOpenChange,
  onConfirm,
}: DeleteTestCaseDialogProps) {
  const config: BaseConfirmDialogConfig = {
    title: 'Delete Test Case',
    description: `Are you sure you want to delete "${testCase?.title}"? This action cannot be undone.`,
    submitLabel: 'Delete',
    cancelLabel: 'Cancel',
    triggerOpen: open,
    onOpenChange,
    onSubmit: async () => onConfirm(),
    destructive: true,
  };

  return <BaseConfirmDialog {...config} />;
}
