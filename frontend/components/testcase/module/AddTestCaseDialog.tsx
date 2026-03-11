'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/frontend/reusable-elements/dialogs/Dialog';
import { Button } from '@/frontend/reusable-elements/buttons/Button';
import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';
import { Checkbox } from '@/frontend/reusable-elements/checkboxes/Checkbox';
import { Loader } from '@/frontend/reusable-elements/loaders/Loader';
import { TestCase } from '../types';

interface AddTestCaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  moduleId: string;
  onTestCasesAdded: () => void;
}

export function AddTestCaseDialog({
  open,
  onOpenChange,
  projectId,
  moduleId,
  onTestCasesAdded,
}: AddTestCaseDialogProps) {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [selectedTestCases, setSelectedTestCases] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchAvailableTestCases = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/projects/${projectId}/testcases`);
        const data = await response.json();
        if (data.data) {
          // Only show test cases that have NO module assigned
          // A test case can only be in one module at a time
          const availableTestCases = data.data.filter(
            (tc: TestCase) => !tc.moduleId
          );
          setTestCases(availableTestCases);
        }
      } catch (error) {
        console.error('Error fetching test cases:', error);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchAvailableTestCases();
    }
  }, [open, projectId, moduleId]);

  const handleToggleTestCase = (testCaseId: string) => {
    const newSelected = new Set(selectedTestCases);
    if (newSelected.has(testCaseId)) {
      newSelected.delete(testCaseId);
    } else {
      newSelected.add(testCaseId);
    }
    setSelectedTestCases(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedTestCases.size === testCases.length) {
      setSelectedTestCases(new Set());
    } else {
      setSelectedTestCases(new Set(testCases.map(tc => tc.id)));
    }
  };

  const handleSubmit = async () => {
    if (selectedTestCases.size === 0) return;

    setSubmitting(true);
    try {
      // Get test case data to find tcId for each test case
      const testCasesData = await Promise.all(
        Array.from(selectedTestCases).map(async testCaseId => {
          const response = await fetch(`/api/testcases/${testCaseId}`, {
            cache: 'no-store'
          });
          const data = await response.json();
          return { id: testCaseId, tcId: data.data.tcId };
        })
      );

      // Use the dedicated add-to-module endpoint for each test case
      const updatePromises = testCasesData.map(({ tcId }) =>
        fetch(`/api/projects/${projectId}/testcases/${tcId}/add-to-module`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            moduleId: moduleId,
          }),
        })
      );

      const results = await Promise.all(updatePromises);
      
      // Check if all updates were successful
      const allSuccessful = results.every(res => res.ok);
      
      if (allSuccessful) {
        onTestCasesAdded();
        onOpenChange(false);
        setSelectedTestCases(new Set());
      } else {
        console.error('Some test cases failed to update');
        // Log failed results for debugging
        await Promise.all(
          results.map(async (res, index) => {
            if (!res.ok) {
              const error = await res.json();
              console.error(`Test case ${testCasesData[index].tcId} failed:`, error);
            }
          })
        );
        alert('Failed to add some test cases. Please try again.');
      }
    } catch (error) {
      console.error('Error adding test cases to module:', error);
      alert('Failed to add test cases. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogTitle>Add Test Cases to Module</DialogTitle>
        <DialogDescription>
          Select unassigned test cases to add to this module. Test cases can only belong to one module.
        </DialogDescription>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <Loader fullScreen={false} text="Loading test cases..." />
          </div>
        ) : testCases.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-white/60 mb-2">No available test cases</p>
              <p className="text-white/40 text-sm">
                All test cases are already assigned to modules or no unassigned test cases exist
              </p>
              <p className="text-white/40 text-xs mt-2">
                Note: A test case can only belong to one module at a time
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedTestCases.size === testCases.length}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-white/80 text-sm font-medium">
                  Select All ({testCases.length} test cases)
                </span>
              </div>
              <span className="text-white/60 text-sm">
                {selectedTestCases.size} selected
              </span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 mb-6">
              {testCases.map((testCase) => (
                <div
                  key={testCase.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedTestCases.has(testCase.id)
                      ? 'bg-blue-500/10 border-blue-500/30'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                  onClick={() => handleToggleTestCase(testCase.id)}
                >
                  <Checkbox
                    checked={selectedTestCases.has(testCase.id)}
                    onCheckedChange={() => handleToggleTestCase(testCase.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1">
                    <p className="text-white font-medium">{testCase.title}</p>
                    {testCase.description && (
                      <p className="text-white/60 text-sm mt-1 break-words line-clamp-2">
                        {testCase.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        testCase.priority === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                        testCase.priority === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {testCase.priority}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        testCase.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                        testCase.status === 'DRAFT' ? 'bg-gray-500/20 text-gray-400' :
                        'bg-orange-500/20 text-orange-400'
                      }`}>
                        {testCase.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="flex gap-3 justify-end border-t border-white/10 pt-4">
          <Button
            variant="glass"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <ButtonPrimary
            onClick={handleSubmit}
            disabled={submitting || selectedTestCases.size === 0}
          >
            {submitting ? 'Adding...' : `Add ${selectedTestCases.size} Test Case${selectedTestCases.size !== 1 ? 's' : ''}`}
          </ButtonPrimary>
        </div>
      </DialogContent>
    </Dialog>
  );
}
