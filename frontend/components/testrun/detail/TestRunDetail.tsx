import { useEffect, useState, useMemo, useCallback } from 'react';
import { Navbar } from '@/frontend/reusable-components/layout/Navbar';
import { Breadcrumbs } from '@/frontend/reusable-components/layout/Breadcrumbs';
import { Loader } from '@/frontend/reusable-elements/loaders/Loader';
import { FloatingAlert, FloatingAlertMessage } from '@/frontend/reusable-components/alerts/FloatingAlert';
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
  Upload,
} from 'lucide-react';
import { TestRun, TestCase, ResultFormData, TestRunStats, TestSuite } from './types';
import { usePermissions } from '@/hooks/usePermissions';
import { useFormPersistence } from '@/hooks/useFormPersistence';
import { FileExportDialog } from '@/frontend/reusable-components/dialogs/FileExportDialog';
import { EditTestRunDialog } from '@/frontend/components/testrun/subcomponents/EditTestRunDialog';

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
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

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

  // Check permissions for navbar
  const canUpdateTestRun = hasPermissionCheck('testruns:update');
  const canCreateTestRun = hasPermissionCheck('testruns:create');
  hasPermissionCheck('testruns:read');

  const executionTypeLabel = useMemo(() => {
    const type = (testRun?.executionType || 'MANUAL').toString().toUpperCase();
    return type === 'AUTOMATION' ? 'AUTOMATION' : 'MANUAL';
  }, [testRun?.executionType]);

  // For automation runs, allow defect actions even after completion
  const showAutomationDefectActions = useMemo(() => {
    const type = (testRun?.executionType || 'MANUAL').toString().toUpperCase();
    return type === 'AUTOMATION' && testRun?.status === 'COMPLETED';
  }, [testRun?.executionType, testRun?.status]);

  const navbarActions = useMemo(() => {
    const actions = [];
    
    // Only show export button to users who can update (not read-only viewers)
    if (canUpdateTestRun) {
      actions.push({
        type: 'action' as const,
        label: 'レポートをエクスポート',
        icon: Upload,
        onClick: () => setExportDialogOpen(true),
        variant: 'secondary' as const,
        buttonName: 'Test Run Detail - Export Report',
      });
    }

    actions.push({
      type: 'signout' as const,
      showConfirmation: true,
    });

    return actions;
  }, [canUpdateTestRun]);

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
      // Extract projectId from URL path or use from testRun data
      let projectId = testRun?.project?.id;
      if (!projectId && typeof window !== 'undefined') {
        // Extract projectId from URL path: /projects/[id]/testruns/[testrunId]
        const pathSegments = window.location.pathname.split('/');
        const projectIndex = pathSegments.indexOf('projects');
        if (projectIndex !== -1 && projectIndex + 1 < pathSegments.length) {
          projectId = pathSegments[projectIndex + 1];
        }
      }
      const url = projectId 
        ? `/api/projects/${projectId}/testruns/${testRunId}`
        : `/api/testruns/${testRunId}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.data) {
        setTestRun(data.data);
      } else {
        alert(data.error || 'テストランの取得に失敗しました');
      }
    } catch (error) {
      console.error('Error fetching test run:', error);
      alert('テストランの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTestRun = async () => {
    try {
      setActionLoading(true);
      let projectId = testRun?.project?.id;
      if (!projectId && typeof window !== 'undefined') {
        const pathSegments = window.location.pathname.split('/');
        const projectIndex = pathSegments.indexOf('projects');
        if (projectIndex !== -1 && projectIndex + 1 < pathSegments.length) {
          projectId = pathSegments[projectIndex + 1];
        }
      }
      const response = await fetch(`/api/projects/${projectId}/testruns/${testRunId}/start`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.data) {
        fetchTestRun();
      } else {
        alert(data.error || 'テストランの開始に失敗しました');
      }
    } catch (error) {
      console.error('Error starting test run:', error);
      alert('テストランの開始に失敗しました');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteTestRun = async () => {
    try {
      setActionLoading(true);
      let projectId = testRun?.project?.id;
      if (!projectId && typeof window !== 'undefined') {
        const pathSegments = window.location.pathname.split('/');
        const projectIndex = pathSegments.indexOf('projects');
        if (projectIndex !== -1 && projectIndex + 1 < pathSegments.length) {
          projectId = pathSegments[projectIndex + 1];
        }
      }
      const response = await fetch(`/api/projects/${projectId}/testruns/${testRunId}/complete`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.data) {
        setTestRun(data.data);
        
        // Only show send report dialog if email is available
        if (data.data.emailAvailable === true) {
          setSendReportDialogOpen(true);
        } else {
          // Ensure dialog is closed
          setSendReportDialogOpen(false);
        }
      } else {
        alert(data.error || 'テストランの完了に失敗しました');
      }
    } catch (error) {
      console.error('Error completing test run:', error);
      alert('テストランの完了に失敗しました');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReopenTestRun = async () => {
    try {
      setActionLoading(true);
      let projectId = testRun?.project?.id;
      if (!projectId && typeof window !== 'undefined') {
        const pathSegments = window.location.pathname.split('/');
        const projectIndex = pathSegments.indexOf('projects');
        if (projectIndex !== -1 && projectIndex + 1 < pathSegments.length) {
          projectId = pathSegments[projectIndex + 1];
        }
      }
      const response = await fetch(`/api/projects/${projectId}/testruns/${testRunId}/reopen`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.data) {
        fetchTestRun();
      } else {
        alert(data.error || 'テストランの再開に失敗しました');
      }
    } catch (error) {
      console.error('Error reopening test run:', error);
      alert('テストランの再開に失敗しました');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTestRunUpdated = async () => {
    setEditDialogOpen(false);
    await fetchTestRun();
    setFloatingAlert({
      type: 'success',
      title: 'テストランを更新しました',
      message: 'テストラン情報を更新しました。',
    });
  };

  const handleSendReportYes = async () => {
    let projectId = testRun?.project?.id;
    if (!projectId && typeof window !== 'undefined') {
      const pathSegments = window.location.pathname.split('/');
      const projectIndex = pathSegments.indexOf('projects');
      if (projectIndex !== -1 && projectIndex + 1 < pathSegments.length) {
        projectId = pathSegments[projectIndex + 1];
      }
    }
    const response = await fetch(`/api/projects/${projectId}/testruns/${testRunId}/send-report`, {
      method: 'POST',
    });

    const data = await response.json();

    // Refresh test run data regardless of success/failure (non-blocking)
    await fetchTestRun();

    // If SMTP is disabled, don't show any notification
    if (data.data?.smtpDisabled) {
      return;
    }

    // Handle response - show floating alert instead of throwing error
    if (!data.data?.success) {
      // No emails were sent at all - show error alert
      const hasInvalidEmails = data.data.message?.includes('Invalid email') || data.data.message?.includes('No valid email');
      setFloatingAlert({
        type: 'error',
        title: hasInvalidEmails ? '無効なメールアドレス' : 'レポート送信に失敗しました',
        message: data.data.message || data.error || 'レポートの送信に失敗しました。受信者のメールアドレスを確認してください。',
      });
      return;
    }
    
    // Emails were sent successfully - check if there are warnings (invalid emails or failed sends)
    const hasInvalidEmails = data.data.message?.includes('Invalid email addresses skipped:');
    const hasFailedSends = data.data.message?.includes('Failed to send to:');
    
    // Show success alert if all went well, or warning if some emails had issues
    if (hasInvalidEmails || hasFailedSends) {
      setFloatingAlert({
        type: 'error', // Use error type to highlight the warning about invalid emails
        title: 'レポート送信完了 - 一部問題あり',
        message: data.data.message, // Message will include: "Report sent successfully to X recipient(s). Invalid email addresses skipped: ..."
      });
    } else {
      // All emails sent successfully, no issues
      setFloatingAlert({
        type: 'success',
        title: 'レポートを送信しました',
        message: data.data.message,
      });
    }
  };

  // RTC-ID昇順にソートしたテストケースリスト（ナビゲーション用）
  const sortedTestCases = useMemo(() => {
    if (!testRun?.results) return [];
    return [...testRun.results]
      .filter((r) => r.testCase)
      .map((r) => r.testCase)
      .sort((a, b) =>
        (a.rtcId || '').localeCompare(b.rtcId || '', undefined, { numeric: true })
      );
  }, [testRun?.results]);

  // ◀▶ナビゲーション（前後切り替え）
  const navigateTestCase = useCallback((direction: 'prev' | 'next') => {
    if (!selectedTestCase || sortedTestCases.length === 0) return;
    const currentIndex = sortedTestCases.findIndex(tc => tc.id === selectedTestCase.testCaseId);
    if (currentIndex === -1) return;
    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= sortedTestCases.length) return;

    const newTestCase = sortedTestCases[newIndex];
    const existingResult = testRun?.results.find((r) => r.testCaseId === newTestCase.id);

    setSelectedTestCase({
      testCaseId: newTestCase.id,
      testCaseName: newTestCase.title || newTestCase.name || '',
    });
    setResultForm({
      status: existingResult?.status || '',
      comment: existingResult?.comment || '',
    });
  }, [selectedTestCase, sortedTestCases, testRun?.results, setResultForm]);

  // 次のテストケースに遷移するヘルパー（保存後・欠陥作成後に使用）
  const navigateToNextTestCase = useCallback(() => {
    if (!selectedTestCase || sortedTestCases.length === 0) {
      setResultDialogOpen(false);
      setSelectedTestCase(null);
      return;
    }
    const currentIndex = sortedTestCases.findIndex(tc => tc.id === selectedTestCase.testCaseId);
    if (currentIndex >= 0 && currentIndex < sortedTestCases.length - 1) {
      const nextTestCase = sortedTestCases[currentIndex + 1];
      const nextResult = testRun?.results.find((r) => r.testCaseId === nextTestCase.id);
      setSelectedTestCase({
        testCaseId: nextTestCase.id,
        testCaseName: nextTestCase.title || nextTestCase.name || '',
      });
      setResultForm({
        status: nextResult?.status || '',
        comment: nextResult?.comment || '',
      });
      setResultDialogOpen(true);
    } else {
      setResultDialogOpen(false);
      setSelectedTestCase(null);
    }
  }, [selectedTestCase, sortedTestCases, testRun?.results, setResultForm]);

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

  const handleSubmitResult = async (durationSeconds?: number) => {
    if (!selectedTestCase || !resultForm.status) {
      alert('結果ステータスを選択してください');
      return;
    }

    try {
      let projectId = testRun?.project?.id;
      if (!projectId && typeof window !== 'undefined') {
        const pathSegments = window.location.pathname.split('/');
        const projectIndex = pathSegments.indexOf('projects');
        if (projectIndex !== -1 && projectIndex + 1 < pathSegments.length) {
          projectId = pathSegments[projectIndex + 1];
        }
      }

      const response = await fetch(`/api/projects/${projectId}/testruns/${testRunId}/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testCaseId: selectedTestCase.testCaseId,
          status: resultForm.status,
          comment: resultForm.comment,
          duration: durationSeconds,
        }),
      });

      const data = await response.json();

      if (data.data) {
        clearResultForm();
        fetchTestRun();

        if (resultForm.status === 'FAILED' && selectedTestCase) {
          // FAILED → 結果記録を閉じて新規欠陥作成ダイアログを開く
          setResultDialogOpen(false);
          setSelectedTestCaseForDefect(selectedTestCase.testCaseId);
          setCreateDefectDialogOpen(true);
        } else {
          // FAILED以外 → 次のテストケースへ遷移
          navigateToNextTestCase();
        }
      } else {
        alert(data.error || '結果の保存に失敗しました');
      }
    } catch (error) {
      console.error('Error saving result:', error);
      alert('結果の保存に失敗しました');
    }
  };

  const fetchAvailableTestCases = async () => {
    if (!testRun || !testRun.project?.id) return;

    try {
      // Fetch latest test run data to get current results
      let projectId = testRun?.project?.id;
      if (!projectId && typeof window !== 'undefined') {
        const pathSegments = window.location.pathname.split('/');
        const projectIndex = pathSegments.indexOf('projects');
        if (projectIndex !== -1 && projectIndex + 1 < pathSegments.length) {
          projectId = pathSegments[projectIndex + 1];
        }
      }
      const testRunResponse = await fetch(`/api/projects/${projectId}/testruns/${testRunId}`);
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
      alert('1件以上のテストケースを選択してください');
      return;
    }

    setAddingTestCases(true);
    try {
      console.log('Adding test cases:', selectedCaseIds);
      let projectId = testRun?.project?.id;
      if (!projectId && typeof window !== 'undefined') {
        const pathSegments = window.location.pathname.split('/');
        const projectIndex = pathSegments.indexOf('projects');
        if (projectIndex !== -1 && projectIndex + 1 < pathSegments.length) {
          projectId = pathSegments[projectIndex + 1];
        }
      }
      const promises = selectedCaseIds.map(async (testCaseId) => {
        const payload = {
          testCaseId,
          status: 'SKIPPED',
        };
        
        const response = await fetch(`/api/projects/${projectId}/testruns/${testRunId}/results`, {
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

      await Promise.all(promises);

      setAddCasesDialogOpen(false);
      setSelectedCaseIds([]);
      await fetchTestRun();
      // Refresh both lists to keep data in sync
      await fetchAvailableTestCases();
      await fetchAvailableTestSuites();
    } catch (error) {
      console.error('Error adding test cases:', error);
      alert(`テストケースの追加に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    } finally {
      setAddingTestCases(false);
    }
  };

  const fetchAvailableTestSuites = async () => {
    if (!testRun || !testRun.project?.id) return;

    setLoadingSuites(true);
    try {
      // Fetch latest test run data to get current results
      let projectId = testRun?.project?.id;
      if (!projectId && typeof window !== 'undefined') {
        const pathSegments = window.location.pathname.split('/');
        const projectIndex = pathSegments.indexOf('projects');
        if (projectIndex !== -1 && projectIndex + 1 < pathSegments.length) {
          projectId = pathSegments[projectIndex + 1];
        }
      }
      const testRunResponse = await fetch(`/api/projects/${projectId}/testruns/${testRunId}`);
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
              name: 'テストスイート未割当',
              description: 'いずれのテストスイートにも割り当てられていないテストケース',
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
      alert('1件以上のテストスイートを選択してください');
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
        alert('選択したテストスイートに追加する新しいテストケースがありません');
        return;
      }

      // Add all test cases from selected suites
      let projectId = testRun?.project?.id;
      if (!projectId && typeof window !== 'undefined') {
        const pathSegments = window.location.pathname.split('/');
        const projectIndex = pathSegments.indexOf('projects');
        if (projectIndex !== -1 && projectIndex + 1 < pathSegments.length) {
          projectId = pathSegments[projectIndex + 1];
        }
      }
      const promises = testCaseIds.map(async (testCaseId) => {
        const response = await fetch(`/api/projects/${projectId}/testruns/${testRunId}/results`, {
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
          } catch {
            const text = await response.text();
            if (text) errorMessage = text;
          }
          throw new Error(errorMessage);
        }

        return response.json();
      });

      await Promise.all(promises);

      setAddSuitesDialogOpen(false);
      setSelectedSuiteIds([]);
      await fetchTestRun();
      // Refresh both lists to keep data in sync
      await fetchAvailableTestSuites();
      await fetchAvailableTestCases();
    } catch (error) {
      console.error('Error adding test cases from suites:', error);
      alert(`テストスイートからのテストケース追加に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
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
    setDefectRefreshTrigger(prev => prev + 1);
    fetchTestRun();

    // 欠陥作成後、次のテストケースの結果記録ダイアログを開く
    navigateToNextTestCase();
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
    return <Loader fullScreen text="テストランを読み込み中..." />;
  }

  if (!testRun) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-400">テストランが見つかりません</p>
      </div>
    );
  }

  return (
    <div className="flex-1">
      {/* Navbar */}
      <Navbar
        brandLabel={null}
        items={[]}
        breadcrumbs={
          <Breadcrumbs 
            items={[
              { label: 'プロジェクト', href: '/projects' },
              {
                label: testRun.project?.name || 'プロジェクト',
                href: `/projects/${testRun.project?.id}`,
              },
              {
                label: 'テストラン',
                href: `/projects/${testRun.project?.id}/testruns`,
              },
              { label: testRun.name, href: `/projects/${testRun.project?.id}/testruns/${testRun.id}` },
            ]}
          />
        }
        actions={navbarActions}
      />

      <div className="p-4 md:p-6 lg:p-8 pt-8 space-y-6">
        <TestRunHeader
          testRun={testRun}
          executionTypeLabel={executionTypeLabel}
          actionLoading={actionLoading}
          canUpdate={canUpdateTestRun}
          onEditTestRun={() => setEditDialogOpen(true)}
          onStartTestRun={handleStartTestRun}
          onCompleteTestRun={handleCompleteTestRun}
          onReopenTestRun={handleReopenTestRun}
          totalExecutionTime={
            testRun.results
              ?.reduce((sum, r) => sum + (r.testCase?.estimatedTime || 0), 0) || 0
          }
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
          projectId={testRun.project?.id || ''}
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
          forceShowDefectActions={showAutomationDefectActions}
          getResultIcon={getResultIcon}
        />

        <RecordResultDialog
          open={resultDialogOpen}
          testCaseName={selectedTestCase?.testCaseName || ''}
          testCaseId={selectedTestCase?.testCaseId || ''}
          projectId={testRun.project?.id || ''}
          testRunEnvironment={testRun.environment}
          testRunPlatform={testRun.platform}
          testRunDevice={testRun.device}
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
          onNavigate={navigateTestCase}
          hasPrev={sortedTestCases.findIndex(tc => tc.id === selectedTestCase?.testCaseId) > 0}
          hasNext={(() => {
            const idx = sortedTestCases.findIndex(tc => tc.id === selectedTestCase?.testCaseId);
            return idx >= 0 && idx < sortedTestCases.length - 1;
          })()}
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
            testRunPlatform={testRun.platform}
            testRunDevice={testRun.device}
          />
        )}

        <SendTestRunReportDialog
          open={sendReportDialogOpen}
          onOpenChange={setSendReportDialogOpen}
          onConfirm={handleSendReportYes}
        />

        {/* Export Dialog */}
        {testRun && (
          <FileExportDialog
            open={exportDialogOpen}
            onOpenChange={setExportDialogOpen}
            title="テストランレポートをエクスポート"
            description="テストケースとDefectを含む詳細レポートのエクスポート形式を選択してください。"
            exportOptions={{
              projectId: testRun.project?.id || '',
              endpoint: `/api/projects/${testRun.project?.id}/testruns/${testRunId}/export`,
              filters: {},
            }}
            itemName="テストランレポート"
          />
        )}

        <EditTestRunDialog
          projectId={testRun.project?.id || ''}
          testRun={testRun}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onTestRunUpdated={handleTestRunUpdated}
        />
      </div>

      <FloatingAlert
        alert={floatingAlert}
        onClose={() => setFloatingAlert(null)}
      />
    </div>
  );
}

