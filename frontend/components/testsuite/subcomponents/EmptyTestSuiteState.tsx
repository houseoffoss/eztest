'use client';

import { EmptyStateCard } from '@/components/design';
import { Folder } from 'lucide-react';

interface EmptyTestSuiteStateProps {
  onCreateClick: () => void;
  canCreate?: boolean;
}

export function EmptyTestSuiteState({ onCreateClick, canCreate = false }: EmptyTestSuiteStateProps) {
  return (
    <EmptyStateCard
      icon={Folder}
      title="No test suites found"
      description="Organize your test cases into suites to keep your testing structured and manageable."
      actionLabel={canCreate ? 'Create Test Suite' : undefined}
      onAction={canCreate ? onCreateClick : undefined}
    />
  );
}
