'use client';

import { BaseConfirmDialog, BaseConfirmDialogConfig } from '@/frontend/reusable-components/dialogs/BaseConfirmDialog';
import { TestCase } from '../types';

interface DeleteTestCaseDialogProps {
  open: boolean;
  testCase: TestCase | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}

export function DeleteTestCaseDialog({
  open,
  testCase,
  onOpenChange,
  onConfirm,
}: DeleteTestCaseDialogProps) {
  if (!testCase) return null;

  const config: BaseConfirmDialogConfig = {
    title: 'Удалить тест-кейс',
    description: `Вы уверены, что хотите удалить «${testCase.title}»? Это действие нельзя отменить.`,
    submitLabel: 'Удалить',
    cancelLabel: 'Отмена',
    triggerOpen: open,
    onOpenChange,
    onSubmit: onConfirm,
    destructive: true,
    dialogName: 'Delete Test Case Dialog (Detail)',
    submitButtonName: 'Delete Test Case Dialog (Detail) - Delete',
    cancelButtonName: 'Delete Test Case Dialog (Detail) - Cancel',
  };

  return <BaseConfirmDialog {...config} />;
}
