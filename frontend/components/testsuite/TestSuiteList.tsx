'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/elements/badge';
import { Button } from '@/elements/button';
import { ButtonPrimary } from '@/elements/button-primary';
import { Plus } from 'lucide-react';
import { TopBar } from '@/components/design';
import { Loader } from '@/elements/loader';
import { FloatingAlert, type FloatingAlertMessage } from '@/components/utils/FloatingAlert';
import { TestSuite, Project } from './types';
import { TestSuiteTreeItem } from './subcomponents/TestSuiteTreeItem';
import { CreateTestSuiteDialog } from './subcomponents/CreateTestSuiteDialog';
import { DeleteTestSuiteDialog } from './subcomponents/DeleteTestSuiteDialog';
import { EmptyTestSuiteState } from './subcomponents/EmptyTestSuiteState';
import { usePermissions } from '@/hooks/usePermissions';

interface TestSuiteListProps {
  projectId: string;
}

export default function TestSuiteList({ projectId }: TestSuiteListProps) {
  const router = useRouter();
  const { hasPermission: hasPermissionCheck, isLoading: permissionsLoading } = usePermissions();
  const [project, setProject] = useState<Project | null>(null);
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSuite, setSelectedSuite] = useState<TestSuite | null>(null);
  const [expandedSuites, setExpandedSuites] = useState<Set<string>>(new Set());
  const [alert, setAlert] = useState<FloatingAlertMessage | null>(null);

  useEffect(() => {
    fetchProject();
    fetchTestSuites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    if (project) {
      document.title = `Test Suites - ${project.name} | EZTest`;
    }
  }, [project]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setAlert({
          type: 'error',
          title: 'Failed to Load Project',
          message: errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        });
      } else {
        const data = await response.json();
        if (data.data) {
          setProject(data.data);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setAlert({
        type: 'error',
        title: 'Connection Error',
        message: errorMessage,
      });
      console.error('Error fetching project:', error);
    }
  };

  const fetchTestSuites = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}/testsuites`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setAlert({
          type: 'error',
          title: 'Failed to Load Test Suites',
          message: errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        });
        setTestSuites([]);
      } else {
        const data = await response.json();
        if (data.data) {
          setTestSuites(data.data);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setAlert({
        type: 'error',
        title: 'Connection Error',
        message: errorMessage,
      });
      console.error('Error fetching test suites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTestSuite = async () => {
    if (!selectedSuite) return;

    try {
      const response = await fetch(`/api/testsuites/${selectedSuite.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDeleteDialogOpen(false);
        const deletedSuiteName = selectedSuite.name;
        setSelectedSuite(null);
        setAlert({
          type: 'success',
          title: 'Success',
          message: `Test suite "${deletedSuiteName}" deleted successfully`,
        });
        setTimeout(() => setAlert(null), 5000);
        fetchTestSuites();
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

  const toggleExpanded = (suiteId: string) => {
    const newExpanded = new Set(expandedSuites);
    if (newExpanded.has(suiteId)) {
      newExpanded.delete(suiteId);
    } else {
      newExpanded.add(suiteId);
    }
    setExpandedSuites(newExpanded);
  };

  const handleViewSuite = (suiteId: string) => {
    router.push(`/projects/${projectId}/testsuites/${suiteId}`);
  };

  const handleDeleteClick = (suite: TestSuite) => {
    setSelectedSuite(suite);
    setDeleteDialogOpen(true);
  };

  const rootSuites = testSuites.filter(s => !s.parentId);

  if (loading || permissionsLoading) {
    return <Loader fullScreen text="Loading test suites..." />;
  }

  // Check if user can create, update, or delete test suites
  const canCreateTestSuite = hasPermissionCheck('testsuites:create');
  const canDeleteTestSuite = hasPermissionCheck('testsuites:delete');

  return (
    <>
      {/* Alert Messages */}
      <FloatingAlert alert={alert} onClose={() => setAlert(null)} />

      {project && (
        <TopBar 
          breadcrumbs={[
            { label: 'Projects', href: '/projects' },
            { label: project.name, href: `/projects/${projectId}` },
            { label: 'Test Suites' },
          ]}
          actions={
            canCreateTestSuite ? (
              <ButtonPrimary
                size="default"
                onClick={() => setCreateDialogOpen(true)}
                className="cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Test Suite
              </ButtonPrimary>
            ) : undefined
          }
        />
      )}

      <div className="max-w-7xl mx-auto px-8 pt-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            {project && (
              <Badge variant="outline" className="font-mono border-primary/40 bg-primary/10 text-primary text-xs px-2.5 py-0.5">
                {project.key}
              </Badge>
            )}
            <h1 className="text-2xl font-bold text-white">Test Suites</h1>
          </div>
          <p className="text-gray-400">
            Organize test cases into hierarchical suites
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-400">
            {testSuites.length} suite{testSuites.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <Loader fullScreen={false} text="Loading test suites..." />
        ) : testSuites.length === 0 ? (
          <EmptyTestSuiteState onCreateClick={() => setCreateDialogOpen(true)} canCreate={canCreateTestSuite} />
        ) : (
          <div className="space-y-6">
            {rootSuites.map((suite) => (
              <TestSuiteTreeItem
                key={suite.id}
                suite={suite}
                isExpanded={expandedSuites.has(suite.id)}
                onToggleExpand={toggleExpanded}
                onView={handleViewSuite}
                onDelete={handleDeleteClick}
                canDelete={canDeleteTestSuite}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <CreateTestSuiteDialog
        projectId={projectId}
        testSuites={testSuites}
        triggerOpen={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onTestSuiteCreated={(suite) => {
          setAlert({
            type: 'success',
            title: 'Success',
            message: `Test suite "${suite.name}" created successfully`,
          });
          setTimeout(() => setAlert(null), 5000);
          fetchTestSuites();
        }}
      />

      <DeleteTestSuiteDialog
        suite={selectedSuite}
        triggerOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteTestSuite}
      />
    </>
  );
}