'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/elements/button';
import { Breadcrumbs } from '@/components/design/Breadcrumbs';
import { TestSuiteHeader } from './subcomponents/TestSuiteHeader';
import { TestSuiteDetailsCard } from './subcomponents/TestSuiteDetailsCard';
import { TestCasesCard } from './subcomponents/TestCasesCard';
import { ChildSuitesCard } from './subcomponents/ChildSuitesCard';
import { TestSuiteInfoCard } from './subcomponents/TestSuiteInfoCard';
import { QuickActionsCard } from './subcomponents/QuickActionsCard';
import { DeleteTestSuiteDialog } from './subcomponents/DeleteTestSuiteDialog';
import { CreateTestCaseDialog } from '@/frontend/components/testcase/subcomponents/CreateTestCaseDialog';
import { SelectTestCasesDialog } from '@/frontend/components/testcase/subcomponents/SelectTestCasesDialog';
import { DeleteTestCaseDialog } from '@/frontend/components/testcase/subcomponents/DeleteTestCaseDialog';
import { TestSuite, TestSuiteFormData } from './types';
import { TestCaseFormData, TestCase } from '@/frontend/components/testcase/types';

interface TestSuiteDetailProps {
  suiteId: string;
}

export default function TestSuiteDetail({ suiteId }: TestSuiteDetailProps) {
  const router = useRouter();

  const [testSuite, setTestSuite] = useState<TestSuite | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
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

  const [testCaseFormData, setTestCaseFormData] = useState<TestCaseFormData>({
    title: '',
    description: '',
    expectedResult: '',
    priority: 'MEDIUM',
    status: 'DRAFT',
    estimatedTime: '',
    preconditions: '',
    postconditions: '',
    suiteId: null,
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
      const data = await response.json();

      if (data.data) {
        setTestSuite(data.data);
        setFormData({
          name: data.data.name,
          description: data.data.description || '',
        });
      }
    } catch (error) {
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

      if (data.data) {
        setIsEditing(false);
        fetchTestSuite();
      } else {
        alert(data.error || 'Failed to update test suite');
      }
    } catch (error) {
      console.error('Error updating test suite:', error);
      alert('Failed to update test suite');
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
        router.push(`/projects/${testSuite?.project.id}/testsuites`);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete test suite');
      }
    } catch (error) {
      console.error('Error deleting test suite:', error);
      alert('Failed to delete test suite');
    }
  };

  const handleCreateTestCase = async () => {
    try {
      const estimatedTime = testCaseFormData.estimatedTime
        ? parseInt(testCaseFormData.estimatedTime)
        : undefined;

      const response = await fetch(`/api/projects/${testSuite?.project.id}/testcases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...testCaseFormData,
          estimatedTime,
          suiteId: suiteId,
        }),
      });

      const data = await response.json();

      if (data.data) {
        setCreateTestCaseDialogOpen(false);
        setTestCaseFormData({
          title: '',
          description: '',
          expectedResult: '',
          priority: 'MEDIUM',
          status: 'DRAFT',
          estimatedTime: '',
          preconditions: '',
          postconditions: '',
          suiteId: null,
        });
        fetchTestSuite();
      } else {
        alert(data.error || 'Failed to create test case');
      }
    } catch (error) {
      console.error('Error creating test case:', error);
      alert('Failed to create test case');
    }
  };

  const fetchAvailableTestCases = async () => {
    try {
      const response = await fetch(`/api/projects/${testSuite?.project.id}/testcases`);
      const data = await response.json();
      if (data.data) {
        // Filter out test cases that are already in this suite
        const alreadyInSuite = testSuite?.testCases.map(tc => tc.id) || [];
        const available = data.data.filter((tc: any) => !alreadyInSuite.includes(tc.id));
        setAvailableTestCases(available);
      }
    } catch (error) {
      console.error('Error fetching available test cases:', error);
    }
  };

  const handleAddTestCases = async () => {
    if (selectedTestCaseIds.length === 0) {
      alert('Please select at least one test case');
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
          alert(`Failed to add test case`);
          return;
        }
      }

      setAddTestCasesDialogOpen(false);
      setSelectedTestCaseIds([]);
      fetchTestSuite();
    } catch (error) {
      console.error('Error adding test cases:', error);
      alert('Failed to add test cases');
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
        alert(data.error || 'Failed to remove test case');
      }
    } catch (error) {
      console.error('Error removing test case:', error);
      alert('Failed to remove test case');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-6 lg:p-8">
        <div className="text-center py-12">
          <p className="text-gray-400">Loading test suite...</p>
        </div>
      </div>
    );
  }

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
                setTestCaseFormData({
                  title: '',
                  description: '',
                  expectedResult: '',
                  priority: 'MEDIUM',
                  status: 'DRAFT',
                  estimatedTime: '',
                  preconditions: '',
                  postconditions: '',
                  suiteId: null,
                });
              }}
              onTestCaseClick={(testCaseId) =>
                router.push(
                  `/projects/${testSuite.project.id}/testcases/${testCaseId}`
                )
              }
              onRemoveTestCase={handleRemoveTestCase}
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
                setTestCaseFormData({
                  title: '',
                  description: '',
                  expectedResult: '',
                  priority: 'MEDIUM',
                  status: 'DRAFT',
                  estimatedTime: '',
                  preconditions: '',
                  postconditions: '',
                  suiteId: null,
                });
              }}
              onAddTestCase={() => {
                setCreateTestCaseDialogOpen(true);
                setTestCaseFormData({
                  title: '',
                  description: '',
                  expectedResult: '',
                  priority: 'MEDIUM',
                  status: 'DRAFT',
                  estimatedTime: '',
                  preconditions: '',
                  postconditions: '',
                  suiteId: null,
                });
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
          open={createTestCaseDialogOpen}
          formData={testCaseFormData}
          testSuites={[]}
          onOpenChange={setCreateTestCaseDialogOpen}
          onFormChange={setTestCaseFormData}
          onSubmit={handleCreateTestCase}
        />

        {/* Add Test Cases Dialog */}
        <SelectTestCasesDialog
          open={addTestCasesDialogOpen}
          testCases={availableTestCases}
          selectedIds={selectedTestCaseIds}
          onOpenChange={setAddTestCasesDialogOpen}
          onSelectionChange={setSelectedTestCaseIds}
          onSubmit={handleAddTestCases}
        />

        {/* Delete Test Case Dialog */}
        <DeleteTestCaseDialog
          open={deleteTestCaseDialogOpen}
          testCase={testCaseToDelete}
          onOpenChange={setDeleteTestCaseDialogOpen}
          onConfirm={handleConfirmDeleteTestCase}
        />
      </div>
    </div>
  );
}
