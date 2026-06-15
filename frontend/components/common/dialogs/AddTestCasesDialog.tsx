'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, FolderOpen, TestTube2 } from 'lucide-react';
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
import { Checkbox } from '@/frontend/reusable-elements/checkboxes/Checkbox';
import { Badge } from '@/frontend/reusable-elements/badges/Badge';
import { SearchInput } from '@/frontend/reusable-elements/inputs/SearchInput';
import { FilterDropdown, type FilterOption } from '@/frontend/reusable-components/inputs/FilterDropdown';
import { PriorityBadge } from '@/frontend/reusable-components/badges/PriorityBadge';
import { useDropdownOptions } from '@/hooks/useDropdownOptions';

interface TestCase {
  id: string;
  tcId?: string;
  title?: string;
  name?: string;
  description?: string;
  priority?: string;
  status?: string;
  moduleId?: string | null;
  module?: {
    id: string;
    name: string;
    description?: string;
  } | null;
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
  const isRunContext = context === 'run';
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setPriorityFilter('all');
      setStatusFilter('all');
      setExpandedModules(new Set());
    }
  }, [open]);

  const { options: priorityOptionsData } = useDropdownOptions('TestCase', 'priority');
  const { options: statusOptionsData } = useDropdownOptions('TestCase', 'status');

  const priorityOptions: FilterOption[] = [
    { value: 'all', label: 'All Priorities' },
    ...priorityOptionsData.map((opt) => ({ value: opt.value, label: opt.label })),
  ];

  const statusOptions: FilterOption[] = [
    { value: 'all', label: 'All Statuses' },
    ...statusOptionsData.map((opt) => ({ value: opt.value, label: opt.label })),
  ];

  const filteredTestCases = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return testCases.filter((testCase) => {
      const matchesSearch =
        !query ||
        (testCase.title || testCase.name || '').toLowerCase().includes(query) ||
        (testCase.tcId || '').toLowerCase().includes(query) ||
        (testCase.description || '').toLowerCase().includes(query) ||
        (testCase.module?.name || '').toLowerCase().includes(query);

      const matchesPriority =
        priorityFilter === 'all' ||
        (testCase.priority || '').toLowerCase() === priorityFilter.toLowerCase();

      const matchesStatus =
        statusFilter === 'all' ||
        (testCase.status || '').toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [testCases, searchQuery, priorityFilter, statusFilter]);

  const groupedModules = useMemo(() => {
    const modulesMap = new Map<string, {
      id: string;
      name: string;
      description?: string;
      testCases: TestCase[];
    }>();

    filteredTestCases.forEach((testCase) => {
      const moduleId = testCase.module?.id || testCase.moduleId || 'ungrouped';
      const moduleName = testCase.module?.name || 'Ungrouped';
      const moduleDescription = testCase.module?.description;

      if (!modulesMap.has(moduleId)) {
        modulesMap.set(moduleId, {
          id: moduleId,
          name: moduleName,
          description: moduleDescription,
          testCases: [],
        });
      }

      modulesMap.get(moduleId)?.testCases.push(testCase);
    });

    return Array.from(modulesMap.values()).sort((a, b) => {
      if (a.id === 'ungrouped') return 1;
      if (b.id === 'ungrouped') return -1;
      return a.name.localeCompare(b.name);
    });
  }, [filteredTestCases]);

  const visibleIds = useMemo(
    () => filteredTestCases.map((testCase) => testCase.id),
    [filteredTestCases]
  );

  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

  const handleToggle = (testCaseId: string) => {
    onSelectionChange(
      selectedIds.includes(testCaseId)
        ? selectedIds.filter((id) => id !== testCaseId)
        : [...selectedIds, testCaseId]
    );
  };

  const handleToggleVisible = () => {
    if (allVisibleSelected) {
      onSelectionChange(selectedIds.filter((id) => !visibleIds.includes(id)));
      return;
    }

    const merged = new Set([...selectedIds, ...visibleIds]);
    onSelectionChange(Array.from(merged));
  };

  const toggleModuleExpanded = (moduleId: string) => {
    const next = new Set(expandedModules);
    if (next.has(moduleId)) {
      next.delete(moduleId);
    } else {
      next.add(moduleId);
    }
    setExpandedModules(next);
  };

  const handleModuleToggle = (moduleTestCases: TestCase[]) => {
    const moduleIds = moduleTestCases.map((testCase) => testCase.id);
    const isFullySelected = moduleIds.every((id) => selectedIds.includes(id));

    if (isFullySelected) {
      onSelectionChange(selectedIds.filter((id) => !moduleIds.includes(id)));
      return;
    }

    const merged = new Set([...selectedIds, ...moduleIds]);
    onSelectionChange(Array.from(merged));
  };

  const getStatusLabel = (status?: string) => {
    if (!status) return 'Unknown';
    return statusOptionsData.find((opt) => opt.value === status)?.label || status;
  };

  const contextLabel = context === 'suite' ? 'this suite' : 'this test run';
  const title = context === 'suite' ? 'Add Test Cases to Suite' : 'Add Test Cases to Run';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={context === 'run' ? 'max-w-3xl' : 'max-w-lg'}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Select test cases to add to {contextLabel}
          </DialogDescription>
        </DialogHeader>

        <div className={isRunContext ? 'max-h-[400px] overflow-y-auto custom-scrollbar' : 'max-h-[80vh] overflow-y-auto custom-scrollbar pr-4'}>
          {testCases.length === 0 ? (
            <p className={isRunContext ? 'text-white/60 text-center py-8' : 'text-gray-400 text-center py-8'}>
              No available test cases to add
            </p>
          ) : (
            <div className={context === 'run' ? 'space-y-3' : 'space-y-3'}>
              {isRunContext && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <SearchInput
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search by title, ID, description, or folder..."
                    className="md:col-span-2"
                  />
                  <FilterDropdown
                    value={priorityFilter}
                    onValueChange={setPriorityFilter}
                    placeholder="Priority"
                    options={priorityOptions}
                  />
                  <div className="md:col-start-3">
                    <FilterDropdown
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                      placeholder="Status"
                      options={statusOptions}
                    />
                  </div>
                </div>
              )}

              {isRunContext && filteredTestCases.length > 0 && (
                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                  <label className="flex items-center gap-3 text-sm text-white/80 cursor-pointer">
                    <Checkbox
                      id="select-visible-test-cases"
                      checked={allVisibleSelected}
                      onCheckedChange={handleToggleVisible}
                    />
                    Select all visible folders and test cases
                  </label>
                  <Badge variant="outline" className="text-xs bg-white/5 text-white/70 border-white/10">
                    {visibleIds.length} visible
                  </Badge>
                </div>
              )}

              {isRunContext && filteredTestCases.length === 0 ? (
                <p className="text-white/60 text-center py-8">
                  No test cases match your search or filters
                </p>
              ) : isRunContext ? (
                groupedModules.map((moduleItem) => {
                  const isExpanded = expandedModules.has(moduleItem.id);
                  const moduleIds = moduleItem.testCases.map((testCase) => testCase.id);
                  const selectedCount = moduleIds.filter((id) => selectedIds.includes(id)).length;
                  const isFullySelected = moduleIds.length > 0 && selectedCount === moduleIds.length;
                  const isPartiallySelected = selectedCount > 0 && selectedCount < moduleIds.length;

                  return (
                    <div
                      key={moduleItem.id}
                      className={`rounded-lg border overflow-hidden ${
                        moduleItem.id === 'ungrouped'
                          ? 'border-purple-500/30 bg-purple-500/5'
                          : 'border-white/10 bg-white/5'
                      }`}
                    >
                      <div
                        className={`flex items-center gap-3 p-3 transition-colors ${
                          moduleItem.id === 'ungrouped'
                            ? 'bg-purple-500/10 hover:bg-purple-500/15'
                            : 'hover:bg-white/10'
                        }`}
                      >
                        <button
                          onClick={() => toggleModuleExpanded(moduleItem.id)}
                          className="text-white/70 hover:text-white transition-colors cursor-pointer"
                          disabled={moduleItem.testCases.length === 0}
                        >
                          {moduleItem.testCases.length === 0 ? (
                            <div className="w-5 h-5" />
                          ) : isExpanded ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                        </button>

                        <Checkbox
                          id={`module-${moduleItem.id}`}
                          checked={isFullySelected}
                          onCheckedChange={() => handleModuleToggle(moduleItem.testCases)}
                          className={isPartiallySelected ? 'data-[state=checked]:bg-blue-500/50' : ''}
                        />

                        <FolderOpen className="w-4 h-4 text-blue-400 shrink-0" />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-white truncate">{moduleItem.name}</p>
                            {isPartiallySelected && (
                              <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/20">
                                Partial
                              </Badge>
                            )}
                          </div>
                          {moduleItem.description && (
                            <p className="text-xs text-white/60 line-clamp-1">{moduleItem.description}</p>
                          )}
                        </div>

                        <Badge variant="outline" className="text-xs bg-white/5 text-white/70 border-white/10">
                          {moduleItem.testCases.length}
                        </Badge>
                      </div>

                      {isExpanded && moduleItem.testCases.length > 0 && (
                        <div className="border-t border-white/10 bg-white/[0.02]">
                          {moduleItem.testCases.map((testCase) => (
                            <div
                              key={testCase.id}
                              className="pl-11 pr-3 py-2 border-b border-white/5 last:border-b-0"
                            >
                              <CheckboxListItem
                                id={testCase.id}
                                checked={selectedIds.includes(testCase.id)}
                                onCheckedChange={() => handleToggle(testCase.id)}
                                label={testCase.title || testCase.name || 'Untitled'}
                                description={testCase.description}
                                rightContent={
                                  <div className="flex items-center gap-2 ml-2">
                                    {showPriority && testCase.priority && (
                                      <PriorityBadge
                                        priority={testCase.priority.toLowerCase() as 'low' | 'medium' | 'high' | 'critical'}
                                      />
                                    )}
                                    {testCase.status && (
                                      <Badge variant="outline" className="text-xs bg-white/5 text-white/70 border-white/10">
                                        {getStatusLabel(testCase.status)}
                                      </Badge>
                                    )}
                                    <TestTube2 className="w-3.5 h-3.5 text-green-400" />
                                  </div>
                                }
                                variant="compact"
                                checkboxVariant="default"
                                onClick={() => handleToggle(testCase.id)}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                testCases.map((testCase) => (
                  <div
                    key={testCase.id}
                    className="rounded transition-colors border border-white/10 hover:bg-slate-800/50"
                  >
                    <CheckboxListItem
                      id={testCase.id}
                      checked={selectedIds.includes(testCase.id)}
                      onCheckedChange={() => handleToggle(testCase.id)}
                      label={testCase.title || testCase.name || 'Untitled'}
                      description={testCase.description}
                      rightContent={
                        showPriority && testCase.priority ? (
                          <PriorityBadge
                            priority={testCase.priority.toLowerCase() as 'low' | 'medium' | 'high' | 'critical'}
                          />
                        ) : undefined
                      }
                      variant="default"
                      checkboxVariant="glass"
                      onClick={() => handleToggle(testCase.id)}
                    />
                  </div>
                ))
              )}
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
            Cancel
          </Button>
          <ButtonPrimary
            onClick={onSubmit}
            disabled={selectedIds.length === 0 || loading}
            className="cursor-pointer"
          >
            {loading ? 'Adding...' : `Add ${selectedIds.length > 0 ? `(${selectedIds.length})` : ''}`}
          </ButtonPrimary>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
