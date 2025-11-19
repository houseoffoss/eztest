'use client';

import { useParams } from 'next/navigation';
import { TestRunDetail } from '@/frontend/components/testruns';

export default function TestRunDetailPage() {
  const params = useParams();
  const testRunId = params.testrunId as string;

  return <TestRunDetail testRunId={testRunId} />;
}
