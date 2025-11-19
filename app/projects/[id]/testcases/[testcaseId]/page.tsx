'use client';

import { useParams } from 'next/navigation';
import TestCaseDetail from '@/frontend/components/testcase/detail/TestCaseDetail';

export default function TestCaseDetailPage() {
  const params = useParams();
  const testCaseId = params.testcaseId as string;

  return <TestCaseDetail testCaseId={testCaseId} />;
}
