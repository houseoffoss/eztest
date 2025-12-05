'use client';

import { useParams } from 'next/navigation';
import DefectList from '@/frontend/components/defect/DefectList';

export default function DefectsPage() {
  const params = useParams();
  const projectId = params.id as string;

  return <DefectList projectId={projectId} />;
}
