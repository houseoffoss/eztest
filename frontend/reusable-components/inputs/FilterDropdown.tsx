'use client';

import { Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/frontend/reusable-elements/selects/Select';

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  options: FilterOption[];
  icon?: React.ReactNode;
  className?: string;
}

export function FilterDropdown({
  value,
  onValueChange,
  placeholder = 'Filter',
  options,
  icon = <Filter className="w-4 h-4 mr-2" />,
  className = '',
}: FilterDropdownProps) {
  // Find the selected option label
  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={cn('min-w-0 overflow-hidden', className)}>
        {icon}
        <span className="flex-1 text-left truncate min-w-0 block">{displayValue}</span>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

