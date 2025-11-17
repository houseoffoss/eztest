'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/elements/button';
import { Loader } from '@/elements/loader';
import { Navbar } from '@/components/design/Navbar';
import { Breadcrumbs } from '@/components/design/Breadcrumbs';
import ProjectTestCases from '@/app/frontend/components/project/ProjectTestCases';

interface Project {
  id: string;
  name: string;
  key: string;
}

export default function TestCasesPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setProject(data.data);
          document.title = `Test Cases - ${data.data.name} | EZTest`;
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
                { label: 'Test Cases' }
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
          <Loader fullScreen text="Loading test cases..." />
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
              { label: 'Test Cases' }
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
      
      <div className="max-w-7xl mx-auto px-8 pt-8 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Test Cases</h1>
          <p className="text-lg text-white/70">
            Manage test cases for <span className="font-semibold text-white">{project.name}</span>
          </p>
        </div>
        
        <ProjectTestCases projectId={projectId} />
      </div>
    </div>
  );
}
