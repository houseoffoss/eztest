'use client';

import { useParams } from 'next/navigation';
import TestSuiteList from '@/frontend/components/testsuite/TestSuiteList';

export default function TestSuitesPage() {
  const params = useParams();
  const projectId = params.id as string;

  return <TestSuiteList projectId={projectId} />;
}
