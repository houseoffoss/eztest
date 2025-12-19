'use client';

import { SearchInput } from '@/components/design/SearchInput';
import { FilterDropdown, type FilterOption } from '@/components/design/FilterDropdown';
import { TestRunFilters } from '../types';

interface TestRunsFilterCardProps {
  filters: TestRunFilters;
  onSearchChange: (search: string) => void;
  onStatusFilterChange: (status: string) => void;
  onEnvironmentFilterChange: (environment: string) => void;
}

const statusOptions: FilterOption[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'PLANNED', label: 'Planned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const environmentOptions: FilterOption[] = [
  { value: 'all', label: 'All Environments' },
  { value: 'Production', label: 'Production' },
  { value: 'Staging', label: 'Staging' },
  { value: 'QA', label: 'QA' },
  { value: 'Development', label: 'Development' },
];

export function TestRunsFilterCard({
  filters,
  onSearchChange,
  onStatusFilterChange,
  onEnvironmentFilterChange,
}: TestRunsFilterCardProps) {
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
