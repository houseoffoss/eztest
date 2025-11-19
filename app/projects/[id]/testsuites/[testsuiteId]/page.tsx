'use client';

import { useParams } from 'next/navigation';
import TestSuiteDetail from '@/frontend/components/testsuite/detail/TestSuiteDetail';

export default function TestSuiteDetailPage() {
  const params = useParams();
  const suiteId = params.testsuiteId as string;

  return <TestSuiteDetail suiteId={suiteId} />;
}
