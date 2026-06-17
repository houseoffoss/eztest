'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Badge } from '@/frontend/reusable-elements/badges/Badge';
import { Button } from '@/frontend/reusable-elements/buttons/Button';
import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';
import { ButtonSecondary } from '@/frontend/reusable-elements/buttons/ButtonSecondary';
import { formatDateTime } from '@/lib/date-utils';
import { DetailCard } from '@/frontend/reusable-components/cards/DetailCard';
import { DataTable, type ColumnDef } from '@/frontend/reusable-components/tables/DataTable';
import { Pagination } from '@/frontend/reusable-elements/pagination/Pagination';
import { PAGE_SIZE_OPTIONS } from '@/lib/pagination-config';
import { Checkbox } from '@/frontend/reusable-elements/checkboxes/Checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/frontend/reusable-elements/dialogs/Dialog';
import { Label } from '@/frontend/reusable-elements/labels/Label';
import { Textarea } from '@/frontend/reusable-elements/textareas/Textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/frontend/reusable-elements/selects/Select';
import { BaseConfirmDialog } from '@/frontend/reusable-components/dialogs/BaseConfirmDialog';
import { AlertCircle, Plus, Bug, ListChecks, ChevronDown } from 'lucide-react';
import { TestResult, TestCase } from '../types';
import { useDropdownOptions } from '@/hooks/useDropdownOptions';
import { getDynamicBadgeProps } from '@/lib/badge-color-utils';
import { usePermissions } from '@/hooks/usePermissions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/frontend/reusable-elements/dropdowns/DropdownMenu';

interface TestCasesListCardProps {
  testRunId: string;
  results: TestResult[];
  testRunStatus: string;
  canUpdate?: boolean;
  canCreate?: boolean;
  projectId: string;
  onRefresh: () => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  statusFilter: string;
  ownerFilter: string;
  statusSort: 'none' | 'asc' | 'desc';
  onStatusFilterChange: (value: string) => void;
  onOwnerFilterChange: (value: string) => void;
  onStatusSortChange: (value: 'none' | 'asc' | 'desc') => void;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  onAddTestCases: () => void;
  onAddTestSuites: () => void;
  onExecuteTestCase: (testCase: TestCase) => void;
  onCreateDefect?: (testCaseId: string) => void;
  forceShowDefectActions?: boolean;
  getResultIcon: (status?: string) => React.JSX.Element;
}

interface ResultRow {
  id: string;
  testCase: TestCase;
  status: string;
  comment?: string;
  executedBy?: { id?: string; name: string };
  executedAt?: string;
}

export function TestCasesListCard({
  testRunId,
  results,
  testRunStatus,
  canUpdate = true,
  canCreate = true,
  projectId,
  onRefresh,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  statusFilter,
  ownerFilter,
  statusSort,
  onStatusFilterChange,
  onOwnerFilterChange,
  onStatusSortChange,
  onPageChange,
  onItemsPerPageChange,
  onAddTestCases,
  onAddTestSuites,
  onExecuteTestCase,
  onCreateDefect,
  forceShowDefectActions = false,
  getResultIcon,
}: TestCasesListCardProps) {
  const { data: session } = useSession();
  const [selectedTestCaseIds, setSelectedTestCaseIds] = useState<Set<string>>(new Set());
  const [bulkExecuteOpen, setBulkExecuteOpen] = useState(false);
  const [bulkAssignOpen, setBulkAssignOpen] = useState(false);
  const [bulkRemoveOpen, setBulkRemoveOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkComment, setBulkComment] = useState('');
  const [bulkExecutorId, setBulkExecutorId] = useState('current-user');
  const [bulkAssigneeId, setBulkAssigneeId] = useState('');
  const [members, setMembers] = useState<Array<{ id: string; name: string }>>([]);
  const [submittingBulk, setSubmittingBulk] = useState(false);
  const { options: priorityOptions, loading: loadingPriority } = useDropdownOptions('TestCase', 'priority');
  const { options: statusOptions, loading: loadingStatus } = useDropdownOptions('TestResult', 'status');
  const { hasPermission: hasPermissionCheck, role } = usePermissions();
  const currentUserId = session?.user?.id;
  const membersForFilter = React.useMemo(
    () =>
      [...members]
        .sort((a, b) => {
          const aIsCurrent = !!currentUserId && a.id === currentUserId;
          const bIsCurrent = !!currentUserId && b.id === currentUserId;

          if (aIsCurrent && !bIsCurrent) return -1;
          if (!aIsCurrent && bIsCurrent) return 1;
          return a.name.localeCompare(b.name, 'ru');
        })
        .map((member) => ({
          ...member,
          label: currentUserId && member.id === currentUserId ? `${member.name} (Я)` : member.name,
        })),
    [members, currentUserId]
  );
  
  // Check if user can create defects
  const canCreateDefect = hasPermissionCheck('defects:create');
  const isAdmin = role === 'ADMIN';

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/members`);
        const data = await response.json();
        if (data.data) {
          setMembers(
            data.data.map((member: { user: { id: string; name: string } }) => ({
              id: member.user.id,
              name: member.user.name,
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching project members:', error);
      }
    };

    fetchMembers();
  }, [projectId]);

  const getStatusLabel = (status: string) => {
    if (status === 'NOT_RUN' || status === 'SKIPPED') {
      return 'Не запускался';
    }

    if (!loadingStatus && statusOptions.length > 0) {
      return statusOptions.find((opt) => opt.value === status)?.label || status;
    }

    return status;
  };

  const columns: ColumnDef<ResultRow>[] = [
    {
      key: 'select',
      label: '',
      className: 'w-10',
      render: (_, row: ResultRow) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={selectedTestCaseIds.has(row.testCase.id)}
            onCheckedChange={() => {
              setSelectedTestCaseIds((prev) => {
                const next = new Set(prev);
                if (next.has(row.testCase.id)) {
                  next.delete(row.testCase.id);
                } else {
                  next.add(row.testCase.id);
                }
                return next;
              });
            }}
          />
        </div>
      ),
    },
    {
      key: 'tcId',
      label: 'ID тест-кейса',
      className: 'min-w-[80px]',
      render: (_, row: ResultRow) => (
        <p className="text-xs font-mono text-white/70 truncate">{row.testCase.tcId || '-'}</p>
      ),
    },
    {
      key: 'testCase',
      label: 'Тест-кейс',
      className: 'min-w-0 max-w-xs whitespace-normal',
      render: (_, row: ResultRow) => (
        <div className="min-w-0 max-w-xs overflow-hidden">
          <p className="font-medium text-white/90 truncate block">{row.testCase.title}</p>
          {row.comment && (
            <p className="text-xs text-white/60 mt-1 break-words whitespace-pre-wrap">
              {row.comment}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'priority',
      label: 'Приоритет',
      render: (_, row: ResultRow) => {
        const badgeProps = getDynamicBadgeProps(row.testCase.priority, priorityOptions);
        const priorityLabel = !loadingPriority && priorityOptions.length > 0
          ? priorityOptions.find(opt => opt.value === row.testCase.priority)?.label || row.testCase.priority
          : row.testCase.priority;
        return (
          <Badge 
            variant="outline" 
            className={`text-xs px-2 py-0.5 ${badgeProps.className}`}
            style={badgeProps.style}
          >
            {priorityLabel}
          </Badge>
        );
      },
    },
    {
      key: 'status',
      label: 'Статус',
      render: (_, row: ResultRow) => {
        const badgeProps = getDynamicBadgeProps(row.status, statusOptions);
        const label = getStatusLabel(row.status);
        return (
          <div className="flex items-center gap-2">
            {getResultIcon(row.status)}
            <Badge
              variant="outline"
              className={`text-xs px-2 py-0.5 ${badgeProps.className}`}
              style={badgeProps.style}
            >
              {label}
            </Badge>
          </div>
        );
      },
    },
    {
      key: 'executedBy',
      label: 'Выполнил',
      render: (_, row: ResultRow) => (
        <span className="text-white/70 text-sm">
          {row.status === 'NOT_RUN' || row.status === 'SKIPPED' ? '-' : row.executedBy?.name || '-'}
        </span>
      ),
    },
    {
      key: 'executedAt',
      label: 'Дата',
      render: (_, row: ResultRow) => (
        <span className="text-white/70 text-sm">
          {(row.status === 'NOT_RUN' || row.status === 'SKIPPED')
            ? '-'
            : row.executedAt
            ? formatDateTime(row.executedAt)
            : '-'}
        </span>
      ),
    },
    {
      key: 'id',
      label: 'Действия',
      render: (_, row: ResultRow) => (
        <div className="flex items-center gap-2 justify-end">
          {(testRunStatus === 'IN_PROGRESS' || forceShowDefectActions) && (
            <>
              {row.status === 'FAILED' && canCreateDefect && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    asChild
                    onClick={(e) => {
                      // Prevent row click (which navigates to test case detail)
                      e.stopPropagation();
                    }}
                  >
                    <ButtonSecondary
                      size="sm"
                      className="flex items-center gap-2"
                      buttonName={`Test Cases List Card - Defect Actions (${row.testCase.title || row.testCase.id})`}
                    >
                      Дефект
                      <ChevronDown className="w-3 h-3" />
                    </ButtonSecondary>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    {onCreateDefect && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onCreateDefect(row.testCase.id);
                        }}
                      >
                        <Bug className="w-4 h-4 mr-2" />
                        Создать дефект
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onExecuteTestCase(row.testCase);
                      }}
                    >
                      <ListChecks className="w-4 h-4 mr-2" />
                      Выбрать дефект
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </>
          )}
        </div>
      ),
      align: 'right',
    },
  ];

  const tableData: ResultRow[] = (results || [])
    .filter((result) => result.testCase)
    .map((result) => ({
      id: result.testCase.id,
      testCase: result.testCase,
      status: result.status,
      comment: result.comment,
      executedBy: result.executedBy,
      executedAt: result.executedAt,
    }));

  const currentPageIds = tableData.map((row) => row.testCase.id);
  const allCurrentPageSelected = currentPageIds.length > 0 && currentPageIds.every((id) => selectedTestCaseIds.has(id));
  const hasActiveFilters = statusFilter !== 'all' || ownerFilter !== 'all';
  const hasAnyResultsInRun = totalItems > 0 || hasActiveFilters;

  const handleSelectCurrentPage = () => {
    setSelectedTestCaseIds((prev) => {
      const next = new Set(prev);
      if (allCurrentPageSelected) {
        currentPageIds.forEach((id) => next.delete(id));
      } else {
        currentPageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const selectedRows = tableData.filter((row) => selectedTestCaseIds.has(row.testCase.id));

  const handleBulkRemove = async () => {
    if (selectedTestCaseIds.size === 0) {
      return;
    }

    try {
      setSubmittingBulk(true);
      const response = await fetch(`/api/projects/${projectId}/testruns/${testRunId}/results/bulk`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testCaseIds: Array.from(selectedTestCaseIds) }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Не удалось удалить тест-кейсы из тест-рана');
      }

      setSelectedTestCaseIds(new Set());
      setBulkRemoveOpen(false);
      onRefresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Не удалось удалить тест-кейсы из тест-рана');
    } finally {
      setSubmittingBulk(false);
    }
  };

  const handleBulkExecute = async () => {
    if (selectedTestCaseIds.size === 0 || !bulkStatus) {
      return;
    }

    try {
      setSubmittingBulk(true);
      const executorId = bulkExecutorId === 'current-user' ? undefined : bulkExecutorId;
      const response = await fetch(`/api/projects/${projectId}/testruns/${testRunId}/results/bulk`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testCaseIds: Array.from(selectedTestCaseIds),
          status: bulkStatus,
          comment: bulkComment || undefined,
          executedById: executorId,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Не удалось массово обновить результаты');
      }

      setSelectedTestCaseIds(new Set());
      setBulkExecuteOpen(false);
      setBulkStatus('');
      setBulkComment('');
      setBulkExecutorId('current-user');
      onRefresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Не удалось массово обновить результаты');
    } finally {
      setSubmittingBulk(false);
    }
  };

  const handleBulkAssign = async () => {
    if (selectedTestCaseIds.size === 0 || !bulkAssigneeId) {
      return;
    }

    try {
      setSubmittingBulk(true);
      const response = await fetch(`/api/projects/${projectId}/testruns/${testRunId}/results/bulk`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testCaseIds: Array.from(selectedTestCaseIds),
          executedById: bulkAssigneeId,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Не удалось назначить исполнителя');
      }

      setSelectedTestCaseIds(new Set());
      setBulkAssignOpen(false);
      setBulkAssigneeId('');
      onRefresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Не удалось назначить исполнителя');
    } finally {
      setSubmittingBulk(false);
    }
  };

  return (
    <DetailCard
      title={`Тест-кейсы (${totalItems})`}
      contentClassName=""
      headerAction={
        <div className="flex gap-2 flex-wrap justify-end">
          {tableData.length > 0 && (
            <Button
              variant="glass"
              size="sm"
              onClick={handleSelectCurrentPage}
            >
              {allCurrentPageSelected ? 'Снять выделение страницы' : 'Выбрать страницу'}
            </Button>
          )}
            {selectedTestCaseIds.size > 0 && (
              <>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                  {selectedTestCaseIds.size} выбрано
                </Badge>
                {canUpdate && testRunStatus !== 'CANCELLED' && (
                  <ButtonSecondary size="sm" onClick={() => setBulkAssignOpen(true)}>
                    Кто будет выполнять
                  </ButtonSecondary>
                )}
                {testRunStatus === 'IN_PROGRESS' && canUpdate && (
                  <>
                    <ButtonSecondary size="sm" onClick={() => setBulkExecuteOpen(true)}>
                      Массово обновить статус
                    </ButtonSecondary>
                  </>
                )}
                {((canUpdate && testRunStatus !== 'COMPLETED' && testRunStatus !== 'CANCELLED') ||
                  (isAdmin && testRunStatus !== 'CANCELLED')) && (
                  <ButtonSecondary size="sm" onClick={() => setBulkRemoveOpen(true)}>
                    Убрать из рана
                  </ButtonSecondary>
                )}
              </>
            )}
            <Button
              variant="glass"
              size="sm"
              onClick={onAddTestSuites}
              disabled={testRunStatus === 'COMPLETED' || testRunStatus === 'CANCELLED'}
            >
              <Plus className="w-4 h-4 mr-2" />
              Добавить тест-сьюты
            </Button>
            <Button
              variant="glass"
              size="sm"
              onClick={onAddTestCases}
              disabled={testRunStatus === 'COMPLETED' || testRunStatus === 'CANCELLED'}
            >
              <Plus className="w-4 h-4 mr-2" />
              Добавить тест-кейсы
            </Button>
          </div>
      }
    >
      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder="Фильтр по статусу" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            {Array.from(
              new Set(
                ['NOT_RUN', ...statusOptions.map((option) => option.value === 'SKIPPED' ? 'NOT_RUN' : option.value)]
              )
            ).map((status) => (
              <SelectItem key={status} value={status}>
                {getStatusLabel(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={ownerFilter} onValueChange={onOwnerFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder="Фильтр по исполнителю" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все исполнители</SelectItem>
            {membersForFilter.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusSort} onValueChange={(v) => onStatusSortChange(v as 'none' | 'asc' | 'desc')}>
          <SelectTrigger>
            <SelectValue placeholder="Сортировка по статусу" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Без сортировки</SelectItem>
            <SelectItem value="asc">Статус: A-Z</SelectItem>
            <SelectItem value="desc">Статус: Z-A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!hasAnyResultsInRun ? (
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">В этом тест-ране нет тест-кейсов</p>
          {canCreate && (
            <div className="flex gap-2 justify-center flex-wrap">
              <ButtonPrimary
                size="default"
                onClick={onAddTestCases}
                disabled={testRunStatus === 'COMPLETED' || testRunStatus === 'CANCELLED'}
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить тест-кейсы
              </ButtonPrimary>
              <Button
                variant="glass"
                size="default"
                onClick={onAddTestSuites}
                disabled={testRunStatus === 'COMPLETED' || testRunStatus === 'CANCELLED'}
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить тест-сьюты
              </Button>
            </div>
          )}
        </div>
      ) : tableData.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-10 text-center">
          <AlertCircle className="mx-auto mb-4 h-10 w-10 text-gray-400" />
          <p className="mb-2 text-white/80">По выбранным фильтрам тест-кейсы не найдены</p>
          <p className="mb-4 text-sm text-white/60">Снимите фильтры или измените сортировку, чтобы снова увидеть кейсы.</p>
          <Button
            variant="glass"
            size="sm"
            onClick={() => {
              onStatusFilterChange('all');
              onOwnerFilterChange('all');
              onStatusSortChange('none');
            }}
          >
            Сбросить фильтры
          </Button>
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={tableData}
            rowClassName="cursor-pointer hover:bg-accent/20"
            onRowClick={(row) => onExecuteTestCase(row.testCase)}
            emptyMessage="В этом запуске нет тест-кейсов"
          />

          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={onPageChange}
              onItemsPerPageChange={onItemsPerPageChange}
              itemsPerPageOptions={PAGE_SIZE_OPTIONS}
              showItemsPerPage={true}
            />
          </div>
        </>
      )}

      <Dialog open={bulkExecuteOpen} onOpenChange={setBulkExecuteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Массовое выполнение тест-кейсов</DialogTitle>
            <DialogDescription>
              Обновление {selectedRows.length} тест-кейсов в рамках текущего тест-рана.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bulk-status">Статус результата</Label>
              <Select value={bulkStatus} onValueChange={setBulkStatus}>
                <SelectTrigger id="bulk-status">
                  <SelectValue placeholder="Выберите статус" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bulk-executor">Исполнитель</Label>
              <Select value={bulkExecutorId} onValueChange={setBulkExecutorId}>
                <SelectTrigger id="bulk-executor">
                  <SelectValue placeholder="Текущий пользователь" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current-user">Текущий пользователь</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bulk-comment">Комментарий</Label>
              <Textarea
                id="bulk-comment"
                variant="glass"
                value={bulkComment}
                onChange={(e) => setBulkComment(e.target.value)}
                placeholder="Комментарий для выбранных тест-кейсов"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Выбранные тест-кейсы</Label>
              <div className="max-h-48 overflow-y-auto rounded-lg border border-white/10 bg-white/5 p-3 space-y-2">
                {selectedRows.map((row) => (
                  <div key={row.testCase.id} className="text-sm text-white/80">
                    <span className="font-mono text-white/60 mr-2">{row.testCase.tcId || '-'}</span>
                    <span>{row.testCase.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="glass" onClick={() => setBulkExecuteOpen(false)}>
              Отмена
            </Button>
            <ButtonPrimary onClick={handleBulkExecute} disabled={submittingBulk || !bulkStatus}>
              Сохранить результаты
            </ButtonPrimary>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkAssignOpen} onOpenChange={setBulkAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Кто будет выполнять</DialogTitle>
            <DialogDescription>
              Назначение исполнителя для {selectedRows.length} выбранных тест-кейсов без изменения статуса.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bulk-assignee">Исполнитель</Label>
              <Select value={bulkAssigneeId} onValueChange={setBulkAssigneeId}>
                <SelectTrigger id="bulk-assignee">
                  <SelectValue placeholder="Выберите пользователя" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="glass" onClick={() => setBulkAssignOpen(false)}>
              Отмена
            </Button>
            <ButtonPrimary onClick={handleBulkAssign} disabled={submittingBulk || !bulkAssigneeId}>
              Сохранить
            </ButtonPrimary>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BaseConfirmDialog
        title="Удалить тест-кейсы из тест-рана"
        description={`Вы уверены, что хотите убрать ${selectedTestCaseIds.size} тест-кейс(ов) из этого тест-рана? Сами тест-кейсы удалены не будут.`}
        submitLabel="Убрать из рана"
        cancelLabel="Отмена"
        triggerOpen={bulkRemoveOpen}
        onOpenChange={setBulkRemoveOpen}
        onSubmit={handleBulkRemove}
        destructive={true}
      />
    </DetailCard>
  );
}
