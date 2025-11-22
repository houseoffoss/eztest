import { Badge } from '@/elements/badge';
import { Button } from '@/elements/button';
import { Card, CardContent, CardHeader } from '@/elements/card';
import { AlertCircle, Plus } from 'lucide-react';
import { TestResult, TestCase } from '../types';

interface TestCasesListCardProps {
  results: TestResult[];
  testRunStatus: string;
  canUpdate?: boolean;
  onAddTestCases: () => void;
  onAddTestSuites: () => void;
  onExecuteTestCase: (testCase: TestCase) => void;
  getResultIcon: (status?: string) => React.JSX.Element;
}

export function TestCasesListCard({
  results,
  testRunStatus,
  canUpdate = true,
  onAddTestCases,
  onAddTestSuites,
  onExecuteTestCase,
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

  return (
    <Card variant="glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Test Cases</h2>
          {canUpdate && (
            <div className="flex gap-2">
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
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!results || results.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No test cases in this test run</p>
            <Button
              variant="glass-primary"
              size="sm"
              className="mt-4"
              onClick={onAddTestCases}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Test Cases
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {results.map((result) => {
              const testCase = result.testCase;

              return (
                <div
                  key={testCase.id}
                  className="flex items-center gap-4 p-4 rounded bg-white/5 hover:bg-white/8 transition-colors border border-white/10"
                >
                  <div className="flex-shrink-0">
                    {getResultIcon(result?.status)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-medium">
                        {testCase.title}
                      </h3>
                      <Badge variant="outline" className="text-xs px-2 py-0.5 h-fit">
                        {testCase.priority}
                      </Badge>
                      {result && (
                        <Badge
                          variant="outline"
                          className={`text-xs px-2 py-0.5 h-fit ${getStatusColor(result.status)}`}
                        >
                          {result.status}
                        </Badge>
                      )}
                    </div>
                    {result?.comment && (
                      <p className="text-sm text-gray-400 mt-2">
                        {result.comment}
                      </p>
                    )}
                    {result?.executedBy && result?.executedAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        Executed by {result.executedBy.name} on{' '}
                        {new Date(result.executedAt).toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div className="flex-shrink-0">
                    <Button
                      variant="glass"
                      size="sm"
                      onClick={() => onExecuteTestCase(testCase)}
                      disabled={
                        testRunStatus === 'COMPLETED' ||
                        testRunStatus === 'CANCELLED'
                      }
                    >
                      {result ? 'Update' : 'Execute'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
