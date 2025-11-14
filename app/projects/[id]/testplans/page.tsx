'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertCircle,
  FileText,
  MoreVertical,
  Plus,
  Trash2,
  Calendar,
  User,
  TestTube2,
} from 'lucide-react';
import { Navbar } from '@/components/design/Navbar';
import { Breadcrumbs } from '@/components/design/Breadcrumbs';

interface TestPlan {
  id: string;
  name: string;
  description?: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  _count: {
    testCases: number;
    testRuns: number;
  };
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  key: string;
}

export default function TestPlansPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [testPlans, setTestPlans] = useState<TestPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTestPlan, setSelectedTestPlan] = useState<TestPlan | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchProject();
    fetchTestPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    if (project) {
      document.title = `Test Plans - ${project.name} | EZTest`;
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

  const fetchTestPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}/testplans`);
      const data = await response.json();
      if (data.data) {
        setTestPlans(data.data);
      }
    } catch (error) {
      console.error('Error fetching test plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTestPlan = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/testplans`, {
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
        });
        fetchTestPlans();
      } else {
        alert(data.error || 'Failed to create test plan');
      }
    } catch (error) {
      console.error('Error creating test plan:', error);
      alert('Failed to create test plan');
    }
  };

  const handleDeleteTestPlan = async () => {
    if (!selectedTestPlan) return;

    try {
      const response = await fetch(`/api/testplans/${selectedTestPlan.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDeleteDialogOpen(false);
        setSelectedTestPlan(null);
        fetchTestPlans();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete test plan');
      }
    } catch (error) {
      console.error('Error deleting test plan:', error);
      alert('Failed to delete test plan');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!project) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-white/70">Loading...</p>
        </div>
      </div>
    );
  }

  const currentPath = [
    { label: 'Projects', href: '/projects' },
    { label: project.name, href: `/projects/${projectId}` },
    { label: 'Test Plans' },
  ];

  const projectNavigation = [
    { name: 'Overview', href: `/projects/${projectId}`, active: false },
    { name: 'Test Suites', href: `/projects/${projectId}/testsuites`, active: false },
    { name: 'Test Cases', href: `/projects/${projectId}/testcases`, active: false },
    { name: 'Test Plans', href: `/projects/${projectId}/testplans`, active: true },
    { name: 'Test Runs', href: `/projects/${projectId}/testruns`, active: false },
    { name: 'Members', href: `/projects/${projectId}/members`, active: false },
    { name: 'Settings', href: `/projects/${projectId}/settings`, active: false },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-8 pt-8">
        <Breadcrumbs items={currentPath} />
        
        <div className="mb-6">
          <div className="mb-2">
            <h1 className="text-2xl font-bold text-white/90">Test Plans</h1>
          </div>
          {project && (
            <p className="text-white/60 text-sm mb-2">{project.name}</p>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            {projectNavigation.map((item) => (
              <Button
                key={item.name}
                variant={item.active ? 'glass-primary' : 'glass'}
                onClick={() => router.push(item.href)}
              >
                {item.name}
              </Button>
            ))}
          </div>
          
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="glass-primary">
                <Plus className="w-4 h-4 mr-2" />
                New Test Plan
              </Button>
            </DialogTrigger>
            <DialogContent variant="glass">
              <DialogHeader>
                <DialogTitle className="text-white/90">Create Test Plan</DialogTitle>
                <DialogDescription className="text-white/60">
                  Create a new test plan to organize test cases for execution
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-white/90">Name *</Label>
                  <Input
                    variant="glass"
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter test plan name"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-white/90">Description</Label>
                  <Textarea
                    variant="glass"
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Enter test plan description"
                    rows={4}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="glass"
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="glass-primary" onClick={handleCreateTestPlan}>
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
          <div className="flex items-center justify-center py-12">
            <p className="text-white/70">Loading test plans...</p>
          </div>
        ) : testPlans.length === 0 ? (
          <Card variant="glass">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="w-16 h-16 text-white/30 mb-4" />
              <h3 className="text-xl font-semibold text-white/90 mb-2">
                No Test Plans Yet
              </h3>
              <p className="text-white/60 mb-4 text-center max-w-md">
                Create your first test plan to organize test cases for execution.
                Test plans help you manage testing campaigns and track progress.
              </p>
              <Button
                variant="glass-primary"
                onClick={() => setCreateDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Test Plan
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testPlans.map((testPlan) => (
              <Card
                key={testPlan.id}
                variant="glass"
                className="hover:border-blue-500/30 transition-all cursor-pointer"
                onClick={() => router.push(`/projects/${projectId}/testplans/${testPlan.id}`)}
              >
                <CardHeader className="flex flex-row items-start justify-between pb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white/90 mb-1 truncate">
                      {testPlan.name}
                    </h3>
                    {testPlan.description && (
                      <p className="text-sm text-white/50 line-clamp-2">
                        {testPlan.description}
                      </p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" variant="glass">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/projects/${projectId}/testplans/${testPlan.id}`);
                        }}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        View Plan
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-400 focus:text-red-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTestPlan(testPlan);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-white/60 mb-4">
                    <div className="flex items-center gap-1">
                      <TestTube2 className="w-4 h-4" />
                      <span>{testPlan._count.testCases} cases</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      <span>{testPlan._count.testRuns} runs</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-white/40">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{testPlan.createdBy.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(testPlan.createdAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent variant="glass">
          <DialogHeader>
            <DialogTitle className="text-white/90">Delete Test Plan</DialogTitle>
            <DialogDescription className="text-white/60">
              Are you sure you want to delete &quot;{selectedTestPlan?.name}&quot;?
            </DialogDescription>
          </DialogHeader>
          
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-red-400 mb-1">
                  Warning: This action cannot be undone
                </h4>
                <ul className="text-sm text-red-300/90 space-y-1">
                  <li>• This test plan will be permanently deleted</li>
                  <li>• Test cases will remain but will no longer be linked to this plan</li>
                  {selectedTestPlan && selectedTestPlan._count.testRuns > 0 && (
                    <li>• Cannot delete: {selectedTestPlan._count.testRuns} test run(s) are linked to this plan</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="glass"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTestPlan}
              disabled={selectedTestPlan ? selectedTestPlan._count.testRuns > 0 : false}
            >
              Delete Test Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
