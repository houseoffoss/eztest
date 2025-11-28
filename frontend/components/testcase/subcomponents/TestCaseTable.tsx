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
import { TestCase } from '../types';

interface TestCaseTableProps {
  testCases: TestCase[];
  groupedByTestSuite?: boolean;
  onDelete: (testCase: TestCase) => void;
  onClick: (testCaseId: string) => void;
  canDelete?: boolean;
}

export function TestCaseTable({ testCases, groupedByTestSuite = false, onDelete, onClick, canDelete = true }: TestCaseTableProps) {
  const [expandedSuites, setExpandedSuites] = useState<Set<string>>(new Set());

  const toggleSuite = (suiteId: string) => {
    const newExpanded = new Set(expandedSuites);
    if (newExpanded.has(suiteId)) {
      newExpanded.delete(suiteId);
    } else {
      newExpanded.add(suiteId);
    }
    setExpandedSuites(newExpanded);
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

  // If grouped by test suite, organize test cases
  const groupedCases = groupedByTestSuite
    ? testCases.reduce((acc, testCase) => {
        const suiteId = testCase.suiteId || 'no-suite';
        const suiteName = testCase.suite?.name || 'Ungrouped';
        
        if (!acc[suiteId]) {
          acc[suiteId] = {
            suiteName,
            testCases: [],
          };
        }
        
        acc[suiteId].testCases.push(testCase);
        return acc;
      }, {} as Record<string, { suiteName: string; testCases: TestCase[] }>)
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
        // Grouped by test suite with collapsible dropdowns
        Object.entries(groupedCases).map(([suiteId, { suiteName, testCases: cases }]) => {
          const isExpanded = expandedSuites.has(suiteId);
          return (
            <div key={suiteId} className="space-y-1">
              {/* Suite Header - Collapsible */}
              <button
                onClick={() => toggleSuite(suiteId)}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 border-b border-white/10 rounded transition-colors text-left cursor-pointer"
              >
                <ChevronDown
                  className={`w-4 h-4 text-white/60 transition-transform flex-shrink-0 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
                <span className="text-sm font-semibold text-white/80">
                  {suiteName}
                </span>
                <span className="text-xs text-white/50 ml-auto">
                  ({cases.length} test case{cases.length !== 1 ? 's' : ''})
                </span>
              </button>

              {/* Test Cases - Hidden when collapsed */}
              {isExpanded && (
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
        ))
      )}
    </div>
  );
}
