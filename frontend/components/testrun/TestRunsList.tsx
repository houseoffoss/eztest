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
import { Pagination } from '@/frontend/reusable-elements/pagination/Pagination';
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '@/lib/pagination-config';
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
    assignedToFilter: 'all',
  });

  const [alert, setAlert] = useState<FloatingAlertMessage | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGE_SIZE);

  useEffect(() => {
    fetchProject();
    fetchTestRuns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    if (project) {
      document.title = `Тест-раны - ${project.name} | EZTest`;
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

    // Assigned user filter
    if (filters.assignedToFilter !== 'all') {
      filtered = filtered.filter(
        (tr) => tr.assignedTo?.id === filters.assignedToFilter
      );
    }

    setFilteredTestRuns(filtered);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handleItemsPerPageChange = (n: number) => {
    setItemsPerPage(n);
    setCurrentPage(1);
  };

  const handleTestRunCreated = (newTestRun: TestRun) => {
    setAlert({
      type: 'success',
      title: 'Успешно',
      message: `Тест-ран "${newTestRun.name}" успешно создан`,
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
          title: 'Успешно',
          message: `Тест-ран "${deletedTestRunName}" успешно удален`,
        });
        setTimeout(() => setAlert(null), 5000);
        fetchTestRuns();
      } else {
        const data = await response.json();
        setAlert({
          type: 'error',
          title: 'Не удалось удалить тест-ран',
          message: data.error || 'Не удалось удалить тест-ран',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Произошла неизвестная ошибка';
      setAlert({
        type: 'error',
        title: 'Ошибка соединения',
        message: errorMessage,
      });
      console.error('Error deleting test run:', error);
    }
  };

  // Check permissions before early returns
  const canCreateTestRun = hasPermissionCheck('testruns:create');
  const canDeleteTestRun = hasPermissionCheck('testruns:delete');
  const canReadTestRun = hasPermissionCheck('testruns:read');

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
                Ручные / Авто
                <ChevronDown className="w-4 h-4" />
              </ButtonSecondary>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {/* Always show automation setup guide */}
              <DropdownMenuItem onClick={() => setAutomationWizardOpen(true)}>
                <BookOpen className="w-4 h-4" />
                Гайд по автоматизации
              </DropdownMenuItem>
              {/* Always show import/export options */}
              <DropdownMenuItem onClick={() => setUploadXMLDialogOpen(true)}>
                <FileCode className="w-4 h-4" />
                Загрузить TestNG XML
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setExportDialogOpen(true)}>
                <Upload className="w-4 h-4" />
                Экспорт тест-ранов
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      });
    }

    if (canCreateTestRun) {
      actions.push({
        type: 'action' as const,
        label: 'Новый тест-ран',
        icon: Plus,
        onClick: () => setCreateDialogOpen(true),
        variant: 'primary' as const,
        buttonName: 'Список тест-ранов - Новый тест-ран',
      });
    }

    actions.push({
      type: 'signout' as const,
      showConfirmation: true,
    });

    return actions;
  }, [canCreateTestRun, canReadTestRun]);

  if (loading || permissionsLoading) {
    return <Loader fullScreen text="Загрузка тест-ранов..." />;
  }

  const assignedToOptions = [
    { value: 'all', label: 'Все' },
    ...Array.from(
      new Map(
        testRuns
          .filter((run) => run.assignedTo?.id)
          .map((run) => [run.assignedTo!.id, run.assignedTo!.name])
      ).entries()
    ).map(([value, label]) => ({ value, label })),
  ];

  const totalPages = Math.max(1, Math.ceil(filteredTestRuns.length / itemsPerPage));
  const paginatedTestRuns = filteredTestRuns.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
              { label: 'Проекты', href: '/projects' },
              { label: project?.name || 'Загрузка...', href: `/projects/${projectId}` },
              { label: 'Тест-раны', href: `/projects/${projectId}/testruns` },
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
              title="Тест-раны"
              description="Управляйте и отслеживайте прогресс выполнения тестов"
            />
          }
          filters={
            <TestRunsFilterCard
              filters={filters}
              assignedToOptions={assignedToOptions}
              onSearchChange={(searchQuery) =>
                setFilters({ ...filters, searchQuery })
              }
              onStatusFilterChange={(statusFilter) =>
                setFilters({ ...filters, statusFilter })
              }
              onEnvironmentFilterChange={(environmentFilter) =>
                setFilters({ ...filters, environmentFilter })
              }
              onAssignedToFilterChange={(assignedToFilter) =>
                setFilters({ ...filters, assignedToFilter })
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
            {paginatedTestRuns.map((testRun) => (
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

        {/* Pagination */}
        {filteredTestRuns.length > 0 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredTestRuns.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              itemsPerPageOptions={PAGE_SIZE_OPTIONS}
              showItemsPerPage={true}
            />
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

        {/* Export Dialog */}
        <FileExportDialog
          open={exportDialogOpen}
          onOpenChange={setExportDialogOpen}
          title="Экспорт тест-ранов"
          description="Выберите формат для экспорта тест-ранов."
          exportOptions={{
            projectId,
            endpoint: `/api/projects/${projectId}/testruns/export`,
            filters: {
              status: filters.statusFilter !== 'all' ? filters.statusFilter : undefined,
              environment: filters.environmentFilter !== 'all' ? filters.environmentFilter : undefined,
              assignedToId: filters.assignedToFilter !== 'all' ? filters.assignedToFilter : undefined,
            },
          }}
          itemName="тест-раны"
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
