'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Badge } from '@/elements/badge';
import { ButtonPrimary } from '@/elements/button-primary';
import { ButtonSecondary } from '@/elements/button-secondary';
import { Plus, Trash2, RefreshCw, UserPlus } from 'lucide-react';
import { TopBar } from '@/components/design';
import { Loader } from '@/elements/loader';
import { Pagination } from '@/elements/pagination';
import { FloatingAlert, type FloatingAlertMessage } from '@/components/utils/FloatingAlert';
import { usePermissions } from '@/hooks/usePermissions';
import { DefectTable, type Defect, type SortField, type SortOrder } from '@/components/common/tables/DefectTable';
import { DefectFilters } from './subcomponents/DefectFilters';
import { EmptyDefectState } from './subcomponents/EmptyDefectState';
import { CreateDefectDialog } from './subcomponents/CreateDefectDialog';

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
  const { hasPermission: hasPermissionCheck, isLoading: permissionsLoading } = usePermissions();

  const [project, setProject] = useState<Project | null>(null);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [filteredDefects, setFilteredDefects] = useState<Defect[]>([]);
  const [paginatedDefects, setPaginatedDefects] = useState<Defect[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [availableAssignees, setAvailableAssignees] = useState<Array<{ id: string; name: string }>>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
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
      document.title = `Defects - ${project.name} | EZTest`;
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

  const handleBulkDelete = async () => {
    if (selectedDefects.size === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedDefects.size} defect(s)?`)) {
      return;
    }

    try {
      const deletePromises = Array.from(selectedDefects).map((id) =>
        fetch(`/api/defects/${id}`, { method: 'DELETE' })
      );

      await Promise.all(deletePromises);

      setAlert({
        type: 'success',
        title: 'Success',
        message: `${selectedDefects.size} defect(s) deleted successfully`,
      });
      setTimeout(() => setAlert(null), 5000);
      
      setSelectedDefects(new Set());
      fetchDefects();
    } catch {
      setAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete some defects',
      });
      setTimeout(() => setAlert(null), 5000);
    }
  };

  const handleBulkStatusChange = () => {
    // This would open a dialog to select new status
    setAlert({
      type: 'success',
      title: 'Coming Soon',
      message: 'Bulk status change feature is under development',
    });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleBulkAssign = () => {
    // This would open a dialog to select assignee
    setAlert({
      type: 'success',
      title: 'Coming Soon',
      message: 'Bulk assign feature is under development',
    });
    setTimeout(() => setAlert(null), 3000);
  };

  if (loading || permissionsLoading) {
    return <Loader fullScreen text="Loading defects..." />;
  }

  const canCreateDefect = hasPermissionCheck('defects:create');
  const canEditDefect = hasPermissionCheck('defects:update');
  const canDeleteDefect = hasPermissionCheck('defects:delete');
  const canAssignDefect = hasPermissionCheck('defects:assign');

  return (
    <>
      {/* Alert Messages */}
      <FloatingAlert alert={alert} onClose={() => setAlert(null)} />

      <TopBar 
        breadcrumbs={[
          { label: 'Projects', href: '/projects' },
          { label: project?.name || 'Loading...', href: `/projects/${projectId}` },
          { label: 'Defects' }
        ]}
        actions={
          canCreateDefect ? (
            <ButtonPrimary onClick={() => setCreateDialogOpen(true)} className="cursor-pointer">
              <Plus className="w-4 h-4 mr-2" />
              New Defect
            </ButtonPrimary>
          ) : undefined
        }
      />
      
      <div className="px-8 pt-4">
        {/* Header Section */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="shrink-0">
              <div className="flex items-center gap-3 mb-2">
                {project && (
                  <Badge variant="outline" className="font-mono border-primary/40 bg-primary/10 text-primary text-xs px-2.5 py-0.5">
                    {project.key}
                  </Badge>
                )}
                <h1 className="text-2xl font-bold text-white">Defects</h1>
              </div>
              {project && (
                <p className="text-white/70 text-sm">{project.name}</p>
              )}
            </div>

            {/* Selection Counter and Bulk Actions */}
            {selectedDefects.size > 0 && (
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                  {selectedDefects.size} selected
                </Badge>
                <div className="flex gap-2">
                  <ButtonSecondary onClick={handleBulkStatusChange} className="cursor-pointer">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Change Status
                  </ButtonSecondary>
                  {canAssignDefect && (
                    <ButtonSecondary onClick={handleBulkAssign} className="cursor-pointer">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Assign
                    </ButtonSecondary>
                  )}
                  {canDeleteDefect && (
                    <ButtonSecondary 
                      onClick={handleBulkDelete}
                      className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </ButtonSecondary>
                  )}
                </div>
              </div>
            )}
          </div>

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
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1600px] mx-auto px-8 py-4">
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
              onEdit={(defect) => router.push(`/projects/${projectId}/defects/${defect.id}/edit`)}
              onDelete={(defect) => {
                if (confirm(`Are you sure you want to delete defect "${defect.title}"?`)) {
                  fetch(`/api/defects/${defect.id}`, { method: 'DELETE' })
                    .then(() => {
                      setAlert({
                        type: 'success',
                        title: 'Success',
                        message: 'Defect deleted successfully',
                      });
                      setTimeout(() => setAlert(null), 5000);
                      fetchDefects();
                    })
                    .catch(() => {
                      setAlert({
                        type: 'error',
                        title: 'Error',
                        message: 'Failed to delete defect',
                      });
                      setTimeout(() => setAlert(null), 5000);
                    });
                }
              }}
              onChangeStatus={() => {
                setAlert({
                  type: 'success',
                  title: 'Coming Soon',
                  message: 'Status change feature is under development',
                });
                setTimeout(() => setAlert(null), 3000);
              }}
              onAssign={() => {
                setAlert({
                  type: 'success',
                  title: 'Coming Soon',
                  message: 'Assign feature is under development',
                });
                setTimeout(() => setAlert(null), 3000);
              }}
              canEdit={canEditDefect}
              canDelete={canDeleteDefect}
              canAssign={canAssignDefect}
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
      <CreateDefectDialog
        projectId={projectId}
        triggerOpen={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onDefectCreated={(defect) => {
          setCreateDialogOpen(false);
          setAlert({
            type: 'success',
            title: 'Success',
            message: `Defect ${defect.defectId} created successfully`,
          });
          setTimeout(() => setAlert(null), 5000);
          fetchDefects();
        }}
      />
    </>
  );
}
