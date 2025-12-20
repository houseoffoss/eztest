'use client';

import { Button } from '@/elements/button';
import {
  Edit,
  Folder,
  MoreVertical,
  Trash2,
} from 'lucide-react';
import { TestSuite } from '../types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/elements/dropdown-menu';

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
  const childrenCount = suite.children?.length || 0;

  // Card design matching the image
  return (
    <div 
      className="relative bg-gradient-to-br from-white/[0.05] to-white/[0.08] rounded-2xl p-5 cursor-pointer transition-all group shadow-lg shadow-black/30 hover:shadow-xl hover:shadow-primary/10 backdrop-blur-xl"
      onClick={() => onView(suite.id)}
    >
      {/* Menu Button */}
      <div className="absolute top-4 right-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onView(suite.id);
              }}
              className="cursor-pointer"
            >
              <Edit className="mr-2 h-4 w-4" />
              View / Edit
            </DropdownMenuItem>
            {canDelete && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(suite);
                }}
                className="cursor-pointer text-red-400 focus:text-red-400"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
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