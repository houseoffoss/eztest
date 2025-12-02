'use client';

import { useParams } from 'next/navigation';
import ModuleDetail from '@/frontend/components/testcase/module/ModuleDetail';

export default function ModuleDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const moduleId = params.moduleId as string;

  return <ModuleDetail projectId={projectId} moduleId={moduleId} />;
}
