/**
 * @deprecated Use AddTestCasesDialog from @/frontend/components/common/dialogs instead
 * This component is kept for backward compatibility but should not be used for new code
 */
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/elements/dialog';
import { Button } from '@/elements/button';
import { ButtonPrimary } from '@/elements/button-primary';
import { Checkbox } from '@/elements/checkbox';
import { PriorityBadge } from '@/components/design/PriorityBadge';
import { TestCase } from '../types';

interface AddTestCasesDialogProps {
  open: boolean;
  availableTestCases: TestCase[];
  selectedCaseIds: string[];
  onOpenChange: (open: boolean) => void;
  onToggleTestCase: (testCaseId: string, checked: boolean) => void;
  onAdd: () => void;
  onCancel: () => void;
}

export function AddTestCasesDialog({
  open,
  availableTestCases,
  selectedCaseIds,
  onOpenChange,
  onToggleTestCase,
  onAdd,
  onCancel,
}: AddTestCasesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add Test Cases</DialogTitle>
          <DialogDescription>
            Select test cases to add to this test run
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
          {availableTestCases.length === 0 ? (
            <p className="text-white/60 text-center py-8">
              No available test cases to add
            </p>
          ) : (
            <div className="space-y-2">
              {availableTestCases.map((testCase) => (
                <div
                  key={testCase.id}
                  className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <Checkbox
                    id={testCase.id}
                    checked={selectedCaseIds.includes(testCase.id)}
                    onCheckedChange={(checked: boolean) =>
                      onToggleTestCase(testCase.id, checked)
                    }
                  />
                  <label htmlFor={testCase.id} className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white/90">
                          {testCase.title || testCase.name}
                        </p>
                        {testCase.description && (
                          <p className="text-xs text-white/60 line-clamp-1 mt-1">
                            {testCase.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <PriorityBadge
                          priority={
                            testCase.priority.toLowerCase() as
                              | 'low'
                              | 'medium'
                              | 'high'
                              | 'critical'
                          }
                        />
                      </div>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="glass" onClick={onCancel} className="cursor-pointer">
            Cancel
          </Button>
          <ButtonPrimary
            onClick={onAdd}
            disabled={selectedCaseIds.length === 0}
          >
            Add {selectedCaseIds.length > 0 && `(${selectedCaseIds.length})`}
          </ButtonPrimary>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
