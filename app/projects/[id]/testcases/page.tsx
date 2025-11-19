'use client';

import { useParams } from 'next/navigation';
import TestCaseList from '@/frontend/components/testcase/TestCaseList';

export default function TestCasesPage() {
  const params = useParams();
  const projectId = params.id as string;

  return <TestCaseList projectId={projectId} />;
}