'use client';

import { useState } from 'react';
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
import { Badge } from '@/elements/badge';
import { ChevronDown, ChevronRight, FolderOpen, TestTube2 } from 'lucide-react';
import { PriorityBadge } from '@/components/design/PriorityBadge';
import { Module, TestCase } from '@/frontend/components/testcase/types';

interface AddModulesAndTestCasesDialogProps {
  open: boolean;
  modules: (Module & { testCases?: TestCase[] })[];
  selectedModuleIds: string[];
  selectedTestCaseIds: string[];
  onOpenChange: (open: boolean) => void;
  onModuleSelectionChange: (moduleIds: string[]) => void;
  onTestCaseSelectionChange: (testCaseIds: string[]) => void;
  onSubmit: () => void;
}

/**
 * Dialog for adding modules and/or test cases to a test suite
 * Users can select entire modules or individual test cases within modules
 */
export function AddModulesAndTestCasesDialog({
  open,
  modules,
  selectedModuleIds,
  selectedTestCaseIds,
  onOpenChange,
  onModuleSelectionChange,
  onTestCaseSelectionChange,
  onSubmit,
}: AddModulesAndTestCasesDialogProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const toggleModuleExpanded = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const handleModuleToggle = (moduleId: string, testCases: TestCase[] = []) => {
    const isCurrentlySelected = selectedModuleIds.includes(moduleId);
    
    if (isCurrentlySelected) {
      // Unselect module and all its test cases
      onModuleSelectionChange(selectedModuleIds.filter(id => id !== moduleId));
      const testCaseIdsInModule = testCases.map(tc => tc.id);
      onTestCaseSelectionChange(
        selectedTestCaseIds.filter(id => !testCaseIdsInModule.includes(id))
      );
    } else {
      // Select module and all its test cases
      onModuleSelectionChange([...selectedModuleIds, moduleId]);
      const testCaseIdsInModule = testCases.map(tc => tc.id);
      const newTestCaseIds = [
        ...selectedTestCaseIds,
        ...testCaseIdsInModule.filter(id => !selectedTestCaseIds.includes(id))
      ];
      onTestCaseSelectionChange(newTestCaseIds);
    }
  };

  const handleTestCaseToggle = (testCaseId: string, moduleId: string, testCases: TestCase[] = []) => {
    const isCurrentlySelected = selectedTestCaseIds.includes(testCaseId);
    
    if (isCurrentlySelected) {
      // Unselect test case
      const newSelectedTestCaseIds = selectedTestCaseIds.filter(id => id !== testCaseId);
      onTestCaseSelectionChange(newSelectedTestCaseIds);
      
      // Check if all test cases in this module are now unselected
      const testCaseIdsInModule = testCases.map(tc => tc.id);
      const allUnselected = testCaseIdsInModule.every(id => !newSelectedTestCaseIds.includes(id));
      
      if (allUnselected && selectedModuleIds.includes(moduleId)) {
        // Unselect the module as well
        onModuleSelectionChange(selectedModuleIds.filter(id => id !== moduleId));
      }
    } else {
      // Select test case
      const newSelectedTestCaseIds = [...selectedTestCaseIds, testCaseId];
      onTestCaseSelectionChange(newSelectedTestCaseIds);
      
      // Check if all test cases in this module are now selected
      const testCaseIdsInModule = testCases.map(tc => tc.id);
      const allSelected = testCaseIdsInModule.every(id => newSelectedTestCaseIds.includes(id));
      
      if (allSelected && !selectedModuleIds.includes(moduleId)) {
        // Select the module as well
        onModuleSelectionChange([...selectedModuleIds, moduleId]);
      }
    }
  };

  const isModuleFullySelected = (moduleItem: Module & { testCases?: TestCase[] }) => {
    if (selectedModuleIds.includes(moduleItem.id)) return true;
    if (!moduleItem.testCases || moduleItem.testCases.length === 0) return false;
    return moduleItem.testCases.every(tc => selectedTestCaseIds.includes(tc.id));
  };

  const isModulePartiallySelected = (moduleItem: Module & { testCases?: TestCase[] }) => {
    if (selectedModuleIds.includes(moduleItem.id)) return false;
    if (!moduleItem.testCases || moduleItem.testCases.length === 0) return false;
    const selectedCount = moduleItem.testCases.filter(tc => selectedTestCaseIds.includes(tc.id)).length;
    return selectedCount > 0 && selectedCount < moduleItem.testCases.length;
  };

  const totalSelectedCount = selectedModuleIds.length + selectedTestCaseIds.filter(id => {
    // Only count test cases that are not part of a fully selected module
    return !selectedModuleIds.some(moduleId => {
      const moduleItem = modules.find(m => m.id === moduleId);
      return moduleItem?.testCases?.some(tc => tc.id === id);
    });
  }).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-6">
          <div className="pt-6">
            <DialogHeader className="mb-6">
              <DialogTitle>Add Modules & Test Cases to Suite</DialogTitle>
              <DialogDescription className="mt-2">
                Select entire modules or individual test cases to add to this test suite
              </DialogDescription>
            </DialogHeader>
            {modules.length === 0 ? (
              <p className="text-white/60 text-center py-8">
                No modules or test cases available to add
              </p>
            ) : (
              <div className="space-y-2">
              {modules.map((moduleItem) => {
                const isExpanded = expandedModules.has(moduleItem.id);
                const isFullySelected = isModuleFullySelected(moduleItem);
                const isPartiallySelected = isModulePartiallySelected(moduleItem);
                const testCaseCount = moduleItem.testCases?.length || 0;

                return (
                  <div key={moduleItem.id} className="border border-white/10 rounded-lg overflow-hidden">
                    {/* Module Header */}
                    <div className="bg-white/5 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3 p-3">
                        {/* Expand/Collapse Button */}
                        <button
                          onClick={() => toggleModuleExpanded(moduleItem.id)}
                          className="text-white/70 hover:text-white transition-colors cursor-pointer"
                          disabled={testCaseCount === 0}
                        >
                          {testCaseCount === 0 ? (
                            <div className="w-5 h-5" />
                          ) : isExpanded ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                        </button>

                        {/* Module Checkbox */}
                        <Checkbox
                          id={`module-${moduleItem.id}`}
                          checked={isFullySelected}
                          onCheckedChange={() => handleModuleToggle(moduleItem.id, moduleItem.testCases)}
                          className={`border-white/20 ${
                            isPartiallySelected ? 'data-[state=checked]:bg-blue-500/50' : ''
                          }`}
                        />

                        {/* Module Icon */}
                        <FolderOpen className="w-5 h-5 text-blue-400 flex-shrink-0" />

                        {/* Module Name & Description */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-white truncate">
                              {moduleItem.name}
                            </p>
                            {isPartiallySelected && (
                              <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/20">
                                Partial
                              </Badge>
                            )}
                          </div>
                          {moduleItem.description && (
                            <p className="text-xs text-white/60 line-clamp-1 mt-0.5">
                              {moduleItem.description}
                            </p>
                          )}
                        </div>

                        {/* Test Case Count */}
                        <Badge variant="outline" className="text-xs bg-white/5 text-white/70 border-white/10">
                          {testCaseCount} test {testCaseCount === 1 ? 'case' : 'cases'}
                        </Badge>
                      </div>
                    </div>

                    {/* Test Cases List */}
                    {isExpanded && testCaseCount > 0 && (
                      <div className="bg-white/[0.02] border-t border-white/10">
                        {moduleItem.testCases?.map((testCase) => (
                          <div
                            key={testCase.id}
                            className="flex items-start gap-3 p-3 pl-11 hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0"
                          >
                            {/* Test Case Checkbox */}
                            <Checkbox
                              id={`testcase-${testCase.id}`}
                              checked={selectedTestCaseIds.includes(testCase.id)}
                              onCheckedChange={() => handleTestCaseToggle(testCase.id, moduleItem.id, moduleItem.testCases)}
                              className="mt-0.5 border-white/20"
                            />

                            {/* Test Case Icon */}
                            <TestTube2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />

                            {/* Test Case Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-medium text-white/90 text-sm">
                                  {testCase.title}
                                </p>
                                <PriorityBadge
                                  priority={testCase.priority.toLowerCase() as 'low' | 'medium' | 'high' | 'critical'}
                                />
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${
                                    testCase.status === 'ACTIVE'
                                      ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                      : testCase.status === 'DRAFT'
                                      ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                      : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                                  }`}
                                >
                                  {testCase.status}
                                </Badge>
                              </div>
                              {testCase.description && (
                                <p className="text-xs text-white/60 line-clamp-2 mt-1">
                                  {testCase.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              </div>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 border-t border-white/10 bg-[#0f172a] px-6 py-4">
          <div className="flex items-center justify-between w-full">
            <p className="text-sm text-white/60">
              {totalSelectedCount > 0 ? (
                <>
                  <span className="text-white font-medium">{totalSelectedCount}</span> item{totalSelectedCount === 1 ? '' : 's'} selected
                </>
              ) : (
                'No items selected'
              )}
            </p>
            <div className="flex gap-3">
              <Button
                variant="glass"
                onClick={() => onOpenChange(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <ButtonPrimary
                onClick={onSubmit}
                disabled={totalSelectedCount === 0}
                className="cursor-pointer"
              >
                Add Selected
              </ButtonPrimary>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
