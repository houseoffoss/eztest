'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/frontend/reusable-elements/dialogs/Dialog';
import { Button } from '@/frontend/reusable-elements/buttons/Button';
import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';
import { CheckboxListItem } from '@/frontend/reusable-elements/checkboxes/CheckboxListItem';
import { PriorityBadge } from '@/frontend/reusable-components/badges/PriorityBadge';

interface TestCase {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  priority?: string;
}

interface AddTestCasesDialogProps {
  open: boolean;
  testCases: TestCase[];
  selectedIds: string[];
  onOpenChange: (open: boolean) => void;
  onSelectionChange: (ids: string[]) => void;
  onSubmit: () => void;
  context?: 'suite' | 'run'; // 'suite' for test suite, 'run' for test run
  showPriority?: boolean; // whether to show priority badge
  loading?: boolean; // whether submission is in progress
}

/**
 * Unified reusable dialog for adding test cases to suites or runs
 * Used in TestSuiteDetail and TestRunDetail
 */
export function AddTestCasesDialog({
  open,
  testCases,
  selectedIds,
  onOpenChange,
  onSelectionChange,
  onSubmit,
  context = 'run',
  showPriority = context === 'run',
  loading = false,
}: AddTestCasesDialogProps) {
  const handleToggle = (testCaseId: string) => {
    onSelectionChange(
      selectedIds.includes(testCaseId)
        ? selectedIds.filter((id) => id !== testCaseId)
        : [...selectedIds, testCaseId]
    );
  };

  const contextLabel = context === 'suite' ? 'このテストスイート' : 'このテストラン';
  const title = context === 'suite' ? 'テストスイートにテストケースを追加' : 'テストランにテストケースを追加';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={context === 'run' ? 'max-w-3xl' : 'max-w-lg'}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {contextLabel}に追加するテストケースを選択してください
          </DialogDescription>
        </DialogHeader>

        <div className={context === 'run' ? 'max-h-[400px] overflow-y-auto custom-scrollbar' : 'max-h-[80vh] overflow-y-auto custom-scrollbar pr-4'}>
          {testCases.length === 0 ? (
            <p className={context === 'run' ? 'text-white/60 text-center py-8' : 'text-gray-400 text-center py-8'}>
              追加できるテストケースがありません
            </p>
          ) : (
            <div className={context === 'run' ? 'space-y-2' : 'space-y-3'}>
              {testCases.map((testCase) => (
                <div
                  key={testCase.id}
                  className={`rounded transition-colors ${
                    context === 'run'
                      ? 'bg-white/5 hover:bg-white/10'
                      : 'border border-white/10 hover:bg-slate-800/50'
                  }`}
                >
                  <CheckboxListItem
                    id={testCase.id}
                    checked={selectedIds.includes(testCase.id)}
                    onCheckedChange={() => handleToggle(testCase.id)}
                    label={testCase.title || testCase.name || '（タイトルなし）'}
                    description={testCase.description}
                    rightContent={
                      showPriority && testCase.priority ? (
                        <PriorityBadge
                          priority={testCase.priority.toLowerCase() as 'low' | 'medium' | 'high' | 'critical'}
                        />
                      ) : undefined
                    }
                    variant={context === 'run' ? 'compact' : 'default'}
                    checkboxVariant={context === 'suite' ? 'glass' : 'default'}
                    onClick={() => handleToggle(testCase.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="glass"
            onClick={() => {
              onOpenChange(false);
              onSelectionChange([]);
            }}
            className="cursor-pointer"
            disabled={loading}
          >
            キャンセル
          </Button>
          <ButtonPrimary
            onClick={onSubmit}
            disabled={selectedIds.length === 0 || loading}
            className="cursor-pointer"
          >
            {loading ? '追加中...' : `追加${selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}`}
          </ButtonPrimary>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
