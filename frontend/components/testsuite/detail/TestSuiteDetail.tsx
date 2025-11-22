import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/elements/button';
import { Breadcrumbs } from '@/components/design/Breadcrumbs';
import { Loader } from '@/elements/loader';
import { FloatingAlert, type FloatingAlertMessage } from '@/components/utils/FloatingAlert';
import { TestSuiteHeader } from './subcomponents/TestSuiteHeader';
import { TestSuiteDetailsCard } from './subcomponents/TestSuiteDetailsCard';
import { TestCasesCard } from './subcomponents/TestCasesCard';
import { ChildSuitesCard } from './subcomponents/ChildSuitesCard';
import { TestSuiteInfoCard } from './subcomponents/TestSuiteInfoCard';
import { QuickActionsCard } from './subcomponents/QuickActionsCard';
import { DeleteTestSuiteDialog } from './subcomponents/DeleteTestSuiteDialog';
import { CreateTestCaseDialog } from '@/frontend/components/testcase/subcomponents/CreateTestCaseDialog';
import { AddTestCasesDialog } from '@/frontend/components/common/dialogs/AddTestCasesDialog';
import { DeleteTestCaseDialog } from '@/frontend/components/testcase/subcomponents/DeleteTestCaseDialog';
import { TestSuite, TestSuiteFormData } from './types';
import { TestCase } from '@/frontend/components/testcase/types';
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
  const [createTestCaseDialogOpen, setCreateTestCaseDialogOpen] = useState(false);
  const [addTestCasesDialogOpen, setAddTestCasesDialogOpen] = useState(false);
  const [deleteTestCaseDialogOpen, setDeleteTestCaseDialogOpen] = useState(false);
  const [testCaseToDelete, setTestCaseToDelete] = useState<TestCase | null>(null);
  const [availableTestCases, setAvailableTestCases] = useState<TestCase[]>([]);
  const [selectedTestCaseIds, setSelectedTestCaseIds] = useState<string[]>([]);

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
    }
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
    try {
      const response = await fetch(`/api/testsuites/${suiteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAlert({
          type: 'success',
          title: 'Success',
          message: 'Test suite deleted successfully',
        });
        setTimeout(() => router.push(`/projects/${testSuite?.project.id}/testsuites`), 1000);
      } else {
        const data = await response.json();
        setAlert({
          type: 'error',
          title: 'Failed to Delete Test Suite',
          message: data.error || 'Failed to delete test suite',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setAlert({
        type: 'error',
        title: 'Connection Error',
        message: errorMessage,
      });
      console.error('Error deleting test suite:', error);
    }
  };



  const fetchAvailableTestCases = async () => {
    try {
      const response = await fetch(`/api/projects/${testSuite?.project.id}/testcases`);
      const data = await response.json();
      if (data.data) {
        // Filter out test cases that are already in this suite
        const alreadyInSuite = testSuite?.testCases.map(tc => tc.id) || [];
        const available = data.data.filter((tc: TestCase) => !alreadyInSuite.includes(tc.id));
        setAvailableTestCases(available);
      }
    } catch (error) {
      console.error('Error fetching available test cases:', error);
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

  const handleRemoveTestCase = (testCase: TestCase) => {
    setTestCaseToDelete(testCase);
    setDeleteTestCaseDialogOpen(true);
  };

  const handleConfirmDeleteTestCase = async () => {
    if (!testCaseToDelete) return;

    try {
      const response = await fetch(`/api/testsuites/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testCaseIds: [testCaseToDelete.id],
          suiteId: null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setDeleteTestCaseDialogOpen(false);
        setTestCaseToDelete(null);
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
    return <Loader fullScreen text="Loading..." />;
  }

  // Check permissions
  const canUpdateSuite = hasPermissionCheck('testsuites:update');
  const canDeleteSuite = hasPermissionCheck('testsuites:delete');
  const canCreateTestCase = hasPermissionCheck('testcases:create');

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
      <div className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <Breadcrumbs
            items={[
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
          <form action="/api/auth/signout" method="POST" className="inline">
            <Button type="submit" variant="glass-destructive" size="sm" className="px-5">
              Sign Out
            </Button>
          </form>
        </div>
      </div>

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <TestSuiteDetailsCard
              isEditing={isEditing}
              description={testSuite.description}
              formData={formData}
              onDescriptionChange={(description) =>
                setFormData({ ...formData, description })
              }
            />

            <TestCasesCard
              testCases={testSuite.testCases}
              testCasesCount={testSuite._count.testCases}
              onAddTestCase={() => {
                setCreateTestCaseDialogOpen(true);
              }}
              onTestCaseClick={(testCaseId) =>
                router.push(
                  `/projects/${testSuite.project.id}/testcases/${testCaseId}`
                )
              }
              onRemoveTestCase={handleRemoveTestCase}
              canAdd={canCreateTestCase}
              canDelete={canCreateTestCase}
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

            <QuickActionsCard
              onCreateTestCase={() => {
                setCreateTestCaseDialogOpen(true);
              }}
              onAddTestCase={() => {
                setCreateTestCaseDialogOpen(true);
              }}
              onAddExistingTestCases={() => {
                fetchAvailableTestCases();
                setAddTestCasesDialogOpen(true);
              }}
              onViewAllTestCases={() =>
                router.push(`/projects/${testSuite.project.id}/testcases`)
              }
              onViewAllSuites={() =>
                router.push(`/projects/${testSuite.project.id}/testsuites`)
              }
              canCreateTestCase={canCreateTestCase}
            />
          </div>
        </div>

        <DeleteTestSuiteDialog
          open={deleteDialogOpen}
          testSuiteName={testSuite.name}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteTestSuite}
        />

        {/* Create Test Case Dialog */}
        <CreateTestCaseDialog
          projectId={testSuite.project.id}
          testSuites={testSuite ? [{ id: testSuite.id, name: testSuite.name, parentId: testSuite.parentId || null, _count: { testCases: testSuite._count.testCases } }] : []}
          defaultSuiteId={suiteId}
          triggerOpen={createTestCaseDialogOpen}
          onOpenChange={setCreateTestCaseDialogOpen}
          onTestCaseCreated={() => {
            setCreateTestCaseDialogOpen(false);
            setAlert({
              type: 'success',
              title: 'Success',
              message: 'Test case created successfully',
            });
            setTimeout(() => setAlert(null), 5000);
            fetchTestSuite();
          }}
        />

        {/* Add Test Cases Dialog */}
        <AddTestCasesDialog
          open={addTestCasesDialogOpen}
          testCases={availableTestCases}
          selectedIds={selectedTestCaseIds}
          onOpenChange={setAddTestCasesDialogOpen}
          onSelectionChange={setSelectedTestCaseIds}
          onSubmit={handleAddTestCases}
          context="suite"
          showPriority={false}
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
