'use client';

import { Button } from '@/elements/button';
import {
  ChevronRight,
  Folder,
  FolderOpen,
  TestTube2,
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
  isExpanded = false,
  onToggleExpand,
  onView,
  onDelete,
  canDelete = true,
  isChild = false,
}: TestSuiteCardProps) {
  const hasChildren = suite.children && suite.children.length > 0;

  if (isChild) {
    // Simplified card for child suites
    return (
      <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="text-primary flex-shrink-0">
            <Folder className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h4
              className="text-sm text-white font-medium cursor-pointer hover:text-primary transition-colors truncate"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onView(suite.id);
              }}
            >
              {suite.name}
            </h4>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-white/60 flex-shrink-0">
            <TestTube2 className="w-4 h-4" />
            <span>{suite._count.testCases} cases</span>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onView(suite.id);
            }}
            className="rounded-full border border-primary/30 text-primary hover:text-primary/80 hover:bg-primary/10"
            title="View Suite"
          >
            <FolderOpen className="w-4 h-4" />
          </Button>
          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onDelete(suite);
              }}
              className="rounded-full border border-red-400/30 text-red-400 hover:text-red-300 hover:bg-red-400/10"
              title="Delete Suite"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Full card for parent suites - single line design
  return (
    <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors group">
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        {/* Expand/Collapse Icon */}
        {hasChildren && (
          <button
            onClick={() => onToggleExpand?.(suite.id)}
            className="text-white/60 hover:text-white transition-colors flex-shrink-0 cursor-pointer"
          >
            <ChevronRight
              className={`w-4 h-4 transition-transform ${
                isExpanded ? 'rotate-90' : ''
              }`}
            />
          </button>
        )}

        {/* Folder Icon */}
        <div className="text-primary flex-shrink-0">
          {isExpanded ? (
            <FolderOpen className="w-5 h-5" />
          ) : (
            <Folder className="w-5 h-5" />
          )}
        </div>

        {/* Suite Info - Single Line */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h3
            className="text-sm text-white font-semibold cursor-pointer hover:text-primary transition-colors truncate"
            onClick={() => onView(suite.id)}
          >
            {suite.name}
          </h3>
          {suite.description && (
            <span className="text-xs text-white/60 truncate hidden md:block">
              {suite.description}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-white/60 flex-shrink-0">
          <div className="flex items-center gap-1">
            <TestTube2 className="w-4 h-4" />
            <span>{suite._count.testCases} cases</span>
          </div>
          {hasChildren && (
            <div className="flex items-center gap-1">
              <Folder className="w-4 h-4" />
              <span>{suite.children?.length} suites</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onView(suite.id)}
          className="rounded-full border border-primary/30 text-primary hover:text-primary/80 hover:bg-primary/10 h-8 w-8 cursor-pointer"
          title="View Suite"
        >
          <FolderOpen className="w-4 h-4" />
        </Button>
        {canDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(suite)}
            className="rounded-full border border-red-400/30 text-red-400 hover:text-red-300 hover:bg-red-400/10 h-8 w-8 cursor-pointer"
            title="Delete Suite"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
