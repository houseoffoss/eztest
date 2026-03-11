'use client';

import { EmptyStateCard } from '@/frontend/reusable-components/cards/EmptyStateCard';
import { Folder } from 'lucide-react';

interface EmptyTestSuiteStateProps {
  onCreateClick: () => void;
  canCreate?: boolean;
}

export function EmptyTestSuiteState({ onCreateClick, canCreate = false }: EmptyTestSuiteStateProps) {
  return (
    <EmptyStateCard
      icon={Folder}
      title="テストスイートがありません"
      description="Organize your test cases into suites to keep your testing structured and manageable."
      actionLabel={canCreate ? 'テストスイートを作成' : undefined}
      onAction={canCreate ? onCreateClick : undefined}
      actionButtonName="Test Suite List - Create Test Suite (Empty State)"
    />
  );
}
