'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge } from '@/elements/badge';
import { ButtonPrimary } from '@/elements/button-primary';
import { ButtonSecondary } from '@/elements/button-secondary';
import { Plus, FolderPlus } from 'lucide-react';
import { TopBar } from '@/components/design';
import { Loader } from '@/elements/loader';
import { Pagination } from '@/elements/pagination';
import { FloatingAlert, type FloatingAlertMessage } from '@/components/design/FloatingAlert';
import { TestCase, TestSuite, Project, Module } from './types';
import { TestCaseTable } from '@/components/common/tables/TestCaseTable';
import { CreateTestCaseDialog } from './subcomponents/CreateTestCaseDialog';
import { CreateModuleDialog } from './subcomponents/CreateModuleDialog';
import { DeleteTestCaseDialog } from './subcomponents/DeleteTestCaseDialog';
import { TestCaseFilters } from './subcomponents/TestCaseFilters';
import { EmptyTestCaseState } from './subcomponents/EmptyTestCaseState';
import { usePermissions } from '@/hooks/usePermissions';

interface TestCaseListProps {
  projectId: string;
}

export default function TestCaseList({ projectId }: TestCaseListProps) {
  const router = useRouter();
  const { hasPermission: hasPermissionCheck, isLoading: permissionsLoading } = usePermissions();

  const [project, setProject] = useState<Project | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  // Removed unused state variables testPlans and testRuns
  const [filteredTestCases, setFilteredTestCases] = useState<TestCase[]>([]);
  const [paginatedTestCases, setPaginatedTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createModuleDialogOpen, setCreateModuleDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPagesCount, setTotalPagesCount] = useState(1);

  // Alert state
  const [alert, setAlert] = useState<FloatingAlertMessage | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchProject();
    fetchTestCases();
    fetchTestSuites();
    fetchModules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    if (project) {
      document.title = `Test Cases - ${project.name} | EZTest`;
    }
  }, [project]);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testCases, searchQuery, priorityFilter, statusFilter]);

  useEffect(() => {
    applyPagination();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredTestCases, currentPage, itemsPerPage]);

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
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}/testcases`);
      const data = await response.json();
      if (data.data) {
        setTestCases(data.data);
      }
    } catch (error) {
      console.error('Error fetching test cases:', error);
    } finally {
      setLoading(false);
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

  const fetchModules = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/modules`);
      const data = await response.json();
      if (data.data) {
        setModules(data.data);
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...testCases];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (tc) =>
          tc.title.toLowerCase().includes(query) ||
          tc.description?.toLowerCase().includes(query)
      );
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter((tc) => tc.priority === priorityFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((tc) => tc.status === statusFilter);
    }

    setFilteredTestCases(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const applyPagination = () => {
    // Group by module first
    const grouped = filteredTestCases.reduce((acc, tc) => {
      const moduleId = tc.moduleId || 'no-module';
      if (!acc[moduleId]) {
        acc[moduleId] = [];
      }
      acc[moduleId].push(tc);
      return acc;
    }, {} as Record<string, TestCase[]>);

    // Convert to array of module groups
    const moduleGroups = Object.values(grouped);
    
    // Build pages by complete module groups
    const pages: TestCase[][] = [];
    let currentPageItems: TestCase[] = [];
    
    for (const group of moduleGroups) {
      // If adding this module would exceed page size and we already have items
      if (currentPageItems.length > 0 && currentPageItems.length + group.length > itemsPerPage) {
        // Save current page and start a new one
        pages.push(currentPageItems);
        currentPageItems = [];
      }
      
      // Add entire module group to current page
      currentPageItems = currentPageItems.concat(group);
      
      // If this single module fills or exceeds the page size, create a page for it
      if (currentPageItems.length >= itemsPerPage) {
        pages.push(currentPageItems);
        currentPageItems = [];
      }
    }
    
    // Add any remaining test cases as the last page
    if (currentPageItems.length > 0) {
      pages.push(currentPageItems);
    }
    
    // Store total pages count
    setTotalPagesCount(pages.length);
    
    // Get the appropriate page (currentPage state is 1-indexed)
    const pageIndex = currentPage - 1;
    setPaginatedTestCases(pages[pageIndex] || []);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  // Get modules that have test cases in the current page
  const modulesInCurrentPage = modules.filter(module => 
    paginatedTestCases.some(tc => tc.moduleId === module.id)
  );

  const handleTestCaseCreated = (newTestCase: TestCase) => {
    setAlert({
      type: 'success',
      title: 'Success',
      message: `Test case "${newTestCase.title}" created successfully`,
    });
    setTimeout(() => setAlert(null), 5000);
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
    fetchModules(); // Refresh modules list
    fetchTestCases(); // Refresh test cases to show new module grouping
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
            <div className="flex gap-2">
              <ButtonSecondary onClick={() => setCreateModuleDialogOpen(true)} className="cursor-pointer">
                <FolderPlus className="w-4 h-4 mr-2" />
                New Module
              </ButtonSecondary>
              <ButtonPrimary onClick={() => setCreateDialogOpen(true)} className="cursor-pointer">
                <Plus className="w-4 h-4 mr-2" />
                New Test Case
              </ButtonPrimary>
            </div>
          ) : undefined
        }
      />
      
      <div className="px-8 pt-4">
        {/* Header and Filters Section */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-4">
          {/* Header */}
          <div className="shrink-0">
            <div className="flex items-center gap-3 mb-2">
              {project && (
                <Badge variant="outline" className="font-mono border-primary/40 bg-primary/10 text-primary text-xs px-2.5 py-0.5">
                  {project.key}
                </Badge>
              )}
              <h1 className="text-2xl font-bold text-white">Test Cases</h1>
            </div>
            {project && (
              <p className="text-white/70 text-sm mb-2">{project.name}</p>
            )}
          </div>

          {/* Filters */}
          {mounted && (
            <div className="w-full lg:w-auto shrink-0">
              <TestCaseFilters
                searchQuery={searchQuery}
                priorityFilter={priorityFilter}
                statusFilter={statusFilter}
                onSearchChange={setSearchQuery}
                onPriorityChange={setPriorityFilter}
                onStatusChange={setStatusFilter}
              />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-4">
        {/* Test Cases List */}
        {loading ? (
          <Loader fullScreen={false} text="Loading test cases..." />
        ) : filteredTestCases.length === 0 ? (
          <EmptyTestCaseState
            hasFilters={testCases.length > 0}
            onCreateClick={() => setCreateDialogOpen(true)}
            canCreate={canCreateTestCase}
          />
        ) : (
          <>
            <TestCaseTable
              testCases={paginatedTestCases}
              groupedByModule={true}
              modules={modulesInCurrentPage}
              onDelete={handleDeleteClick}
              onClick={handleCardClick}
              canDelete={canDeleteTestCase}
              projectId={projectId}
              enableModuleLink={true}
            />

            {/* Pagination */}
            {filteredTestCases.length > 0 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPagesCount}
                  totalItems={filteredTestCases.length}
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
      </div>
    </>
  );
}
