'use client';

import { useParams } from 'next/navigation';
import { Button } from '@/elements/button';
import { Navbar } from '@/components/design/Navbar';
import { Breadcrumbs } from '@/components/design/Breadcrumbs';
import ProjectMembers from '@/app/frontend/components/project/ProjectMembers';
import { useEffect, useState } from 'react';

interface Project {
  id: string;
  name: string;
  key: string;
}

export default function ProjectMembersPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setProject(data.data);
          document.title = `Team Members - ${data.data.name} | EZTest`;
        }
      })
      .catch(() => {});
  }, [projectId]);

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
              { label: project?.name || 'Loading...', href: `/projects/${projectId}` },
              { label: 'Members' }
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
      
      <div className="max-w-6xl mx-auto px-8 pt-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Project Members</h1>
          <p className="text-white/70 text-sm">
            Manage team members for <span className="font-semibold text-white">{project?.name || 'this project'}</span>
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 pb-8">
        <ProjectMembers projectId={projectId} />
      </div>
    </div>
  );
}

