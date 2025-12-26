'use client';

import { SearchInput } from '@/frontend/reusable-elements/inputs/SearchInput';
import { FilterDropdown, type FilterOption } from '@/frontend/reusable-components/inputs/FilterDropdown';
import { TestRunFilters } from '../types';
import { useDropdownOptions } from '@/hooks/useDropdownOptions';

interface TestRunsFilterCardProps {
  filters: TestRunFilters;
  onSearchChange: (search: string) => void;
  onStatusFilterChange: (status: string) => void;
  onEnvironmentFilterChange: (environment: string) => void;
}

export function TestRunsFilterCard({
  filters,
  onSearchChange,
  onStatusFilterChange,
  onEnvironmentFilterChange,
}: TestRunsFilterCardProps) {
  // Fetch dynamic dropdown options
  const { options: statusOptionsData } = useDropdownOptions('TestRun', 'status');
  const { options: environmentOptionsData } = useDropdownOptions('TestRun', 'environment');

  // Map to FilterOption format with "All" option
  const statusOptions: FilterOption[] = [
    { value: 'all', label: 'All Statuses' },
    ...statusOptionsData.map(opt => ({ value: opt.value, label: opt.label })),
  ];

  const environmentOptions: FilterOption[] = [
    { value: 'all', label: 'All Environments' },
    ...environmentOptionsData.map(opt => ({ value: opt.value, label: opt.label })),
  ];
  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <SearchInput
            value={filters.searchQuery}
            onChange={onSearchChange}
            placeholder="Search test runs..."
          />
        </div>

        <div>
          <FilterDropdown
            value={filters.statusFilter}
            onValueChange={onStatusFilterChange}
            placeholder="Status"
            options={statusOptions}
          />
        </div>

        <div>
          <FilterDropdown
            value={filters.environmentFilter}
            onValueChange={onEnvironmentFilterChange}
            placeholder="Environment"
            options={environmentOptions}
          />
        </div>
      </div>
    </div>
  );
}
