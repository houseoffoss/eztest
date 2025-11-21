'use client';

import { Card, CardContent } from '@/elements/card';
import { Button } from '@/elements/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/elements/dropdown-menu';
import {
  ChevronRight,
  Folder,
  FolderOpen,
  MoreVertical,
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
      <Card variant="glass" className="hover:border-primary/50 transition-colors">
        <CardContent className="p-2">
          <div className="flex items-center gap-2">
            <div className="text-primary flex-shrink-0">
              <Folder className="w-3 h-3" />
            </div>
            <div className="flex-1 min-w-0">
              <h4
                className="text-xs text-white font-medium cursor-pointer hover:text-primary transition-colors"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onView(suite.id);
                }}
              >
                {suite.name}
              </h4>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
              <TestTube2 className="w-3 h-3" />
              <span>{suite._count.testCases}</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10 p-1 h-auto">
                  <MoreVertical className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent variant="glass" align="end">
                <DropdownMenuItem
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    onView(suite.id);
                  }}
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  View Suite
                </DropdownMenuItem>
                {canDelete && (
                  <DropdownMenuItem
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      onDelete(suite);
                    }}
                    className="text-red-400"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full card for parent suites
  return (
    <Card variant="glass" className="hover:border-primary/50 transition-colors">
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          {/* Expand/Collapse Icon */}
          {hasChildren && (
            <button
              onClick={() => onToggleExpand?.(suite.id)}
              className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
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
              <FolderOpen className="w-4 h-4" />
            ) : (
              <Folder className="w-4 h-4" />
            )}
          </div>

          {/* Suite Info */}
          <div className="flex-1 min-w-0">
            <h3
              className="text-sm text-white font-medium cursor-pointer hover:text-primary transition-colors"
              onClick={() => onView(suite.id)}
            >
              {suite.name}
            </h3>
            {suite.description && (
              <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                {suite.description}
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-gray-400 flex-shrink-0">
            <div className="flex items-center gap-1">
              <TestTube2 className="w-3 h-3" />
              <span>{suite._count.testCases}</span>
            </div>
            {hasChildren && (
              <div className="flex items-center gap-1">
                <Folder className="w-3 h-3" />
                <span>{suite.children?.length}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e: React.MouseEvent) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10 p-1 h-auto">
                <MoreVertical className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent variant="glass" align="end">
              <DropdownMenuItem
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onView(suite.id);
                }}
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                View Suite
              </DropdownMenuItem>
              {canDelete && (
                <DropdownMenuItem
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    onDelete(suite);
                  }}
                  className="text-red-400"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
