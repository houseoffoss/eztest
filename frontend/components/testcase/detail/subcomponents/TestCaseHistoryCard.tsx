'use client';

import { useEffect, useState } from 'react';
import { formatDateTime } from '@/lib/date-utils';
import { DetailCard } from '@/frontend/reusable-components/cards/DetailCard';
import { Badge } from '@/frontend/reusable-elements/badges/Badge';
import { Loader } from '@/frontend/reusable-elements/loaders/Loader';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Circle,
  Calendar,
  User,
  Clock
} from 'lucide-react';
import { useDropdownOptions } from '@/hooks/useDropdownOptions';
import { getDynamicBadgeProps } from '@/lib/badge-color-utils';

interface TestResult {
  id: string;
  status: string;
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
  projectId: string;
  testCaseId: string;
}

export function TestCaseHistoryCard({ projectId, testCaseId }: TestCaseHistoryCardProps) {
  const [history, setHistory] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const { options: statusOptions } = useDropdownOptions('TestResult', 'status');
  const { options: environmentOptions } = useDropdownOptions('TestRun', 'environment');

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testCaseId, projectId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}/testcases/${testCaseId}/history`);
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
    if (!seconds || seconds === 0) return '-';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.round(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return (
    <DetailCard title="Execution History" contentClassName="">
      {loading ? (
        <div className="py-8 flex justify-center">
          <Loader fullScreen={false} text="Loading history..." />
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
        <div className="space-y-0">
          {/* Header Row */}
          <div
            className="grid gap-3 px-3 py-2 text-xs font-semibold text-white/60 border-b border-white/10 rounded-t-md"
            style={{ gridTemplateColumns: '80px 180px 140px 180px 80px' }}
          >
            <div>Status</div>
            <div>Test Run</div>
            <div>Executed By</div>
            <div>Date</div>
            <div className="text-right">Duration</div>
          </div>

          {/* Data Rows */}
          {history.map((row, rowIndex) => (
            <div
              key={row.id}
              className={`grid gap-3 px-3 py-2.5 transition-colors items-center text-sm rounded-sm hover:bg-accent/20 ${
                rowIndex % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.04] border-b border-white/10'
              } ${
                rowIndex === history.length - 1 ? 'rounded-b-md' : ''
              }`}
              style={{ gridTemplateColumns: '80px 180px 140px 180px 80px' }}
            >
              <div className="flex items-center gap-2">
                {getStatusIcon(row.status)}
                <Badge
                  variant="outline"
                  className={`text-xs ${(() => {
                    const badgeProps = getDynamicBadgeProps(row.status, statusOptions);
                    return badgeProps.className;
                  })()}`}
                  style={(() => {
                    const badgeProps = getDynamicBadgeProps(row.status, statusOptions);
                    return badgeProps.style;
                  })()}
                >
                  {row.status}
                </Badge>
              </div>
              <div className="min-w-0">
                <p className="text-sm text-white/90 font-medium truncate block">{row.testRun.name}</p>
                {row.testRun.environment && (() => {
                  const badgeProps = getDynamicBadgeProps(row.testRun.environment, environmentOptions);
                  const environmentLabel = environmentOptions.find(opt => opt.value === row.testRun.environment)?.label || row.testRun.environment.toUpperCase();
                  return (
                    <Badge
                      variant="outline"
                      className={`text-xs mt-1 ${badgeProps.className}`}
                      style={badgeProps.style}
                    >
                      {environmentLabel}
                    </Badge>
                  );
                })()}
              </div>
              <div className="flex items-center gap-1 text-xs text-white/70 min-w-0">
                <User className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{row.executedBy.name}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-white/70">
                <Calendar className="w-3 h-3" />
                <span>{formatDateTime(row.executedAt)}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-white/70 justify-self-end">
                <Clock className="w-3 h-3" />
                <span>{formatDuration(row.duration) || '-'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </DetailCard>
  );
}
