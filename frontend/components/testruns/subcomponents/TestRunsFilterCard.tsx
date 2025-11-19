import { Input } from '@/elements/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/elements/select';
import { Search, Filter } from 'lucide-react';
import { TestRunFilters } from '../types';

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
  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search test runs..."
              value={filters.searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <Select value={filters.statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger>
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="PLANNED">Planned</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select
            value={filters.environmentFilter}
            onValueChange={onEnvironmentFilterChange}
          >
            <SelectTrigger>
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Environment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Environments</SelectItem>
              <SelectItem value="Production">Production</SelectItem>
              <SelectItem value="Staging">Staging</SelectItem>
              <SelectItem value="QA">QA</SelectItem>
              <SelectItem value="Development">Development</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
