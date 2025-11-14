'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ChevronRight,
  Folder,
  FolderOpen,
  MoreVertical,
  Plus,
  TestTube2,
  Trash2,
} from 'lucide-react';
import { Navbar } from '@/components/design/Navbar';
import { Breadcrumbs } from '@/components/design/Breadcrumbs';

interface TestSuite {
  id: string;
  name: string;
  description?: string;
  order: number;
  parentId?: string;
  parent?: {
    id: string;
    name: string;
  };
  children?: TestSuite[];
  _count: {
    testCases: number;
  };
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  key: string;
}

export default function TestSuitesPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSuite, setSelectedSuite] = useState<TestSuite | null>(null);
  const [expandedSuites, setExpandedSuites] = useState<Set<string>>(new Set());

  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    parentId: string | null;
  }>({
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
          description: formData.description,
          parentId: formData.parentId || undefined,
        }),
      });

      const data = await response.json();

      if (data.data) {
        setCreateDialogOpen(false);
        setFormData({ name: '', description: '', parentId: '' });
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

  const renderSuiteTree = (suites: TestSuite[]) => {
    const rootSuites = suites.filter(s => !s.parentId);
    
    return rootSuites.map((suite) => (
      <div key={suite.id} className="mb-2">
        <Card
          variant="glass"
          className="hover:border-primary/50 transition-colors"
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {/* Expand/Collapse Icon */}
              {suite.children && suite.children.length > 0 && (
                <button
                  onClick={() => toggleExpanded(suite.id)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <ChevronRight
                    className={`w-5 h-5 transition-transform ${
                      expandedSuites.has(suite.id) ? 'rotate-90' : ''
                    }`}
                  />
                </button>
              )}

              {/* Folder Icon */}
              <div className="text-primary">
                {expandedSuites.has(suite.id) ? (
                  <FolderOpen className="w-5 h-5" />
                ) : (
                  <Folder className="w-5 h-5" />
                )}
              </div>

              {/* Suite Info */}
              <div className="flex-1 min-w-0">
                <h3
                  className="text-white font-medium cursor-pointer hover:text-primary transition-colors"
                  onClick={() => router.push(`/projects/${projectId}/testsuites/${suite.id}`)}
                >
                  {suite.name}
                </h3>
                {suite.description && (
                  <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                    {suite.description}
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <TestTube2 className="w-4 h-4" />
                  <span>{suite._count.testCases}</span>
                </div>
                {suite.children && suite.children.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Folder className="w-4 h-4" />
                    <span>{suite.children.length}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent variant="glass" align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/projects/${projectId}/testsuites/${suite.id}`);
                    }}
                  >
                    <FolderOpen className="w-4 h-4 mr-2" />
                    View Suite
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSuite(suite);
                      setDeleteDialogOpen(true);
                    }}
                    className="text-red-400"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {/* Child Suites */}
        {expandedSuites.has(suite.id) && suite.children && suite.children.length > 0 && (
          <div className="ml-8 mt-2">
            {suite.children.map((child) => (
              <div key={child.id} className="mb-2">
                <Card
                  variant="glass"
                  className="hover:border-primary/50 transition-colors"
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="text-primary">
                        <Folder className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4
                          className="text-sm text-white font-medium cursor-pointer hover:text-primary transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/projects/${projectId}/testsuites/${child.id}`);
                          }}
                        >
                          {child.name}
                        </h4>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <TestTube2 className="w-3 h-3" />
                        <span>{child._count.testCases}</span>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
                            <MoreVertical className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent variant="glass" align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/projects/${projectId}/testsuites/${child.id}`);
                            }}
                          >
                            <FolderOpen className="w-4 h-4 mr-2" />
                            View Suite
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSuite(child);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-red-400"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-[#0a1628]">
      <Navbar
        items={[
          { label: 'Overview', href: `/projects/${projectId}` },
          { label: 'Test Suites', href: `/projects/${projectId}/testsuites` },
          { label: 'Test Cases', href: `/projects/${projectId}/testcases` },
          { label: 'Test Runs', href: `/projects/${projectId}/testruns` },
          { label: 'Members', href: `/projects/${projectId}/members` },
          { label: 'Settings', href: `/projects/${projectId}/settings` },
        ]}
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: 'Projects', href: '/projects' },
              { label: project?.name || 'Loading...', href: `/projects/${projectId}` },
              { label: 'Test Suites' },
            ]}
          />
        }
        actions={
          <form action="/api/auth/signout" method="POST">
            <Button type="submit" variant="glass-destructive" size="sm" className="px-5">
              Sign Out
            </Button>
          </form>
        }
      />

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
          {project && (
            <p className="text-white/70 text-sm mb-2">{project.name}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div></div>
          
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="glass-primary">
                <Plus className="w-4 h-4 mr-2" />
                New Test Suite
              </Button>
            </DialogTrigger>
            <DialogContent variant="glass" className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Test Suite</DialogTitle>
                <DialogDescription>
                  Organize your test cases into suites
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    variant="glass"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter suite name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    variant="glass"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Enter suite description"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parentId">Parent Suite (Optional)</Label>
                  <Select
                    value={formData.parentId || "__none__"}
                    onValueChange={(value) =>
                      setFormData({ ...formData, parentId: value === "__none__" ? null : value })
                    }
                  >
                    <SelectTrigger variant="glass">
                      <SelectValue placeholder="Select parent suite" />
                    </SelectTrigger>
                    <SelectContent variant="glass">
                      <SelectItem value="__none__">None (Root Level)</SelectItem>
                      {testSuites.filter(s => !s.parentId).map((suite) => (
                        <SelectItem key={suite.id} value={suite.id}>
                          {suite.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="glass"
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="glass-primary" onClick={handleCreateTestSuite}>
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Loading test suites...</p>
          </div>
        ) : testSuites.length === 0 ? (
          <Card variant="glass">
            <CardContent className="py-12 text-center">
              <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                No test suites found
              </h3>
              <p className="text-gray-400 mb-4">
                Get started by creating your first test suite to organize test cases
              </p>
              <Button variant="glass-primary" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Test Suite
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {renderSuiteTree(testSuites)}
          </div>
        )}

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent variant="glass">
            <DialogHeader>
              <DialogTitle>Delete Test Suite</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{selectedSuite?.name}&quot;?
                Test cases in this suite will not be deleted, but will become unorganized.
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="glass"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="glass-destructive" onClick={handleDeleteTestSuite}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
