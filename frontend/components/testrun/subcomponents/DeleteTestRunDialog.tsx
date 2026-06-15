'use client';

import { BaseConfirmDialog, BaseConfirmDialogConfig } from '@/frontend/reusable-components/dialogs/BaseConfirmDialog';
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
    title: 'Удаление тест-рана',
    description: `Вы уверены, что хотите удалить "${testRun?.name}"? Также будут удалены все результаты тестов. Это действие нельзя отменить.`,
    submitLabel: 'Удалить',
    cancelLabel: 'Отмена',
    triggerOpen,
    onOpenChange,
    onSubmit: onConfirm,
    destructive: true,
    dialogName: 'Диалог удаления тест-рана',
    submitButtonName: 'Диалог удаления тест-рана - Удалить',
    cancelButtonName: 'Диалог удаления тест-рана - Отмена',
  };

  return <BaseConfirmDialog {...config} />;
}
