'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/elements/badge';
import { Button } from '@/elements/button';
import { Plus } from 'lucide-react';
import { Breadcrumbs } from '@/components/design/Breadcrumbs';
import { Loader } from '@/elements/loader';
import { TestSuite, Project, TestSuiteFormData } from './types';
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
  const [formData, setFormData] = useState<TestSuiteFormData>({
    name: '',
    description: '',
    parentId: null,
  });

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
      const data = await response.json();
      if (data.data) {
        setProject(data.data);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };

  const fetchTestSuites = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}/testsuites`);
      const data = await response.json();
      if (data.data) {
        setTestSuites(data.data);
      }
    } catch (error) {
      console.error('Error fetching test suites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTestSuite = async () => {
    if (!formData.name.trim()) {
      alert('Suite name is required');
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/testsuites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || undefined,
          parentId: formData.parentId || undefined,
        }),
      });

      const data = await response.json();

      if (data.data) {
        setCreateDialogOpen(false);
        setFormData({ name: '', description: '', parentId: null });
        fetchTestSuites();
      } else {
        alert(data.error || 'Failed to create test suite');
      }
    } catch (error) {
      console.error('Error creating test suite:', error);
      alert('Failed to create test suite');
    }
  };

  const handleDeleteTestSuite = async () => {
    if (!selectedSuite) return;

    try {
      const response = await fetch(`/api/testsuites/${selectedSuite.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDeleteDialogOpen(false);
        setSelectedSuite(null);
        fetchTestSuites();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete test suite');
      }
    } catch (error) {
      console.error('Error deleting test suite:', error);
      alert('Failed to delete test suite');
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
    return <Loader fullScreen text="Loading..." />;
  }

  // Check if user can create, update, or delete test suites
  const canCreateTestSuite = hasPermissionCheck('testsuites:create');
  const canDeleteTestSuite = hasPermissionCheck('testsuites:delete');

  return (
    <>
      {/* Top Bar */}
      <div className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/10">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            {project && (
              <Breadcrumbs 
                items={[
                  { label: 'Projects', href: '/projects' },
                  { label: project.name, href: `/projects/${projectId}` },
                  { label: 'Test Suites' },
                ]}
              />
            )}
            <div className="flex items-center gap-3">
              {canCreateTestSuite && (
                <Button
                  variant="glass-primary"
                  size="sm"
                  onClick={() => setCreateDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Test Suite
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
      
      <div className="max-w-7xl mx-auto px-8 pt-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            {project && (
              <Badge variant="outline" className="font-mono border-primary/40 bg-primary/10 text-primary text-xs px-2.5 py-0.5">
                {project.key}
              </Badge>
            )}
            <h1 className="text-2xl font-bold text-white">Test Suites</h1>
          </div>
          <p className="text-gray-400">
            Organize test cases into hierarchical suites
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-400">
            {testSuites.length} suite{testSuites.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : testSuites.length === 0 ? (
          <EmptyTestSuiteState onCreateClick={() => setCreateDialogOpen(true)} canCreate={canCreateTestSuite} />
        ) : (
          <div className="space-y-2">
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
          </div>
        )}
      </div>

      {/* Dialogs */}
      <CreateTestSuiteDialog
        open={createDialogOpen}
        formData={formData}
        testSuites={testSuites}
        onOpenChange={setCreateDialogOpen}
        onFormChange={setFormData}
        onSubmit={handleCreateTestSuite}
      />

      <DeleteTestSuiteDialog
        open={deleteDialogOpen}
        suite={selectedSuite}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteTestSuite}
      />
    </>
  );
}
