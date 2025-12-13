import { useEffect, useState } from 'react';
import { TopBar } from '@/components/design';
import { Loader } from '@/elements/loader';
import { FloatingAlert, FloatingAlertMessage } from '@/components/design/FloatingAlert';
import { TestRunHeader } from './subcomponents/TestRunHeader';
import { TestRunStatsCards } from './subcomponents/TestRunStatsCards';
import { TestCasesListCard } from './subcomponents/TestCasesListCard';
import { RecordResultDialog } from './subcomponents/RecordResultDialog';
import { AddTestCasesDialog } from '@/frontend/components/common/dialogs/AddTestCasesDialog';
import { AddTestSuitesDialog } from './subcomponents/AddTestSuitesDialog';
import { CreateDefectDialog } from '@/frontend/components/defect/subcomponents/CreateDefectDialog';
import { SendTestRunReportDialog } from './subcomponents/SendTestRunReportDialog';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Circle,
} from 'lucide-react';
import { TestRun, TestCase, ResultFormData, TestRunStats, TestSuite } from './types';
import { usePermissions } from '@/hooks/usePermissions';
import { useFormPersistence } from '@/hooks/useFormPersistence';

interface TestRunDetailProps {
  testRunId: string;
}

export default function TestRunDetail({ testRunId }: TestRunDetailProps) {
  const { hasPermission: hasPermissionCheck, isLoading: permissionsLoading } = usePermissions();

  const [testRun, setTestRun] = useState<TestRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [addCasesDialogOpen, setAddCasesDialogOpen] = useState(false);
  const [addSuitesDialogOpen, setAddSuitesDialogOpen] = useState(false);
  const [createDefectDialogOpen, setCreateDefectDialogOpen] = useState(false);
  const [selectedTestCaseForDefect, setSelectedTestCaseForDefect] = useState<string | null>(null);
  const [selectedTestCase, setSelectedTestCase] = useState<{
    testCaseId: string;
    testCaseName: string;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [availableTestCases, setAvailableTestCases] = useState<TestCase[]>([]);
  const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>([]);
  const [availableTestSuites, setAvailableTestSuites] = useState<TestSuite[]>([]);
  const [selectedSuiteIds, setSelectedSuiteIds] = useState<string[]>([]);
  const [defectRefreshTrigger, setDefectRefreshTrigger] = useState(0);
  const [sendReportDialogOpen, setSendReportDialogOpen] = useState(false);
  const [floatingAlert, setFloatingAlert] = useState<FloatingAlertMessage | null>(null);
  const [addingTestCases, setAddingTestCases] = useState(false);
  const [addingTestSuites, setAddingTestSuites] = useState(false);
  const [loadingSuites, setLoadingSuites] = useState(false);

  const [resultForm, setResultForm, clearResultForm] = useFormPersistence<ResultFormData>(
    `testrun-result-${testRunId}`,
    {
      status: '',
      comment: '',
    },
    {
      expiryMs: 30 * 60 * 1000, // 30 minutes
    }
  );

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
      console.log('Starting complete test run...');
      const response = await fetch(`/api/testruns/${testRunId}/complete`, {
        method: 'POST',
      });

      const data = await response.json();
      console.log('Complete test run response:', data);
      console.log('Email available status:', data.data?.emailAvailable);

      if (data.data) {
        console.log('Test run completed, updating test run state...');
        setTestRun(data.data);
        
        // Only show send report dialog if email is available
        if (data.data.emailAvailable === true) {
          console.log('[TEST RUN] Email available - showing send report dialog');
          setSendReportDialogOpen(true);
        } else {
          console.log('[TEST RUN] Email not available (value:', data.data.emailAvailable, ') - skipping send report dialog');
          // Ensure dialog is closed
          setSendReportDialogOpen(false);
        }
      } else {
        alert(data.error || 'Failed to complete test run');
      }
    } catch (error) {
      console.error('Error completing test run:', error);
      alert('Failed to complete test run');
    } finally {
      setActionLoading(false);
      console.log('Complete test run finished');
    }
  };

  const handleSendReportYes = async () => {
    console.log('Calling send-report API...');
    const response = await fetch(`/api/testruns/${testRunId}/send-report`, {
      method: 'POST',
    });

    const data = await response.json();
    console.log('Send report response:', data);

    if (!data.data?.success) {
      throw new Error(data.data?.message || data.error || 'Failed to send report');
    }

    console.log('Report sent successfully, showing message and refreshing...');
    
    // If SMTP is disabled, don't show any notification
    if (data.data.smtpDisabled) {
      console.log('[TEST RUN] SMTP disabled - no email notification shown');
      // Refresh test run data silently
      await fetchTestRun();
      return;
    }
    
    // Check if message contains "Failed to send to:" to determine if there were partial failures
    const hasFailures = data.data.message?.includes('Failed to send to:');
    
    setFloatingAlert({
      type: hasFailures ? 'error' : 'success',
      title: hasFailures ? 'Report Sent with Errors' : 'Report Sent Successfully',
      message: data.data.message,
    });
    // Refresh test run data
    await fetchTestRun();
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
        clearResultForm(); // Clear persisted form data after successful submission
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
    if (!testRun || !testRun.project?.id) return;

    try {
      // Fetch latest test run data to get current results
      const testRunResponse = await fetch(`/api/testruns/${testRunId}`);
      const testRunData = await testRunResponse.json();
      const currentTestRun = testRunData.data || testRun;

      const response = await fetch(
        `/api/projects/${testRun.project.id}/testcases`
      );
      const data = await response.json();

      if (data.data) {
        const existingIds = new Set(currentTestRun.results.map((r: { testCaseId: string }) => r.testCaseId));
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

    setAddingTestCases(true);
    try {
      console.log('Adding test cases:', selectedCaseIds);
      const promises = selectedCaseIds.map(async (testCaseId) => {
        const payload = {
          testCaseId,
          status: 'SKIPPED',
        };
        console.log('Sending payload:', payload);
        
        const response = await fetch(`/api/testruns/${testRunId}/results`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          let errorMessage = `Failed to add test case (Status: ${response.status})`;
          try {
            const data = await response.json();
            console.error('API error response:', data);
            errorMessage = data.message || data.error || errorMessage;
          } catch {
            const text = await response.text();
            console.error('Response text:', text);
            if (text) errorMessage = text;
          }
          throw new Error(errorMessage);
        }

        return response.json();
      });

      const results = await Promise.all(promises);
      console.log('Test cases added successfully:', results);

      setAddCasesDialogOpen(false);
      setSelectedCaseIds([]);
      await fetchTestRun();
      // Refresh both lists to keep data in sync
      await fetchAvailableTestCases();
      await fetchAvailableTestSuites();
    } catch (error) {
      console.error('Error adding test cases:', error);
      alert(`Failed to add test cases: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setAddingTestCases(false);
    }
  };

  const fetchAvailableTestSuites = async () => {
    if (!testRun || !testRun.project?.id) return;

    setLoadingSuites(true);
    try {
      // Fetch latest test run data to get current results
      const testRunResponse = await fetch(`/api/testruns/${testRunId}`);
      const testRunData = await testRunResponse.json();
      const currentTestRun = testRunData.data || testRun;

      // Fetch test suites
      const suitesResponse = await fetch(
        `/api/projects/${testRun.project.id}/testsuites`
      );
      const suitesData = await suitesResponse.json();

      // Fetch all test cases to get ungrouped ones
      const testCasesResponse = await fetch(
        `/api/projects/${testRun.project.id}/testcases`
      );
      const testCasesData = await testCasesResponse.json();

      if (suitesData.data) {
        const existingTestCaseIds = new Set(currentTestRun.results.map((r: { testCaseId: string }) => r.testCaseId));
        
        // Collect all test case IDs that belong to any suite
        const testCaseIdsInSuites = new Set<string>();
        suitesData.data.forEach((suite: TestSuite) => {
          (suite.testCases || []).forEach((tc: TestCase) => {
            testCaseIdsInSuites.add(tc.id);
          });
        });
        
        // Process each suite to include test case details and count new test cases
        const availableSuites = suitesData.data
          .map((suite: TestSuite) => {
            // Filter test cases that are not already in the test run
            const newTestCases = (suite.testCases || []).filter(
              (tc: TestCase) => !existingTestCaseIds.has(tc.id)
            );
            
            return {
              ...suite,
              testCases: newTestCases,
              _count: {
                testCases: newTestCases.length,
              },
            };
          });

        // Find ungrouped test cases (test cases not in any suite)
        if (testCasesData.data) {
          const ungroupedTestCases = testCasesData.data
            .filter((tc: TestCase) => !testCaseIdsInSuites.has(tc.id) && !existingTestCaseIds.has(tc.id));

          // Add ungrouped test cases as a special "suite"
          if (ungroupedTestCases.length > 0) {
            availableSuites.push({
              id: 'ungrouped',
              name: 'Ungrouped Test Cases',
              description: 'Test cases not assigned to any test suite',
              projectId: testRun.project.id,
              testCases: ungroupedTestCases,
              _count: {
                testCases: ungroupedTestCases.length,
              },
            });
          }
        }

        setAvailableTestSuites(availableSuites);
      }
    } catch (error) {
      console.error('Error fetching test suites:', error);
    } finally {
      setLoadingSuites(false);
    }
  };

  const handleAddTestSuites = async () => {
    if (selectedSuiteIds.length === 0) {
      alert('Please select at least one test suite');
      return;
    }

    setAddingTestSuites(true);
    try {
      const suiteIds = selectedSuiteIds;
      const testCaseIds: string[] = [];

      // Collect all test case IDs from selected suites
      suiteIds.forEach((suiteId) => {
        const suite = availableTestSuites.find((s) => s.id === suiteId);
        if (suite && suite.testCases) {
          suite.testCases.forEach((testCase: TestCase) => {
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
      const promises = testCaseIds.map(async (testCaseId) => {
        const response = await fetch(`/api/testruns/${testRunId}/results`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            testCaseId,
            status: 'SKIPPED',
          }),
        });

        if (!response.ok) {
          let errorMessage = `Failed to add test case (Status: ${response.status})`;
          try {
            const data = await response.json();
            errorMessage = data.message || data.error || errorMessage;
          } catch (parseError) {
            const text = await response.text();
            if (text) errorMessage = text;
          }
          throw new Error(errorMessage);
        }

        return response.json();
      });

      const results = await Promise.all(promises);
      console.log('Test cases from suites added successfully:', results);

      setAddSuitesDialogOpen(false);
      setSelectedSuiteIds([]);
      await fetchTestRun();
      // Refresh both lists to keep data in sync
      await fetchAvailableTestSuites();
      await fetchAvailableTestCases();
    } catch (error) {
      console.error('Error adding test cases from suites:', error);
      alert(`Failed to add test cases from suites: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setAddingTestSuites(false);
    }
  };

  const handleCreateDefect = (testCaseId: string) => {
    setSelectedTestCaseForDefect(testCaseId);
    setCreateDefectDialogOpen(true);
  };

  const handleDefectCreated = () => {
    setCreateDefectDialogOpen(false);
    setSelectedTestCaseForDefect(null);
    // Trigger defect list refresh in RecordResultDialog
    setDefectRefreshTrigger(prev => prev + 1);
    // Optionally refresh test run data if needed
    fetchTestRun();
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

    // Check if results exist before iterating
    if (testRun.results && Array.isArray(testRun.results)) {
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
    }

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
    return <Loader fullScreen text="Loading test run..." />;
  }

  if (!testRun) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-400">Test run not found</p>
      </div>
    );
  }

  const canUpdateTestRun = hasPermissionCheck('testruns:update');
  const canCreateTestRun = hasPermissionCheck('testruns:create');

  return (
    <div className="flex-1">
      {/* Top Bar */}
      <TopBar
        breadcrumbs={[
          { label: 'Projects', href: '/projects' },
          {
            label: testRun.project?.name || 'Project',
            href: `/projects/${testRun.project?.id}`,
          },
          {
            label: 'Test Runs',
            href: `/projects/${testRun.project?.id}/testruns`,
          },
          { label: testRun.name },
        ]}
      />

      <div className="p-4 md:p-6 lg:p-8 space-y-6">
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
          canCreate={canCreateTestRun}
          onAddTestCases={() => {
            fetchAvailableTestCases();
            setAddCasesDialogOpen(true);
          }}
          onAddTestSuites={() => {
            fetchAvailableTestSuites();
            setAddSuitesDialogOpen(true);
          }}
          onExecuteTestCase={handleOpenResultDialog}
          onCreateDefect={handleCreateDefect}
          getResultIcon={getResultIcon}
        />

        <RecordResultDialog
          open={resultDialogOpen}
          testCaseName={selectedTestCase?.testCaseName || ''}
          testCaseId={selectedTestCase?.testCaseId || ''}
          projectId={testRun.project?.id || ''}
          testRunEnvironment={testRun.environment}
          formData={resultForm}
          onOpenChange={setResultDialogOpen}
          onFormChange={(data) => {
            const filteredData = Object.fromEntries(
              Object.entries(data).filter(([, value]) => value !== undefined)
            ) as Record<string, string>;
            setResultForm({ ...resultForm, ...filteredData } as ResultFormData);
          }}
          onSubmit={handleSubmitResult}
          refreshTrigger={defectRefreshTrigger}
        />

        <AddTestCasesDialog
          open={addCasesDialogOpen}
          testCases={availableTestCases}
          selectedIds={selectedCaseIds}
          onOpenChange={setAddCasesDialogOpen}
          onSelectionChange={(ids) => setSelectedCaseIds(ids)}
          onSubmit={handleAddTestCases}
          context="run"
          showPriority={false}
          loading={addingTestCases}
        />

        <AddTestSuitesDialog
          open={addSuitesDialogOpen}
          availableTestSuites={availableTestSuites as Array<{
            id: string;
            name: string;
            description?: string;
            testCases: Array<{
              id: string;
              title?: string;
              name?: string;
              priority: 'low' | 'medium' | 'high' | 'critical';
              status: string;
              description?: string;
            }>;
            _count?: {
              testCases: number;
            };
          }>}
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
          loading={addingTestSuites}
          fetchingData={loadingSuites}
        />

        {selectedTestCaseForDefect && testRun.project?.id && (
          <CreateDefectDialog
            projectId={testRun.project.id}
            triggerOpen={createDefectDialogOpen}
            onOpenChange={setCreateDefectDialogOpen}
            onDefectCreated={handleDefectCreated}
            testCaseId={selectedTestCaseForDefect}
            testRunEnvironment={testRun.environment}
          />
        )}

        <SendTestRunReportDialog
          open={sendReportDialogOpen}
          onOpenChange={setSendReportDialogOpen}
          onConfirm={handleSendReportYes}
        />
      </div>

      <FloatingAlert
        alert={floatingAlert}
        onClose={() => setFloatingAlert(null)}
      />
    </div>
  );
}

