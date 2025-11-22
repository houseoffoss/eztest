'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/elements/card';

export interface DetailCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  contentClassName?: string;
  headerClassName?: string;
  headerAction?: React.ReactNode;
  variant?: 'default' | 'glass';
}

/**
 * Reusable DetailCard component for consistent card styling across detail pages
 * Used in: ProjectDetail, TestCaseDetail, TestRunDetail, TestSuiteDetail, and similar pages
 * 
 * @example
 * ```tsx
 * <DetailCard title="Details" description="View project details">
 *   <div>Card content here</div>
 * </DetailCard>
 * ```
 */
export function DetailCard({
  title,
  description,
  children,
  contentClassName = 'space-y-4',
  headerClassName = '',
  headerAction,
  variant = 'glass',
  className,
  ...props
}: DetailCardProps) {
  return (
    <Card variant={variant} className={className} {...props}>
      <CardHeader className={`${headerClassName} ${headerAction ? 'flex flex-row items-start justify-between' : ''}`}>
        <div className="flex flex-col gap-1">
          <CardTitle>{title}</CardTitle>
          {description && (
            <p className="text-sm text-white/60">{description}</p>
          )}
        </div>
        {headerAction && <div>{headerAction}</div>}
      </CardHeader>
      <CardContent className={contentClassName}>
        {children}
      </CardContent>
    </Card>
  );
}

export default DetailCard;
