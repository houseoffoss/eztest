'use client';

import { Badge } from '@/frontend/reusable-elements/badges/Badge';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/frontend/reusable-elements/hover-cards/HoverCard';
import { Trash2, Bug } from 'lucide-react';
import { GroupedDataTable, ColumnDef, ActionConfig } from '@/frontend/reusable-components/tables/GroupedDataTable';
import { TestCase, Module } from '@/frontend/components/testcase/types';
import { useDropdownOptions } from '@/hooks/useDropdownOptions';
import { getDynamicBadgeProps } from '@/lib/badge-color-utils';

interface TestSuiteTestCaseTableProps {
  testCases: TestCase[];
  modules?: Module[];
  onDelete?: (testCase: TestCase) => void;
  onClick: (testCaseId: string) => void;
  canDelete?: boolean;
}

/**
 * Test case table component specifically for test suite detail page
 * Uses the reusable GroupedDataTable component for consistent styling
 */
export function TestSuiteTestCaseTable({
  testCases,
  onDelete,
  onClick,
  canDelete = true,
}: TestSuiteTestCaseTableProps) {
  const { options: statusOptions } = useDropdownOptions('TestCase', 'status');
  const sortedTestCases = [...testCases].sort((a, b) => {
    const aRtc = (a.rtcId || '').trim();
    const bRtc = (b.rtcId || '').trim();

    // RTC-ID があるものを先にし、同士は数値考慮で昇順
    if (aRtc && bRtc) {
      const rtcCompare = aRtc.localeCompare(bRtc, undefined, { numeric: true, sensitivity: 'base' });
      if (rtcCompare !== 0) return rtcCompare;
    } else if (aRtc && !bRtc) {
      return -1;
    } else if (!aRtc && bRtc) {
      return 1;
    }

    // RTC-ID が同値/空の場合は安定化のため tcId で比較
    return (a.tcId || '').localeCompare(b.tcId || '', undefined, { numeric: true, sensitivity: 'base' });
  });

  // Define columns
  const columns: ColumnDef<TestCase>[] = [
    {
      key: 'title',
      label: 'TITLE',
      width: '360px',
      className: 'min-w-0',
      render: (row) => (
        <div className="min-w-0 flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <HoverCard openDelay={200}>
              <HoverCardTrigger asChild>
                <p className="text-sm font-medium text-white truncate cursor-pointer">
                  {row.title}
                </p>
              </HoverCardTrigger>
              {row.title && row.title.length > 40 && (
                <HoverCardContent side="top" className="w-80">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-white">テストケース名</h4>
                    <p className="text-sm text-white/80 break-words">{row.title}</p>
                    {row._count.defects > 0 && (
                      <div className="pt-2 border-t border-white/10">
                        <p className="text-xs text-red-400">
                          {row._count.defects} open defect{row._count.defects !== 1 ? 's' : ''}
                        </p>
                      </div>
                    )}
                  </div>
                </HoverCardContent>
              )}
            </HoverCard>
          </div>
          {row._count.defects > 0 && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-red-500/20 rounded border border-red-500/30 flex-shrink-0">
              <Bug className="w-3 h-3 text-red-400" />
              <span className="text-xs text-red-400 font-medium">{row._count.defects}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'STATUS',
      render: (row) => {
        const badgeProps = getDynamicBadgeProps(row.status, statusOptions);
        const label = statusOptions.find(opt => opt.value === row.status)?.label || row.status;
        return (
          <Badge
            variant="outline"
            className={`w-fit text-xs px-2 py-0.5 ${badgeProps.className}`}
            style={badgeProps.style}
          >
            {label}
          </Badge>
        );
      },
    },
    {
      key: 'runs',
      label: 'RUNS',
      width: '70px',
      render: (row) => (
        <span className="text-xs text-white/60">{row._count.results}</span>
      ),
    },
  ];

  // Action configuration
  const actions: ActionConfig<TestCase> | undefined =
    onDelete && canDelete
      ? {
          items: [
            {
              label: 'Delete',
              icon: Trash2,
              onClick: onDelete,
              variant: 'destructive',
              buttonName: (row) => `Test Suite Test Case Table - Delete (${row.tcId || row.title})`,
            },
          ],
          align: 'end',
          iconSize: 'w-3 h-3',
        }
      : undefined;

  return (
    <GroupedDataTable
      data={sortedTestCases}
      columns={columns}
      onRowClick={(row) => onClick(row.id)}
      grouped={false}
      actions={actions}
      gridTemplateColumns="360px 1fr 70px 40px"
      emptyMessage="No test cases available"
    />
  );
}
