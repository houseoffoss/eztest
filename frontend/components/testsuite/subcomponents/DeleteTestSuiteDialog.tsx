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
          <p className="font-medium">⚠️ This suite contains {suite._count.testCases} test case(s)</p>
          <p className="mt-1 text-yellow-300/80">
            Test cases will not be deleted but will become unorganized.
          </p>
        </div>
      )}

      {hasChildren && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-200">
          <p className="font-medium">⚠️ This suite contains {suite.children?.length} child suite(s)</p>
          <p className="mt-1 text-yellow-300/80">
            Child suites will be moved to root level.
          </p>
        </div>
      )}

      {!hasTestCases && !hasChildren && (
        <p className="text-sm text-gray-300">
          This action cannot be undone.
        </p>
      )}
    </div>
  );

  const config: BaseConfirmDialogConfig = {
    title: 'Delete Test Suite',
    description: `Are you sure you want to delete "${suite.name}"?`,
    content,
    submitLabel: 'Delete',
    cancelLabel: 'Cancel',
    triggerOpen,
    onOpenChange,
    onSubmit: async () => onConfirm(),
    destructive: true,
  };

  return <BaseConfirmDialog {...config} />;
}
