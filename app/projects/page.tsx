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
import { Navbar } from '@/components/design/Navbar';

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    key: '',
    description: '',
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Projects | EZTest';
  }, []);

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
    setDeleting(true);

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProjects(projects.filter(p => p.id !== projectId));
        setDeleteDialogOpen(false);
        setProjectToDelete(null);
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteDialog = (project: Project) => {
    setProjectToDelete({ id: project.id, name: project.name });
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1628] p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-muted-foreground">Loading projects...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1628]">
      <Navbar
        items={[
          { label: 'Projects', href: '/projects' },
          { label: 'Runs', href: '/runs' },
        ]}
        actions={
          <form action="/api/auth/signout" method="POST">
            <Button type="submit" variant="glass-destructive" size="sm" className="px-5">
              Sign Out
            </Button>
          </form>
        }
      />
      
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-8 py-6 pt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Projects</h1>
            <p className="text-white/70 text-sm">Manage your test projects and track progress</p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="glass-primary" className="gap-2">
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
                      className="uppercase backdrop-blur-none"
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
                      variant="glass"
                      onClick={() => setCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={creating}
                      variant="glass-primary"
                    >
                      {creating ? 'Creating...' : 'Create Project'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto px-8 pb-8">
        {projects.length === 0 ? (
          <Card variant="glass" className="border-dashed border-2 border-white/20">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Folder className="w-16 h-16 text-white/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-white">No projects yet</h3>
              <p className="text-white/60 mb-6 text-center max-w-sm">
                Get started by creating your first project to organize test cases and track testing progress.
              </p>
              <Button
                onClick={() => setCreateDialogOpen(true)}
                variant="glass-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {projects.map((project) => (
              <Card
                key={project.id}
                variant="glass"
                className="hover:shadow-xl hover:shadow-primary/10 transition-all cursor-pointer group border-l-4 border-l-primary/30"
              >
                <CardHeader className="pb-1 pt-2.5 px-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0" onClick={() => router.push(`/projects/${project.id}`)}>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="font-mono text-xs px-2 py-0.5 border-primary/40 bg-primary/10 text-primary">
                          {project.key}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1 text-white">
                        {project.name}
                      </CardTitle>
                      {project.description && (
                        <CardDescription className="line-clamp-1 text-sm text-white/60">
                          {project.description}
                        </CardDescription>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 shrink-0 hover:bg-white/10">
                          <MoreVertical className="w-3.5 h-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/projects/${project.id}`)} className="hover:bg-white/10">
                          <Folder className="w-4 h-4 mr-2" />
                          Open Project
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/projects/${project.id}/settings`)} className="hover:bg-white/10">
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/projects/${project.id}/members`)} className="hover:bg-white/10">
                          <Users className="w-4 h-4 mr-2" />
                          Manage Members
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(project)}
                          className="text-red-400 hover:bg-red-400/10"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent onClick={() => router.push(`/projects/${project.id}`)} className="py-2.5 px-3.5">
                  <div className="grid grid-cols-3 gap-2.5 mb-2.5">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <TestTube2 className="w-4 h-4 text-primary" />
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {project._count?.testCases || 0}
                      </div>
                      <div className="text-xs text-white/60">Test Cases</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Play className="w-4 h-4 text-accent" />
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {project._count?.testRuns || 0}
                      </div>
                      <div className="text-xs text-white/60">Test Runs</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <FileText className="w-4 h-4 text-purple-400" />
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {project._count?.testSuites || 0}
                      </div>
                      <div className="text-xs text-white/60">Test Suites</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1.5">
                        {project.members.slice(0, 3).map((member) => (
                          <div
                            key={member.id}
                            className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold border-2 border-background"
                            title={member.user.name}
                          >
                            {member.user.name.charAt(0).toUpperCase()}
                          </div>
                        ))}
                        {project.members.length > 3 && (
                          <div className="w-7 h-7 rounded-full bg-white/10 text-white/70 flex items-center justify-center text-xs font-semibold border-2 border-background">
                            +{project.members.length - 3}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-white/60">
                        {project.members.length} member{project.members.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <span className="text-xs text-white/50">
                      Updated {new Date(project.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{projectToDelete?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-red-300">
              <p className="font-semibold mb-2">This will permanently delete:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>All test cases</li>
                <li>All test runs</li>
                <li>All test suites</li>
                <li>All requirements</li>
                <li>All project data</li>
              </ul>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="glass"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setProjectToDelete(null);
                }}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="glass-destructive"
                onClick={() => projectToDelete && handleDeleteProject(projectToDelete.id)}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Project'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
