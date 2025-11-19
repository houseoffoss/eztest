'use client';

import { Button } from '@/elements/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/elements/dialog';
import { TestSuite } from '../types';

interface DeleteTestSuiteDialogProps {
  open: boolean;
  suite: TestSuite | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export type { DeleteTestSuiteDialogProps };

/**
 * Generic delete confirmation dialog for test suites
 * Displays warnings about related items (test cases, child suites)
 */
export function DeleteTestSuiteDialog({
  open,
  suite,
  onOpenChange,
  onConfirm,
}: DeleteTestSuiteDialogProps) {
  if (!suite) return null;

  const hasTestCases = suite._count?.testCases > 0;
  const hasChildren = suite.children && suite.children.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="glass">
        <DialogHeader>
          <DialogTitle>Delete Test Suite</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{suite.name}&quot;?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
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

        <DialogFooter>
          <Button variant="glass" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="glass-destructive" onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
