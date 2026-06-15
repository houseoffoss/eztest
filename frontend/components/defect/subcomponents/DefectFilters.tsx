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
    { value: 'all', label: 'Все уровни серьезности' },
    ...severityOptionsData.map(opt => ({ value: opt.value, label: opt.label })),
  ];

  const priorityOptions: FilterOption[] = [
    { value: 'all', label: 'Все приоритеты' },
    ...priorityOptionsData.map(opt => ({ value: opt.value, label: opt.label })),
  ];

  const statusOptions: FilterOption[] = [
    { value: 'all', label: 'Все статусы' },
    ...statusOptionsData.map(opt => ({ value: opt.value, label: opt.label })),
  ];
  // Build assignee options from available assignees
  const assigneeOptions: FilterOption[] = [
    { value: 'all', label: 'Все исполнители' },
    { value: 'unassigned', label: 'Не назначено' },
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
            placeholder="Поиск дефектов..."
          />
        </div>

        <div className="min-w-0 w-full">
          <FilterDropdown
            value={severityFilter}
            onValueChange={onSeverityChange}
            placeholder="Все уровни серьезности"
            options={severityOptions}
          />
        </div>

        <div className="min-w-0 w-full">
          <FilterDropdown
            value={priorityFilter}
            onValueChange={onPriorityChange}
            placeholder="Все приоритеты"
            options={priorityOptions}
          />
        </div>

        <div className="min-w-0 w-full">
          <FilterDropdown
            value={statusFilter}
            onValueChange={onStatusChange}
            placeholder="Все статусы"
            options={statusOptions}
          />
        </div>

        <div className="min-w-0 w-full">
          <FilterDropdown
            value={assigneeFilter}
            onValueChange={onAssigneeChange}
            placeholder="Все исполнители"
            options={assigneeOptions}
          />
        </div>
      </div>
    </div>
  );
}
