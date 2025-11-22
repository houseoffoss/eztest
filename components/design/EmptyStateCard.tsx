'use client';

import * as React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/elements/button';
import { Card, CardContent } from '@/elements/card';

interface EmptyStateCardProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

/**
 * Unified reusable empty state component for consistent empty states across the application
 * Used for: Test suites, test cases, test runs, projects, and other empty lists
 */
export function EmptyStateCard({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateCardProps) {
  return (
    <Card variant="glass" className={className}>
      <CardContent className="flex flex-col items-center justify-center py-12">
        {Icon && (
          <div className="rounded-full bg-white/5 p-6 mb-4">
            <Icon className="w-12 h-12 text-white/50" />
          </div>
        )}
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        {description && (
          <p className="text-white/60 text-center max-w-sm mb-6">
            {description}
          </p>
        )}
        {actionLabel && onAction && (
          <Button onClick={onAction} variant="glass-primary">
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
