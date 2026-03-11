'use client';

import { Badge } from '@/frontend/reusable-elements/badges/Badge';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/frontend/reusable-elements/hover-cards/HoverCard';
import { Trash2, Bug } from 'lucide-react';
import { GroupedDataTable, ColumnDef, GroupConfig, ActionConfig } from '@/frontend/reusable-components/tables/GroupedDataTable';
import { TestCase, Module } from '../types';
import { useRouter } from 'next/navigation';
import { useDropdownOptions } from '@/hooks/useDropdownOptions';
import { getDynamicBadgeProps } from '@/lib/badge-color-utils';
import { Checkbox } from '@/frontend/reusable-elements/checkboxes/Checkbox';

interface TestCaseTableProps {
  testCases: TestCase[];
  groupedByModule?: boolean;
  modules?: Module[];
  onDelete?: (testCase: TestCase) => void;
  onClick: (testCaseId: string) => void;
  canDelete?: boolean;
  projectId?: string;
  enableModuleLink?: boolean;
  selectedTestCases?: Set<string>;
  onSelectTestCase?: (testCaseId: string) => void;
  onSelectAll?: (selected: boolean) => void;
  showSelection?: boolean;
}

/**
 * Test case table component with module grouping and collapsible sections
 * Uses the reusable GroupedDataTable component internally
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
  selectedTestCases = new Set<string>(),
  onSelectTestCase,
  onSelectAll,
  showSelection = false,
}: TestCaseTableProps) {
  const router = useRouter();
  const { options: statusOptions } = useDropdownOptions('TestCase', 'status');
  const isSelectionEnabled = showSelection && Boolean(onSelectTestCase) && Boolean(onSelectAll);
  const allSelected = testCases.length > 0 && testCases.every((testCase) => selectedTestCases.has(testCase.id));
  const someSelected = testCases.some((testCase) => selectedTestCases.has(testCase.id)) && !allSelected;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // Define columns
  const columns: ColumnDef<TestCase>[] = [
    ...(isSelectionEnabled ? [{
      key: 'select',
      label: (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={allSelected}
            onCheckedChange={(checked) => onSelectAll?.(checked === true)}
            aria-label="すべてのテストケースを選択"
            className={someSelected ? 'data-[state=checked]:bg-primary/50' : ''}
          />
        </div>
      ),
      width: '40px',
      align: 'center' as const,
      render: (row: TestCase) => (
        <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={selectedTestCases.has(row.id)}
            onCheckedChange={() => onSelectTestCase?.(row.id)}
            aria-label={`テストケース ${row.tcId || row.title} を選択`}
          />
        </div>
      ),
    }] : []),
    {
      key: 'title',
      label: 'TITLE',
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
      width: '70px',
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
      key: 'flowId',
      label: 'FLOW-ID',
      width: '80px',
      render: (row) => (
        <span className="text-xs text-white/70 truncate">{row.flowId || '-'}</span>
      ),
    },
    {
      key: 'platform',
      label: 'プラットフォーム',
      width: '100px',
      render: (row) => (
        <span className="text-xs text-white/70 truncate">{row.platform || '-'}</span>
      ),
    },
    {
      key: 'executionType',
      label: '実行方式',
      width: '80px',
      render: (row) => (
        <span className="text-xs text-white/70 truncate">{row.executionType || '-'}</span>
      ),
    },
    {
      key: 'automationStatus',
      label: '自動化状況',
      width: '100px',
      render: (row) => (
        <span className="text-xs text-white/70 truncate">{row.automationStatus || '-'}</span>
      ),
    },
    {
      key: 'device',
      label: '端末',
      width: '80px',
      render: (row) => (
        <span className="text-xs text-white/70 truncate">{row.device || '-'}</span>
      ),
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

  // Group configuration
  const groupConfig: GroupConfig<TestCase> | undefined = groupedByModule
    ? {
        getGroupId: (row) => row.moduleId || 'no-module',
        getGroupName: (groupId) => {
          if (groupId === 'no-module') return 'Ungrouped';
          const moduleItem = modules.find((m) => m.id === groupId);
          return moduleItem?.name || 'Ungrouped';
        },
        getGroupCount: (groupId) => {
          const moduleItem = modules.find((m) => m.id === groupId);
          return moduleItem?._count?.testCases;
        },
        onGroupClick: enableModuleLink && projectId
          ? (groupId) => {
              if (groupId !== 'no-module') {
                router.push(`/projects/${projectId}/modules/${groupId}`);
              }
            }
          : undefined,
        emptyGroups: modules.map((moduleItem) => ({
          id: moduleItem.id,
          name: moduleItem.name,
          count: moduleItem._count?.testCases,
        })),
      }
    : undefined;

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
              buttonName: (row) => `Test Case Table - Delete (${row.tcId || row.title})`,
            },
          ],
          align: 'end',
          iconSize: 'w-3 h-3',
        }
      : undefined;

  return (
    <GroupedDataTable
      data={testCases}
      columns={columns}
      onRowClick={(row) => onClick(row.id)}
      grouped={groupedByModule}
      groupConfig={groupConfig}
      actions={actions}
      gridTemplateColumns={
        isSelectionEnabled
          ? '40px minmax(900px, 6fr) 70px 80px 100px 80px 100px 80px 70px 40px'
          : 'minmax(900px, 6fr) 70px 80px 100px 80px 100px 80px 70px 40px'
      }
      emptyMessage="No test cases available"
    />
  );
}
