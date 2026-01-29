'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';
import { Plus } from 'lucide-react';
import { Navbar } from '@/frontend/reusable-components/layout/Navbar';
import { Breadcrumbs } from '@/frontend/reusable-components/layout/Breadcrumbs';
import { Loader } from '@/frontend/reusable-elements/loaders/Loader';
import { FloatingAlert, type FloatingAlertMessage } from '@/frontend/reusable-components/alerts/FloatingAlert';
import { PageHeaderWithBadge } from '@/frontend/reusable-components/layout/PageHeaderWithBadge';
import { ResponsiveGrid } from '@/frontend/reusable-components/layout/ResponsiveGrid';
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

  const canCreateTestSuite = hasPermissionCheck('testsuites:create');

  const navbarActions = useMemo(() => {
    const actions = [];
    
    if (canCreateTestSuite) {
      actions.push({
        type: 'action' as const,
        label: 'Create Test Suite',
        icon: Plus,
        onClick: () => setCreateDialogOpen(true),
        variant: 'primary' as const,
        buttonName: 'Test Suite List - Create Test Suite',
      });
    }

    actions.push({
      type: 'signout' as const,
      showConfirmation: true,
    });

    return actions;
  }, [canCreateTestSuite]);

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
      const response = await fetch(`/api/projects/${projectId}/testsuites/${selectedSuite.id}`, {
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

  const canDeleteTestSuite = hasPermissionCheck('testsuites:delete');

  return (
    <>
      {/* Alert Messages */}
      <FloatingAlert alert={alert} onClose={() => setAlert(null)} />

      {project && (
        <Navbar
          brandLabel={null}
          items={[]}
          breadcrumbs={
            <Breadcrumbs 
              items={[
                { label: 'Projects', href: '/projects' },
                { label: project.name, href: `/projects/${projectId}` },
                { label: 'Test Suites', href: `/projects/${projectId}/testsuites` },
              ]}
            />
          }
          actions={navbarActions}
        />
      )}

      <div className="max-w-7xl mx-auto px-8 pt-8">
        {/* Header */}
        <PageHeaderWithBadge
          badge={project?.key}
          title="Test Suites"
          description="Organize test cases into hierarchical suites"
          className="mb-6"
        />

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
          <ResponsiveGrid
            columns={{ default: 1, md: 2, lg: 2, xl: 3 }}
            gap="md"
          >
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
          </ResponsiveGrid>
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