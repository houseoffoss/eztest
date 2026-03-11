'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Badge } from '@/frontend/reusable-elements/badges/Badge';
import { ButtonSecondary } from '@/frontend/reusable-elements/buttons/ButtonSecondary';
import { Plus, Trash2, Import, Upload } from 'lucide-react';
import { Navbar } from '@/frontend/reusable-components/layout/Navbar';
import { Breadcrumbs } from '@/frontend/reusable-components/layout/Breadcrumbs';
import { Loader } from '@/frontend/reusable-elements/loaders/Loader';
import { Pagination } from '@/frontend/reusable-elements/pagination/Pagination';
import { FloatingAlert, type FloatingAlertMessage } from '@/frontend/reusable-components/alerts/FloatingAlert';
import { usePermissions } from '@/hooks/usePermissions';
import { DefectTable, type Defect, type SortField, type SortOrder } from '@/frontend/reusable-components/tables/DefectTable';
import { BaseConfirmDialog } from '@/frontend/reusable-components/dialogs/BaseConfirmDialog';
import { DefectFilters } from './subcomponents/DefectFilters';
import { EmptyDefectState } from './subcomponents/EmptyDefectState';
import { CreateDefectDialog } from './subcomponents/CreateDefectDialog';
import { FileImportDialog } from '@/frontend/reusable-components/dialogs/FileImportDialog';
import { FileExportDialog } from '@/frontend/reusable-components/dialogs/FileExportDialog';

interface Project {
  id: string;
  name: string;
  key: string;
  description: string | null;
}

interface DefectListProps {
  projectId: string;
}

export default function DefectList({ projectId }: DefectListProps) {
  const router = useRouter();
  const { hasPermission: hasPermissionCheck, isLoading: permissionsLoading, role } = usePermissions();

  const [project, setProject] = useState<Project | null>(null);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [filteredDefects, setFilteredDefects] = useState<Defect[]>([]);
  const [paginatedDefects, setPaginatedDefects] = useState<Defect[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [availableAssignees, setAvailableAssignees] = useState<Array<{ id: string; name: string }>>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [singleDeleteConfirmOpen, setSingleDeleteConfirmOpen] = useState(false);
  const [defectToDelete, setDefectToDelete] = useState<Defect | null>(null);
  
  // Selection state
  const [selectedDefects, setSelectedDefects] = useState<Set<string>>(new Set());
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');

  // Sorting
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [totalPagesCount, setTotalPagesCount] = useState(1);

  // Alert state
  const [alert, setAlert] = useState<FloatingAlertMessage | null>(null);

  // Check permissions early
  const canCreateDefect = hasPermissionCheck('defects:create');
  const canDeleteDefect = hasPermissionCheck('defects:delete');
  const canImport = ['ADMIN', 'PROJECT_MANAGER', 'TESTER'].includes(role);

  // Navbar actions config
  const navbarActions = useMemo(() => {
    const actions = [];
    
    // Migration Dropdown
    if (canImport) {
      actions.push({
        type: 'dropdown' as const,
        label: 'マイグレーション',
        items: [
          {
            label: 'Defectをインポート',
            icon: Import,
            onClick: () => setImportDialogOpen(true),
          },
          {
            label: 'Defectをエクスポート',
            icon: Upload,
            onClick: () => setExportDialogOpen(true),
          },
        ],
      });
    }

    // Create Defect Button
    if (canCreateDefect) {
      actions.push({
        type: 'action' as const,
        label: '新規Defect',
        icon: Plus,
        onClick: () => setCreateDialogOpen(true),
        variant: 'primary' as const,
        buttonName: 'Defect List - New Defect',
      });
    }

    // Sign Out Button
    actions.push({
      type: 'signout' as const,
      showConfirmation: true,
    });

    return actions;
  }, [canImport, canCreateDefect]);

  useEffect(() => {
    setMounted(true);
    
    // Restore filters from sessionStorage
    const savedFilters = sessionStorage.getItem(`defects-filters-${projectId}`);
    if (savedFilters) {
      try {
        const filters = JSON.parse(savedFilters);
        setSearchQuery(filters.searchQuery || '');
        // Ensure filter values are strings, not arrays (from old implementation)
        setSeverityFilter(typeof filters.severityFilter === 'string' ? filters.severityFilter : 'all');
        setPriorityFilter(typeof filters.priorityFilter === 'string' ? filters.priorityFilter : 'all');
        setStatusFilter(typeof filters.statusFilter === 'string' ? filters.statusFilter : 'all');
        setAssigneeFilter(typeof filters.assigneeFilter === 'string' ? filters.assigneeFilter : 'all');
      } catch (error) {
        console.error('Error restoring filters:', error);
      }
    }
  }, [projectId]);

  // Save filters to sessionStorage
  useEffect(() => {
    if (mounted) {
      const filters = {
        searchQuery,
        severityFilter,
        priorityFilter,
        statusFilter,
        assigneeFilter,
      };
      sessionStorage.setItem(`defects-filters-${projectId}`, JSON.stringify(filters));
    }
  }, [mounted, projectId, searchQuery, severityFilter, priorityFilter, statusFilter, assigneeFilter]);

  useEffect(() => {
    fetchProject();
    fetchDefects();
    fetchAvailableAssignees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    if (project) {
      document.title = `Defect - ${project.name} | EZTest`;
    }
  }, [project]);

  useEffect(() => {
    applyFiltersAndSort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defects, searchQuery, severityFilter, priorityFilter, statusFilter, assigneeFilter, sortField, sortOrder]);

  useEffect(() => {
    applyPagination();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredDefects, currentPage, itemsPerPage]);

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

  const fetchDefects = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}/defects`);
      const data = await response.json();
      if (data.data) {
        setDefects(data.data);
      } else {
        setDefects([]);
      }
    } catch (error) {
      console.error('Error fetching defects:', error);
      setDefects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableAssignees = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/members`);
      const data = await response.json();
      if (data.data) {
        setAvailableAssignees(
          data.data.map((member: { user: { id: string; name: string } }) => ({
            id: member.user.id,
            name: member.user.name,
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching assignees:', error);
    }
  };

  const applyFiltersAndSort = useCallback(() => {
    let filtered = [...defects];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (defect) =>
          defect.title.toLowerCase().includes(query) ||
          defect.description?.toLowerCase().includes(query) ||
          defect.defectId.toLowerCase().includes(query)
      );
    }

    // Severity filter
    if (severityFilter !== 'all') {
      filtered = filtered.filter((defect) => defect.severity === severityFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter((defect) => defect.priority === priorityFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((defect) => defect.status === statusFilter);
    }

    // Assignee filter
    if (assigneeFilter !== 'all') {
      filtered = filtered.filter((defect) => {
        if (assigneeFilter === 'unassigned') {
          return !defect.assignedTo;
        }
        return defect.assignedTo && defect.assignedTo.id === assigneeFilter;
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      let compareA: string | number;
      let compareB: string | number;

      switch (sortField) {
        case 'createdAt':
          compareA = new Date(a.createdAt).getTime();
          compareB = new Date(b.createdAt).getTime();
          break;
        case 'defectId':
          // Extract numeric part for proper sorting (e.g., DEF-2 vs DEF-19)
          const numA = parseInt(a.defectId.split('-')[1] || '0', 10);
          const numB = parseInt(b.defectId.split('-')[1] || '0', 10);
          compareA = numA;
          compareB = numB;
          break;
        case 'assignedTo':
          compareA = (a.assignedTo?.name || '').toLowerCase();
          compareB = (b.assignedTo?.name || '').toLowerCase();
          break;
        case 'reporter':
          compareA = (a.createdBy?.name || '').toLowerCase();
          compareB = (b.createdBy?.name || '').toLowerCase();
          break;
        case 'title':
          compareA = a.title.toLowerCase();
          compareB = b.title.toLowerCase();
          break;
        case 'severity':
          // Define severity order: CRITICAL > HIGH > MEDIUM > LOW
          const severityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
          compareA = severityOrder[a.severity as keyof typeof severityOrder] || 0;
          compareB = severityOrder[b.severity as keyof typeof severityOrder] || 0;
          break;
        case 'priority':
          // Define priority order: CRITICAL > HIGH > MEDIUM > LOW
          const priorityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
          compareA = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          compareB = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case 'status':
          compareA = a.status.toLowerCase();
          compareB = b.status.toLowerCase();
          break;
        default:
          compareA = '';
          compareB = '';
      }

      if (compareA < compareB) return sortOrder === 'asc' ? -1 : 1;
      if (compareA > compareB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredDefects(filtered);
    setCurrentPage(1);
    setSelectedDefects(new Set()); // Clear selection when filters change
  }, [defects, searchQuery, severityFilter, priorityFilter, statusFilter, assigneeFilter, sortField, sortOrder]);

  const applyPagination = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedDefects(filteredDefects.slice(startIndex, endIndex));
    setTotalPagesCount(Math.ceil(filteredDefects.length / itemsPerPage));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedDefects(new Set()); // Clear selection when page changes
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
    setSelectedDefects(new Set()); // Clear selection
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc'); // Default to desc when changing field
    }
  };

  const handleSelectDefect = (defectId: string) => {
    setSelectedDefects((prev) => {
      const next = new Set(prev);
      if (next.has(defectId)) {
        next.delete(defectId);
      } else {
        next.add(defectId);
      }
      return next;
    });
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedDefects(new Set(paginatedDefects.map((d) => d.id)));
    } else {
      setSelectedDefects(new Set());
    }
  };

  const handleDefectClick = (defectId: string) => {
    router.push(`/projects/${projectId}/defects/${defectId}`);
  };

  const handleBulkDelete = () => {
    if (selectedDefects.size === 0) return;
    setDeleteConfirmOpen(true);
  };

  const handleSingleDelete = (defect: Defect) => {
    setDefectToDelete(defect);
    setSingleDeleteConfirmOpen(true);
  };

  const handleConfirmBulkDelete = async () => {
    try {
      const deletePromises = Array.from(selectedDefects).map((id) =>
        fetch(`/api/projects/${projectId}/defects/${id}`, { method: 'DELETE' })
      );

      await Promise.all(deletePromises);

      setAlert({
        type: 'success',
        title: 'Success',
        message: `${selectedDefects.size} 件のDefectを削除しました`,
      });
      setTimeout(() => setAlert(null), 5000);
      
      setSelectedDefects(new Set());
      fetchDefects();
    } catch {
      setAlert({
        type: 'error',
        title: 'エラー',
        message: '一部のDefectの削除に失敗しました',
      });
      setTimeout(() => setAlert(null), 5000);
    }
  };

  const handleConfirmSingleDelete = async () => {
    if (!defectToDelete) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/defects/${defectToDelete.id}`, { method: 'DELETE' });
      
      if (response.ok) {
        setAlert({
          type: 'success',
          title: '成功',
          message: 'Defectを削除しました',
        });
        setTimeout(() => setAlert(null), 5000);
        fetchDefects();
      } else {
        throw new Error('Failed to delete');
      }
    } catch {
      setAlert({
        type: 'error',
        title: 'エラー',
        message: 'Defectの削除に失敗しました',
      });
      setTimeout(() => setAlert(null), 5000);
    } finally {
      setDefectToDelete(null);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleBulkStatusChange = () => {
    // This would open a dialog to select new status
    setAlert({
      type: 'success',
      title: '準備中',
      message: '一括ステータス変更機能は開発中です',
    });
    setTimeout(() => setAlert(null), 3000);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleBulkAssign = () => {
    // This would open a dialog to select assignee
    setAlert({
      type: 'success',
      title: '準備中',
      message: '一括アサイン機能は開発中です',
    });
    setTimeout(() => setAlert(null), 3000);
  };


  if (loading || permissionsLoading) {
    return <Loader fullScreen text="Defectを読み込み中..." />;
  }

  return (
    <>
      {/* Alert Messages */}
      <FloatingAlert alert={alert} onClose={() => setAlert(null)} />

      <Navbar 
        brandLabel={null}
        items={[]}
        breadcrumbs={
          <Breadcrumbs 
            items={[
              { label: 'プロジェクト', href: '/projects' },
              { label: project?.name || '読み込み中...', href: `/projects/${projectId}` },
              { label: 'Defect', href: `/projects/${projectId}/defects` }
            ]}
          />
        }
        actions={navbarActions}
      />
      
      <div className="px-4 sm:px-6 lg:px-8 pt-8 w-full min-w-0 overflow-hidden">
        {/* Header Section */}
        <div className="flex flex-col gap-4 mb-6 w-full min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full min-w-0">
            <div className="shrink-0 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                {project && (
                  <Badge variant="outline" className="font-mono border-primary/40 bg-primary/10 text-primary text-xs px-2.5 py-0.5 flex-shrink-0">
                    {project.key}
                  </Badge>
                )}
                <h1 className="text-2xl font-bold text-white">Defect</h1>
              </div>
              {project && (
                <p className="text-white/70 text-sm">{project.name}</p>
              )}
            </div>

            {/* Selection Counter and Bulk Actions */}
            {selectedDefects.size > 0 && (
              <div className="flex items-center gap-3 flex-shrink-0">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                  {selectedDefects.size} 件選択中
                </Badge>
                {canDeleteDefect && (
                  <ButtonSecondary 
                    onClick={handleBulkDelete}
                    buttonName="Defect List - Bulk Delete"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    削除
                  </ButtonSecondary>
                )}
              </div>
            )}
          </div>

          {/* Statistics Chart - Commented out */}
          {/* <DefectStatistics projectId={projectId} refreshTrigger={defects.length} /> */}

          {/* Filters */}
          {mounted && (
            <DefectFilters
              searchQuery={searchQuery}
              severityFilter={severityFilter}
              priorityFilter={priorityFilter}
              statusFilter={statusFilter}
              assigneeFilter={assigneeFilter}
              onSearchChange={setSearchQuery}
              onSeverityChange={setSeverityFilter}
              onPriorityChange={setPriorityFilter}
              onStatusChange={setStatusFilter}
              onAssigneeChange={setAssigneeFilter}
              availableAssignees={availableAssignees}
            />
          )}

          {/* Total Count */}
          <div className="text-sm text-white/60">
            {defects.length} 件中 {filteredDefects.length} 件を表示
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 w-full min-w-0 overflow-hidden">
        {/* Defects Table */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredDefects.length === 0 ? (
          <EmptyDefectState
            hasFilters={searchQuery !== '' || severityFilter !== 'all' || priorityFilter !== 'all' || statusFilter !== 'all' || assigneeFilter !== 'all'}
            onCreateClick={() => setCreateDialogOpen(true)}
            canCreate={canCreateDefect}
          />
        ) : (
          <>
            <DefectTable
              defects={paginatedDefects}
              selectedDefects={selectedDefects}
              onSelectDefect={handleSelectDefect}
              onSelectAll={handleSelectAll}
              onClick={handleDefectClick}
              onDelete={handleSingleDelete}
              canDelete={canDeleteDefect}
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={handleSort}
            />

            {/* Pagination */}
            {filteredDefects.length > 0 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPagesCount}
                  totalItems={filteredDefects.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  itemsPerPageOptions={[10, 25, 50, 100]}
                  showItemsPerPage={true}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Defect Dialog */}
      {/* Bulk Delete Confirmation Dialog */}
      <BaseConfirmDialog
        title="Defectを削除"
        description={`${selectedDefects.size} 件のDefectを削除してもよろしいですか？この操作は取り消せません。`}
        submitLabel="削除"
        cancelLabel="キャンセル"
        triggerOpen={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onSubmit={handleConfirmBulkDelete}
        destructive={true}
      />

      {/* Single Delete Confirmation Dialog */}
      <BaseConfirmDialog
        title="Defectを削除"
        description={defectToDelete ? `Defect「${defectToDelete.title}」を削除してもよろしいですか？この操作は取り消せません。` : ''}
        submitLabel="削除"
        cancelLabel="キャンセル"
        triggerOpen={singleDeleteConfirmOpen}
        onOpenChange={setSingleDeleteConfirmOpen}
        onSubmit={handleConfirmSingleDelete}
        destructive={true}
      />

      <CreateDefectDialog
        projectId={projectId}
        triggerOpen={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onDefectCreated={(defect) => {
          setCreateDialogOpen(false);
          setAlert({
            type: 'success',
            title: '成功',
            message: `Defect ${defect.defectId} を作成しました`,
          });
          setTimeout(() => setAlert(null), 5000);
          fetchDefects();
        }}
      />

      {/* Import Dialog */}
      <FileImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        title="Defectをインポート"
        description="CSV または Excel ファイルをアップロードして、複数のDefectを一括インポートできます。"
        importEndpoint={`/api/projects/${projectId}/defects/import`}
        templateEndpoint={`/api/projects/${projectId}/defects/import/template`}
        itemName="Defect"
        onImportComplete={() => {
          fetchDefects();
          setImportDialogOpen(false);
        }}
      />

      {/* Export Dialog */}
      <FileExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        title="Defectをエクスポート"
        description="Defectのエクスポート形式を選択してください"
        exportOptions={{
          projectId,
          endpoint: `/api/projects/${projectId}/defects/export`,
          filters: {
            status: statusFilter !== 'all' ? statusFilter : undefined,
            severity: severityFilter !== 'all' ? severityFilter : undefined,
            priority: priorityFilter !== 'all' ? priorityFilter : undefined,
            assignedToId: assigneeFilter !== 'all' && assigneeFilter !== 'unassigned' ? assigneeFilter : undefined,
          },
        }}
        itemName="Defect"
      />
    </>
  );
}
