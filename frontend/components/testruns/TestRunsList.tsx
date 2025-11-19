'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/elements/button';
import { Breadcrumbs } from '@/components/design/Breadcrumbs';
import { Plus } from 'lucide-react';
import { TestRunsHeader } from './subcomponents/TestRunsHeader';
import { TestRunsFilterCard } from './subcomponents/TestRunsFilterCard';
import { TestRunCard } from './subcomponents/TestRunCard';
import { TestRunsEmptyState } from './subcomponents/TestRunsEmptyState';
import { CreateTestRunDialog } from './subcomponents/CreateTestRunDialog';
import { DeleteTestRunDialog } from './subcomponents/DeleteTestRunDialog';
import { TestRun, Project, TestRunFormData, TestRunFilters } from './types';

interface TestRunsListProps {
  projectId: string;
}

export default function TestRunsList({ projectId }: TestRunsListProps) {
  const router = useRouter();

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

  const [formData, setFormData] = useState<TestRunFormData>({
    name: '',
    description: '',
    environment: '',
    assignedToId: '',
  });

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

  const handleCreateTestRun = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/testruns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.data) {
        setCreateDialogOpen(false);
        setFormData({
          name: '',
          description: '',
          environment: '',
          assignedToId: '',
        });
        fetchTestRuns();
      } else {
        alert(data.error || 'Failed to create test run');
      }
    } catch (error) {
      console.error('Error creating test run:', error);
      alert('Failed to create test run');
    }
  };

  const handleDeleteTestRun = async () => {
    if (!selectedTestRun) return;

    try {
      const response = await fetch(`/api/testruns/${selectedTestRun.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDeleteDialogOpen(false);
        setSelectedTestRun(null);
        fetchTestRuns();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete test run');
      }
    } catch (error) {
      console.error('Error deleting test run:', error);
      alert('Failed to delete test run');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-6 lg:p-8">
        <div className="text-center py-12">
          <p className="text-gray-400">Loading test runs...</p>
        </div>
      </div>
    );
  }

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
                { label: 'Test Runs' },
              ]}
            />
            <div className="flex items-center gap-3">
              <Button
                variant="glass-primary"
                size="sm"
                onClick={() => setCreateDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Test Run
              </Button>
              <form action="/api/auth/signout" method="POST">
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
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTestRuns.map((testRun) => (
              <TestRunCard
                key={testRun.id}
                testRun={testRun}
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
          open={createDialogOpen}
          formData={formData}
          onOpenChange={setCreateDialogOpen}
          onFormChange={(data) => setFormData({ ...formData, ...data })}
          onCreate={handleCreateTestRun}
        />

        {/* Delete Dialog */}
        <DeleteTestRunDialog
          open={deleteDialogOpen}
          testRunName={selectedTestRun?.name || ''}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteTestRun}
        />
      </div>
    </>
  );
}
