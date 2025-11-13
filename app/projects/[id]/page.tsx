'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TestTube2, Play, FileText, Folder } from 'lucide-react';
import { Navbar } from '@/components/design/Navbar';
import { Breadcrumbs } from '@/components/design/Breadcrumbs';

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
  _count: {
    testCases: number;
    testRuns: number;
    testSuites: number;
    requirements: number;
  };
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    if (project) {
      document.title = `${project.name} | EZTest`;
    }
  }, [project]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}?stats=true`);
      if (response.ok) {
        const data = await response.json();
        setProject(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch project:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1628] p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-muted-foreground">Loading project...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#0a1628] p-8">
        <div className="max-w-7xl mx-auto">
          <Card variant="glass">
            <CardContent className="p-8 text-center">
              <p className="text-lg text-white/70">Project not found</p>
              <Button onClick={() => router.push('/projects')} variant="glass-primary" className="mt-4">
                Back to Projects
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1628]">
      <Navbar
        items={[
          { label: 'Overview', href: `/projects/${projectId}` },
          { label: 'Test Cases', href: `/projects/${projectId}/testcases` },
          { label: 'Members', href: `/projects/${projectId}/members` },
          { label: 'Settings', href: `/projects/${projectId}/settings` },
        ]}
        breadcrumbs={
          <Breadcrumbs 
            items={[
              { label: 'Projects', href: '/projects' },
              { label: project.name }
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
      
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-8 pt-8">
        {/* Project Title Section */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="outline" className="font-mono border-primary/40 bg-primary/10 text-primary text-xs px-2.5 py-0.5">
              {project.key}
            </Badge>
            <h1 className="text-2xl font-bold text-white">{project.name}</h1>
          </div>
          {project.description && (
            <p className="text-white/70 text-sm mb-2">{project.description}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-white/60">
            <div>
              Created by <span className="font-semibold text-white/90">{project.createdBy.name}</span>
            </div>
            <div>•</div>
            <div>
              Last updated {new Date(project.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Stats Cards */}
          <Card variant="glass" className="border-l-4 border-l-primary/30">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-white/70">
                <TestTube2 className="w-4 h-4" />
                Test Cases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {project._count.testCases}
              </div>
            </CardContent>
          </Card>

          <Card variant="glass" className="border-l-4 border-l-accent/30">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-white/70">
                <Play className="w-4 h-4" />
                Test Runs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {project._count.testRuns}
              </div>
            </CardContent>
          </Card>

          <Card variant="glass" className="border-l-4 border-l-purple-400/30">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-white/70">
                <FileText className="w-4 h-4" />
                Test Suites
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {project._count.testSuites}
              </div>
            </CardContent>
          </Card>

          <Card variant="glass" className="border-l-4 border-l-green-400/30">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-white/70">
                <Folder className="w-4 h-4" />
                Requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {project._count.requirements}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project Overview Card */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-white">Project Overview</CardTitle>
            <CardDescription className="text-white/70">
              Summary and key information about this project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2 text-white">Description</h3>
              <p className="text-white/70">
                {project.description || 'No description provided'}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-white">Project Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60">Project Key</span>
                  <Badge variant="outline" className="font-mono border-primary/40 bg-primary/10 text-primary">{project.key}</Badge>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60">Created By</span>
                  <span className="font-medium text-white">{project.createdBy.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60">Created On</span>
                  <span className="font-medium text-white">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60">Last Updated</span>
                  <span className="font-medium text-white">
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-white/60">Team Size</span>
                  <span className="font-medium text-white">{project.members.length} members</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
