'use client';

import { useEffect, useState } from 'react';
import { formatDateTime } from '@/lib/date-utils';
import { DetailCard } from '@/components/design/DetailCard';
import { DataTable, type ColumnDef } from '@/components/design/DataTable';
import { Badge } from '@/elements/badge';
import { Loader } from '@/elements/loader';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Circle,
  Calendar,
  User,
  Clock
} from 'lucide-react';

interface TestResult {
  id: string;
  status: 'PASSED' | 'FAILED' | 'BLOCKED' | 'SKIPPED' | 'RETEST';
  comment?: string;
  duration?: number;
  executedAt: string;
  executedBy: {
    name: string;
    email: string;
  };
  testRun: {
    id: string;
    name: string;
    environment?: string;
  };
}

interface TestCaseHistoryCardProps {
  testCaseId: string;
}

export function TestCaseHistoryCard({ testCaseId }: TestCaseHistoryCardProps) {
  const [history, setHistory] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testCaseId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/testcases/${testCaseId}/history`);
      const data = await response.json();
      if (data.data) {
        setHistory(data.data);
      }
    } catch (error) {
      console.error('Error fetching test case history:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASSED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'BLOCKED':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'SKIPPED':
        return <Circle className="w-4 h-4 text-gray-500" />;
      case 'RETEST':
        return <AlertCircle className="w-4 h-4 text-purple-500" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return null;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const columns: ColumnDef<TestResult>[] = [
    {
      key: 'status',
      label: 'Status',
      render: (value: unknown, row: TestResult) => {
        const status = value as string;
        return (
          <div className="flex items-center gap-2">
            {getStatusIcon(status)}
            <Badge
              variant="outline"
              className={`text-xs ${getStatusColor(status)}`}
            >
              {status}
            </Badge>
          </div>
        );
      },
    },
    {
      key: 'testRun',
      label: 'Test Run',
      render: (_, row: TestResult) => (
        <div className="min-w-0">
          <p className="text-sm text-white/90 font-medium truncate">{row.testRun.name}</p>
          {row.testRun.environment && (
            <Badge
              variant="outline"
              className="text-xs bg-purple-500/10 text-purple-500 border-purple-500/20 mt-1"
            >
              {row.testRun.environment}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'executedBy',
      label: 'Executed By',
      render: (_, row: TestResult) => (
        <div className="flex items-center gap-1 text-xs text-white/70 min-w-0">
          <User className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{row.executedBy.name}</span>
        </div>
      ),
    },
    {
      key: 'executedAt',
      label: 'Date',
      render: (_, row: TestResult) => (
        <div className="flex items-center gap-1 text-xs text-white/70">
          <Calendar className="w-3 h-3" />
          <span>{formatDateTime(row.executedAt)}</span>
        </div>
      ),
    },
    {
      key: 'duration',
      label: 'Duration',
      render: (value: unknown, row: TestResult) => {
        const duration = value as number | undefined;
        return (
          <div className="flex items-center gap-1 text-xs text-white/70">
            <Clock className="w-3 h-3" />
            <span>{formatDuration(duration) || '-'}</span>
          </div>
        );
      },
      align: 'right',
    },
  ];

  return (
    <DetailCard title="Execution History" contentClassName="">
      {loading ? (
        <div className="py-8 flex justify-center">
          <Loader text="Loading history..." />
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-white/60 text-sm">
            No execution history yet
          </p>
          <p className="text-white/40 text-xs mt-1">
            This test case hasn&apos;t been executed in any test run
          </p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={history}
          emptyMessage="No execution history"
        />
      )}
    </DetailCard>
  );
}
