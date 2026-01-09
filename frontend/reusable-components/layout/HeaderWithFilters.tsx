'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface HeaderWithFiltersProps {
  header: React.ReactNode;
  filters: React.ReactNode;
  className?: string;
  headerClassName?: string;
  filtersClassName?: string;
}

export function HeaderWithFilters({
  header,
  filters,
  className,
  headerClassName,
  filtersClassName,
}: HeaderWithFiltersProps) {
  return (
    <div className={cn(
      'flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-4 w-full min-w-0',
      className
    )}>
      <div className={cn('shrink-0 min-w-0', headerClassName)}>
        {header}
      </div>
      <div className={cn('w-full lg:w-auto lg:min-w-[400px] min-w-0', filtersClassName)}>
        {filters}
      </div>
    </div>
  );
}

