'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Plus, FolderPlus, Import, Upload } from 'lucide-react';
import { TopBar } from '@/frontend/reusable-components/layout/TopBar';
import { PageHeaderWithBadge } from '@/frontend/reusable-components/layout/PageHeaderWithBadge';
import { ActionButtonGroup } from '@/frontend/reusable-components/layout/ActionButtonGroup';
import { HeaderWithFilters } from '@/frontend/reusable-components/layout/HeaderWithFilters';
import { Loader } from '@/frontend/reusable-elements/loaders/Loader';
import { Pagination } from '@/frontend/reusable-elements/pagination/Pagination';
import { ButtonSecondary } from '@/frontend/reusable-elements/buttons/ButtonSecondary';
import { FloatingAlert, type FloatingAlertMessage } from '@/frontend/reusable-components/alerts/FloatingAlert';
import { TestCase, TestSuite, Project, Module } from './types';
import { TestCaseTable } from './subcomponents/TestCaseTable';
import { CreateTestCaseDialog } from './subcomponents/CreateTestCaseDialog';
import { CreateModuleDialog } from './subcomponents/CreateModuleDialog';
import { DeleteTestCaseDialog } from './subcomponents/DeleteTestCaseDialog';
import { TestCaseFilters } from './subcomponents/TestCaseFilters';
import { EmptyTestCaseState } from './subcomponents/EmptyTestCaseState';
import { usePermissions } from '@/hooks/usePermissions';
import { FileImportDialog } from '@/frontend/reusable-components/dialogs/FileImportDialog';
import { FileExportDialog } from '@/frontend/reusable-components/dialogs/FileExportDialog';

interface TestCaseListProps {
  projectId: string;
}

export default function TestCaseList({ projectId }: TestCaseListProps) {
  const router = useRouter();
  const { hasPermission: hasPermissionCheck, isLoading: permissionsLoading, role } = usePermissions();

  const [project, setProject] = useState<Project | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createModuleDialogOpen, setCreateModuleDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPagesCount, setTotalPagesCount] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isPaginationChange, setIsPaginationChange] = useState(false);

  // Alert state
  const [alert, setAlert] = useState<FloatingAlertMessage | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchProject();
    fetchTestSuites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Fetch test cases with backend pagination when filters or page changes
  useEffect(() => {
    fetchTestCases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, currentPage, itemsPerPage, searchQuery, priorityFilter, statusFilter]);

  useEffect(() => {
    if (project) {
      document.title = `Test Cases - ${project.name} | EZTest`;
    }
  }, [project]);

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

  const fetchTestCases = async () => {
    try {
      // Show loader on initial load or pagination changes, but not on search/filter changes
      if (testCases.length === 0 && modules.length === 0) {
        setLoading(true);
      } else if (isPaginationChange) {
        setLoading(true);
      }
      
      // Build query parameters for pagination and filtering
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        groupBy: 'module',
      });
      
      if (searchQuery) params.append('search', searchQuery);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await fetch(`/api/projects/${projectId}/testcases?${params}`);
      const data = await response.json();
      
      if (data.data) {
        setTestCases(data.data);
      }
      
      if (data.modules) {
        setModules(data.modules);
      }
      
      if (data.pagination) {
        setTotalPagesCount(data.pagination.totalPages);
        setTotalItems(data.pagination.totalItems);
      }
    } catch (error) {
      console.error('Error fetching test cases:', error);
    } finally {
      setLoading(false);
      setIsPaginationChange(false);
    }
  };

  const fetchTestSuites = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/testsuites`);
      const data = await response.json();
      if (data.data) {
        setTestSuites(data.data);
      }
    } catch (error) {
      console.error('Error fetching test suites:', error);
    }
  };

  const handlePageChange = (page: number) => {
    setIsPaginationChange(true);
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setIsPaginationChange(true);
    setItemsPerPage(items);
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  // Show modules that have test cases in the current page OR are truly empty (on last page only)
  const modulesForTable = testCases.length === 0 
    ? modules 
    : modules.filter(module => {
        // Include if module has test cases in current page
        const hasTestCasesInPage = testCases.some(tc => tc.moduleId === module.id);
        if (hasTestCasesInPage) return true;
        
        // Include if module is truly empty AND we're on the last page
        const isTrulyEmpty = module._count?.testCases === 0;
        const isLastPage = currentPage === totalPagesCount;
        return isTrulyEmpty && isLastPage;
      });

  const handleTestCaseCreated = (newTestCase: TestCase) => {
    setAlert({
      type: 'success',
      title: 'Success',
      message: `Test case "${newTestCase.title}" created successfully`,
    });
    setTimeout(() => setAlert(null), 5000);
    setCurrentPage(1); // Navigate to page 1 to see the newly created test case
    fetchTestCases();
  };

  const handleModuleCreated = (newModule: Module) => {
    setAlert({
      type: 'success',
      title: 'Success',
      message: `Module "${newModule.name}" created successfully`,
    });
    setTimeout(() => setAlert(null), 5000);
    setCreateModuleDialogOpen(false);
    setCurrentPage(1); // Navigate to page 1 to see the newly created module
    fetchTestCases(); // Refresh test cases and modules (modules are now fetched with pagination)
  };

  const handleDeleteTestCase = async () => {
    if (!selectedTestCase) return;

    try {
      const response = await fetch(`/api/testcases/${selectedTestCase.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const deletedTestCaseName = selectedTestCase.title;
        setDeleteDialogOpen(false);
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
          title: 'Failed to Delete Test Case',
          message: data.error || 'Failed to delete test case',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setAlert({
        type: 'error',
        title: 'Connection Error',
        message: errorMessage,
      });
      console.error('Error deleting test case:', error);
    }
  };

  const handleCardClick = (testCaseId: string) => {
    router.push(`/projects/${projectId}/testcases/${testCaseId}`);
  };

  const handleDeleteClick = (testCase: TestCase) => {
    setSelectedTestCase(testCase);
    setDeleteDialogOpen(true);
  };


  if (loading || permissionsLoading) {
    return <Loader fullScreen text="Loading test cases..." />;
  }

  // Check permissions
  const canCreateTestCase = hasPermissionCheck('testcases:create');
  const canDeleteTestCase = hasPermissionCheck('testcases:delete');
  const canImport = ['ADMIN', 'PROJECT_MANAGER', 'TESTER'].includes(role);

  return (
    <>
      {/* Alert Messages */}
      <FloatingAlert alert={alert} onClose={() => setAlert(null)} />

      <TopBar 
        breadcrumbs={[
          { label: 'Projects', href: '/projects' },
          { label: project?.name || 'Loading...', href: `/projects/${projectId}` },
          { label: 'Test Cases' }
        ]}
        actions={
          canCreateTestCase ? (
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {canImport && (
                <>
                  <ButtonSecondary onClick={() => setImportDialogOpen(true)} className="cursor-pointer flex-shrink-0">
                    <Import className="w-4 h-4 mr-2" />
                    Import
                  </ButtonSecondary>
                  <ButtonSecondary 
                    onClick={() => setExportDialogOpen(true)} 
                    className="cursor-pointer flex-shrink-0"
                    title="Export test cases"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Export
                  </ButtonSecondary>
                </>
              )}
              <ActionButtonGroup
                buttons={[
                  {
                    label: 'New Module',
                    icon: FolderPlus,
                    onClick: () => setCreateModuleDialogOpen(true),
                    variant: 'secondary',
                    buttonName: 'Test Case List - New Module',
                  },
                  {
                    label: 'New Test Case',
                    icon: Plus,
                    onClick: () => setCreateDialogOpen(true),
                    variant: 'primary',
                    buttonName: 'Test Case List - New Test Case',
                  },
                ]}
              />
            </div>
          ) : undefined
        }
      />
      
      <div className="px-4 sm:px-6 lg:px-8 pt-4 w-full min-w-0 overflow-hidden">
        {/* Header and Filters Section */}
        <HeaderWithFilters
          header={
            <PageHeaderWithBadge
              badge={project?.key}
              title="Test Cases"
              description={project?.name}
            />
          }
          filters={
            mounted ? (
              <TestCaseFilters
                searchQuery={searchQuery}
                priorityFilter={priorityFilter}
                statusFilter={statusFilter}
                onSearchChange={setSearchQuery}
                onPriorityChange={setPriorityFilter}
                onStatusChange={setStatusFilter}
              />
            ) : null
          }
        />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-4">
        {/* Test Cases List */}
        {loading ? (
          <Loader fullScreen={false} text="Loading test cases..." />
        ) : testCases.length === 0 && totalItems === 0 ? (
          <EmptyTestCaseState
            hasFilters={false}
            onCreateClick={() => setCreateDialogOpen(true)}
            canCreate={canCreateTestCase}
          />
        ) : (
          <>
            <TestCaseTable
              testCases={testCases}
              groupedByModule={true}
              modules={modulesForTable}
              onDelete={handleDeleteClick}
              onClick={handleCardClick}
              canDelete={canDeleteTestCase}
              projectId={projectId}
              enableModuleLink={true}
            />

            {/* Pagination */}
            {totalItems > 0 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPagesCount}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  itemsPerPageOptions={[10, 20, 50, 100]}
                  showItemsPerPage={true}
                />
              </div>
            )}
          </>
        )}

        {/* Create Test Case Dialog */}
        <CreateTestCaseDialog
          projectId={projectId}
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onTestCaseCreated={handleTestCaseCreated}
        />

        {/* Create Module Dialog */}
        <CreateModuleDialog
          projectId={projectId}
          triggerOpen={createModuleDialogOpen}
          onOpenChange={setCreateModuleDialogOpen}
          onModuleCreated={handleModuleCreated}
        />

        {/* Delete Dialog */}
        <DeleteTestCaseDialog
          testCase={selectedTestCase}
          triggerOpen={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteTestCase}
        />

        {/* Import Dialog */}
        <FileImportDialog
          open={importDialogOpen}
          onOpenChange={setImportDialogOpen}
          title="Import Test Cases"
          description="Upload a CSV or Excel file to import multiple test cases at once."
          importEndpoint={`/api/projects/${projectId}/testcases/import`}
          templateEndpoint={`/api/projects/${projectId}/testcases/import/template`}
          itemName="test cases"
          onImportComplete={() => {
            fetchTestCases();
            setImportDialogOpen(false);
          }}
        />

        {/* Export Dialog */}
        <FileExportDialog
          open={exportDialogOpen}
          onOpenChange={setExportDialogOpen}
          title="Export Test Cases"
          description="Choose a format to export your test cases."
          exportOptions={{
            projectId,
            endpoint: `/api/projects/${projectId}/testcases/export`,
            filters: {
              moduleId: undefined,
              suiteId: undefined,
              status: statusFilter !== 'all' ? statusFilter : undefined,
              priority: priorityFilter !== 'all' ? priorityFilter : undefined,
            },
          }}
          itemName="test cases"
        />
      </div>
    </>
  );
}
