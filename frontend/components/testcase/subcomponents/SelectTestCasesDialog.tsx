'use client';

import { Button } from '@/elements/button';
import { ButtonPrimary } from '@/elements/button-primary';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/elements/dialog';
import { Checkbox } from '@/elements/checkbox';
import { TestCase } from '../types';

/**
 * @deprecated Use AddTestCasesDialog from @/frontend/components/common/dialogs instead
 * This component is kept for backward compatibility but should not be used for new code
 */
interface SelectTestCasesDialogProps {
  open: boolean;
  testCases: TestCase[];
  selectedIds: string[];
  onOpenChange: (open: boolean) => void;
  onSelectionChange: (ids: string[]) => void;
  onSubmit: () => void;
}

export function SelectTestCasesDialog({
  open,
  testCases,
  selectedIds,
  onOpenChange,
  onSelectionChange,
  onSubmit,
}: SelectTestCasesDialogProps) {
  const handleToggle = (testCaseId: string) => {
    onSelectionChange(
      selectedIds.includes(testCaseId)
        ? selectedIds.filter((id) => id !== testCaseId)
        : [...selectedIds, testCaseId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Test Cases</DialogTitle>
          <DialogDescription>
            Select test cases to add to this suite
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
          <div className="space-y-3">
            {testCases.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                No available test cases to add
              </p>
            ) : (
              testCases.map((testCase) => (
                <div
                  key={testCase.id}
                  className="flex items-start gap-3 p-3 border border-white/10 rounded hover:bg-slate-800/50 cursor-pointer transition-colors"
                  onClick={() => handleToggle(testCase.id)}
                >
                  <Checkbox
                    checked={selectedIds.includes(testCase.id)}
                    onCheckedChange={() => handleToggle(testCase.id)}
                    variant="glass"
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{testCase.title}</p>
                    {testCase.description && (
                      <p className="text-xs text-gray-400 line-clamp-2 mt-1">
                        {testCase.description}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="glass"
            onClick={() => {
              onOpenChange(false);
              onSelectionChange([]);
            }}
          >
            Cancel
          </Button>
          <ButtonPrimary
            onClick={onSubmit}
            disabled={selectedIds.length === 0}
          >
            Add ({selectedIds.length})
          </ButtonPrimary>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
