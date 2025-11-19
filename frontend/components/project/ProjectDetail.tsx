'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/elements/button';
import { Card, CardContent } from '@/elements/card';
import { TestTube2, Play, FileText, Folder } from 'lucide-react';
import { Breadcrumbs } from '@/components/design/Breadcrumbs';
import { Loader } from '@/elements/loader';
import { StatCard } from './subcomponents/StatCard';
import { ProjectHeader } from './subcomponents/ProjectHeader';
import { ProjectOverviewCard } from './subcomponents/ProjectOverviewCard';

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

interface ProjectDetailProps {
  projectId: string;
}

export default function ProjectDetail({ projectId }: ProjectDetailProps) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

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
    return <Loader fullScreen text="Loading project..." />;
  }

  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <p className="text-white/70">Project not found</p>
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
                { label: project.name, href: `/projects/${projectId}` },
                { label: 'Overview' }
              ]}
            />
            <form action="/api/auth/signout" method="POST">
              <Button type="submit" variant="glass-destructive" size="sm" className="px-5">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </div>
      
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-8 pt-8">
        <ProjectHeader project={project} />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Stats Cards */}
          <StatCard
            icon={<TestTube2 className="w-4 h-4" />}
            label="Test Cases"
            value={project._count.testCases}
            borderColor="border-l-primary/30"
          />
          <StatCard
            icon={<Play className="w-4 h-4" />}
            label="Test Runs"
            value={project._count.testRuns}
            borderColor="border-l-accent/30"
          />
          <StatCard
            icon={<FileText className="w-4 h-4" />}
            label="Test Suites"
            value={project._count.testSuites}
            borderColor="border-l-purple-400/30"
          />
          <StatCard
            icon={<Folder className="w-4 h-4" />}
            label="Requirements"
            value={project._count.requirements}
            borderColor="border-l-green-400/30"
          />
        </div>

        {/* Project Overview Card */}
        <ProjectOverviewCard project={project} />
      </div>
    </>
  );
}
