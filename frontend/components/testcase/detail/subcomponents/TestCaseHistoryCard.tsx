'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/elements/card';
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

  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle>Execution History</CardTitle>
      </CardHeader>
      <CardContent>
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
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {history.map((result) => (
              <div
                key={result.id}
                className="border border-white/10 rounded-lg p-4 bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    <Badge
                      variant="outline"
                      className={`text-xs ${getStatusColor(result.status)}`}
                    >
                      {result.status}
                    </Badge>
                  </div>
                  {result.duration && (
                    <div className="flex items-center gap-1 text-xs text-white/60">
                      <Clock className="w-3 h-3" />
                      {formatDuration(result.duration)}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-white/90 font-medium mb-1">
                      {result.testRun.name}
                    </p>
                    {result.testRun.environment && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-purple-500/10 text-purple-500 border-purple-500/20"
                      >
                        {result.testRun.environment}
                      </Badge>
                    )}
                  </div>

                  {result.comment && (
                    <p className="text-xs text-white/70 italic">
                      &quot;{result.comment}&quot;
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-white/50 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{result.executedBy.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(result.executedAt).toLocaleDateString()}{' '}
                        {new Date(result.executedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
