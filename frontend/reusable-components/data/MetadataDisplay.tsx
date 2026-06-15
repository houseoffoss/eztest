'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface MetadataItem {
  label?: string;
  value: string | React.ReactNode;
  showSeparator?: boolean;
}

export interface MetadataDisplayProps {
  items: MetadataItem[];
  className?: string;
  itemClassName?: string;
  separator?: string | React.ReactNode;
}

export function MetadataDisplay({
  items,
  className,
  itemClassName,
  separator = '•',
}: MetadataDisplayProps) {
  return (
    <div className={cn('flex items-center gap-4 text-xs text-muted-foreground', className)}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <div className={itemClassName}>
            {item.label && <>{item.label} </>}
            <span className="font-semibold text-foreground">{item.value}</span>
          </div>
          {index < items.length - 1 && item.showSeparator !== false && (
            <div>{separator}</div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

