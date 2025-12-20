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
import { MoreVertical, Trash2, ChevronDown } from 'lucide-react';
import { PriorityBadge } from '@/components/design/PriorityBadge';
import { TestCase, Module } from '../types';
import { useRouter } from 'next/navigation';

interface TestCaseTableProps {
  testCases: TestCase[];
  groupedByTestSuite?: boolean;
  groupedByModule?: boolean;
  modules?: Module[];
  onDelete: (testCase: TestCase) => void;
  onClick: (testCaseId: string) => void;
  canDelete?: boolean;
  projectId?: string;
  enableModuleLink?: boolean;
}

export function TestCaseTable({ testCases, groupedByTestSuite = false, groupedByModule = false, modules = [], onDelete, onClick, canDelete = true, projectId, enableModuleLink = false }: TestCaseTableProps) {
  const router = useRouter();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
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

  // Group by module or test suite
  const groupedCases = groupedByModule
    ? (() => {
        // First, create groups from test cases
        const groups = testCases.reduce((acc, testCase) => {
          const groupId = testCase.moduleId || 'no-module';
          const groupName = testCase.module?.name || 'Ungrouped';
          
          if (!acc[groupId]) {
            acc[groupId] = {
              groupName,
              testCases: [],
            };
          }
          
          acc[groupId].testCases.push(testCase);
          return acc;
        }, {} as Record<string, { groupName: string; testCases: TestCase[] }>);
        
        // Then, add empty modules if modules prop is provided
        if (modules && modules.length > 0) {
          modules.forEach(module => {
            if (!groups[module.id]) {
              groups[module.id] = {
                groupName: module.name,
                testCases: [],
              };
            }
          });
        }
        
        return groups;
      })()
    : groupedByTestSuite
    ? testCases.reduce((acc, testCase) => {
        const groupId = testCase.suiteId || 'no-suite';
        const groupName = testCase.suite?.name || 'Ungrouped';
        
        if (!acc[groupId]) {
          acc[groupId] = {
            groupName,
            testCases: [],
          };
        }
        
        acc[groupId].testCases.push(testCase);
        return acc;
      }, {} as Record<string, { groupName: string; testCases: TestCase[] }>)
    : null;

  return (
    <div className="space-y-2">
      {/* Header Row */}
      <div className="grid grid-cols-12 gap-3 px-3 py-1.5 text-xs font-semibold text-white/60 border-b border-white/10">
        <div className="col-span-1">ID</div>
        <div className="col-span-5">TITLE</div>
        <div className="col-span-1">PRIORITY</div>
        <div className="col-span-1">STATUS</div>
        <div className="col-span-2">OWNER</div>
        <div className="col-span-1">RUNS</div>
        <div className="col-span-1"></div>
      </div>

      {/* Test Case Rows */}
      {groupedCases ? (
        // Grouped by module or test suite with collapsible dropdowns
        Object.entries(groupedCases).map(([groupId, { groupName, testCases: cases }]) => {
          const isExpanded = expandedGroups.has(groupId);
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
                  {enableModuleLink && groupedByModule && groupId !== 'no-module' && projectId ? (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/projects/${projectId}/modules/${groupId}`);
                      }}
                      className="text-sm font-semibold text-blue-400 hover:text-blue-300 cursor-pointer hover:underline"
                    >
                      {groupName}
                    </span>
                  ) : (
                    <span className="text-sm font-semibold text-white/80">
                      {groupName}
                    </span>
                  )}
                </button>
                <span className="text-xs text-white/50">
                  ({cases.length} test case{cases.length !== 1 ? 's' : ''})
                </span>
              </div>

              {/* Test Cases - Hidden when collapsed */}
              {isExpanded && cases.length > 0 && (
                <div className="space-y-0.5 pl-3">
                  {cases.map((testCase) => (
                    <div
                      key={testCase.id}
                      className="grid grid-cols-12 gap-3 px-3 py-1.5 rounded hover:bg-white/5 border-b border-white/10 hover:border-blue-500/30 cursor-pointer transition-colors items-center text-sm"
                      onClick={() => onClick(testCase.id)}
                    >
                      {/* ID Column */}
                      <div className="col-span-1">
                        <p className="text-xs font-mono text-white/70 truncate">
                          {testCase.tcId}
                        </p>
                      </div>

                      {/* Title Column */}
                      <div className="col-span-5">
                        <p className="text-sm font-medium text-white truncate">
                          {testCase.title}
                        </p>
                      </div>

                      {/* Priority Column */}
                      <div className="col-span-1">
                        <div className="scale-90 origin-left">
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
                      </div>

                      {/* Status Column */}
                      <div className="col-span-1">
                        <div className="scale-90 origin-left">
                          <Badge
                            variant="outline"
                            className={`w-fit text-xs px-1.5 py-0.5 ${getStatusColor(testCase.status)}`}
                          >
                            {testCase.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Owner Column */}
                      <div className="col-span-2">
                        <span className="text-xs text-white/70 truncate">
                          {testCase.createdBy.name}
                        </span>
                      </div>

                      {/* Runs Column */}
                      <div className="col-span-1">
                        <span className="text-xs text-white/60">
                          {testCase._count.results}
                        </span>
                      </div>

                      {/* Actions Column */}
                      <div className="col-span-1 flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            asChild
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-white/70 hover:text-white hover:bg-white/10 h-5 w-5 p-0 cursor-pointer"
                            >
                              <MoreVertical className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent variant="glass" align="end">
                            {canDelete && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDelete(testCase);
                                }}
                                className="text-red-400 hover:bg-red-400/10"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state when expanded but no test cases */}
              {isExpanded && cases.length === 0 && (
                <div className="pl-6 py-4 text-sm text-white/50 italic">
                  No test cases in this module yet
                </div>
              )}
            </div>
          );
        })
      ) : (
        // Ungrouped
        testCases.map((testCase) => (
          <div
            key={testCase.id}
            className="grid grid-cols-12 gap-3 px-3 py-1.5 rounded hover:bg-white/5 border-b border-white/10 hover:border-blue-500/30 cursor-pointer transition-colors items-center text-sm"
            onClick={() => onClick(testCase.id)}
          >
            {/* ID Column */}
            <div className="col-span-1">
              <p className="text-xs font-mono text-white/70 truncate">
                {testCase.tcId}
              </p>
            </div>

            {/* Title Column */}
            <div className="col-span-5">
              <p className="text-sm font-medium text-white truncate">
                {testCase.title}
              </p>
            </div>

            {/* Priority Column */}
            <div className="col-span-1">
              <div className="scale-90 origin-left">
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
            </div>

            {/* Status Column */}
            <div className="col-span-1">
              <div className="scale-90 origin-left">
                <Badge
                  variant="outline"
                  className={`w-fit text-xs px-1.5 py-0.5 ${getStatusColor(testCase.status)}`}
                >
                  {testCase.status}
                </Badge>
              </div>
            </div>

            {/* Owner Column */}
            <div className="col-span-2">
              <span className="text-xs text-white/70 truncate">
                {testCase.createdBy.name}
              </span>
            </div>

            {/* Runs Column */}
            <div className="col-span-1">
              <span className="text-xs text-white/60">
                {testCase._count.results}
              </span>
            </div>

            {/* Actions Column */}
            <div className="col-span-1 flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger
                  asChild
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/70 hover:text-white hover:bg-white/10 h-5 w-5 p-0 cursor-pointer"
                  >
                    <MoreVertical className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent variant="glass" align="end">
                  {canDelete && (
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
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
