'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';
import { ButtonSecondary } from '@/frontend/reusable-elements/buttons/ButtonSecondary';
import { TopBar } from '@/frontend/reusable-components/layout/TopBar';
import { Loader } from '@/frontend/reusable-elements/loaders/Loader';
import { Plus, Upload } from 'lucide-react';
import { FloatingAlert, type FloatingAlertMessage } from '@/frontend/reusable-components/alerts/FloatingAlert';
import { PageHeaderWithBadge } from '@/frontend/reusable-components/layout/PageHeaderWithBadge';
import { HeaderWithFilters } from '@/frontend/reusable-components/layout/HeaderWithFilters';
import { ResponsiveGrid } from '@/frontend/reusable-components/layout/ResponsiveGrid';
import { TestRunsFilterCard } from './subcomponents/TestRunsFilterCard';
import { TestRunCard } from './subcomponents/TestRunCard';
import { TestRunsEmptyState } from './subcomponents/TestRunsEmptyState';
import { CreateTestRunDialog } from './subcomponents/CreateTestRunDialog';
import { DeleteTestRunDialog } from './subcomponents/DeleteTestRunDialog';
import { TestRun, Project, TestRunFormData, TestRunFilters } from './types';
import { usePermissions } from '@/hooks/usePermissions';
import { FileExportDialog } from '@/frontend/reusable-components/dialogs/FileExportDialog';

interface TestRunsListProps {
  projectId: string;
}

export default function TestRunsList({ projectId }: TestRunsListProps) {
  const router = useRouter();
  const { hasPermission: hasPermissionCheck, isLoading: permissionsLoading } = usePermissions();

  const [project, setProject] = useState<Project | null>(null);
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [filteredTestRuns, setFilteredTestRuns] = useState<TestRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedTestRun, setSelectedTestRun] = useState<TestRun | null>(null);

  const [filters, setFilters] = useState<TestRunFilters>({
    searchQuery: '',
    statusFilter: 'all',
    environmentFilter: 'all',
  });

  const [alert, setAlert] = useState<FloatingAlertMessage | null>(null);

  useEffect(() => {
    fetchProject();
    fetchTestRuns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    if (project) {
      document.title = `Test Runs - ${project.name} | EZTest`;
    }
  }, [project]);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testRuns, filters]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      const data = await response.json();
      if (data.data) {
        setProject(data.data);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };

  const fetchTestRuns = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}/testruns`);
      const data = await response.json();
      if (data.data) {
        setTestRuns(data.data);
      }
    } catch (error) {
      console.error('Error fetching test runs:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...testRuns];

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (tr) =>
          tr.name.toLowerCase().includes(query) ||
          tr.description?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filters.statusFilter !== 'all') {
      filtered = filtered.filter((tr) => tr.status === filters.statusFilter);
    }

    // Environment filter
    if (filters.environmentFilter !== 'all') {
      filtered = filtered.filter(
        (tr) => tr.environment === filters.environmentFilter
      );
    }

    setFilteredTestRuns(filtered);
  };

  const handleTestRunCreated = (newTestRun: TestRun) => {
    setAlert({
      type: 'success',
      title: 'Success',
      message: `Test run "${newTestRun.name}" created successfully`,
    });
    setTimeout(() => setAlert(null), 5000);
    fetchTestRuns();
  };

  const handleDeleteTestRun = async () => {
    if (!selectedTestRun) return;

    try {
      const response = await fetch(`/api/testruns/${selectedTestRun.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const deletedTestRunName = selectedTestRun.name;
        setDeleteDialogOpen(false);
        setSelectedTestRun(null);
        setAlert({
          type: 'success',
          title: 'Success',
          message: `Test run "${deletedTestRunName}" deleted successfully`,
        });
        setTimeout(() => setAlert(null), 5000);
        fetchTestRuns();
      } else {
        const data = await response.json();
        setAlert({
          type: 'error',
          title: 'Failed to Delete Test Run',
          message: data.error || 'Failed to delete test run',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setAlert({
        type: 'error',
        title: 'Connection Error',
        message: errorMessage,
      });
      console.error('Error deleting test run:', error);
    }
  };

  if (loading || permissionsLoading) {
    return <Loader fullScreen text="Loading test runs..." />;
  }

  const canCreateTestRun = hasPermissionCheck('testruns:create');
  const canDeleteTestRun = hasPermissionCheck('testruns:delete');
  const canReadTestRun = hasPermissionCheck('testruns:read');


  return (
    <>
      {/* Alert Messages */}
      <FloatingAlert alert={alert} onClose={() => setAlert(null)} />

      <TopBar
        breadcrumbs={[
          { label: 'Projects', href: '/projects' },
          { label: project?.name || 'Loading...', href: `/projects/${projectId}` },
          { label: 'Test Runs' },
        ]}
        actions={
          <div className="flex gap-2">
            {canReadTestRun && (
              <ButtonSecondary 
                onClick={() => setExportDialogOpen(true)} 
                className="cursor-pointer"
                title="Export test runs"
              >
                <Upload className="w-4 h-4 mr-2" />
                Export
              </ButtonSecondary>
            )}
            {canCreateTestRun && (
              <ButtonPrimary
                onClick={() => setCreateDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Test Run
              </ButtonPrimary>
            )}
          </div>
        }
      />

      {/* Page Header and Filters */}
      <div className="px-8 pt-4">
        <HeaderWithFilters
          header={
            <PageHeaderWithBadge
              badge={project?.key}
              title="Test Runs"
              description="Manage and track test execution progress"
            />
          }
          filters={
            <TestRunsFilterCard
              filters={filters}
              onSearchChange={(searchQuery) =>
                setFilters({ ...filters, searchQuery })
              }
              onStatusFilterChange={(statusFilter) =>
                setFilters({ ...filters, statusFilter })
              }
              onEnvironmentFilterChange={(environmentFilter) =>
                setFilters({ ...filters, environmentFilter })
              }
            />
          }
          className="mb-4"
        />
      </div>

      {/* Test Runs Grid */}
      <div className="max-w-7xl mx-auto px-8 pb-8">
        {filteredTestRuns.length === 0 ? (
          <TestRunsEmptyState
            hasTestRuns={testRuns.length > 0}
            onCreateClick={() => setCreateDialogOpen(true)}
            canCreate={canCreateTestRun}
          />
        ) : (
          <ResponsiveGrid
            columns={{ default: 1, md: 2, lg: 3 }}
            gap="sm"
          >
            {filteredTestRuns.map((testRun) => (
              <TestRunCard
                key={testRun.id}
                testRun={testRun}
                canDelete={canDeleteTestRun}
                onCardClick={() =>
                  router.push(`/projects/${projectId}/testruns/${testRun.id}`)
                }
                onViewDetails={() =>
                  router.push(`/projects/${projectId}/testruns/${testRun.id}`)
                }
                onDelete={() => {
                  setSelectedTestRun(testRun);
                  setDeleteDialogOpen(true);
                }}
              />
            ))}
          </ResponsiveGrid>
        )}

        {/* Create Dialog */}
        <CreateTestRunDialog
          projectId={projectId}
          triggerOpen={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onTestRunCreated={handleTestRunCreated}
        />

        {/* Delete Dialog */}
        <DeleteTestRunDialog
          testRun={selectedTestRun}
          triggerOpen={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteTestRun}
        />

        {/* Export Dialog */}
        <FileExportDialog
          open={exportDialogOpen}
          onOpenChange={setExportDialogOpen}
          title="Export Test Runs"
          description="Choose a format to export your test runs."
          exportOptions={{
            projectId,
            endpoint: `/api/projects/${projectId}/testruns/export`,
            filters: {
              status: filters.statusFilter !== 'all' ? filters.statusFilter : undefined,
              environment: filters.environmentFilter !== 'all' ? filters.environmentFilter : undefined,
            },
          }}
          itemName="test runs"
        />
      </div>
    </>
  );
}
