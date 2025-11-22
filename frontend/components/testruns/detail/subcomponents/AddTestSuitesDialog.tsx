import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/elements/dialog';
import { Button } from '@/elements/button';
import { CheckboxListItem } from '@/elements/checkbox-list-item';
import { Badge } from '@/elements/badge';
import { Folder, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface TestSuite {
  id: string;
  name: string;
  description?: string;
  testCases: Array<{
    id: string;
    title?: string;
    name?: string;
    priority: string;
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
}

export function AddTestSuitesDialog({
  open,
  availableTestSuites,
  selectedSuiteIds,
  onOpenChange,
  onToggleTestSuite,
  onAdd,
  onCancel,
}: AddTestSuitesDialogProps) {
  const [expandedSuites, setExpandedSuites] = useState<Set<string>>(
    new Set(availableTestSuites.map((s) => s.id))
  );

  const toggleSuiteExpanded = (suiteId: string) => {
    const newExpanded = new Set(expandedSuites);
    if (newExpanded.has(suiteId)) {
      newExpanded.delete(suiteId);
    } else {
      newExpanded.add(suiteId);
    }
    setExpandedSuites(newExpanded);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'HIGH':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'MEDIUM':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'LOW':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add Test Suites</DialogTitle>
          <DialogDescription>
            Select test suites to add their test cases to this test run
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[500px] overflow-y-auto space-y-3">
          {availableTestSuites.length === 0 ? (
            <p className="text-white/60 text-center py-8">
              No available test suites to add
            </p>
          ) : (
            availableTestSuites.map((testSuite) => (
              <div key={testSuite.id} className="border border-white/10 rounded-lg overflow-hidden">
                {/* Suite Header */}
                <div className="bg-white/5 p-4 hover:bg-white/10 transition-colors">
                  <div className="flex items-start gap-3">
                    <CheckboxListItem
                      id={testSuite.id}
                      checked={selectedSuiteIds.includes(testSuite.id)}
                      onCheckedChange={(checked) =>
                        onToggleTestSuite(testSuite.id, checked)
                      }
                      label={testSuite.name}
                      description={testSuite.description}
                      rightContent={
                        <Badge variant="outline" className="text-xs">
                          {testSuite._count?.testCases || testSuite.testCases?.length || 0} test cases
                        </Badge>
                      }
                      variant="compact"
                      onClick={() => toggleSuiteExpanded(testSuite.id)}
                    />
                    <button
                      onClick={() => toggleSuiteExpanded(testSuite.id)}
                      className="text-white/60 hover:text-white p-1 transition-colors"
                    >
                      {expandedSuites.has(testSuite.id) ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>
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
                            <div className="text-xs text-white/50 mt-1 min-w-fit">
                              TC
                            </div>
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
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${getPriorityColor(
                                    testCase.priority
                                  )}`}
                                >
                                  {testCase.priority}
                                </Badge>
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
                        No test cases in this suite
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <Button variant="glass" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="glass-primary"
            onClick={onAdd}
            disabled={selectedSuiteIds.length === 0}
          >
            Add {selectedSuiteIds.length > 0 && `(${selectedSuiteIds.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
