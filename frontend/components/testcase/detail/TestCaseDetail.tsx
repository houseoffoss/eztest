'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TopBar } from '@/components/design';
import { FloatingAlert, type FloatingAlertMessage } from '@/components/utils/FloatingAlert';
import { usePermissions } from '@/hooks/usePermissions';
import { Loader } from '@/elements/loader';
import { ButtonSecondary } from '@/elements/button-secondary';
import { TestTube2, Folder } from 'lucide-react';
import { TestCase, TestCaseFormData, TestStep, TestSuite } from './types';
import { TestCaseHeader } from './subcomponents/TestCaseHeader';
import { TestCaseDetailsCard } from './subcomponents/TestCaseDetailsCard';
import { TestStepsCard } from './subcomponents/TestStepsCard';
import { TestCaseInfoCard } from './subcomponents/TestCaseInfoCard';
import { TestCaseHistoryCard } from './subcomponents/TestCaseHistoryCard';
import { DeleteTestCaseDialog } from './subcomponents/DeleteTestCaseDialog';

interface TestCaseDetailProps {
  testCaseId: string;
}

export default function TestCaseDetail({ testCaseId }: TestCaseDetailProps) {
  const router = useRouter();
  const { hasPermission: hasPermissionCheck } = usePermissions();
  const [testCase, setTestCase] = useState<TestCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);

  const [formData, setFormData] = useState<TestCaseFormData>({
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

  const [steps, setSteps] = useState<TestStep[]>([]);
  const [newStep, setNewStep] = useState({ action: '', expectedResult: '' });
  const [addingStep, setAddingStep] = useState(false);
  const [alert, setAlert] = useState<FloatingAlertMessage | null>(null);

  useEffect(() => {
    fetchTestCase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testCaseId]);

  useEffect(() => {
    if (testCase) {
      document.title = `${testCase.title} | EZTest`;
    }
  }, [testCase]);

  // Check permissions
  const canUpdateTestCase = hasPermissionCheck('testcases:update');
  const canDeleteTestCase = hasPermissionCheck('testcases:delete');

  const fetchTestCase = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/testcases/${testCaseId}`);
      const data = await response.json();

      if (data.data) {
        setTestCase(data.data);
        setFormData({
          title: data.data.title,
          description: data.data.description || '',
          expectedResult: data.data.expectedResult || '',
          priority: data.data.priority,
          status: data.data.status,
          estimatedTime: data.data.estimatedTime?.toString() || '',
          preconditions: data.data.preconditions || '',
          postconditions: data.data.postconditions || '',
          suiteId: data.data.suiteId || null,
        });
        setSteps(data.data.steps || []);
        
        // Fetch test suites for the project
        if (data.data.project?.id) {
          try {
            const suitesResponse = await fetch(`/api/projects/${data.data.project.id}/testsuites`);
            const suitesData = await suitesResponse.json();
            if (suitesData.data) {
              setTestSuites(suitesData.data);
            }
          } catch (error) {
            console.error('Error fetching test suites:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching test case:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const estimatedTime = formData.estimatedTime
        ? parseInt(formData.estimatedTime)
        : undefined;

      const response = await fetch(`/api/testcases/${testCaseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          estimatedTime,
        }),
      });

      const data = await response.json();

      if (data.data) {
        await updateSteps();
        setIsEditing(false);
        setAlert({
          type: 'success',
          title: 'Success',
          message: 'Test case updated successfully',
        });
        setTimeout(() => setAlert(null), 5000);
        fetchTestCase();
      } else {
        setAlert({
          type: 'error',
          title: 'Failed to Update Test Case',
          message: data.error || 'Failed to update test case',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setAlert({
        type: 'error',
        title: 'Connection Error',
        message: errorMessage,
      });
      console.error('Error updating test case:', error);
    }
  };

  const updateSteps = async () => {
    try {
      const response = await fetch(`/api/testcases/${testCaseId}/steps`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steps }),
      });

      const data = await response.json();
      if (!data.data) {
        console.error('Failed to update steps:', data.error);
      }
    } catch (error) {
      console.error('Error updating steps:', error);
    }
  };

  const handleAddStep = () => {
    if (!newStep.action || !newStep.expectedResult) {
      setAlert({
        type: 'error',
        title: 'Missing Required Fields',
        message: 'Please fill in both action and expected result',
      });
      return;
    }

    const maxStepNumber =
      steps.length > 0 ? Math.max(...steps.map((s) => s.stepNumber)) : 0;

    setSteps([
      ...steps,
      {
        stepNumber: maxStepNumber + 1,
        action: newStep.action,
        expectedResult: newStep.expectedResult,
      },
    ]);

    setNewStep({ action: '', expectedResult: '' });
    setAddingStep(false);
  };

  const handleRemoveStep = (stepNumber: number) => {
    const filtered = steps.filter((s) => s.stepNumber !== stepNumber);
    const renumbered = filtered.map((step, index) => ({
      ...step,
      stepNumber: index + 1,
    }));
    setSteps(renumbered);
  };

  const handleDeleteTestCase = async () => {
    const response = await fetch(`/api/testcases/${testCaseId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setDeleteDialogOpen(false);
      setAlert({
        type: 'success',
        title: 'Success',
        message: 'Test case deleted successfully',
      });
      setTimeout(() => {
        router.push(`/projects/${testCase?.project.id}/testcases`);
      }, 1500);
    } else {
      const data = await response.json();
      throw new Error(data.error || 'Failed to delete test case');
    }
  };

  if (loading) {
    return <Loader fullScreen text="Loading test case..." />;
  }

  if (!testCase) {
    return (
      <div className="min-h-screen p-4 md:p-6 lg:p-8">
        <div className="text-center py-12">
          <p className="text-gray-400">Test case not found</p>
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
            label: testCase.project.name,
            href: `/projects/${testCase.project.id}`,
          },
          {
            label: 'Test Cases',
            href: `/projects/${testCase.project.id}/testcases`,
          },
          { label: testCase.title },
        ]}
      />

      <div className="p-4 md:p-6 lg:p-8">
        <TestCaseHeader
          testCase={testCase}
          isEditing={isEditing}
          formData={formData}
          onEdit={() => setIsEditing(true)}
          onCancel={() => setIsEditing(false)}
          onSave={handleSave}
          onDelete={() => setDeleteDialogOpen(true)}
          onFormChange={setFormData}
          canUpdate={canUpdateTestCase}
          canDelete={canDeleteTestCase}
        />

        {/* Quick Actions Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <ButtonSecondary
            onClick={() => router.push(`/projects/${testCase.project.id}/testcases`)}
          >
            <TestTube2 className="w-4 h-4 mr-2" />
            View All Test Cases
          </ButtonSecondary>
          {testCase.suite && (
            <ButtonSecondary
              onClick={() => router.push(`/projects/${testCase.project.id}/testsuites/${testCase.suite?.id}`)}
            >
              <Folder className="w-4 h-4 mr-2" />
              View Test Suite
            </ButtonSecondary>
          )}
          <ButtonSecondary
            onClick={() => router.push(`/projects/${testCase.project.id}/testsuites`)}
          >
            <Folder className="w-4 h-4 mr-2" />
            View All Test Suites
          </ButtonSecondary>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <TestCaseDetailsCard
              testCase={testCase}
              isEditing={isEditing}
              formData={formData}
              testSuites={testSuites}
              onFormChange={setFormData}
            />

            <TestStepsCard
              steps={steps}
              isEditing={isEditing}
              addingStep={addingStep}
              newStep={newStep}
              onStepsChange={setSteps}
              onAddingStepChange={setAddingStep}
              onNewStepChange={setNewStep}
              onAddStep={handleAddStep}
              onRemoveStep={handleRemoveStep}
            />

            <TestCaseHistoryCard testCaseId={testCaseId} />
          </div>

          <div className="space-y-6">
            <TestCaseInfoCard testCase={testCase} />
          </div>
        </div>

        <DeleteTestCaseDialog
          testCase={testCase}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteTestCase}
        />
      </div>
    </div>
  );
}
