'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';
import { ButtonSecondary } from '@/frontend/reusable-elements/buttons/ButtonSecondary';
import { TopBar } from '@/frontend/reusable-components/layout/TopBar';
import { Loader } from '@/frontend/reusable-elements/loaders/Loader';
import { Plus, Upload, FileCode } from 'lucide-react';
import { FloatingAlert, type FloatingAlertMessage } from '@/frontend/reusable-components/alerts/FloatingAlert';
import { PageHeaderWithBadge } from '@/frontend/reusable-components/layout/PageHeaderWithBadge';
import { HeaderWithFilters } from '@/frontend/reusable-components/layout/HeaderWithFilters';
import { ResponsiveGrid } from '@/frontend/reusable-components/layout/ResponsiveGrid';
import { TestRunsFilterCard } from './subcomponents/TestRunsFilterCard';
import { TestRunCard } from './subcomponents/TestRunCard';
import { TestRunsEmptyState } from './subcomponents/TestRunsEmptyState';
import { CreateTestRunDialog } from './subcomponents/CreateTestRunDialog';
import { EditTestRunDialog } from './subcomponents/EditTestRunDialog';
import { DeleteTestRunDialog } from './subcomponents/DeleteTestRunDialog';
import { UploadTestNGXMLDialog } from './subcomponents/UploadTestNGXMLDialog';
import { TestRun, Project, TestRunFilters } from './types';
import { usePermissions } from '@/hooks/usePermissions';
import { FileExportDialog } from '@/frontend/reusable-components/dialogs/FileExportDialog';

interface TestRunsListProps {
  projectId: string;
}

export default function TestRunsList({ projectId }: TestRunsListProps) {
  const router = useRouter();
  const { hasPermission: hasPermissionCheck, isLoading: permissionsLoading } = usePermissions();

  const [project, setProject] = useState<Project | null>(null);
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [filteredTestRuns, setFilteredTestRuns] = useState<TestRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [uploadXMLDialogOpen, setUploadXMLDialogOpen] = useState(false);
  const [selectedTestRun, setSelectedTestRun] = useState<TestRun | null>(null);

  const [filters, setFilters] = useState<TestRunFilters>({
    searchQuery: '',
    statusFilter: 'all',
    environmentFilter: 'all',
    platformFilter: 'all',
    deviceFilter: 'all',
    assignedToFilter: 'all',
  });

  const [alert, setAlert] = useState<FloatingAlertMessage | null>(null);

  useEffect(() => {
    fetchProject();
    fetchTestRuns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    if (project) {
      document.title = `テストラン - ${project.name} | EZTest`;
    }
  }, [project]);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testRuns, filters]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      const data = await response.json();
      if (data.data) {
        setProject(data.data);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };

  const fetchTestRuns = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}/testruns`);
      const data = await response.json();
      if (data.data) {
        setTestRuns(data.data);
      }
    } catch (error) {
      console.error('Error fetching test runs:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...testRuns];

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (tr) =>
          tr.name.toLowerCase().includes(query) ||
          tr.description?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filters.statusFilter !== 'all') {
      filtered = filtered.filter((tr) => tr.status === filters.statusFilter);
    }

    // Environment filter
    if (filters.environmentFilter !== 'all') {
      filtered = filtered.filter(
        (tr) => tr.environment === filters.environmentFilter
      );
    }

    // Platform filter
    if (filters.platformFilter !== 'all') {
      filtered = filtered.filter(
        (tr) => tr.platform === filters.platformFilter
      );
    }

    // Device filter
    if (filters.deviceFilter !== 'all') {
      filtered = filtered.filter(
        (tr) => tr.device === filters.deviceFilter
      );
    }

    // Assigned tester filter
    if (filters.assignedToFilter !== 'all') {
      if (filters.assignedToFilter === 'unassigned') {
        filtered = filtered.filter((tr) => !tr.assignedTo);
      } else {
        filtered = filtered.filter(
          (tr) => tr.assignedTo?.id === filters.assignedToFilter
        );
      }
    }

    setFilteredTestRuns(filtered);
  };

  const handleTestRunCreated = (newTestRun: TestRun) => {
    setAlert({
      type: 'success',
      title: '成功',
      message: `テストラン「${newTestRun.name}」を作成しました`,
    });
    setTimeout(() => setAlert(null), 5000);
    fetchTestRuns();
  };

  const handleDeleteTestRun = async () => {
    if (!selectedTestRun) return;

    try {
      const response = await fetch(`/api/testruns/${selectedTestRun.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const deletedTestRunName = selectedTestRun.name;
        setDeleteDialogOpen(false);
        setSelectedTestRun(null);
        setAlert({
          type: 'success',
          title: '成功',
          message: `テストラン「${deletedTestRunName}」を削除しました`,
        });
        setTimeout(() => setAlert(null), 5000);
        fetchTestRuns();
      } else {
        const data = await response.json();
        setAlert({
          type: 'error',
          title: 'テストランの削除に失敗しました',
          message: data.error || 'テストランの削除に失敗しました',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
      setAlert({
        type: 'error',
        title: '接続エラー',
        message: errorMessage,
      });
      console.error('Error deleting test run:', error);
    }
  };

  const handleTestRunUpdated = (updatedTestRun: { id: string; name: string }) => {
    setEditDialogOpen(false);
    setSelectedTestRun(null);
    setAlert({
      type: 'success',
      title: '成功',
      message: `テストラン「${updatedTestRun.name}」を更新しました`,
    });
    setTimeout(() => setAlert(null), 5000);
    fetchTestRuns();
  };

  // Build tester filter options dynamically from test runs data
  const testerFilterOptions = useMemo(() => {
    const options: Array<{ value: string; label: string }> = [
      { value: 'all', label: 'すべてのテスター' },
      { value: 'unassigned', label: '未割り当て' },
    ];
    const seen = new Set<string>();
    testRuns.forEach((tr) => {
      if (tr.assignedTo && !seen.has(tr.assignedTo.id)) {
        seen.add(tr.assignedTo.id);
        options.push({
          value: tr.assignedTo.id,
          label: tr.assignedTo.name || tr.assignedTo.email,
        });
      }
    });
    return options;
  }, [testRuns]);

  if (loading || permissionsLoading) {
    return <Loader fullScreen text="テストランを読み込み中..." />;
  }

  const canCreateTestRun = hasPermissionCheck('testruns:create');
  const canUpdateTestRun = hasPermissionCheck('testruns:update');
  const canDeleteTestRun = hasPermissionCheck('testruns:delete');
  const canReadTestRun = hasPermissionCheck('testruns:read');


  return (
    <>
      {/* Alert Messages */}
      <FloatingAlert alert={alert} onClose={() => setAlert(null)} />

      <TopBar
        breadcrumbs={[
          { label: 'プロジェクト', href: '/projects' },
          { label: project?.name || '読み込み中...', href: `/projects/${projectId}` },
          { label: 'テストラン' },
        ]}
        actions={
          <div className="flex gap-2">
            {canReadTestRun && (
              <>
                <ButtonSecondary 
                  onClick={() => setUploadXMLDialogOpen(true)} 
                  className="cursor-pointer"
                  title="TestNG XML 結果をアップロード"
                  buttonName="Test Runs List - Upload XML"
                >
                  <FileCode className="w-4 h-4 mr-2" />
                  XML アップロード
                </ButtonSecondary>
                <ButtonSecondary 
                  onClick={() => setExportDialogOpen(true)} 
                  className="cursor-pointer"
                  title="テストランをエクスポート"
                  buttonName="Test Runs List - Export"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  エクスポート
                </ButtonSecondary>
              </>
            )}
            {canCreateTestRun && (
              <ButtonPrimary
                onClick={() => setCreateDialogOpen(true)}
                buttonName="Test Runs List - New Test Run"
              >
                <Plus className="w-4 h-4 mr-2" />
                新規テストラン
              </ButtonPrimary>
            )}
          </div>
        }
      />

      {/* Page Header and Filters */}
      <div className="px-8 pt-4">
        <HeaderWithFilters
          header={
            <PageHeaderWithBadge
              badge={project?.key}
              title="テストラン"
              description="テスト実行の進捗を管理・追跡します"
            />
          }
          filters={
            <TestRunsFilterCard
              filters={filters}
              testerOptions={testerFilterOptions}
              onSearchChange={(searchQuery) =>
                setFilters({ ...filters, searchQuery })
              }
              onStatusFilterChange={(statusFilter) =>
                setFilters({ ...filters, statusFilter })
              }
              onEnvironmentFilterChange={(environmentFilter) =>
                setFilters({ ...filters, environmentFilter })
              }
              onPlatformFilterChange={(platformFilter) =>
                setFilters({ ...filters, platformFilter })
              }
              onDeviceFilterChange={(deviceFilter) =>
                setFilters({ ...filters, deviceFilter })
              }
              onAssignedToFilterChange={(assignedToFilter) =>
                setFilters({ ...filters, assignedToFilter })
              }
            />
          }
          className="mb-4"
        />
      </div>

      {/* Test Runs Grid */}
      <div className="max-w-7xl mx-auto px-8 pb-8">
        {filteredTestRuns.length === 0 ? (
          <TestRunsEmptyState
            hasTestRuns={testRuns.length > 0}
            onCreateClick={() => setCreateDialogOpen(true)}
            canCreate={canCreateTestRun}
          />
        ) : (
          <ResponsiveGrid
            columns={{ default: 1, md: 2, lg: 3 }}
            gap="sm"
          >
            {filteredTestRuns.map((testRun) => (
              <TestRunCard
                key={testRun.id}
                testRun={testRun}
                canUpdate={canUpdateTestRun}
                canDelete={canDeleteTestRun}
                onCardClick={() =>
                  router.push(`/projects/${projectId}/testruns/${testRun.id}`)
                }
                onViewDetails={() =>
                  router.push(`/projects/${projectId}/testruns/${testRun.id}`)
                }
                onEdit={() => {
                  setSelectedTestRun(testRun);
                  setEditDialogOpen(true);
                }}
                onDelete={() => {
                  setSelectedTestRun(testRun);
                  setDeleteDialogOpen(true);
                }}
              />
            ))}
          </ResponsiveGrid>
        )}

        {/* Create Dialog */}
        <CreateTestRunDialog
          projectId={projectId}
          triggerOpen={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onTestRunCreated={handleTestRunCreated}
        />

        {/* Edit Dialog */}
        <EditTestRunDialog
          projectId={projectId}
          testRun={selectedTestRun}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onTestRunUpdated={handleTestRunUpdated}
        />

        {/* Delete Dialog */}
        <DeleteTestRunDialog
          testRun={selectedTestRun}
          triggerOpen={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteTestRun}
        />

        {/* Export Dialog */}
        <FileExportDialog
          open={exportDialogOpen}
          onOpenChange={setExportDialogOpen}
          title="テストランをエクスポート"
          description="エクスポート形式を選択してください。"
          exportOptions={{
            projectId,
            endpoint: `/api/projects/${projectId}/testruns/export`,
            filters: {
              status: filters.statusFilter !== 'all' ? filters.statusFilter : undefined,
              environment: filters.environmentFilter !== 'all' ? filters.environmentFilter : undefined,
            },
          }}
          itemName="テストラン"
        />

        {/* Upload XML Dialog */}
        <UploadTestNGXMLDialog
          open={uploadXMLDialogOpen}
          onOpenChange={setUploadXMLDialogOpen}
          projectId={projectId}
          onImportComplete={() => {
            fetchTestRuns();
          }}
        />
      </div>
    </>
  );
}
