'use client';

import { useParams } from 'next/navigation';
import ProjectDetail from '@/frontend/components/project/ProjectDetail';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;

  return <ProjectDetail projectId={projectId} />;
}
