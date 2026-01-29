'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { ButtonSecondary } from '@/frontend/reusable-elements/buttons/ButtonSecondary';
import { Navbar } from '@/frontend/reusable-components/layout/Navbar';
import { Breadcrumbs } from '@/frontend/reusable-components/layout/Breadcrumbs';
import { Loader } from '@/frontend/reusable-elements/loaders/Loader';
import { Plus, Upload, FileCode } from 'lucide-react';
import { FloatingAlert, type FloatingAlertMessage } from '@/frontend/reusable-components/alerts/FloatingAlert';
import { PageHeaderWithBadge } from '@/frontend/reusable-components/layout/PageHeaderWithBadge';
import { HeaderWithFilters } from '@/frontend/reusable-components/layout/HeaderWithFilters';
import { ResponsiveGrid } from '@/frontend/reusable-components/layout/ResponsiveGrid';
import { TestRunsFilterCard } from './subcomponents/TestRunsFilterCard';
import { TestRunCard } from './subcomponents/TestRunCard';
import { TestRunsEmptyState } from './subcomponents/TestRunsEmptyState';
import { CreateTestRunDialog } from './subcomponents/CreateTestRunDialog';
import { DeleteTestRunDialog } from './subcomponents/DeleteTestRunDialog';
import { UploadTestNGXMLDialog } from './subcomponents/UploadTestNGXMLDialog';
import { AutomationSetupWizard } from './subcomponents/AutomationSetupWizard';
import { TestRun, Project, TestRunFilters } from './types';
import { usePermissions } from '@/hooks/usePermissions';
import { FileExportDialog } from '@/frontend/reusable-components/dialogs/FileExportDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/frontend/reusable-elements/dropdowns/DropdownMenu';
import { ChevronDown, BookOpen } from 'lucide-react';

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
  const [uploadXMLDialogOpen, setUploadXMLDialogOpen] = useState(false);
  const [automationWizardOpen, setAutomationWizardOpen] = useState(false);
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
      const response = await fetch(`/api/projects/${projectId}/testruns/${selectedTestRun.id}`, {
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

  // Check permissions before early returns
  const canCreateTestRun = hasPermissionCheck('testruns:create');
  const canDeleteTestRun = hasPermissionCheck('testruns:delete');
  const canReadTestRun = hasPermissionCheck('testruns:read');

  // Check if project has any automation test runs
  const hasAutomationTestRuns = useMemo(() => {
    return testRuns.some(tr => tr.executionType === 'AUTOMATION');
  }, [testRuns]);

  const navbarActions = useMemo(() => {
    const actions = [];

    // Only show import/export if user can create test runs (has permission to import)
    if (canReadTestRun && canCreateTestRun) {
      actions.push({
        type: 'custom' as const,
        custom: (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ButtonSecondary className="cursor-pointer flex items-center gap-2">
                Manual / Automation
                <ChevronDown className="w-4 h-4" />
              </ButtonSecondary>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {hasAutomationTestRuns && (
                // Show automation wizard for automation projects
                <DropdownMenuItem onClick={() => setAutomationWizardOpen(true)}>
                  <BookOpen className="w-4 h-4" />
                  Automation Setup Guide
                </DropdownMenuItem>
              )}
              {/* Always show import/export options */}
              <DropdownMenuItem onClick={() => setUploadXMLDialogOpen(true)}>
                <FileCode className="w-4 h-4" />
                Upload TestNG XML
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setExportDialogOpen(true)}>
                <Upload className="w-4 h-4" />
                Export Test Runs
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      });
    }

    if (canCreateTestRun) {
      actions.push({
        type: 'action' as const,
        label: 'New Test Run',
        icon: Plus,
        onClick: () => setCreateDialogOpen(true),
        variant: 'primary' as const,
        buttonName: 'Test Runs List - New Test Run',
      });
    }

    actions.push({
      type: 'signout' as const,
      showConfirmation: true,
    });

    return actions;
  }, [canCreateTestRun, canReadTestRun, hasAutomationTestRuns]);

  if (loading || permissionsLoading) {
    return <Loader fullScreen text="Loading test runs..." />;
  }

  return (
    <>
      {/* Alert Messages */}
      <FloatingAlert alert={alert} onClose={() => setAlert(null)} />

      <Navbar
        brandLabel={null}
        items={[]}
        breadcrumbs={
          <Breadcrumbs 
            items={[
              { label: 'Projects', href: '/projects' },
              { label: project?.name || 'Loading...', href: `/projects/${projectId}` },
              { label: 'Test Runs', href: `/projects/${projectId}/testruns` },
            ]}
          />
        }
        actions={navbarActions}
      />

      {/* Page Header and Filters */}
      <div className="px-8 pt-8">
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

        {/* Upload XML Dialog */}
        <UploadTestNGXMLDialog
          open={uploadXMLDialogOpen}
          onOpenChange={setUploadXMLDialogOpen}
          projectId={projectId}
          onImportComplete={() => {
            fetchTestRuns();
          }}
        />

        {/* Automation Setup Wizard */}
        <AutomationSetupWizard
          open={automationWizardOpen}
          onOpenChange={setAutomationWizardOpen}
          projectId={projectId}
          projectKey={project?.key}
        />
      </div>
    </>
  );
}
