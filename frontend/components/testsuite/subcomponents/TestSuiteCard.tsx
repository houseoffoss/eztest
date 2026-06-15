'use client';

import { formatDateTime } from '@/lib/date-utils';
import { Badge } from '@/frontend/reusable-elements/badges/Badge';
import { ItemCard } from '@/frontend/reusable-components/cards/ItemCard';
import { ActionMenu } from '@/frontend/reusable-components/menus/ActionMenu';
import { StatsGrid } from '@/frontend/reusable-components/data/StatsGrid';
import { Edit, Trash2, TestTube2, Layers, FolderTree } from 'lucide-react';
import { TestSuite } from '../types';

interface TestSuiteCardProps {
  suite: TestSuite;
  // Retained for API compatibility with the tree list; nesting is shown via the
  // "Sub-suites" stat and the parent badge rather than inline expansion.
  isExpanded?: boolean;
  onToggleExpand?: (suiteId: string) => void;
  onView: (suiteId: string) => void;
  onDelete: (suite: TestSuite) => void;
  canDelete?: boolean;
  isChild?: boolean;
}

export function TestSuiteCard({
  suite,
  onView,
  onDelete,
  canDelete = true,
}: TestSuiteCardProps) {
  const childrenCount = suite.children?.length || 0;

  // Mirror the Projects dashboard card: a key/relationship pill, a stats grid,
  // and a footer — built on the same ItemCard/StatsGrid primitives.
  const badges = (
    <Badge
      variant="outline"
      className="flex items-center gap-1 text-xs px-2 py-0.5 border-primary/40 bg-primary/10 text-primary"
    >
      <FolderTree className="h-3 w-3" />
      {suite.parent ? suite.parent.name : 'Suite'}
    </Badge>
  );

  const header = (
    <ActionMenu
      items={[
        {
          label: 'View / Edit',
          icon: Edit,
          onClick: () => onView(suite.id),
        },
        {
          label: 'Delete',
          icon: Trash2,
          onClick: () => onDelete(suite),
          variant: 'destructive',
          show: canDelete,
          buttonName: `Test Suite Card - Delete (${suite.name})`,
        },
      ]}
      align="end"
      iconSize="h-4 w-4"
    />
  );

  const content = (
    <StatsGrid
      stats={[
        {
          icon: TestTube2,
          value: suite._count.testCases,
          label: 'Test Cases',
          iconColor: 'text-primary',
        },
        {
          icon: Layers,
          value: childrenCount,
          label: 'Sub-suites',
          iconColor: 'text-purple-400',
        },
      ]}
      columns={2}
      gap="sm"
      className="mb-2.5"
    />
  );

  const footer = (
    <span className="text-xs text-white/50">
      Created {formatDateTime(suite.createdAt)}
    </span>
  );

  return (
    <ItemCard
      title={suite.name}
      description={suite.description || undefined}
      descriptionClassName="line-clamp-2 break-words text-sm text-white/60 min-h-5"
      badges={badges}
      header={header}
      content={content}
      footer={footer}
      onClick={() => onView(suite.id)}
      borderColor="primary"
    />
  );
}
