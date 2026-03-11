'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { TopBar } from '@/frontend/reusable-components/layout/TopBar';
import { Loader } from '@/frontend/reusable-elements/loaders/Loader';
import { ActionButtonGroup } from '@/frontend/reusable-components/layout/ActionButtonGroup';
import { TestTube2, Folder } from 'lucide-react';
import { FloatingAlert, type FloatingAlertMessage } from '@/frontend/reusable-components/alerts/FloatingAlert';
import { usePermissions } from '@/hooks/usePermissions';
import { Module, TestCase } from '../types';
import { CreateTestCaseDialog } from '../subcomponents/CreateTestCaseDialog';
import { DeleteTestCaseDialog } from '../subcomponents/DeleteTestCaseDialog';
import { DeleteModuleDialog } from './DeleteModuleDialog';
import { AddTestCaseDialog } from './AddTestCaseDialog';
import { ModuleHeader } from './subcomponents/ModuleHeader';
import { ModuleDetailsCard } from './subcomponents/ModuleDetailsCard';
import { ModuleTestCasesCard } from './subcomponents/ModuleTestCasesCard';
import { ModuleInfoCard } from './subcomponents/ModuleInfoCard';
import { ModuleStatisticsCard } from './subcomponents/ModuleStatisticsCard';

interface ModuleDetailProps {
  projectId: string;
  moduleId: string;
}

export default function ModuleDetail({ projectId, moduleId }: ModuleDetailProps) {
  const router = useRouter();
  const { hasPermission: hasPermissionCheck } = usePermissions();

  const [project, setProject] = useState<{ id: string; name: string; key: string } | null>(null);
  const [module, setModule] = useState<Module | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  const [createTestCaseDialogOpen, setCreateTestCaseDialogOpen] = useState(false);
  const [addTestCaseDialogOpen, setAddTestCaseDialogOpen] = useState(false);
  const [deleteModuleDialogOpen, setDeleteModuleDialogOpen] = useState(false);
  const [deleteTestCaseDialogOpen, setDeleteTestCaseDialogOpen] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const [alert, setAlert] = useState<FloatingAlertMessage | null>(null);

  const canCreateTestCase = hasPermissionCheck('testcases:create');
  const canUpdateModule = hasPermissionCheck('testcases:update');
  const canDeleteModule = hasPermissionCheck('testcases:delete');
  const canDeleteTestCase = hasPermissionCheck('testcases:delete');

  const fetchProject = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      const data = await response.json();
      if (data.data) {
        setProject(data.data);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  }, [projectId]);

  const fetchModule = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/modules/${moduleId}`);
      const data = await response.json();
      if (data.data) {
        setModule(data.data);
      } else if (response.status === 404) {
        setAlert({
          type: 'error',
          title: 'Error',
          message: 'Module not found',
        });
        setTimeout(() => router.push(`/projects/${projectId}/testcases`), 2000);
      }
    } catch (error) {
      console.error('Error fetching module:', error);
      setAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to load module',
      });
    }
  }, [projectId, moduleId, router]);

  const fetchTestCases = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}/testcases`, {
        cache: 'no-store'
      });
      const data = await response.json();
      if (data.data) {
        const moduleTestCases = data.data.filter((tc: TestCase) => tc.moduleId === moduleId);
        setTestCases(moduleTestCases);
      }
    } catch (error) {
      console.error('Error fetching test cases:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId, moduleId]);

  useEffect(() => {
    fetchProject();
    fetchModule();
    fetchTestCases();
  }, [fetchProject, fetchModule, fetchTestCases]);

  useEffect(() => {
    if (module) {
      document.title = `${module.name} - Module | EZTest`;
      setFormData({
        name: module.name,
        description: module.description || '',
      });
    }
  }, [module]);

  const handleSave = async () => {
    if (!module) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/modules/${moduleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setModule(data.data);
        setIsEditing(false);
        setAlert({
          type: 'success',
          title: 'Success',
          message: `Module "${data.data.name}" updated successfully`,
        });
        setTimeout(() => setAlert(null), 5000);
      } else {
        setAlert({
          type: 'error',
          title: 'Error',
          message: data.error || 'Failed to update module',
        });
        setTimeout(() => setAlert(null), 5000);
      }
    } catch (error) {
      console.error('Error updating module:', error);
      setAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to update module',
      });
      setTimeout(() => setAlert(null), 5000);
    }
  };

  const handleTestCaseClick = (testCaseId: string) => {
    router.push(`/projects/${projectId}/testcases/${testCaseId}`);
  };

  const handleTestCaseCreated = (newTestCase: TestCase) => {
    setAlert({
      type: 'success',
      title: 'Success',
      message: `Test case "${newTestCase.title}" created successfully`,
    });
    setTimeout(() => setAlert(null), 5000);
    fetchTestCases();
  };

  const handleTestCasesAdded = () => {
    setAlert({
      type: 'success',
      title: 'Success',
      message: 'Test cases added to module successfully',
    });
    setTimeout(() => setAlert(null), 5000);
    fetchTestCases();
  };

  const handleDeleteClick = (testCase: TestCase) => {
    setSelectedTestCase(testCase);
    setDeleteTestCaseDialogOpen(true);
  };

  const handleDeleteTestCase = async () => {
    if (!selectedTestCase) return;

    try {
      const response = await fetch(`/api/testcases/${selectedTestCase.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const deletedTestCaseName = selectedTestCase.title;
        setDeleteTestCaseDialogOpen(false);
        setSelectedTestCase(null);
        setAlert({
          type: 'success',
          title: 'Success',
          message: `Test case "${deletedTestCaseName}" deleted successfully`,
        });
        setTimeout(() => setAlert(null), 5000);
        fetchTestCases();
      } else {
        const data = await response.json();
        setAlert({
          type: 'error',
          title: 'Error',
          message: data.error || 'Failed to delete test case',
        });
        setTimeout(() => setAlert(null), 5000);
      }
    } catch (error) {
      console.error('Error deleting test case:', error);
      setAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete test case',
      });
      setTimeout(() => setAlert(null), 5000);
    }
  };

  const handleDeleteModule = async () => {
    if (!module) return;

    const response = await fetch(`/api/projects/${projectId}/modules/${moduleId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setDeleteModuleDialogOpen(false);
      setAlert({
        type: 'success',
        title: 'Success',
        message: `Module "${module.name}" deleted successfully`,
      });
      setTimeout(() => {
        router.push(`/projects/${projectId}/testcases`);
      }, 1000);
    } else {
      const data = await response.json();
      throw new Error(data.error || 'Failed to delete module');
    }
  };

  if (loading || !module) {
    return <Loader fullScreen text="Loading module..." />;
  }

  if (!project) {
    return <Loader fullScreen text="Loading project..." />;
  }

  return (
    <div className="flex-1">
      <FloatingAlert alert={alert} onClose={() => setAlert(null)} />

      <TopBar
        breadcrumbs={[
          { label: 'Projects', href: '/projects' },
          { label: project.name, href: `/projects/${projectId}` },
          { label: 'Test Cases', href: `/projects/${projectId}/testcases` },
          { label: module.name },
        ]}
      />

      <div className="p-4 md:p-6 lg:p-8">
        <ModuleHeader
          module={module}
          projectName={project.name}
          projectKey={project.key}
          testCaseCount={testCases.length}
          isEditing={isEditing}
          formData={formData}
          onEdit={() => setIsEditing(true)}
          onCancel={() => {
            setIsEditing(false);
            setFormData({
              name: module.name,
              description: module.description || '',
            });
          }}
          onSave={handleSave}
          onDelete={() => setDeleteModuleDialogOpen(true)}
          onFormChange={setFormData}
          canUpdate={canUpdateModule}
          canDelete={canDeleteModule}
        />

        <ActionButtonGroup
          buttons={[
            {
              label: 'View All Test Cases',
              icon: TestTube2,
              onClick: () => router.push(`/projects/${projectId}/testcases`),
              variant: 'secondary',
              buttonName: 'Module Detail - View All Test Cases',
            },
            {
              label: 'View All Test Suites',
              icon: Folder,
              onClick: () => router.push(`/projects/${projectId}/testsuites`),
              variant: 'secondary',
              buttonName: 'Module Detail - View All Test Suites',
            },
          ]}
          className="mb-6"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ModuleDetailsCard
              module={module}
              isEditing={isEditing}
              formData={formData}
              onFormChange={setFormData}
            />

            <ModuleTestCasesCard
              testCases={testCases}
              testCasesCount={testCases.length}
              onCreateClick={() => setCreateTestCaseDialogOpen(true)}
              onAddExistingClick={() => setAddTestCaseDialogOpen(true)}
              onTestCaseClick={handleTestCaseClick}
              onDeleteClick={handleDeleteClick}
              canCreate={canCreateTestCase}
              canDelete={canDeleteTestCase}
            />
          </div>

          <div className="space-y-6">
            <ModuleInfoCard module={module} testCaseCount={testCases.length} />
            <ModuleStatisticsCard testCases={testCases} />
          </div>
        </div>

        {canCreateTestCase && (
          <CreateTestCaseDialog
            open={createTestCaseDialogOpen}
            onOpenChange={setCreateTestCaseDialogOpen}
            projectId={projectId}
            defaultModuleId={moduleId}
            onTestCaseCreated={handleTestCaseCreated}
          />
        )}

        {canCreateTestCase && (
          <AddTestCaseDialog
            open={addTestCaseDialogOpen}
            onOpenChange={setAddTestCaseDialogOpen}
            projectId={projectId}
            moduleId={moduleId}
            onTestCasesAdded={handleTestCasesAdded}
          />
        )}

        {canDeleteModule && module && (
          <DeleteModuleDialog
            open={deleteModuleDialogOpen}
            onOpenChange={setDeleteModuleDialogOpen}
            module={module}
            testCaseCount={testCases.length}
            onConfirm={handleDeleteModule}
          />
        )}

        <DeleteTestCaseDialog
          triggerOpen={deleteTestCaseDialogOpen}
          onOpenChange={setDeleteTestCaseDialogOpen}
          testCase={selectedTestCase}
          onConfirm={handleDeleteTestCase}
        />
      </div>
    </div>
  );
}
