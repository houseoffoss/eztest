'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge } from '@/elements/badge';
import { Button } from '@/elements/button';
import { Plus } from 'lucide-react';
import { Breadcrumbs } from '@/components/design/Breadcrumbs';
import { Pagination } from '@/elements/pagination';
import { TestCase, TestSuite, Project, TestCaseFormData } from './types';
import { TestCaseTable } from './subcomponents/TestCaseTable';
import { CreateTestCaseDialog } from './subcomponents/CreateTestCaseDialog';
import { DeleteTestCaseDialog } from './subcomponents/DeleteTestCaseDialog';
import { TestCaseFilters } from './subcomponents/TestCaseFilters';
import { EmptyTestCaseState } from './subcomponents/EmptyTestCaseState';

interface TestCaseListProps {
  projectId: string;
}

export default function TestCaseList({ projectId }: TestCaseListProps) {
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  // Removed unused state variables testPlans and testRuns
  const [filteredTestCases, setFilteredTestCases] = useState<TestCase[]>([]);
  const [paginatedTestCases, setPaginatedTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Form state
  const [formData, setFormData] = useState<TestCaseFormData>({
    title: '',
    description: '',
    expectedResult: '',
    priority: 'MEDIUM',
    status: 'DRAFT',
    estimatedTime: '',
    preconditions: '',
    postconditions: '',
    suiteId: null,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchProject();
    fetchTestCases();
    fetchTestSuites();
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
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedTestCases(filteredTestCases.slice(startIndex, endIndex));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  const totalPages = Math.ceil(filteredTestCases.length / itemsPerPage);

  const handleCreateTestCase = async () => {
    try {
      const estimatedTime = formData.estimatedTime
        ? parseInt(formData.estimatedTime)
        : undefined;

      const response = await fetch(`/api/projects/${projectId}/testcases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          estimatedTime,
        }),
      });

      const data = await response.json();

      if (data.data) {
        setCreateDialogOpen(false);
        setFormData({
          title: '',
          description: '',
          expectedResult: '',
          priority: 'MEDIUM',
          status: 'DRAFT',
          estimatedTime: '',
          preconditions: '',
          postconditions: '',
          suiteId: null,
        });
        fetchTestCases();
      } else {
        alert(data.error || 'Failed to create test case');
      }
    } catch (error) {
      console.error('Error creating test case:', error);
      alert('Failed to create test case');
    }
  };

  const handleDeleteTestCase = async () => {
    if (!selectedTestCase) return;

    try {
      const response = await fetch(`/api/testcases/${selectedTestCase.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDeleteDialogOpen(false);
        setSelectedTestCase(null);
        fetchTestCases();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete test case');
      }
    } catch (error) {
      console.error('Error deleting test case:', error);
      alert('Failed to delete test case');
    }
  };

  const handleCardClick = (testCaseId: string) => {
    router.push(`/projects/${projectId}/testcases/${testCaseId}`);
  };

  const handleDeleteClick = (testCase: TestCase) => {
    setSelectedTestCase(testCase);
    setDeleteDialogOpen(true);
  };

  return (
    <>
      {/* Top Bar */}
      <div className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/10">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <Breadcrumbs 
              items={[
                { label: 'Projects', href: '/projects' },
                { label: project?.name || 'Loading...', href: `/projects/${projectId}` },
                { label: 'Test Cases' }
              ]}
            />
            <div className="flex items-center gap-3">
              <Button variant="glass-primary" size="sm" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Test Case
              </Button>
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
          <div className="text-center py-12">
            <p className="text-gray-400">Loading test cases...</p>
          </div>
        ) : filteredTestCases.length === 0 ? (
          <EmptyTestCaseState
            hasFilters={testCases.length > 0}
            onCreateClick={() => setCreateDialogOpen(true)}
          />
        ) : (
          <>
            <TestCaseTable
              testCases={paginatedTestCases}
              groupedByTestSuite={true}
              onDelete={handleDeleteClick}
              onClick={handleCardClick}
            />

            {/* Pagination */}
            {filteredTestCases.length > 0 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
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

        {/* Create Dialog */}
        <CreateTestCaseDialog
          open={createDialogOpen}
          formData={formData}
          testSuites={testSuites}
          onOpenChange={setCreateDialogOpen}
          onFormChange={setFormData}
          onSubmit={handleCreateTestCase}
        />

        {/* Delete Dialog */}
        <DeleteTestCaseDialog
          open={deleteDialogOpen}
          testCase={selectedTestCase}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteTestCase}
        />
      </div>
    </>
  );
}
