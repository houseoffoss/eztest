'use client';

import { ButtonPrimary } from '@/elements/button-primary';
import { ButtonSecondary } from '@/elements/button-secondary';
import { DetailCard } from '@/components/design/DetailCard';
import { DataTable, type ColumnDef } from '@/components/design/DataTable';
import { Button } from '@/elements/button';
import { Badge } from '@/elements/badge';
import { Plus, FolderOpen, Trash2, TestTube2 } from 'lucide-react';
import { PriorityBadge } from '@/components/design/PriorityBadge';
import { TestCase } from '../../types';

interface ModuleTestCasesCardProps {
  testCases: TestCase[];
  testCasesCount: number;
  onCreateClick: () => void;
  onAddExistingClick: () => void;
  onTestCaseClick: (testCaseId: string) => void;
  onDeleteClick: (testCase: TestCase) => void;
  canCreate: boolean;
  canDelete: boolean;
}

export function ModuleTestCasesCard({
  testCases,
  testCasesCount,
  onCreateClick,
  onAddExistingClick,
  onTestCaseClick,
  onDeleteClick,
  canCreate,
  canDelete,
}: ModuleTestCasesCardProps) {
  const columns: ColumnDef<TestCase>[] = [
    {
      key: 'title',
      label: 'Title',
      render: (_, row: TestCase) => (
        <div className="min-w-0">
          <p className="font-medium text-white/90 truncate">{row.title}</p>
          {row.description && (
            <p className="text-xs text-white/60 line-clamp-1 mt-1">
              {row.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (_, row: TestCase) => (
        <PriorityBadge
          priority={
            row.priority.toLowerCase() as
              | 'low'
              | 'medium'
              | 'high'
              | 'critical'
          }
        />
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_, row: TestCase) => (
        <Badge
          variant="outline"
          className={
            row.status === 'ACTIVE'
              ? 'bg-green-500/10 text-green-500 border-green-500/20'
              : row.status === 'DRAFT'
              ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
              : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
          }
        >
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'id',
      label: 'Steps',
      render: (_, row: TestCase) => <span className="text-white/70">{row._count.steps}</span>,
      align: 'right',
    },
    {
      key: 'id',
      label: 'Runs',
      render: (_, row: TestCase) => <span className="text-white/70">{row._count.results}</span>,
      align: 'right',
    },
  ];

  if (canDelete) {
    columns.push({
      key: 'id',
      label: 'Actions',
      render: (_, row: TestCase) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteClick(row);
          }}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      ),
      align: 'right',
    });
  }

  const headerAction = canCreate && testCases.length > 0 ? (
    <ButtonPrimary size="sm" onClick={onCreateClick}>
      <Plus className="w-4 h-4 mr-2" />
      Create
    </ButtonPrimary>
  ) : undefined;

  return (
    <DetailCard title={`Test Cases (${testCasesCount})`} headerAction={headerAction} contentClassName="">
      {testCases && testCases.length > 0 ? (
        <DataTable
          columns={columns}
          data={testCases}
          onRowClick={(row) => onTestCaseClick((row as TestCase).id)}
          rowClassName="cursor-pointer hover:bg-white/5"
          emptyMessage="No test cases in this module"
        />
      ) : (
        <div className="text-center py-8">
          <TestTube2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-white/60 mb-4">
            No test cases in this module yet
          </p>
          {canCreate && (
            <ButtonPrimary onClick={onCreateClick} className="cursor-pointer">
              <Plus className="w-4 h-4 mr-2" />
              Create Test Case
            </ButtonPrimary>
          )}
        </div>
      )}
    </DetailCard>
  );
}
