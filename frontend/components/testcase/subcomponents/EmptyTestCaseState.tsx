'use client';

import { EmptyStateCard } from '@/frontend/reusable-components/cards/EmptyStateCard';
import { AlertCircle } from 'lucide-react';

interface EmptyTestCaseStateProps {
  hasFilters: boolean;
  onCreateClick: () => void;
  canCreate?: boolean;
}

export function EmptyTestCaseState({ hasFilters, onCreateClick, canCreate = true }: EmptyTestCaseStateProps) {
  return (
    <EmptyStateCard
      icon={AlertCircle}
      title="テストケースがありません"
      description={hasFilters
        ? '検索条件を変更してみてください'
        : '最初のテストケースを作成して始めましょう'}
      actionLabel={!hasFilters && canCreate ? 'テストケースを作成' : undefined}
      onAction={!hasFilters && canCreate ? onCreateClick : undefined}
      actionButtonName="Test Case List - Create Test Case (Empty State)"
    />
  );
}
