'use client';

import * as React from 'react';
import { Badge } from '@/frontend/reusable-elements/badges/Badge';
import { cn } from '@/lib/utils';

export interface PageHeaderWithBadgeProps {
  badge?: string;
  title: string;
  description?: string;
  badgeClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  className?: string;
}

export function PageHeaderWithBadge({
  badge,
  title,
  description,
  badgeClassName,
  titleClassName,
  descriptionClassName,
  className,
}: PageHeaderWithBadgeProps) {
  return (
    <div className={cn('shrink-0', className)}>
      <div className="flex items-center gap-3 mb-2">
        {badge && (
          <Badge
            variant="outline"
            className={cn(
              'font-mono border-primary/40 bg-primary/10 text-primary text-xs px-2.5 py-0.5',
              badgeClassName
            )}
          >
            {badge}
          </Badge>
        )}
        <h1 className={cn('text-2xl font-bold text-white', titleClassName)}>
        <h1 className={cn('text-2xl font-bold text-foreground', titleClassName)}>
          {title}
        </h1>
      </div>
      {description && (
        <p className={cn('text-muted-foreground text-sm mb-2', descriptionClassName)}>
          {description}
        </p>
      )}
    </div>
  );
}

