'use client';

import { ActionMenu } from '@/frontend/reusable-components/menus/ActionMenu';
import {
  Edit,
  Folder,
  Trash2,
} from 'lucide-react';
import { TestSuite } from '../types';

interface TestSuiteCardProps {
  suite: TestSuite;
  isExpanded?: boolean;
  onToggleExpand?: (suiteId: string) => void;
  onView: (suiteId: string) => void;
  onDelete: (suite: TestSuite) => void;
  canDelete?: boolean;
  isChild?: boolean;
}

export function TestSuiteCard({
  suite,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isExpanded = false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onToggleExpand,
  onView,
  onDelete,
  canDelete = true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isChild = false,
}: TestSuiteCardProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const hasChildren = suite.children && suite.children.length > 0;
  const childrenCount = suite.children?.length || 0;

  // Card design matching the image
  return (
    <div 
      className="relative bg-gradient-to-br from-white/[0.05] to-white/[0.08] rounded-2xl p-5 cursor-pointer transition-all group shadow-lg shadow-black/30 hover:shadow-xl hover:shadow-primary/10 backdrop-blur-xl"
      onClick={() => onView(suite.id)}
    >
      {/* Menu Button */}
      <div className="absolute top-4 right-4">
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
            },
          ]}
          align="end"
          iconSize="h-4 w-4"
        />
      </div>

      {/* Card Content */}
      <div className="pr-8">
        {/* Title */}
        <h3 className="text-white group-hover:text-primary font-semibold text-base mb-2 truncate transition-colors">
          {suite.name}
        </h3>

        {/* Description */}
        <p className="text-white/50 text-sm mb-6 line-clamp-2">
          {suite.description || 'No description provided'}
        </p>
        {/* Divider */}
        <div className="w-full h-px bg-white/10 mb-6" />
        {/* Stats */}
        <div className="flex items-center justify-center gap-4 text-white/60 text-sm">
          <div className="flex items-center gap-2">
            <Edit className="w-4 h-4" />
            <span>{suite._count.testCases} cases</span>
          </div>
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4" />
            <span>{childrenCount} suites</span>
          </div>
        </div>
      </div>
    </div>
  );
}