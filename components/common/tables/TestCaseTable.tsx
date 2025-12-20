'use client';

import { useState } from 'react';
import { Badge } from '@/elements/badge';
import { Button } from '@/elements/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/elements/dropdown-menu';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/elements/hover-card';
import { MoreVertical, Trash2, ChevronDown, Bug } from 'lucide-react';
import { PriorityBadge } from '@/components/design/PriorityBadge';
import { TestCase, Module } from '@/frontend/components/testcase/types';
import { useRouter } from 'next/navigation';

interface TestCaseTableProps {
  testCases: TestCase[];
  groupedByModule?: boolean;
  modules?: Module[];
  onDelete?: (testCase: TestCase) => void;
  onClick: (testCaseId: string) => void;
  canDelete?: boolean;
  projectId?: string;
  enableModuleLink?: boolean;
}

/**
 * Reusable test case table component with module grouping and collapsible sections
 * 
 * @example
 * // Basic usage
 * <TestCaseTable
 *   testCases={testCases}
 *   onClick={(id) => router.push(`/testcases/${id}`)}
 * />
 * 
 * @example
 * // With module grouping and actions
 * <TestCaseTable
 *   testCases={testCases}
 *   groupedByModule={true}
 *   modules={modules}
 *   onClick={handleClick}
 *   onDelete={handleDelete}
 *   canDelete={true}
 *   projectId={projectId}
 *   enableModuleLink={true}
 * />
 */
export function TestCaseTable({
  testCases,
  groupedByModule = false,
  modules = [],
  onDelete,
  onClick,
  canDelete = true,
  projectId,
  enableModuleLink = false,
}: TestCaseTableProps) {
  const router = useRouter();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(groupId)) {
        newExpanded.delete(groupId);
      } else {
        newExpanded.add(groupId);
      }
      return newExpanded;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'DRAFT':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'DEPRECATED':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  // Group test cases by module
  const groupedCases = groupedByModule
    ? (() => {
        const groups = testCases.reduce((acc, testCase) => {
          const groupId = testCase.moduleId || 'no-module';
          const groupName = testCase.module?.name || 'Ungrouped';

          if (!acc[groupId]) {
            acc[groupId] = {
              groupName,
              testCases: [],
              totalCount: 0,
            };
          }

          acc[groupId].testCases.push(testCase);
          return acc;
        }, {} as Record<string, { groupName: string; testCases: TestCase[]; totalCount?: number }>);

        // Add empty modules if modules prop is provided and set total counts from module data
        if (modules && modules.length > 0) {
          modules.forEach((module) => {
            if (!groups[module.id]) {
              groups[module.id] = {
                groupName: module.name,
                testCases: [],
                totalCount: module._count?.testCases || 0,
              };
            } else {
              // Set total count from module data if available
              groups[module.id].totalCount = module._count?.testCases || groups[module.id].testCases.length;
            }
          });
        }

        // For groups not in modules list (like 'no-module'), set totalCount to actual length
        Object.keys(groups).forEach((groupId) => {
          if (groups[groupId].totalCount === 0) {
            groups[groupId].totalCount = groups[groupId].testCases.length;
          }
        });

        return groups;
      })()
    : null;

  return (
    <div className="space-y-2">
      {/* Header Row */}
      <div
        className="grid gap-3 px-3 py-1.5 text-xs font-semibold text-white/60 border-b border-white/10"
        style={{ gridTemplateColumns: '80px 1fr 110px 100px 150px 80px 50px' }}
      >
        <div>ID</div>
        <div>TITLE</div>
        <div>PRIORITY</div>
        <div>STATUS</div>
        <div>OWNER</div>
        <div>RUNS</div>
        <div></div>
      </div>

      {/* Test Case Rows */}
      {groupedCases ? (
        // Grouped by module with collapsible dropdowns
        Object.entries(groupedCases).map(([groupId, { groupName, testCases: cases, totalCount }]) => {
          const isExpanded = expandedGroups.has(groupId);
          const displayCount = totalCount !== undefined ? totalCount : cases.length;
          return (
            <div key={groupId} className="space-y-1">
              {/* Group Header - Collapsible */}
              <div className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 border-b border-white/10 rounded transition-colors">
                <button
                  onClick={() => toggleGroup(groupId)}
                  className="flex items-center gap-2 flex-1 text-left cursor-pointer"
                >
                  <ChevronDown
                    className={`w-4 h-4 text-white/60 transition-transform flex-shrink-0 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                  {enableModuleLink && groupId !== 'no-module' && projectId ? (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/projects/${projectId}/modules/${groupId}`);
                      }}
                      className="text-sm font-semibold text-blue-400 hover:text-blue-300 cursor-pointer"
                    >
                      {groupName}
                    </span>
                  ) : (
                    <span className="text-sm font-semibold text-white/80">{groupName}</span>
                  )}
                </button>
                <span className="text-xs text-white/50">
                  ({displayCount} test case{displayCount !== 1 ? 's' : ''})
                </span>
              </div>

              {/* Test Cases - Hidden when collapsed */}
              {isExpanded && cases.length > 0 && (
                <div className="space-y-0.5">
                  {cases.map((testCase) => (
                    <div
                      key={testCase.id}
                      className="grid gap-3 px-3 py-1.5 rounded hover:bg-white/5 border-b border-white/10 hover:border-blue-500/30 cursor-pointer transition-colors items-center text-sm"
                      style={{ gridTemplateColumns: '80px 1fr 110px 100px 150px 80px 50px' }}
                      onClick={() => onClick(testCase.id)}
                    >
                      {/* ID Column */}
                      <div>
                        <p className="text-xs font-mono text-white/70 truncate">{testCase.tcId}</p>
                      </div>

                      {/* Title Column */}
                      <div className="min-w-0">
                        <HoverCard openDelay={200}>
                          <HoverCardTrigger asChild>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-white truncate cursor-pointer">
                                {testCase.title}
                              </p>
                              {testCase._count.defects > 0 && (
                                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-red-500/20 rounded border border-red-500/30 flex-shrink-0">
                                  <Bug className="w-3 h-3 text-red-400" />
                                  <span className="text-xs text-red-400 font-medium">{testCase._count.defects}</span>
                                </div>
                              )}
                            </div>
                          </HoverCardTrigger>
                          {testCase.title && testCase.title.length > 40 && (
                            <HoverCardContent side="top" className="w-80">
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-white">Test Case Title</h4>
                                <p className="text-sm text-white/80 break-words">{testCase.title}</p>
                                {testCase._count.defects > 0 && (
                                  <div className="pt-2 border-t border-white/10">
                                    <p className="text-xs text-red-400">
                                      {testCase._count.defects} open defect{testCase._count.defects !== 1 ? 's' : ''}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </HoverCardContent>
                          )}
                        </HoverCard>
                      </div>

                      {/* Priority Column */}
                      <div>
                        <PriorityBadge
                          priority={
                            testCase.priority.toLowerCase() as
                              | 'low'
                              | 'medium'
                              | 'high'
                              | 'critical'
                          }
                        />
                      </div>

                      {/* Status Column */}
                      <div>
                        <Badge
                          variant="outline"
                          className={`w-fit text-xs px-2 py-0.5 ${getStatusColor(testCase.status)}`}
                        >
                          {testCase.status}
                        </Badge>
                      </div>

                      {/* Owner Column */}
                      <div className="min-w-0">
                        <HoverCard openDelay={200}>
                          <HoverCardTrigger asChild>
                            <span className="text-xs text-white/70 truncate block cursor-pointer">
                              {testCase.createdBy.name}
                            </span>
                          </HoverCardTrigger>
                          {testCase.createdBy.name && testCase.createdBy.name.length > 20 && (
                            <HoverCardContent side="top" className="w-60">
                              <div className="space-y-1">
                                <h4 className="text-xs font-semibold text-white/60">Owner</h4>
                                <p className="text-sm text-white/90">{testCase.createdBy.name}</p>
                              </div>
                            </HoverCardContent>
                          )}
                        </HoverCard>
                      </div>

                      {/* Runs Column */}
                      <div>
                        <span className="text-xs text-white/60">{testCase._count.results}</span>
                      </div>

                      {/* Actions Column */}
                      <div className="flex justify-end">
                        {onDelete && canDelete && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-white/70 hover:text-white hover:bg-white/10 h-5 w-5 p-0 cursor-pointer"
                              >
                                <MoreVertical className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent  align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDelete(testCase);
                                }}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      ) : (
        // Ungrouped - show all test cases
        testCases.map((testCase) => (
          <div
            key={testCase.id}
            className="grid gap-3 px-3 py-1.5 rounded hover:bg-white/5 border-b border-white/10 hover:border-blue-500/30 cursor-pointer transition-colors items-center text-sm"
            style={{ gridTemplateColumns: '80px 1fr 110px 100px 150px 80px 50px' }}
            onClick={() => onClick(testCase.id)}
          >
            {/* ID Column */}
            <div>
              <p className="text-xs font-mono text-white/70 truncate">{testCase.tcId}</p>
            </div>

            {/* Title Column */}
            <div className="min-w-0">
              <HoverCard openDelay={200}>
                <HoverCardTrigger asChild>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white truncate cursor-pointer">
                      {testCase.title}
                    </p>
                    {testCase._count.defects > 0 && (
                      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-red-500/20 rounded border border-red-500/30 flex-shrink-0">
                        <Bug className="w-3 h-3 text-red-400" />
                        <span className="text-xs text-red-400 font-medium">{testCase._count.defects}</span>
                      </div>
                    )}
                  </div>
                </HoverCardTrigger>
                {testCase.title && testCase.title.length > 40 && (
                  <HoverCardContent side="top" className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-white">Test Case Title</h4>
                      <p className="text-sm text-white/80 break-words">{testCase.title}</p>
                      {testCase._count.defects > 0 && (
                        <div className="pt-2 border-t border-white/10">
                          <p className="text-xs text-red-400">
                            {testCase._count.defects} open defect{testCase._count.defects !== 1 ? 's' : ''}
                          </p>
                        </div>
                      )}
                    </div>
                  </HoverCardContent>
                )}
              </HoverCard>
            </div>

            {/* Priority Column */}
            <div>
              <PriorityBadge
                priority={
                  testCase.priority.toLowerCase() as 'low' | 'medium' | 'high' | 'critical'
                }
              />
            </div>

            {/* Status Column */}
            <div>
              <Badge
                variant="outline"
                className={`w-fit text-xs px-2 py-0.5 ${getStatusColor(testCase.status)}`}
              >
                {testCase.status}
              </Badge>
            </div>

            {/* Owner Column */}
            <div className="min-w-0">
              <HoverCard openDelay={200}>
                <HoverCardTrigger asChild>
                  <span className="text-xs text-white/70 truncate block cursor-pointer">
                    {testCase.createdBy.name}
                  </span>
                </HoverCardTrigger>
                {testCase.createdBy.name && testCase.createdBy.name.length > 20 && (
                  <HoverCardContent side="top" className="w-60">
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold text-white/60">Owner</h4>
                      <p className="text-sm text-white/90">{testCase.createdBy.name}</p>
                    </div>
                  </HoverCardContent>
                )}
              </HoverCard>
            </div>

            {/* Runs Column */}
            <div>
              <span className="text-xs text-white/60">{testCase._count.results}</span>
            </div>

            {/* Actions Column */}
            <div className="flex justify-end">
              {onDelete && canDelete && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white/70 hover:text-white hover:bg-white/10 h-5 w-5 p-0 cursor-pointer"
                    >
                      <MoreVertical className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent variant="glass" align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(testCase);
                      }}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
