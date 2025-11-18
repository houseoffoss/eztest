'use client';

import { useParams } from 'next/navigation';
import ProjectMembers from '@/frontend/components/members/ProjectMembers';

export default function ProjectMembersPage() {
  const params = useParams();
  const projectId = params.id as string;

  return <ProjectMembers projectId={projectId} />;
}
