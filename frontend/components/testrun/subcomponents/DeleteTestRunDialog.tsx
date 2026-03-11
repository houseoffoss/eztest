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
    title: 'テストランを削除',
    description: `「${testRun?.name}」を削除してもよろしいですか？すべてのテスト結果も削除されます。この操作は取り消せません。`,
    submitLabel: '削除',
    cancelLabel: 'キャンセル',
    triggerOpen,
    onOpenChange,
    onSubmit: onConfirm,
    destructive: true,
    dialogName: 'Delete Test Run Dialog',
    submitButtonName: 'Delete Test Run Dialog - Delete',
    cancelButtonName: 'Delete Test Run Dialog - Cancel',
  };

  return <BaseConfirmDialog {...config} />;
}
