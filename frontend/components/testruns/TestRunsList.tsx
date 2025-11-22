'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/elements/button';
import { Breadcrumbs } from '@/components/design/Breadcrumbs';
import { Loader } from '@/elements/loader';
import { Plus } from 'lucide-react';
import { FloatingAlert, type FloatingAlertMessage } from '@/components/utils/FloatingAlert';
import { TestRunsHeader } from './subcomponents/TestRunsHeader';
import { TestRunsFilterCard } from './subcomponents/TestRunsFilterCard';
import { TestRunCard } from './subcomponents/TestRunCard';
import { TestRunsEmptyState } from './subcomponents/TestRunsEmptyState';
import { CreateTestRunDialog } from './subcomponents/CreateTestRunDialog';
import { DeleteTestRunDialog } from './subcomponents/DeleteTestRunDialog';
import { TestRun, Project, TestRunFormData, TestRunFilters } from './types';
import { usePermissions } from '@/hooks/usePermissions';

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
    return <Loader fullScreen text="Loading..." />;
  }

  const canCreateTestRun = hasPermissionCheck('testruns:create');
  const canDeleteTestRun = hasPermissionCheck('testruns:delete');

  return (
    <>
      {/* Alert Messages */}
      <FloatingAlert alert={alert} onClose={() => setAlert(null)} />

      {/* Top Bar */}
      <div className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/10">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <Breadcrumbs
              items={[
                { label: 'Projects', href: '/projects' },
                { label: project?.name || 'Loading...', href: `/projects/${projectId}` },
                { label: 'Test Runs' },
              ]}
            />
            <div className="flex items-center gap-3">
              {canCreateTestRun && (
                <Button
                  variant="glass-primary"
                  size="sm"
                  onClick={() => setCreateDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Test Run
                </Button>
              )}
              <form action="/api/auth/signout" method="POST" className="inline">
                <Button type="submit" variant="glass-destructive" size="sm" className="px-5">
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 pt-4">
        {/* Header and Filters Section */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-4">
          {/* Header */}
          <div className="flex-shrink-0">
            <TestRunsHeader
              project={project}
            />
          </div>

          {/* Filters */}
          <div className="w-full lg:w-auto flex-shrink-0">
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
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-4">
        {/* Test Runs List */}
        {filteredTestRuns.length === 0 ? (
          <TestRunsEmptyState
            hasTestRuns={testRuns.length > 0}
            onCreateClick={() => setCreateDialogOpen(true)}
            canCreate={canCreateTestRun}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          </div>
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
      </div>
    </>
  );
}
