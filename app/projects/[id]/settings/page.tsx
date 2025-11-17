'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/elements/button';
import { Loader } from '@/elements/loader';
import { Navbar } from '@/components/design/Navbar';
import { Breadcrumbs } from '@/components/design/Breadcrumbs';
import ProjectSettings from '@/app/frontend/components/project/ProjectSettings';

interface Project {
  id: string;
  name: string;
  key: string;
}

export default function ProjectSettingsPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setProject(data.data);
          document.title = `Settings - ${data.data.name} | EZTest`;
        }
      })
      .catch(() => {});
  }, [projectId]);

  if (!project) {
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
                { label: 'Loading...', href: '#' },
                { label: 'Settings' }
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
        <div className="max-w-4xl mx-auto px-8 pt-8">
          <Loader fullScreen text="Loading project settings..." />
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
              { label: project.name, href: `/projects/${projectId}` },
              { label: 'Settings' }
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
      <div className="max-w-4xl mx-auto px-8 pt-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Project Settings</h1>
          <p className="text-white/70 text-sm">
            Manage project information and settings for <span className="font-semibold text-white">{project.name}</span>
          </p>
        </div>
      </div>

      <ProjectSettings projectId={projectId} />
    </div>
  );
}
