'use client';

import { Card } from '@/frontend/reusable-elements/cards/Card';
import { ReactNode, ComponentProps } from 'react';

interface DataCardProps extends ComponentProps<typeof Card> {
  children: ReactNode;
  borderColor?: 'primary' | 'accent' | 'none';
}

/**
 * Reusable DataCard component with optional left border accent
 * Used for consistent card styling across pages (projects, test runs, etc.)
 */
export const DataCard = ({
  children,
  borderColor = 'primary',
  className = '',
  ...props
}: DataCardProps) => {
  const borderClass = {
    primary: 'border-l-4 border-l-primary/30',
    accent: 'border-l-4 border-l-accent/30',
    none: '',
  }[borderColor];

  const hoverClass = 'hover:shadow-xl hover:shadow-primary/10 transition-all';

  return (
    <Card
      variant="glass"
      className={`${borderClass} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </Card>
  );
};

export default DataCard;

