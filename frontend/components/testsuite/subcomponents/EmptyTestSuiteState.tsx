'use client';

import { EmptyState } from '@/elements/empty-state';
import { Folder } from 'lucide-react';

interface EmptyTestSuiteStateProps {
  onCreateClick: () => void;
}

export function EmptyTestSuiteState({ onCreateClick }: EmptyTestSuiteStateProps) {
  return (
    <EmptyState
      icon={Folder}
      title="No test suites found"
      description="Organize your test cases into suites to keep your testing structured and manageable."
      actionLabel="Create Test Suite"
      onAction={onCreateClick}
      variant="inline"
    />
  );
}
