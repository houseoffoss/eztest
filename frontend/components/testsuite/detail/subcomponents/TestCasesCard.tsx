import { DetailCard } from '@/components/design/DetailCard';
import { DataTable, type ColumnDef } from '@/components/design/DataTable';
import { Button } from '@/elements/button';
import { ButtonPrimary } from '@/elements/button-primary';
import { Badge } from '@/elements/badge';
import { Plus, TestTube2, Trash2 } from 'lucide-react';
import { PriorityBadge } from '@/components/design/PriorityBadge';
import { TestCase } from '@/frontend/components/testcase/types';

interface TestCasesCardProps {
  testCases: TestCase[];
  testCasesCount: number;
  onAddTestCase: () => void;
  onTestCaseClick: (testCaseId: string) => void;
  onRemoveTestCase?: (testCase: TestCase) => void;
  canAdd?: boolean;
  canDelete?: boolean;
}

export function TestCasesCard({
  testCases,
  testCasesCount,
  onAddTestCase,
  onTestCaseClick,
  onRemoveTestCase,
  canAdd = false,
  canDelete = false,
}: TestCasesCardProps) {
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

  if (onRemoveTestCase && canDelete) {
    columns.push({
      key: 'id',
      label: 'Actions',
      render: (_, row: TestCase) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onRemoveTestCase(row);
          }}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      ),
      align: 'right',
    });
  }

  return (
    <DetailCard title={`Test Cases (${testCasesCount})`} contentClassName="">
      {testCases && testCases.length > 0 ? (
        <DataTable
          columns={columns}
          data={testCases}
          onRowClick={(row) => onTestCaseClick((row as TestCase).id)}
          rowClassName="cursor-pointer hover:bg-white/5"
          emptyMessage="No test cases in this suite"
        />
      ) : (
        <div className="text-center py-8">
          <TestTube2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-white/60 mb-4">
            No test cases in this suite yet
          </p>
          {canAdd && (
            <ButtonPrimary onClick={onAddTestCase} className="cursor-pointer">
              <Plus className="w-4 h-4 mr-2" />
              Add First Test Case
            </ButtonPrimary>
          )}
        </div>
      )}
    </DetailCard>
  );
}
