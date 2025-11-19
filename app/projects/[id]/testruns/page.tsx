'use client';

import { useParams } from 'next/navigation';
import TestRunsList from '@/frontend/components/testruns/TestRunsList';

export default function TestRunsPage() {
  const params = useParams();
  const projectId = params.id as string;

  return <TestRunsList projectId={projectId} />;
}
