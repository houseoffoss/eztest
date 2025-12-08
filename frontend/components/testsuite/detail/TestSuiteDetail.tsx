import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TopBar } from '@/components/design';
import { Loader } from '@/elements/loader';
import { FloatingAlert, type FloatingAlertMessage } from '@/components/utils/FloatingAlert';
import { TestSuiteHeader } from './subcomponents/TestSuiteHeader';
import { TestSuiteDetailsCard } from './subcomponents/TestSuiteDetailsCard';
import { TestCasesCard } from './subcomponents/TestCasesCard';
import { ChildSuitesCard } from './subcomponents/ChildSuitesCard';
import { TestSuiteInfoCard } from './subcomponents/TestSuiteInfoCard';
import { DeleteTestSuiteDialog } from './subcomponents/DeleteTestSuiteDialog';
import { ButtonSecondary } from '@/elements/button-secondary';
import { Plus, TestTube2, Folder } from 'lucide-react';
import { AddTestCasesDialog } from '@/frontend/components/common/dialogs/AddTestCasesDialog';
import { AddModulesAndTestCasesDialog } from '@/components/common/dialogs/AddModulesAndTestCasesDialog';
import { DeleteTestCaseDialog } from '@/frontend/components/testcase/subcomponents/DeleteTestCaseDialog';
import { TestSuite, TestSuiteFormData } from './types';
import { TestCase, Module } from '@/frontend/components/testcase/types';
import { usePermissions } from '@/hooks/usePermissions';

interface TestSuiteDetailProps {
  suiteId: string;
}

export default function TestSuiteDetail({ suiteId }: TestSuiteDetailProps) {
  const router = useRouter();
  const { hasPermission: hasPermissionCheck, isLoading: permissionsLoading } = usePermissions();

  const [testSuite, setTestSuite] = useState<TestSuite | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [alert, setAlert] = useState<FloatingAlertMessage | null>(null);
  const [addTestCasesDialogOpen, setAddTestCasesDialogOpen] = useState(false);
  const [addModulesDialogOpen, setAddModulesDialogOpen] = useState(false);
  const [deleteTestCaseDialogOpen, setDeleteTestCaseDialogOpen] = useState(false);
  const [testCaseToDelete, setTestCaseToDelete] = useState<TestCase | null>(null);
  const [availableModules, setAvailableModules] = useState<(Module & { testCases?: TestCase[] })[]>([]);
  const [selectedTestCaseIds, setSelectedTestCaseIds] = useState<string[]>([]);
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([]);
  const [loadingAvailableModules, setLoadingAvailableModules] = useState(false);

  const [formData, setFormData] = useState<TestSuiteFormData>({
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchTestSuite();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suiteId]);

  useEffect(() => {
    if (testSuite) {
      document.title = `${testSuite.name} | EZTest`;
      // Preload available modules immediately
      fetchAvailableModules();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testSuite]);

  const fetchTestSuite = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/testsuites/${suiteId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setAlert({
          type: 'error',
          title: 'Failed to Load Test Suite',
          message: errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        });
      } else {
        const data = await response.json();
        if (data.data) {
          setTestSuite(data.data);
          setFormData({
            name: data.data.name,
            description: data.data.description || '',
          });
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setAlert({
        type: 'error',
        title: 'Connection Error',
        message: errorMessage,
      });
      console.error('Error fetching test suite:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/testsuites/${suiteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.data) {
        setIsEditing(false);
        setAlert({
          type: 'success',
          title: 'Success',
          message: 'Test suite updated successfully',
        });
        setTimeout(() => setAlert(null), 5000);
        fetchTestSuite();
      } else {
        setAlert({
          type: 'error',
          title: 'Failed to Update Test Suite',
          message: data.error || 'Failed to update test suite',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setAlert({
        type: 'error',
        title: 'Connection Error',
        message: errorMessage,
      });
      console.error('Error updating test suite:', error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (testSuite) {
      setFormData({
        name: testSuite.name,
        description: testSuite.description || '',
      });
    }
  };

  const handleDeleteTestSuite = async () => {
    const response = await fetch(`/api/testsuites/${suiteId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setDeleteDialogOpen(false);
      setAlert({
        type: 'success',
        title: 'Success',
        message: 'Test suite deleted successfully',
      });
      setTimeout(() => router.push(`/projects/${testSuite?.project.id}/testsuites`), 1000);
    } else {
      const data = await response.json();
      throw new Error(data.error || 'Failed to delete test suite');
    }
  };

  const fetchAvailableModules = async () => {
    setLoadingAvailableModules(true);
    try {
      // Use optimized endpoint that fetches everything in one call
      const response = await fetch(`/api/testsuites/${suiteId}/available-testcases`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch available modules:', errorData.error || response.statusText);
        setAvailableModules([]);
        return;
      }
      
      const data = await response.json();

      
      if (data.data) {
        setAvailableModules(data.data);
      } else {
        setAvailableModules([]);
      }
    } catch (error) {
      console.error('Error fetching available modules:', error);
      setAvailableModules([]);
    } finally {
      setLoadingAvailableModules(false);
    }
  };

  const handleAddTestCases = async () => {
    if (selectedTestCaseIds.length === 0) {
      setAlert({
        type: 'error',
        title: 'Validation Error',
        message: 'Please select at least one test case',
      });
      return;
    }

    try {
      for (const testCaseId of selectedTestCaseIds) {
        const response = await fetch(`/api/testcases/${testCaseId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            suiteId: suiteId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          setAlert({
            type: 'error',
            title: 'Failed to Add Test Case',
            message: errorData.error || 'Failed to add test case',
          });
          return;
        }
      }

      setAddTestCasesDialogOpen(false);
      setSelectedTestCaseIds([]);
      setAlert({
        type: 'success',
        title: 'Success',
        message: `${selectedTestCaseIds.length} test case(s) added successfully`,
      });
      setTimeout(() => setAlert(null), 5000);
      fetchTestSuite();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setAlert({
        type: 'error',
        title: 'Connection Error',
        message: errorMessage,
      });
      console.error('Error adding test cases:', error);
    }
  };

  const handleAddModulesAndTestCases = async () => {
    if (selectedModuleIds.length === 0 && selectedTestCaseIds.length === 0) {
      setAlert({
        type: 'error',
        title: 'Validation Error',
        message: 'Please select at least one module or test case',
      });
      return;
    }

    try {
      let addedCount = 0;
      
      // Add all test cases from selected modules (excluding the virtual "ungrouped" module)
      const realModuleIds = selectedModuleIds.filter(id => id !== 'ungrouped');
      const testCaseIdsToAdd: string[] = [];

      for (const moduleId of realModuleIds) {
        const selectedModule = availableModules.find(m => m.id === moduleId);
        if (selectedModule?.testCases) {
          testCaseIdsToAdd.push(...selectedModule.testCases.map(tc => tc.id));
        }
      }
      
      // Add individually selected test cases (that are not part of real selected modules)
      // Note: Test cases from the virtual "ungrouped" module should be treated as individual selections
      const testCasesInSelectedRealModules = realModuleIds.flatMap(moduleId => {
        const moduleItem = availableModules.find(m => m.id === moduleId);
        return moduleItem?.testCases?.map(tc => tc.id) || [];
      });
      
      const individualTestCaseIds = selectedTestCaseIds.filter(
        id => !testCasesInSelectedRealModules.includes(id)
      );
      
      testCaseIdsToAdd.push(...individualTestCaseIds);

      // Add all test cases to the suite using the new many-to-many endpoint
      const response = await fetch(`/api/testsuites/${suiteId}/testcases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testCaseIds: testCaseIdsToAdd,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setAlert({
          type: 'error',
          title: 'Failed to Add Test Cases',
          message: errorData.error || 'Failed to add test cases to suite',
        });
        return;
      }

      const data = await response.json();
      addedCount = data.data?.count || testCaseIdsToAdd.length;

      setAddModulesDialogOpen(false);
      setSelectedTestCaseIds([]);
      setSelectedModuleIds([]);
      setAlert({
        type: 'success',
        title: 'Success',
        message: `${addedCount} test case(s) added successfully`,
      });
      setTimeout(() => setAlert(null), 5000);
      fetchTestSuite();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setAlert({
        type: 'error',
        title: 'Connection Error',
        message: errorMessage,
      });
      console.error('Error adding modules and test cases:', error);
    }
  };

  const handleRemoveTestCase = (testCase: TestCase) => {
    setTestCaseToDelete(testCase);
    setDeleteTestCaseDialogOpen(true);
  };

  const handleConfirmDeleteTestCase = async () => {
    if (!testCaseToDelete) return;

    try {
      const response = await fetch(`/api/testsuites/${suiteId}/testcases`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testCaseIds: [testCaseToDelete.id],
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setDeleteTestCaseDialogOpen(false);
        setTestCaseToDelete(null);
        setAlert({
          type: 'success',
          title: 'Success',
          message: 'Test case removed from suite successfully',
        });
        setTimeout(() => setAlert(null), 5000);
        await fetchTestSuite();
      } else {
        console.error('Remove test case error:', data);
        setAlert({
          type: 'error',
          title: 'Failed to Remove Test Case',
          message: data.error || 'Failed to remove test case',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setAlert({
        type: 'error',
        title: 'Connection Error',
        message: errorMessage,
      });
      console.error('Error removing test case:', error);
    }
  };

  if (loading || permissionsLoading) {
    return <Loader fullScreen text="Loading test suite..." />;
  }

  // Check permissions
  const canUpdateSuite = hasPermissionCheck('testsuites:update');
  const canDeleteSuite = hasPermissionCheck('testsuites:delete');
  const canManageTestCases = canUpdateSuite; // Can add/remove test cases if can update suite

  if (!testSuite) {
    return (
      <div className="min-h-screen p-4 md:p-6 lg:p-8">
        <div className="text-center py-12">
          <p className="text-gray-400">Test suite not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      {/* Alert Messages */}
      <FloatingAlert alert={alert} onClose={() => setAlert(null)} />

      {/* Top Bar */}
      <TopBar
        breadcrumbs={[
          { label: 'Projects', href: '/projects' },
          {
            label: testSuite.project.name,
            href: `/projects/${testSuite.project.id}`,
          },
          {
            label: 'Test Suites',
            href: `/projects/${testSuite.project.id}/testsuites`,
          },
          { label: testSuite.name },
        ]}
      />

      <div className="p-4 md:p-6 lg:p-8">
        <TestSuiteHeader
          testSuite={testSuite}
          isEditing={isEditing}
          formData={formData}
          onEdit={() => setIsEditing(true)}
          onCancelEdit={handleCancelEdit}
          onSave={handleSave}
          onDelete={() => setDeleteDialogOpen(true)}
          onNameChange={(name) => setFormData({ ...formData, name })}
          canUpdate={canUpdateSuite}
          canDelete={canDeleteSuite}
        />

        {/* Quick Actions Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          {canManageTestCases && (
            <>
              <ButtonSecondary
                onClick={() => {
                  fetchAvailableModules();
                  setAddModulesDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Modules & Test Cases
              </ButtonSecondary>
            </>
          )}
          <ButtonSecondary
            onClick={() => router.push(`/projects/${testSuite.project.id}/testcases`)}
          >
            <TestTube2 className="w-4 h-4 mr-2" />
            View All Test Cases
          </ButtonSecondary>
          <ButtonSecondary
            onClick={() => router.push(`/projects/${testSuite.project.id}/testsuites`)}
          >
            <Folder className="w-4 h-4 mr-2" />
            View All Test Suites
          </ButtonSecondary>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <TestSuiteDetailsCard
              isEditing={isEditing}
              description={testSuite.description}
              formData={formData}
              onFormChange={(data) =>
                setFormData(data)
              }
            />

            <TestCasesCard
              testCases={testSuite.testCases}
              testCasesCount={testSuite._count.testCases}
              modules={(() => {
                // Extract unique modules from test cases with their counts
                const moduleMap = new Map<string, Module>();
                testSuite.testCases.forEach(tc => {
                  if (tc.module && tc.moduleId) {
                    if (!moduleMap.has(tc.moduleId)) {
                      const count = testSuite.testCases.filter(t => t.moduleId === tc.moduleId).length;
                      moduleMap.set(tc.moduleId, {
                        id: tc.module.id,
                        name: tc.module.name,
                        description: tc.module.description,
                        projectId: testSuite.projectId,
                        _count: { testCases: count }
                      });
                    }
                  }
                });
                return Array.from(moduleMap.values());
              })()}
              onAddTestCase={() => {
                fetchAvailableModules();
                setAddModulesDialogOpen(true);
              }}
              onTestCaseClick={(testCaseId) =>
                router.push(
                  `/projects/${testSuite.project.id}/testcases/${testCaseId}`
                )
              }
              onRemoveTestCase={handleRemoveTestCase}
              canAdd={canManageTestCases}
              canDelete={canManageTestCases}
            />

            <ChildSuitesCard
              childSuites={testSuite.children || []}
              childrenCount={testSuite._count.children}
              onChildSuiteClick={(childId) =>
                router.push(
                  `/projects/${testSuite.project.id}/testsuites/${childId}`
                )
              }
            />
          </div>

          <div className="space-y-6">
            <TestSuiteInfoCard
              parent={testSuite.parent}
              testCasesCount={testSuite._count.testCases}
              childrenCount={testSuite._count.children}
              createdAt={testSuite.createdAt}
              updatedAt={testSuite.updatedAt}
              onParentClick={(parentId) =>
                router.push(
                  `/projects/${testSuite.project.id}/testsuites/${parentId}`
                )
              }
            />
          </div>
        </div>

        <DeleteTestSuiteDialog
          open={deleteDialogOpen}
          testSuiteName={testSuite.name}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteTestSuite}
        />

        {/* Add Test Cases Dialog (deprecated - kept for backward compatibility) */}
        <AddTestCasesDialog
          open={addTestCasesDialogOpen}
          testCases={[]}
          selectedIds={selectedTestCaseIds}
          onOpenChange={setAddTestCasesDialogOpen}
          onSelectionChange={setSelectedTestCaseIds}
          onSubmit={handleAddTestCases}
          context="suite"
          showPriority={false}
        />

        {/* Add Modules & Test Cases Dialog */}
        <AddModulesAndTestCasesDialog
          open={addModulesDialogOpen}
          modules={availableModules}
          selectedModuleIds={selectedModuleIds}
          selectedTestCaseIds={selectedTestCaseIds}
          onOpenChange={setAddModulesDialogOpen}
          onModuleSelectionChange={setSelectedModuleIds}
          onTestCaseSelectionChange={setSelectedTestCaseIds}
          onSubmit={handleAddModulesAndTestCases}
          title="Add Modules & Test Cases to Suite"
          description="Select entire modules or individual test cases to add to this test suite"
          submitButtonText="Add Selected"
          emptyMessage="No modules or test cases available to add"
          loading={loadingAvailableModules}
        />

        {/* Delete Test Case Dialog */}
        <DeleteTestCaseDialog
          testCase={testCaseToDelete}
          triggerOpen={deleteTestCaseDialogOpen}
          onOpenChange={setDeleteTestCaseDialogOpen}
          onConfirm={handleConfirmDeleteTestCase}
        />
      </div>
    </div>
  );
}
