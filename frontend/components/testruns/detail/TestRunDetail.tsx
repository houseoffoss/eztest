import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/elements/button';
import { Breadcrumbs } from '@/components/design/Breadcrumbs';
import { Loader } from '@/elements/loader';
import { TestRunHeader } from './subcomponents/TestRunHeader';
import { TestRunStatsCards } from './subcomponents/TestRunStatsCards';
import { TestCasesListCard } from './subcomponents/TestCasesListCard';
import { RecordResultDialog } from './subcomponents/RecordResultDialog';
import { AddTestCasesDialog } from '@/frontend/components/common/dialogs/AddTestCasesDialog';
import { AddTestSuitesDialog } from './subcomponents/AddTestSuitesDialog';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Circle,
} from 'lucide-react';
import { TestRun, TestCase, ResultFormData, TestRunStats } from './types';
import { usePermissions } from '@/hooks/usePermissions';

interface TestRunDetailProps {
  testRunId: string;
}

export default function TestRunDetail({ testRunId }: TestRunDetailProps) {
  const router = useRouter();
  const { hasPermission: hasPermissionCheck, isLoading: permissionsLoading } = usePermissions();

  const [testRun, setTestRun] = useState<TestRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [addCasesDialogOpen, setAddCasesDialogOpen] = useState(false);
  const [addSuitesDialogOpen, setAddSuitesDialogOpen] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState<{
    testCaseId: string;
    testCaseName: string;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [availableTestCases, setAvailableTestCases] = useState<TestCase[]>([]);
  const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>([]);
  const [availableTestSuites, setAvailableTestSuites] = useState<any[]>([]);
  const [selectedSuiteIds, setSelectedSuiteIds] = useState<string[]>([]);

  const [resultForm, setResultForm] = useState<ResultFormData>({
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
      testCaseName: testCase.title || testCase.name || '',
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

  const fetchAvailableTestCases = async () => {
    if (!testRun) return;

    try {
      const response = await fetch(
        `/api/projects/${testRun.project.id}/testcases`
      );
      const data = await response.json();

      if (data.data) {
        const existingIds = new Set(testRun.results.map((r) => r.testCaseId));
        const available = data.data.filter(
          (tc: TestCase) => !existingIds.has(tc.id)
        );
        setAvailableTestCases(available);
      }
    } catch (error) {
      console.error('Error fetching test cases:', error);
    }
  };

  const handleAddTestCases = async () => {
    if (selectedCaseIds.length === 0) {
      alert('Please select at least one test case');
      return;
    }

    try {
      const promises = selectedCaseIds.map((testCaseId) =>
        fetch(`/api/testruns/${testRunId}/results`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            testCaseId,
            status: 'SKIPPED',
          }),
        })
      );

      await Promise.all(promises);

      setAddCasesDialogOpen(false);
      setSelectedCaseIds([]);
      fetchTestRun();
    } catch (error) {
      console.error('Error adding test cases:', error);
      alert('Failed to add test cases');
    }
  };

  const fetchAvailableTestSuites = async () => {
    if (!testRun) return;

    try {
      const response = await fetch(
        `/api/projects/${testRun.project.id}/testsuites`
      );
      const data = await response.json();

      if (data.data) {
        const existingTestCaseIds = new Set(testRun.results.map((r) => r.testCaseId));
        
        // Process each suite to include test case details and count new test cases
        const availableSuites = data.data
          .map((suite: any) => {
            // Filter test cases that are not already in the test run
            const newTestCases = (suite.testCases || []).filter(
              (tc: any) => !existingTestCaseIds.has(tc.id)
            );
            
            return {
              ...suite,
              testCases: newTestCases,
              _count: {
                testCases: newTestCases.length,
              },
            };
          })
          // Only include suites that have new test cases
          .filter((suite: any) => suite.testCases.length > 0);

        setAvailableTestSuites(availableSuites);
      }
    } catch (error) {
      console.error('Error fetching test suites:', error);
    }
  };

  const handleAddTestSuites = async () => {
    if (selectedSuiteIds.length === 0) {
      alert('Please select at least one test suite');
      return;
    }

    try {
      const suiteIds = selectedSuiteIds;
      const testCaseIds: string[] = [];

      // Collect all test case IDs from selected suites
      suiteIds.forEach((suiteId) => {
        const suite = availableTestSuites.find((s) => s.id === suiteId);
        if (suite && suite.testCases) {
          suite.testCases.forEach((testCase: any) => {
            if (!testRun?.results.find((r) => r.testCaseId === testCase.id)) {
              testCaseIds.push(testCase.id);
            }
          });
        }
      });

      if (testCaseIds.length === 0) {
        alert('No new test cases to add from selected suites');
        return;
      }

      // Add all test cases from selected suites
      const promises = testCaseIds.map((testCaseId) =>
        fetch(`/api/testruns/${testRunId}/results`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            testCaseId,
            status: 'SKIPPED',
          }),
        })
      );

      await Promise.all(promises);

      setAddSuitesDialogOpen(false);
      setSelectedSuiteIds([]);
      fetchTestRun();
    } catch (error) {
      console.error('Error adding test cases from suites:', error);
      alert('Failed to add test cases from suites');
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

  const calculateStats = (): TestRunStats => {
    if (!testRun)
      return { passed: 0, failed: 0, blocked: 0, skipped: 0, pending: 0, total: 0 };

    const stats: TestRunStats = {
      passed: 0,
      failed: 0,
      blocked: 0,
      skipped: 0,
      pending: 0,
      total: testRun.results?.length || 0,
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

    // Pending = tests that haven't been executed (skipped tests count as not executed)
    stats.pending = stats.skipped;

    return stats;
  };

  const stats = calculateStats();
  // Progress = tests that have been executed (passed, failed, blocked, retest)
  // Skipped tests are NOT considered executed
  const executed = stats.passed + stats.failed + stats.blocked;
  const progressPercentage =
    stats.total > 0 ? Math.round((executed / stats.total) * 100) : 0;
  // Pass rate = passed tests / executed tests (excluding skipped)
  const passRate =
    executed > 0 ? Math.round((stats.passed / executed) * 100) : 0;

  if (loading || permissionsLoading) {
    return <Loader fullScreen text="Loading..." />;
  }

  if (!testRun) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-400">Test run not found</p>
      </div>
    );
  }

  const canUpdateTestRun = hasPermissionCheck('testruns:update');
  const canDeleteTestRun = hasPermissionCheck('testruns:delete');

  return (
    <div className="flex-1">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <Breadcrumbs
            items={[
              { label: 'Projects', href: '/projects' },
              {
                label: testRun.project.name,
                href: `/projects/${testRun.project.id}`,
              },
              {
                label: 'Test Runs',
                href: `/projects/${testRun.project.id}/testruns`,
              },
              { label: testRun.name },
            ]}
          />
          <form action="/api/auth/signout" method="POST" className="inline">
            <Button type="submit" variant="glass-destructive" size="sm" className="px-5">
              Sign Out
            </Button>
          </form>
        </div>
      </div>

      <div className="p-4 md:p-6 lg:p-8">
        <TestRunHeader
          testRun={testRun}
          actionLoading={actionLoading}
          canUpdate={canUpdateTestRun}
          onStartTestRun={handleStartTestRun}
          onCompleteTestRun={handleCompleteTestRun}
        />

        <TestRunStatsCards
          stats={stats}
          progressPercentage={progressPercentage}
          passRate={passRate}
          testRun={testRun}
        />

        <TestCasesListCard
          results={testRun.results}
          testRunStatus={testRun.status}
          canUpdate={canUpdateTestRun}
          onAddTestCases={() => {
            fetchAvailableTestCases();
            setAddCasesDialogOpen(true);
          }}
          onAddTestSuites={() => {
            fetchAvailableTestSuites();
            setAddSuitesDialogOpen(true);
          }}
          onExecuteTestCase={handleOpenResultDialog}
          getResultIcon={getResultIcon}
        />

        <RecordResultDialog
          open={resultDialogOpen}
          testCaseName={selectedTestCase?.testCaseName || ''}
          formData={resultForm}
          onOpenChange={setResultDialogOpen}
          onFormChange={(data) => setResultForm({ ...resultForm, ...data })}
          onSubmit={handleSubmitResult}
        />

        <AddTestCasesDialog
          open={addCasesDialogOpen}
          testCases={availableTestCases}
          selectedIds={selectedCaseIds}
          onOpenChange={setAddCasesDialogOpen}
          onSelectionChange={(ids) => setSelectedCaseIds(ids)}
          onSubmit={handleAddTestCases}
          context="run"
          showPriority={true}
        />

        <AddTestSuitesDialog
          open={addSuitesDialogOpen}
          availableTestSuites={availableTestSuites}
          selectedSuiteIds={selectedSuiteIds}
          onOpenChange={setAddSuitesDialogOpen}
          onToggleTestSuite={(suiteId, checked) => {
            if (checked) {
              setSelectedSuiteIds([...selectedSuiteIds, suiteId]);
            } else {
              setSelectedSuiteIds(selectedSuiteIds.filter((id) => id !== suiteId));
            }
          }}
          onAdd={handleAddTestSuites}
          onCancel={() => {
            setAddSuitesDialogOpen(false);
            setSelectedSuiteIds([]);
          }}
        />
      </div>
    </div>
  );
}
