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
import { TestCase } from '../types';

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
      <DialogContent variant="glass" className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Test Cases</DialogTitle>
          <DialogDescription>
            Select test cases to add to this suite
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-4">
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
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(testCase.id)}
                    onChange={() => {}}
                    className="w-4 h-4 mt-1 cursor-pointer accent-green-500"
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
          <Button
            variant="glass-primary"
            onClick={onSubmit}
            disabled={selectedIds.length === 0}
          >
            Add ({selectedIds.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
