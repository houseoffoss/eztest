'use client';

import { useMemo } from 'react';
import { Navbar } from '@/frontend/reusable-components/layout/Navbar';
import { Breadcrumbs } from '@/frontend/reusable-components/layout/Breadcrumbs';
import { PageHeaderWithBadge } from '@/frontend/reusable-components/layout/PageHeaderWithBadge';
import { Project } from '../types';

interface SettingsHeaderProps {
  project: Project;
  projectId?: string;
}

export function SettingsHeader({ project, projectId }: SettingsHeaderProps) {
  const pid = projectId || project.id;

  const navbarActions = useMemo(() => [
    {
      type: 'signout' as const,
      showConfirmation: true,
    },
  ], []);

  return (
    <>
      {/* Navbar */}
      <Navbar
        brandLabel={null}
        items={[]}
        breadcrumbs={
          <Breadcrumbs 
            items={[
              { label: 'Projects', href: '/projects' },
              { label: project.name, href: `/projects/${pid}` },
              { label: 'Settings' },
            ]}
          />
        }
        actions={navbarActions}
      />

      <div className="px-8 pt-8">
        <div className="max-w-4xl mx-auto">
          <PageHeaderWithBadge
            badge={project.key}
            title="Project Settings"
            description={`Manage project information and settings for ${project.name}`}
            className="mb-6"
          />
        </div>
      </div>
    </>
  );
}
