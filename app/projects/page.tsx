'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, MoreVertical, Folder, TestTube2, Play, FileText, Settings, Trash2, Users } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  key: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  members: Array<{
    id: string;
    role: string;
    user: {
      id: string;
      name: string;
      email: string;
      avatar: string | null;
    };
  }>;
  _count?: {
    testCases: number;
    testRuns: number;
    testSuites: number;
  };
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    key: '',
    description: '',
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          key: formData.key.toUpperCase(),
          description: formData.description || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setProjects([data.data, ...projects]);
        setCreateDialogOpen(false);
        setFormData({ name: '', key: '', description: '' });
      } else {
        setError(data.error || 'Failed to create project');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProjects(projects.filter(p => p.id !== projectId));
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] to-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-muted-foreground">Loading projects...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] to-white">
      {/* Header */}
      <div className="border-b bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#033977] mb-2">Projects</h1>
              <p className="text-muted-foreground">Manage your test projects and track progress</p>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#033977] hover:bg-[#044a99] text-white gap-2">
                  <Plus className="w-4 h-4" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>
                    Set up a new project to organize your test cases and test runs.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateProject} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Project Name *</Label>
                    <Input
                      id="name"
                      placeholder="E-Commerce Platform"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      minLength={3}
                      maxLength={255}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="key">Project Key *</Label>
                    <Input
                      id="key"
                      placeholder="ECOM"
                      value={formData.key}
                      onChange={(e) => setFormData({ ...formData, key: e.target.value.toUpperCase() })}
                      required
                      minLength={2}
                      maxLength={10}
                      pattern="[A-Z0-9]+"
                      className="uppercase"
                    />
                    <p className="text-xs text-muted-foreground">
                      2-10 characters, letters and numbers only
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of the project..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  {error && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                      {error}
                    </div>
                  )}
                  <div className="flex gap-3 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={creating}
                      className="bg-[#033977] hover:bg-[#044a99]"
                    >
                      {creating ? 'Creating...' : 'Create Project'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {projects.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Folder className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-sm">
                Get started by creating your first project to organize test cases and track testing progress.
              </p>
              <Button
                onClick={() => setCreateDialogOpen(true)}
                className="bg-[#033977] hover:bg-[#044a99]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="hover:shadow-lg transition-shadow cursor-pointer group border-l-4 border-l-[#033977]"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0" onClick={() => router.push(`/projects/${project.id}`)}>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="font-mono text-xs">
                          {project.key}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl mb-1 group-hover:text-[#033977] transition-colors line-clamp-1">
                        {project.name}
                      </CardTitle>
                      {project.description && (
                        <CardDescription className="line-clamp-2">
                          {project.description}
                        </CardDescription>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/projects/${project.id}`)}>
                          <Folder className="w-4 h-4 mr-2" />
                          Open Project
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/projects/${project.id}/settings`)}>
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/projects/${project.id}/members`)}>
                          <Users className="w-4 h-4 mr-2" />
                          Manage Members
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteProject(project.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent onClick={() => router.push(`/projects/${project.id}`)}>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <TestTube2 className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="text-2xl font-bold text-[#033977]">
                        {project._count?.testCases || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Test Cases</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Play className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="text-2xl font-bold text-[#033977]">
                        {project._count?.testRuns || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Test Runs</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <FileText className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="text-2xl font-bold text-[#033977]">
                        {project._count?.testSuites || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Test Suites</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {project.members.slice(0, 3).map((member) => (
                          <div
                            key={member.id}
                            className="w-8 h-8 rounded-full bg-[#033977] text-white flex items-center justify-center text-xs font-semibold border-2 border-white"
                            title={member.user.name}
                          >
                            {member.user.name.charAt(0).toUpperCase()}
                          </div>
                        ))}
                        {project.members.length > 3 && (
                          <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-semibold border-2 border-white">
                            +{project.members.length - 3}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {project.members.length} {project.members.length === 1 ? 'member' : 'members'}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Updated {new Date(project.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
