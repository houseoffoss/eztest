'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge } from '@/elements/badge';
import { Button } from '@/elements/button';
import { Card, CardContent, CardHeader } from '@/elements/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/elements/dialog';
import { Input } from '@/elements/input';
import { Label } from '@/elements/label';
import { Textarea } from '@/elements/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/elements/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/elements/dropdown-menu';
import {
  AlertCircle,
  Calendar,
  Filter,
  MoreVertical,
  Play,
  Plus,
  Search,
  Trash2,
  User,
} from 'lucide-react';
import { Navbar } from '@/components/design/Navbar';
import { Breadcrumbs } from '@/components/design/Breadcrumbs';

interface TestRun {
  id: string;
  name: string;
  description?: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  environment?: string;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  results: Array<{
    status: string;
  }>;
  _count: {
    results: number;
  };
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

interface Project {
  id: string;
  name: string;
  key: string;
}

export default function TestRunsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [filteredTestRuns, setFilteredTestRuns] = useState<TestRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTestRun, setSelectedTestRun] = useState<TestRun | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [environmentFilter, setEnvironmentFilter] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState({
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
  }, [testRuns, searchQuery, statusFilter, environmentFilter]);

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
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (tr) =>
          tr.name.toLowerCase().includes(query) ||
          tr.description?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((tr) => tr.status === statusFilter);
    }

    // Environment filter
    if (environmentFilter !== 'all') {
      filtered = filtered.filter((tr) => tr.environment === environmentFilter);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNED':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'IN_PROGRESS':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'COMPLETED':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'CANCELLED':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const calculatePassRate = (testRun: TestRun) => {
    const total = testRun._count.results;
    if (total === 0) return 0;
    
    const passed = testRun.results.filter(r => r.status === 'PASSED').length;
    return Math.round((passed / total) * 100);
  };

  const getResultCounts = (testRun: TestRun) => {
    const counts = {
      passed: 0,
      failed: 0,
      blocked: 0,
      skipped: 0,
    };

    testRun.results.forEach((result) => {
      switch (result.status) {
        case 'PASSED':
          counts.passed++;
          break;
        case 'FAILED':
          counts.failed++;
          break;
        case 'BLOCKED':
          counts.blocked++;
          break;
        case 'SKIPPED':
          counts.skipped++;
          break;
      }
    });

    return counts;
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
              { label: 'Test Runs' },
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
            <h1 className="text-2xl font-bold text-white">Test Runs</h1>
          </div>
          {project && (
            <p className="text-white/70 text-sm mb-2">{project.name}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="glass-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  New Test Run
                </Button>
              </DialogTrigger>
              <DialogContent variant="glass" className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Test Run</DialogTitle>
                  <DialogDescription>
                    Create a new test run to execute test cases
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      variant="glass"
                      value={formData.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Enter test run name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      variant="glass"
                      value={formData.description}
                      onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="Enter test run description"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="environment">Environment</Label>
                    <Select
                      value={formData.environment}
                      onValueChange={(value: string) =>
                        setFormData({ ...formData, environment: value })
                      }
                    >
                      <SelectTrigger variant="glass">
                        <SelectValue placeholder="Select environment" />
                      </SelectTrigger>
                      <SelectContent variant="glass">
                        <SelectItem value="Production">Production</SelectItem>
                        <SelectItem value="Staging">Staging</SelectItem>
                        <SelectItem value="QA">QA</SelectItem>
                        <SelectItem value="Development">Development</SelectItem>
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
                  <Button variant="glass-primary" onClick={handleCreateTestRun}>
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Filters */}
        <Card variant="glass" className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    variant="glass"
                    placeholder="Search test runs..."
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger variant="glass">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent variant="glass">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="PLANNED">Planned</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={environmentFilter} onValueChange={setEnvironmentFilter}>
                  <SelectTrigger variant="glass">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Environment" />
                  </SelectTrigger>
                  <SelectContent variant="glass">
                    <SelectItem value="all">All Environments</SelectItem>
                    <SelectItem value="Production">Production</SelectItem>
                    <SelectItem value="Staging">Staging</SelectItem>
                    <SelectItem value="QA">QA</SelectItem>
                    <SelectItem value="Development">Development</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Runs List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Loading test runs...</p>
          </div>
        ) : filteredTestRuns.length === 0 ? (
          <Card variant="glass">
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                No test runs found
              </h3>
              <p className="text-gray-400 mb-4">
                {testRuns.length === 0
                  ? 'Get started by creating your first test run'
                  : 'Try adjusting your filters'}
              </p>
              {testRuns.length === 0 && (
                <Button variant="glass-primary" onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Test Run
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTestRuns.map((testRun) => {
              const passRate = calculatePassRate(testRun);
              const counts = getResultCounts(testRun);

              return (
                <Card
                  key={testRun.id}
                  variant="glass"
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => router.push(`/projects/${projectId}/testruns/${testRun.id}`)}
                >
                  <CardHeader className="pb-2 pt-3 px-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white mb-2 truncate">
                          {testRun.name}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant="outline"
                            className={getStatusColor(testRun.status)}
                          >
                            {testRun.status.replace('_', ' ')}
                          </Badge>
                          {testRun.environment && (
                            <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                              {testRun.environment}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          asChild
                          onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        >
                          <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent variant="glass" align="end">
                          <DropdownMenuItem
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              router.push(`/projects/${projectId}/testruns/${testRun.id}`);
                            }}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              setSelectedTestRun(testRun);
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
                  </CardHeader>

                  <CardContent className="py-3 px-4">
                    {testRun.description && (
                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                        {testRun.description}
                      </p>
                    )}

                    {/* Progress */}
                    {testRun._count.results > 0 && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Progress</span>
                          <span>{passRate}% Passed</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all"
                            style={{ width: `${passRate}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {counts.passed > 0 && (
                        <div className="text-center">
                          <div className="text-xs text-green-500 font-semibold">{counts.passed}</div>
                          <div className="text-[10px] text-gray-500">Passed</div>
                        </div>
                      )}
                      {counts.failed > 0 && (
                        <div className="text-center">
                          <div className="text-xs text-red-500 font-semibold">{counts.failed}</div>
                          <div className="text-[10px] text-gray-500">Failed</div>
                        </div>
                      )}
                      {counts.blocked > 0 && (
                        <div className="text-center">
                          <div className="text-xs text-orange-500 font-semibold">{counts.blocked}</div>
                          <div className="text-[10px] text-gray-500">Blocked</div>
                        </div>
                      )}
                      {counts.skipped > 0 && (
                        <div className="text-center">
                          <div className="text-xs text-gray-500 font-semibold">{counts.skipped}</div>
                          <div className="text-[10px] text-gray-500">Skipped</div>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/5">
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        {testRun.assignedTo && (
                          <div className="flex items-center gap-2">
                            <User className="w-3 h-3" />
                            <span className="truncate">{testRun.assignedTo.name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(testRun.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent variant="glass">
            <DialogHeader>
              <DialogTitle>Delete Test Run</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{selectedTestRun?.name}&quot;?
                This will also delete all test results. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="glass"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="glass-destructive" onClick={handleDeleteTestRun}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      </div>
    </div>
  );
}
