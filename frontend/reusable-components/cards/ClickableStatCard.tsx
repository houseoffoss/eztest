'use client';

import * as React from 'react';
import Link from 'next/link';
import { StatCard } from '@/frontend/components/project/subcomponents/StatCard';
import { cn } from '@/lib/utils';

export interface ClickableStatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  borderColor?: string;
  hoverColor?: string;
  href: string;
  className?: string;
}

export function ClickableStatCard({
  icon,
  label,
  value,
  borderColor = 'border-l-primary/30',
  hoverColor = 'group-hover:bg-primary/10',
  href,
  className,
}: ClickableStatCardProps) {
  return (
    <Link
      href={href}
      className={cn('cursor-pointer group transition-all block', hoverColor, className)}
    >
      <StatCard
        icon={icon}
        label={label}
        value={value}
        borderColor={borderColor}
      />
    </Link>
  );
}

