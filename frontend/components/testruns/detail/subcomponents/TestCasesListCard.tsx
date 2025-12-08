import { Badge } from '@/elements/badge';
import { Button } from '@/elements/button';
import { ButtonPrimary } from '@/elements/button-primary';
import { formatDateTime } from '@/lib/date-utils';
import { DetailCard } from '@/components/design/DetailCard';
import { DataTable, type ColumnDef } from '@/components/design/DataTable';
import { AlertCircle, Plus } from 'lucide-react';
import { TestResult, TestCase } from '../types';

interface TestCasesListCardProps {
  results: TestResult[];
  testRunStatus: string;
  canUpdate?: boolean;
  canCreate?: boolean;
  onAddTestCases: () => void;
  onAddTestSuites: () => void;
  onExecuteTestCase: (testCase: TestCase) => void;
  onCreateDefect?: (testCaseId: string) => void;
  getResultIcon: (status?: string) => React.JSX.Element;
}

interface ResultRow {
  id: string;
  testCase: TestCase;
  status: string;
  comment?: string;
  executedBy?: { name: string };
  executedAt?: string;
}

export function TestCasesListCard({
  results,
  testRunStatus,
  canCreate = true,
  onAddTestCases,
  onAddTestSuites,
  onExecuteTestCase,
  onCreateDefect,
  getResultIcon,
}: TestCasesListCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASSED':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'FAILED':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'BLOCKED':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'SKIPPED':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      case 'RETEST':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const columns: ColumnDef<ResultRow>[] = [
    {
      key: 'testCase',
      label: 'Test Case',
      render: (_, row: ResultRow) => (
        <div>
          <p className="font-medium text-white/90">{row.testCase.title}</p>
          {row.comment && (
            <p className="text-xs text-white/60 mt-1 break-words whitespace-pre-wrap">
              {row.comment}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (_, row: ResultRow) => (
        <Badge variant="outline" className="text-xs px-2 py-0.5">
          {row.testCase.priority?.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_, row: ResultRow) => (
        <div className="flex items-center gap-2">
          {getResultIcon(row.status)}
          <Badge
            variant="outline"
            className={`text-xs px-2 py-0.5 ${getStatusColor(row.status)}`}
          >
            {row.status}
          </Badge>
        </div>
      ),
    },
    {
      key: 'executedBy',
      label: 'Executed By',
      render: (_, row: ResultRow) => (
        <span className="text-white/70 text-sm">
          {row.executedBy?.name || '-'}
        </span>
      ),
    },
    {
      key: 'executedAt',
      label: 'Date',
      render: (_, row: ResultRow) => (
        <span className="text-white/70 text-sm">
          {row.executedAt
            ? formatDateTime(row.executedAt)
            : '-'}
        </span>
      ),
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_, row: ResultRow) => (
        <div className="flex items-center gap-2 justify-end">
          {testRunStatus === 'IN_PROGRESS' && (
            <>
              <Button
                variant="glass"
                size="sm"
                onClick={() => onExecuteTestCase(row.testCase)}
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
              >
                {row.status && row.status !== 'SKIPPED' ? 'Update' : 'Execute'}
              </Button>
              {row.status === 'FAILED' && onCreateDefect && (
                <ButtonPrimary
                  size="sm"
                  onClick={() => onCreateDefect(row.testCase.id)}
                >
                  Create Defect
                </ButtonPrimary>
              )}
            </>
          )}
        </div>
      ),
      align: 'right',
    },
  ];

  const tableData: ResultRow[] = results.map((result) => ({
    id: result.testCase.id,
    testCase: result.testCase,
    status: result.status,
    comment: result.comment,
    executedBy: result.executedBy,
    executedAt: result.executedAt,
  }));

  return (
    <DetailCard
      title={`Test Cases (${results?.length || 0})`}
      contentClassName=""
      headerAction={
        results && results.length > 0 && canCreate ? (
          <div className="flex gap-2 flex-wrap justify-end">
            <Button
              variant="glass"
              size="sm"
              onClick={onAddTestSuites}
              disabled={testRunStatus === 'COMPLETED' || testRunStatus === 'CANCELLED'}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Test Suites
            </Button>
            <Button
              variant="glass"
              size="sm"
              onClick={onAddTestCases}
              disabled={testRunStatus === 'COMPLETED' || testRunStatus === 'CANCELLED'}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Test Cases
            </Button>
          </div>
        ) : undefined
      }
    >
      {!results || results.length === 0 ? (
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">No test cases in this test run</p>
          {canCreate && (
            <div className="flex gap-2 justify-center flex-wrap">
              <ButtonPrimary
                size="default"
                onClick={onAddTestCases}
                disabled={testRunStatus === 'COMPLETED' || testRunStatus === 'CANCELLED'}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Test Cases
              </ButtonPrimary>
              <Button
                variant="glass"
                size="default"
                onClick={onAddTestSuites}
                disabled={testRunStatus === 'COMPLETED' || testRunStatus === 'CANCELLED'}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Test Suites
              </Button>
            </div>
          )}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={tableData}
          rowClassName="cursor-pointer hover:bg-white/5"
          emptyMessage="No test cases in this run"
        />
      )}
    </DetailCard>
  );
}
