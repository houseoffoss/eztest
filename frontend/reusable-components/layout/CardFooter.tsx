'use client';

import * as React from 'react';
import { LucideIcon } from 'lucide-react';
import { formatDateTime } from '@/lib/date-utils';
import { cn } from '@/lib/utils';

export interface CardFooterItem {
  icon?: LucideIcon;
  label?: string;
  value: string;
  formatDate?: boolean;
  className?: string;
}

export interface CardFooterProps {
  items: CardFooterItem[];
  className?: string;
}

export function CardFooter({ items, className }: CardFooterProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-x-4 gap-y-2', className)}>
      {items.map((item, index) => {
        const Icon = item.icon;
        const displayValue = item.formatDate ? formatDateTime(item.value) : item.value;
        return (
          <div
            key={index}
            className={cn('flex items-center gap-1 text-xs text-white/60', item.className)}
          >
            {Icon && <Icon className="w-3 h-3" />}
            {item.label && <span>{item.label}</span>}
            <span className="truncate">{displayValue}</span>
          </div>
        );
      })}
    </div>
  );
}

