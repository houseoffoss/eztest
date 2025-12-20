'use client';

import { TestSuiteCard } from './TestSuiteCard';
import { TestSuite } from '../types';

interface TestSuiteTreeItemProps {
  suite: TestSuite;
  isExpanded: boolean;
  onToggleExpand: (suiteId: string) => void;
  onView: (suiteId: string) => void;
  onDelete: (suite: TestSuite) => void;
  canDelete?: boolean;
}

export function TestSuiteTreeItem({
  suite,
  isExpanded,
  onToggleExpand,
  onView,
  onDelete,
  canDelete = true,
}: TestSuiteTreeItemProps) {
  return (
    <TestSuiteCard
      suite={suite}
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
      onView={onView}
      onDelete={onDelete}
      canDelete={canDelete}
    />
  );
}
