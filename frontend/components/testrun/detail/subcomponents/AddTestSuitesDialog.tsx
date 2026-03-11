'use client';

import { useState } from 'react';
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
import { Checkbox } from '@/frontend/reusable-elements/checkboxes/Checkbox';
import { Badge } from '@/frontend/reusable-elements/badges/Badge';
import { ChevronDown, ChevronRight, FolderOpen, TestTube2 } from 'lucide-react';
import { PriorityBadge, Priority } from '@/frontend/reusable-components/badges/PriorityBadge';

interface TestSuite {
  id: string;
  name: string;
  description?: string;
  testCases: Array<{
    id: string;
    title?: string;
    name?: string;
    priority: Priority;
    status: string;
    description?: string;
  }>;
  _count?: {
    testCases: number;
  };
}

interface AddTestSuitesDialogProps {
  open: boolean;
  availableTestSuites: TestSuite[];
  selectedSuiteIds: string[];
  onOpenChange: (open: boolean) => void;
  onToggleTestSuite: (suiteId: string, checked: boolean) => void;
  onAdd: () => void;
  onCancel: () => void;
  loading?: boolean; // whether submission is in progress
  fetchingData?: boolean; // whether data is being fetched
}

/**
 * Reusable dialog for selecting test suites to add to a test run
 * Shows expandable test suites with their test cases
 */
export function AddTestSuitesDialog({
  open,
  availableTestSuites,
  selectedSuiteIds,
  onOpenChange,
  onToggleTestSuite,
  onAdd,
  onCancel,
  loading = false,
  fetchingData = false,
}: AddTestSuitesDialogProps) {
  const [expandedSuites, setExpandedSuites] = useState<Set<string>>(
    new Set(availableTestSuites.map((s) => s.id))
  );

  const toggleSuiteExpanded = (suiteId: string) => {
    setExpandedSuites((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(suiteId)) {
        newExpanded.delete(suiteId);
      } else {
        newExpanded.add(suiteId);
      }
      return newExpanded;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader className="mb-4">
          <DialogTitle>テストスイートを追加</DialogTitle>
          <DialogDescription>
            テストケースをこのテストランに追加するテストスイートを選択してください
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[500px] overflow-y-auto custom-scrollbar space-y-3 mb-4">
          {fetchingData ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <div className="w-8 h-8 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-white/60 text-sm">テストスイートを読み込み中...</p>
            </div>
          ) : availableTestSuites.length === 0 ? (
            <p className="text-white/60 text-center py-8">
              追加できるテストスイートがありません
            </p>
          ) : (
            availableTestSuites.map((testSuite) => (
              <div key={testSuite.id} className="border border-white/10 rounded-lg overflow-hidden">
                {/* Suite Header */}
                <div className="bg-white/5 p-4 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    {/* Dropdown Button */}
                    <button
                      onClick={() => toggleSuiteExpanded(testSuite.id)}
                      className="text-white/60 hover:text-white p-1 transition-colors cursor-pointer shrink-0"
                      aria-label="スイートの展開/折りたたみ"
                    >
                      {expandedSuites.has(testSuite.id) ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>

                    {/* Suite Checkbox and Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Checkbox
                        id={`suite-${testSuite.id}`}
                        checked={selectedSuiteIds.includes(testSuite.id)}
                        onCheckedChange={(checked) =>
                          onToggleTestSuite(testSuite.id, checked as boolean)
                        }
                        className="cursor-pointer"
                      />
                      
                      <label
                        htmlFor={`suite-${testSuite.id}`}
                        className="flex-1 min-w-0 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <FolderOpen className="w-4 h-4 text-blue-400 shrink-0" />
                          <span className="font-medium text-white/90">{testSuite.name}</span>
                        </div>
                        {testSuite.description && (
                          <p className="text-sm text-white/60 mt-1 line-clamp-1">
                            {testSuite.description}
                          </p>
                        )}
                      </label>

                      <Badge variant="outline" className="text-xs shrink-0">
                        {testSuite._count?.testCases || testSuite.testCases?.length || 0} 件のテストケース
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Test Cases List (Expandable) */}
                {expandedSuites.has(testSuite.id) && testSuite.testCases && (
                  <div className="bg-black/20 p-4 space-y-2">
                    {testSuite.testCases.length > 0 ? (
                      testSuite.testCases.map((testCase) => (
                        <div
                          key={testCase.id}
                          className="p-3 bg-white/5 rounded border border-white/10 hover:border-white/20 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <TestTube2 className="w-4 h-4 text-white/50 mt-1 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white/90 line-clamp-1">
                                {testCase.title || testCase.name}
                              </p>
                              {testCase.description && (
                                <p className="text-xs text-white/60 line-clamp-1 mt-1">
                                  {testCase.description}
                                </p>
                              )}
                              <div className="flex gap-2 mt-2">
                                <PriorityBadge priority={testCase.priority} />
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-blue-500/10 text-blue-500 border-blue-500/20"
                                >
                                  {testCase.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-white/60 text-center py-4">
                        このスイートにテストケースはありません
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <Button variant="glass" onClick={onCancel} className="cursor-pointer" disabled={loading}          >
            キャンセル
          </Button>
          <ButtonPrimary
            onClick={onAdd}
            disabled={selectedSuiteIds.length === 0 || loading}
            className="cursor-pointer"
          >
            {loading ? '追加中...' : `追加${selectedSuiteIds.length > 0 ? ` (${selectedSuiteIds.length})` : ''}`}
          </ButtonPrimary>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
