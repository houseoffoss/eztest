'use client';

import { SearchInput } from '@/frontend/reusable-elements/inputs/SearchInput';
import { FilterDropdown, type FilterOption } from '@/frontend/reusable-components/inputs/FilterDropdown';
import { useDropdownOptions } from '@/hooks/useDropdownOptions';

interface DefectFiltersProps {
  searchQuery: string;
  severityFilter: string;
  priorityFilter: string;
  statusFilter: string;
  assigneeFilter: string;
  onSearchChange: (value: string) => void;
  onSeverityChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onAssigneeChange: (value: string) => void;
  availableAssignees?: Array<{ id: string; name: string }>;
}

export function DefectFilters({
  searchQuery,
  severityFilter,
  priorityFilter,
  statusFilter,
  assigneeFilter,
  onSearchChange,
  onSeverityChange,
  onPriorityChange,
  onStatusChange,
  onAssigneeChange,
  availableAssignees = [],
}: DefectFiltersProps) {
  // Fetch dynamic dropdown options
  const { options: severityOptionsData } = useDropdownOptions('Defect', 'severity');
  const { options: priorityOptionsData } = useDropdownOptions('Defect', 'priority');
  const { options: statusOptionsData } = useDropdownOptions('Defect', 'status');

  // Map to FilterOption format with "All" option
  const severityOptions: FilterOption[] = [
    { value: 'all', label: 'すべての深刻度' },
    ...severityOptionsData.map(opt => ({ value: opt.value, label: opt.label })),
  ];

  const priorityOptions: FilterOption[] = [
    { value: 'all', label: 'すべての優先度' },
    ...priorityOptionsData.map(opt => ({ value: opt.value, label: opt.label })),
  ];

  const statusOptions: FilterOption[] = [
    { value: 'all', label: 'すべてのステータス' },
    ...statusOptionsData.map(opt => ({ value: opt.value, label: opt.label })),
  ];
  // Build assignee options from available assignees
  const assigneeOptions: FilterOption[] = [
    { value: 'all', label: 'すべての担当者' },
    { value: 'unassigned', label: '未割当' },
    ...availableAssignees.map((assignee) => ({
      value: assignee.id,
      label: assignee.name,
    })),
  ];

  return (
    <div className="mb-6 w-full min-w-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4 w-full min-w-0">
        <div className="sm:col-span-2 lg:col-span-2 min-w-0">
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Defectを検索..."
          />
        </div>

        <div className="min-w-0 w-full">
          <FilterDropdown
            value={severityFilter}
            onValueChange={onSeverityChange}
            placeholder="深刻度"
            options={severityOptions}
          />
        </div>

        <div className="min-w-0 w-full">
          <FilterDropdown
            value={priorityFilter}
            onValueChange={onPriorityChange}
            placeholder="優先度"
            options={priorityOptions}
          />
        </div>

        <div className="min-w-0 w-full">
          <FilterDropdown
            value={statusFilter}
            onValueChange={onStatusChange}
            placeholder="ステータス"
            options={statusOptions}
          />
        </div>

        <div className="min-w-0 w-full">
          <FilterDropdown
            value={assigneeFilter}
            onValueChange={onAssigneeChange}
            placeholder="担当者"
            options={assigneeOptions}
          />
        </div>
      </div>
    </div>
  );
}
