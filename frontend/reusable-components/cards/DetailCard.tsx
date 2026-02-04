'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/frontend/reusable-elements/cards/Card';

export interface DetailCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
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
  const gradientStyle = 'conic-gradient(from 45deg, rgba(255, 255, 255, 0.1) 0deg, rgba(255, 255, 255, 0.4) 90deg, rgba(255, 255, 255, 0.1) 180deg, rgba(255, 255, 255, 0.4) 270deg, rgba(255, 255, 255, 0.1) 360deg)';

  return (
    <div
      className="rounded-3xl relative transition-all p-[1px]"
      style={{ background: gradientStyle }}
    >
      <div className="relative rounded-3xl h-full" style={{ backgroundColor: '#0a1628' }}>
        <Card 
          variant={variant} 
          className={`!border-0 !rounded-3xl !bg-transparent before:!bg-none !overflow-visible transition-all flex flex-col h-full ${className}`} 
          {...props}
        >
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
      </div>
    </div>
  );
}

export default DetailCard;

