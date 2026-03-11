'use client';

import { BaseConfirmDialog, BaseConfirmDialogConfig } from '@/frontend/reusable-components/dialogs/BaseConfirmDialog';
import { TestSuite } from '../types';

export interface DeleteTestSuiteDialogProps {
  suite: TestSuite | null;
  triggerOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm: () => void;
}

/**
 * Generic delete confirmation dialog for test suites
 * Displays warnings about related items (test cases, child suites)
 */
export function DeleteTestSuiteDialog({
  suite,
  triggerOpen,
  onOpenChange,
  onConfirm,
}: DeleteTestSuiteDialogProps) {
  if (!suite) return null;

  const hasTestCases = suite._count?.testCases > 0;
  const hasChildren = suite.children && suite.children.length > 0;

  const content = (
    <div className="space-y-3">
      {hasTestCases && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-200">
          <p className="font-medium">⚠️ このスイートには {suite._count.testCases} 件のテストケースが含まれています</p>
          <p className="mt-1 text-yellow-300/80">
            テストケースは削除されませんが、未整理になります。
          </p>
        </div>
      )}

      {hasChildren && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-200">
          <p className="font-medium">⚠️ このスイートには {suite.children?.length} 件の子スイートが含まれています</p>
          <p className="mt-1 text-yellow-300/80">
            子スイートはルートレベルに移動します。
          </p>
        </div>
      )}

      {!hasTestCases && !hasChildren && (
        <p className="text-sm text-gray-300">
          この操作は取り消せません。
        </p>
      )}
    </div>
  );

  const config: BaseConfirmDialogConfig = {
    title: 'テストスイートを削除',
    description: `「${suite.name}」を削除してもよろしいですか？`,
    content,
    submitLabel: '削除',
    cancelLabel: 'キャンセル',
    triggerOpen,
    onOpenChange,
    onSubmit: async () => onConfirm(),
    destructive: true,
    dialogName: 'Delete Test Suite Dialog',
    submitButtonName: 'Delete Test Suite Dialog - Delete',
    cancelButtonName: 'Delete Test Suite Dialog - Cancel',
  };

  return <BaseConfirmDialog {...config} />;
}
