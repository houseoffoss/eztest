'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TestTube2, Play, FileText, Folder } from 'lucide-react';
import { Loader } from '@/elements/loader';
import { TopBar, StatCard } from '@/components/design';
import { ProjectHeader } from './subcomponents/ProjectHeader';

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
      } else if (response.status === 404 || response.status === 403) {
        // Project not found or no access - redirect after showing message
        setTimeout(() => {
          router.push('/projects');
        }, 2000);
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
        <div className="text-center max-w-md">
          <div className="mb-6 flex justify-center">
            <div className="p-4 bg-red-500/10 rounded-full border border-red-500/30">
              <Folder className="w-12 h-12 text-red-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Project Not Found</h2>
          <p className="text-white/70 mb-6">
            The project you're looking for doesn't exist or has been deleted.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-blue-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
            <span>Redirecting to projects page...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <TopBar 
        breadcrumbs={[
          { label: 'Projects', href: '/projects' },
          { label: project.name, href: `/projects/${projectId}` }
        ]}
      />
      
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-8 pt-8">
        <ProjectHeader project={project} />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Test Cases Card - Clickable */}
          <div
            onClick={() => router.push(`/projects/${projectId}/testcases`)}
            className="cursor-pointer group"
          >
            <StatCard
              icon={<TestTube2 className="w-4 h-4" />}
              label="Test Cases"
              value={project._count.testCases}
              borderColor="border-l-primary/30"
              className="group-hover:bg-primary/10 transition-all"
            />
          </div>
          {/* Test Runs Card - Clickable */}
          <div
            onClick={() => router.push(`/projects/${projectId}/testruns`)}
            className="cursor-pointer group"
          >
            <StatCard
              icon={<Play className="w-4 h-4" />}
              label="Test Runs"
              value={project._count.testRuns}
              borderColor="border-l-accent/30"
              className="group-hover:bg-accent/10 transition-all"
            />
          </div>
          {/* Test Suites Card - Clickable */}
          <div
            onClick={() => router.push(`/projects/${projectId}/testsuites`)}
            className="cursor-pointer group"
          >
            <StatCard
              icon={<FileText className="w-4 h-4" />}
              label="Test Suites"
              value={project._count.testSuites}
              borderColor="border-l-purple-400/30"
              className="group-hover:bg-purple-400/10 transition-all"
            />
          </div>
          {/* Members Card - Clickable */}
          <div
            onClick={() => router.push(`/projects/${projectId}/members`)}
            className="cursor-pointer group"
          >
            <StatCard
              icon={<Folder className="w-4 h-4" />}
              label="Members"
              value={project.members?.length || 0}
              borderColor="border-l-green-400/30"
              className="group-hover:bg-green-400/10 transition-all"
            />
          </div>
        </div>
      </div>
    </>
  );
}
