'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Plus, FolderPlus, Import, Upload, Trash2 } from 'lucide-react';
import { TopBar } from '@/frontend/reusable-components/layout/TopBar';
import { PageHeaderWithBadge } from '@/frontend/reusable-components/layout/PageHeaderWithBadge';
import { ActionButtonGroup } from '@/frontend/reusable-components/layout/ActionButtonGroup';
import { HeaderWithFilters } from '@/frontend/reusable-components/layout/HeaderWithFilters';
import { Loader } from '@/frontend/reusable-elements/loaders/Loader';
import { Pagination } from '@/frontend/reusable-elements/pagination/Pagination';
import { ButtonSecondary } from '@/frontend/reusable-elements/buttons/ButtonSecondary';
import { ButtonDestructive } from '@/frontend/reusable-elements/buttons/ButtonDestructive';
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
import { BaseConfirmDialog } from '@/frontend/reusable-components/dialogs/BaseConfirmDialog';

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
  const [selectedTestCaseIds, setSelectedTestCaseIds] = useState<Set<string>>(new Set());
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [domainFilter, setDomainFilter] = useState<string>('');
  const [functionNameFilter, setFunctionNameFilter] = useState<string>('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
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
  }, [projectId, currentPage, itemsPerPage, searchQuery, statusFilter, domainFilter, functionNameFilter]);

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
      });
      
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (domainFilter) params.append('domain', domainFilter);
      if (functionNameFilter) params.append('functionName', functionNameFilter);
      
      const response = await fetch(`/api/projects/${projectId}/testcases?${params}`);
      const data = await response.json();
      
      if (data.data) {
        setTestCases(data.data);
        setSelectedTestCaseIds(new Set());
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
          title: 'テストケースの削除に失敗しました',
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

  const handleSelectTestCase = (testCaseId: string) => {
    setSelectedTestCaseIds((prev) => {
      const next = new Set(prev);
      if (next.has(testCaseId)) {
        next.delete(testCaseId);
      } else {
        next.add(testCaseId);
      }
      return next;
    });
  };

  const handleSelectAllTestCases = (selected: boolean) => {
    if (!selected) {
      setSelectedTestCaseIds(new Set());
      return;
    }
    setSelectedTestCaseIds(new Set(testCases.map((testCase) => testCase.id)));
  };

  const handleBulkDeleteTestCases = async () => {
    if (selectedTestCaseIds.size === 0) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/testcases/bulk-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testCaseIds: Array.from(selectedTestCaseIds) }),
      });

      if (response.ok) {
        const deletedCount = selectedTestCaseIds.size;
        setBulkDeleteDialogOpen(false);
        setSelectedTestCaseIds(new Set());
        setAlert({
          type: 'success',
          title: 'Success',
          message: `${deletedCount}件のテストケースを削除しました`,
        });
        setTimeout(() => setAlert(null), 5000);
        fetchTestCases();
      } else {
        const data = await response.json();
        setAlert({
          type: 'error',
          title: 'テストケースの一括削除に失敗しました',
          message: data.error || 'Failed to bulk delete test cases',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setAlert({
        type: 'error',
        title: 'Connection Error',
        message: errorMessage,
      });
      console.error('Error bulk deleting test cases:', error);
    }
  };


  if (loading || permissionsLoading) {
    return <Loader fullScreen text="テストケースを読み込み中..." />;
  }

  // Check permissions
  const canCreateTestCase = hasPermissionCheck('testcases:create');
  const canDeleteTestCase = hasPermissionCheck('testcases:delete');
  const canImport = ['ADMIN', 'PROJECT_MANAGER', 'TESTER'].includes(role);
  const allSelectedTestCases = testCases.length > 0 && testCases.every((testCase) => selectedTestCaseIds.has(testCase.id));

  return (
    <>
      {/* Alert Messages */}
      <FloatingAlert alert={alert} onClose={() => setAlert(null)} />

      <TopBar 
        breadcrumbs={[
          { label: 'プロジェクト', href: '/projects' },
          { label: project?.name || '読み込み中...', href: `/projects/${projectId}` },
          { label: 'テストケース' }
        ]}
        actions={
          canCreateTestCase ? (
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {canImport && (
                <>
                  <ButtonSecondary onClick={() => setImportDialogOpen(true)} className="cursor-pointer flex-shrink-0">
                    <Import className="w-4 h-4 mr-2" />
                    インポート
                  </ButtonSecondary>
                  <ButtonSecondary 
                    onClick={() => setExportDialogOpen(true)} 
                    className="cursor-pointer flex-shrink-0"
                    title="テストケースをエクスポート"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    エクスポート
                  </ButtonSecondary>
                </>
              )}
              <ActionButtonGroup
                buttons={[
                  {
                    label: '新規モジュール',
                    icon: FolderPlus,
                    onClick: () => setCreateModuleDialogOpen(true),
                    variant: 'secondary',
                    buttonName: 'Test Case List - New Module',
                  },
                  {
                    label: '新規テストケース',
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
              title="テストケース"
              description={project?.name}
            />
          }
          filters={
            mounted ? (
              <TestCaseFilters
                searchQuery={searchQuery}
                statusFilter={statusFilter}
                domainFilter={domainFilter}
                functionNameFilter={functionNameFilter}
                onSearchChange={setSearchQuery}
                onStatusChange={setStatusFilter}
                onDomainChange={setDomainFilter}
                onFunctionNameChange={setFunctionNameFilter}
              />
            ) : null
          }
        />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-4">
        {/* Test Cases List */}
        {loading ? (
          <Loader fullScreen={false} text="テストケースを読み込み中..." />
        ) : testCases.length === 0 && totalItems === 0 ? (
          <EmptyTestCaseState
            hasFilters={false}
            onCreateClick={() => setCreateDialogOpen(true)}
            canCreate={canCreateTestCase}
          />
        ) : (
          <>
            {canDeleteTestCase && (
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-sm text-white/70">
                  一括選択: {allSelectedTestCases ? 'ON' : 'OFF'}（選択中 {selectedTestCaseIds.size} 件）
                </div>
                <ButtonDestructive
                  variant="outline"
                  onClick={() => setBulkDeleteDialogOpen(true)}
                  disabled={selectedTestCaseIds.size === 0}
                  buttonName="Test Case List - Bulk Delete"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  選択中を削除
                </ButtonDestructive>
              </div>
            )}

            <TestCaseTable
              testCases={testCases}
              groupedByModule={false}
              modules={[]}
              onDelete={handleDeleteClick}
              onClick={handleCardClick}
              canDelete={canDeleteTestCase}
              projectId={projectId}
              enableModuleLink={true}
              selectedTestCases={selectedTestCaseIds}
              onSelectTestCase={handleSelectTestCase}
              onSelectAll={handleSelectAllTestCases}
              showSelection={canDeleteTestCase}
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

        {/* Bulk Delete Dialog */}
        <BaseConfirmDialog
          title="テストケースを一括削除"
          description={`選択した ${selectedTestCaseIds.size} 件のテストケースを削除します。この操作は元に戻せません。`}
          submitLabel="削除"
          cancelLabel="キャンセル"
          triggerOpen={bulkDeleteDialogOpen}
          onOpenChange={setBulkDeleteDialogOpen}
          onSubmit={handleBulkDeleteTestCases}
          destructive={true}
          dialogName="Bulk Delete Test Cases Dialog"
          submitButtonName="Bulk Delete Test Cases Dialog - Delete"
          cancelButtonName="Bulk Delete Test Cases Dialog - Cancel"
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
          showUpdateExistingOption={true}
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
            },
          }}
          itemName="test cases"
        />
      </div>
    </>
  );
}
