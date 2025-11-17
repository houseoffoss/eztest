'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge } from '@/elements/badge';
import { Button } from '@/elements/button';
import { Card, CardContent, CardHeader } from '@/elements/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/elements/dialog';
import { Textarea } from '@/elements/textarea';
import { Label } from '@/elements/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/elements/select';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Circle,
  Clock,
  Play,
  Square,
  User,
  XCircle,
} from 'lucide-react';
import { Navbar } from '@/components/design/Navbar';
import { Breadcrumbs } from '@/components/design/Breadcrumbs';

interface TestResult {
  id: string;
  status: 'PASSED' | 'FAILED' | 'BLOCKED' | 'SKIPPED' | 'RETEST';
  testCaseId: string;
  comment?: string;
  executedAt?: string;
  executedBy?: {
    name: string;
    email: string;
  };
}

interface TestCase {
  id: string;
  name: string;
  priority: string;
  status: string;
}

interface TestRun {
  id: string;
  name: string;
  description?: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  environment?: string;
  project: {
    id: string;
    name: string;
    key: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  results: TestResult[];
  testCases?: TestCase[];
  _count?: {
    results: number;
  };
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

interface ResultDialogData {
  testCaseId: string;
  testCaseName: string;
}

export default function TestRunDetailPage() {
  const params = useParams();
  const router = useRouter();
  const testRunId = params.testrunId as string;

  const [testRun, setTestRun] = useState<TestRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState<ResultDialogData | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Result form state
  const [resultForm, setResultForm] = useState({
    status: '',
    comment: '',
  });

  useEffect(() => {
    fetchTestRun();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testRunId]);

  useEffect(() => {
    if (testRun) {
      document.title = `${testRun.name} | EZTest`;
    }
  }, [testRun]);

  const fetchTestRun = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/testruns/${testRunId}`);
      const data = await response.json();
      if (data.data) {
        setTestRun(data.data);
      } else {
        alert(data.error || 'Failed to fetch test run');
      }
    } catch (error) {
      console.error('Error fetching test run:', error);
      alert('Failed to fetch test run');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTestRun = async () => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/testruns/${testRunId}/start`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.data) {
        fetchTestRun();
      } else {
        alert(data.error || 'Failed to start test run');
      }
    } catch (error) {
      console.error('Error starting test run:', error);
      alert('Failed to start test run');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteTestRun = async () => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/testruns/${testRunId}/complete`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.data) {
        fetchTestRun();
      } else {
        alert(data.error || 'Failed to complete test run');
      }
    } catch (error) {
      console.error('Error completing test run:', error);
      alert('Failed to complete test run');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenResultDialog = (testCase: TestCase) => {
    const existingResult = testRun?.results.find(
      (r) => r.testCaseId === testCase.id
    );

    setSelectedTestCase({
      testCaseId: testCase.id,
      testCaseName: testCase.name,
    });

    setResultForm({
      status: existingResult?.status || '',
      comment: existingResult?.comment || '',
    });

    setResultDialogOpen(true);
  };

  const handleSubmitResult = async () => {
    if (!selectedTestCase || !resultForm.status) {
      alert('Please select a result status');
      return;
    }

    try {
      const response = await fetch(`/api/testruns/${testRunId}/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testCaseId: selectedTestCase.testCaseId,
          status: resultForm.status,
          comment: resultForm.comment,
        }),
      });

      const data = await response.json();

      if (data.data) {
        setResultDialogOpen(false);
        setSelectedTestCase(null);
        setResultForm({ status: '', comment: '' });
        fetchTestRun();
      } else {
        alert(data.error || 'Failed to save result');
      }
    } catch (error) {
      console.error('Error saving result:', error);
      alert('Failed to save result');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNED':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'IN_PROGRESS':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'COMPLETED':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'CANCELLED':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
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

  const getResultIcon = (status?: string) => {
    switch (status) {
      case 'PASSED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'FAILED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'BLOCKED':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'SKIPPED':
        return <Circle className="w-5 h-5 text-gray-500" />;
      case 'RETEST':
        return <AlertCircle className="w-5 h-5 text-purple-500" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTestCaseResult = (testCaseId: string): TestResult | undefined => {
    return testRun?.results.find((r) => r.testCaseId === testCaseId);
  };

  const calculateStats = () => {
    if (!testRun) return { passed: 0, failed: 0, blocked: 0, skipped: 0, pending: 0, total: 0 };

    const stats = {
      passed: 0,
      failed: 0,
      blocked: 0,
      skipped: 0,
      pending: 0,
      total: testRun.testCases?.length || 0,
    };

    testRun.results.forEach((result) => {
      switch (result.status) {
        case 'PASSED':
          stats.passed++;
          break;
        case 'FAILED':
          stats.failed++;
          break;
        case 'BLOCKED':
          stats.blocked++;
          break;
        case 'SKIPPED':
          stats.skipped++;
          break;
      }
    });

    stats.pending = stats.total - (stats.passed + stats.failed + stats.blocked + stats.skipped);

    return stats;
  };

  const stats = calculateStats();
  const progressPercentage = stats.total > 0
    ? Math.round(((stats.total - stats.pending) / stats.total) * 100)
    : 0;
  const passRate = stats.total > 0
    ? Math.round((stats.passed / stats.total) * 100)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <p className="text-gray-400">Loading test run...</p>
      </div>
    );
  }

  if (!testRun) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <p className="text-gray-400">Test run not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1628]">
      <Navbar
        items={[
          { label: 'Overview', href: `/projects/${testRun.project.id}` },
          { label: 'Test Cases', href: `/projects/${testRun.project.id}/testcases` },
          { label: 'Test Runs', href: `/projects/${testRun.project.id}/testruns` },
          { label: 'Members', href: `/projects/${testRun.project.id}/members` },
          { label: 'Settings', href: `/projects/${testRun.project.id}/settings` },
        ]}
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: 'Projects', href: '/projects' },
              { label: testRun.project.name, href: `/projects/${testRun.project.id}` },
              { label: 'Test Runs', href: `/projects/${testRun.project.id}/testruns` },
              { label: testRun.name },
            ]}
          />
        }
        actions={
          <form action="/api/auth/signout" method="POST">
            <Button type="submit" variant="glass-destructive" size="sm" className="px-5">
              Sign Out
            </Button>
          </form>
        }
      />

      <div className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push(`/projects/${testRun.project.id}/testruns`)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Test Runs
          </Button>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{testRun.name}</h1>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className={getStatusColor(testRun.status)}>
                  {testRun.status.replace('_', ' ')}
                </Badge>
                {testRun.environment && (
                  <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                    {testRun.environment}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {testRun.status === 'PLANNED' && (
                <Button
                  variant="glass-primary"
                  onClick={handleStartTestRun}
                  disabled={actionLoading}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Test Run
                </Button>
              )}
              {testRun.status === 'IN_PROGRESS' && (
                <Button
                  variant="glass-primary"
                  onClick={handleCompleteTestRun}
                  disabled={actionLoading}
                >
                  <Square className="w-4 h-4 mr-2" />
                  Complete Test Run
                </Button>
              )}
            </div>
          </div>

          {testRun.description && (
            <p className="text-gray-400">{testRun.description}</p>
          )}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card variant="glass">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Progress</span>
                <span className="text-lg font-bold text-white">{progressPercentage}%</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {stats.total - stats.pending} of {stats.total} executed
              </p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Passed</p>
                  <p className="text-2xl font-bold text-green-500">{stats.passed}</p>
                  <p className="text-xs text-gray-500">{passRate}% pass rate</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500/50" />
              </div>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Failed</p>
                  <p className="text-2xl font-bold text-red-500">{stats.failed}</p>
                  <p className="text-xs text-gray-500">
                    {stats.blocked} blocked, {stats.skipped} skipped
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red-500/50" />
              </div>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardContent className="p-4">
              <div>
                {testRun.assignedTo && (
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-white">{testRun.assignedTo.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Calendar className="w-3 h-3" />
                  <span>Created {new Date(testRun.createdAt).toLocaleDateString()}</span>
                </div>
                {testRun.startedAt && (
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>Started {new Date(testRun.startedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Cases List */}
        <Card variant="glass">
          <CardHeader>
            <h2 className="text-xl font-semibold text-white">Test Cases</h2>
          </CardHeader>
          <CardContent>
            {!testRun.testCases || testRun.testCases.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No test cases in this test run</p>
              </div>
            ) : (
              <div className="space-y-2">
                {testRun.testCases.map((testCase) => {
                  const result = getTestCaseResult(testCase.id);

                  return (
                    <div
                      key={testCase.id}
                      className="flex items-center gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        {getResultIcon(result?.status)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium mb-1">{testCase.name}</h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs">
                            {testCase.priority}
                          </Badge>
                          {result && (
                            <Badge
                              variant="outline"
                              className={`text-xs ${getStatusColor(result.status)}`}
                            >
                              {result.status}
                            </Badge>
                          )}
                        </div>
                        {result?.comment && (
                          <p className="text-sm text-gray-400 mt-2">{result.comment}</p>
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
                          onClick={() => handleOpenResultDialog(testCase)}
                          disabled={testRun.status === 'COMPLETED' || testRun.status === 'CANCELLED'}
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

        {/* Result Dialog */}
        <Dialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
          <DialogContent variant="glass">
            <DialogHeader>
              <DialogTitle>Record Test Result</DialogTitle>
              <DialogDescription>
                {selectedTestCase?.testCaseName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Result Status *</Label>
                <Select
                  value={resultForm.status}
                  onValueChange={(value: string) =>
                    setResultForm({ ...resultForm, status: value })
                  }
                >
                  <SelectTrigger variant="glass">
                    <SelectValue placeholder="Select result status" />
                  </SelectTrigger>
                  <SelectContent variant="glass">
                    <SelectItem value="PASSED">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Passed</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="FAILED">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span>Failed</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="BLOCKED">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                        <span>Blocked</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="SKIPPED">
                      <div className="flex items-center gap-2">
                        <Circle className="w-4 h-4 text-gray-500" />
                        <span>Skipped</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="RETEST">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-purple-500" />
                        <span>Retest</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="comment">Comment</Label>
                <Textarea
                  id="comment"
                  variant="glass"
                  value={resultForm.comment}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                    setResultForm({ ...resultForm, comment: e.target.value })
                  }
                  placeholder="Add any comments about this test execution"
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="glass"
                onClick={() => setResultDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="glass-primary" onClick={handleSubmitResult}>
                Save Result
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
