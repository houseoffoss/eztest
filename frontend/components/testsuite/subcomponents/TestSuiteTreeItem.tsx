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
    <div className="mb-1">
      <TestSuiteCard
        suite={suite}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
        onView={onView}
        onDelete={onDelete}
        canDelete={canDelete}
      />

      {/* Child Suites */}
      {isExpanded && suite.children && suite.children.length > 0 && (
        <div className="ml-6 mt-1">
          {suite.children.map((child) => (
            <div key={child.id} className="mb-1">
              <TestSuiteCard
                suite={child}
                onView={onView}
                onDelete={onDelete}
                canDelete={canDelete}
                isChild
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
