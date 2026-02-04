'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressBarWithLabelProps {
  label: string;
  value: number; // 0-100
  valueLabel?: string; // Custom label for the value (e.g., "75%")
  className?: string;
  barClassName?: string;
  fillClassName?: string; // Custom styling for the progress fill
  showValue?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
}

export function ProgressBarWithLabel({
  label,
  value,
  valueLabel,
  className,
  barClassName,
  fillClassName,
  showValue = true,
  gradientFrom = 'from-green-500',
  gradientTo = 'to-green-400',
}: ProgressBarWithLabelProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const displayValue = valueLabel || `${clamped}%`;

  return (
    <div className={cn('mb-2.5', className)}>
      <div className="flex justify-between text-xs text-white/60 mb-1">
        <span>{label}</span>
        {showValue && (
          <span className="font-semibold text-white">{displayValue}</span>
        )}
      </div>
      <div className={cn('w-full bg-white/5 rounded-full h-2', barClassName)}>
        <div
          className={cn(
            fillClassName || `bg-gradient-to-r ${gradientFrom} ${gradientTo}`,
            'h-2 rounded-full transition-all'
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

