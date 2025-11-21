'use client';

import { Badge } from '@/elements/badge';
import { Button } from '@/elements/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/elements/dropdown-menu';
import { CheckCircle2, MoreVertical, Trash2 } from 'lucide-react';
import { TestCase } from '../types';

interface TestCaseTableProps {
  testCases: TestCase[];
  groupedByTestSuite?: boolean;
  onDelete: (testCase: TestCase) => void;
  onClick: (testCaseId: string) => void;
  canDelete?: boolean;
}

export function TestCaseTable({ testCases, groupedByTestSuite = false, onDelete, onClick, canDelete = true }: TestCaseTableProps) {
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
    <div className="space-y-4">
      {/* Header Row */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-semibold text-white/70 border-b border-white/10">
        <div className="col-span-6">TITLE</div>
        <div className="col-span-3">OWNER</div>
        <div className="col-span-2">LAST RESULTS</div>
        <div className="col-span-1"></div>
      </div>

      {/* Test Case Rows */}
      {groupedCases ? (
        // Grouped by test suite
        Object.entries(groupedCases).map(([suiteId, { suiteName, testCases: cases }]) => (
          <div key={suiteId} className="space-y-3">
            <h3 className="text-sm font-semibold text-white/70 px-4 py-2 bg-white/5 rounded">
              {suiteName}
            </h3>
            <div className="space-y-2 pl-4">
              {cases.map((testCase) => (
                <div
                  key={testCase.id}
                  className="grid grid-cols-12 gap-4 px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/50 cursor-pointer transition-colors items-center"
                  onClick={() => onClick(testCase.id)}
                >
                  {/* Title Column */}
                  <div className="col-span-6">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-semibold text-white truncate">
                        {testCase.title}
                      </p>
                      <Badge
                        variant="outline"
                        className={`w-fit text-xs ${getStatusColor(testCase.status)}`}
                      >
                        {testCase.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Owner Column */}
                  <div className="col-span-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-semibold text-white">
                        {testCase.createdBy.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-white/70 truncate">
                        {testCase.createdBy.name}
                      </span>
                    </div>
                  </div>

                  {/* Last Results Column */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-1">
                      {testCase._count.results > 0 ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-white/70">
                            {testCase._count.results} runs
                          </span>
                        </>
                      ) : (
                        <span className="text-sm text-white/50">No runs</span>
                      )}
                    </div>
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
                          className="text-white/70 hover:text-white hover:bg-white/10 h-6 w-6 p-0"
                        >
                          <MoreVertical className="w-4 h-4" />
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
          </div>
        ))
      ) : (
        // Ungrouped
        testCases.map((testCase) => (
          <div
            key={testCase.id}
            className="grid grid-cols-12 gap-4 px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/50 cursor-pointer transition-colors items-center"
            onClick={() => onClick(testCase.id)}
          >
            {/* Title Column */}
            <div className="col-span-6">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-white truncate">
                  {testCase.title}
                </p>
                <Badge
                  variant="outline"
                  className={`w-fit text-xs ${getStatusColor(testCase.status)}`}
                >
                  {testCase.status}
                </Badge>
              </div>
            </div>

            {/* Owner Column */}
            <div className="col-span-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-semibold text-white">
                  {testCase.createdBy.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-white/70 truncate">
                  {testCase.createdBy.name}
                </span>
              </div>
            </div>

            {/* Last Results Column */}
            <div className="col-span-2">
              <div className="flex items-center gap-1">
                {testCase._count.results > 0 ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-white/70">
                      {testCase._count.results} runs
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-white/50">No runs</span>
                )}
              </div>
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
                    className="text-white/70 hover:text-white hover:bg-white/10 h-6 w-6 p-0"
                  >
                    <MoreVertical className="w-4 h-4" />
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
