'use client';

import { SearchInput } from '@/frontend/reusable-elements/inputs/SearchInput';
import { FilterDropdown, type FilterOption } from '@/frontend/reusable-components/inputs/FilterDropdown';
import { useDropdownOptions } from '@/hooks/useDropdownOptions';

interface TestCaseFiltersProps {
  searchQuery: string;
  priorityFilter: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export function TestCaseFilters({
  searchQuery,
  priorityFilter,
  statusFilter,
  onSearchChange,
  onPriorityChange,
  onStatusChange,
}: TestCaseFiltersProps) {
  // Fetch dynamic dropdown options
  const { options: priorityOptionsData, loading: loadingPriority } = useDropdownOptions('TestCase', 'priority');
  const { options: statusOptionsData, loading: loadingStatus } = useDropdownOptions('TestCase', 'status');

  // Map to FilterOption format with "All" option
  const priorityOptions: FilterOption[] = [
    { value: 'all', label: 'All Priorities' },
    ...priorityOptionsData.map(opt => ({ value: opt.value, label: opt.label })),
  ];

  const statusOptions: FilterOption[] = [
    { value: 'all', label: 'All Statuses' },
    ...statusOptionsData.map(opt => ({ value: opt.value, label: opt.label })),
  ];
  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search test cases..."
          />
        </div>

        <div>
          <FilterDropdown
            value={priorityFilter}
            onValueChange={onPriorityChange}
            placeholder="Priority"
            options={priorityOptions}
          />
        </div>

        <div>
          <FilterDropdown
            value={statusFilter}
            onValueChange={onStatusChange}
            placeholder="Status"
            options={statusOptions}
          />
        </div>
      </div>
    </div>
  );
}
