'use client';

import { useParams } from 'next/navigation';
import ProjectSettings from '@/frontend/components/settings/ProjectSettings';

export default function ProjectSettingsPage() {
  const params = useParams();
  const projectId = params.id as string;

  return <ProjectSettings projectId={projectId} />;
}
