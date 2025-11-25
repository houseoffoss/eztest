'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/elements/card';
import { ReactNode } from 'react';

interface ItemCardProps {
  title: string;
  description?: string;
  badges?: ReactNode;
  header?: ReactNode;
  content: ReactNode;
  footer?: ReactNode;
  onClick?: () => void;
  className?: string;
  borderColor?: 'primary' | 'accent';
}

/**
 * Reusable ItemCard component for consistent card styling across pages
 * Used for projects, test runs, and other item displays
 */
export const ItemCard = ({
  title,
  description,
  badges,
  header,
  content,
  footer,
  onClick,
  className = '',
  borderColor = 'primary',
}: ItemCardProps) => {
  const borderClass =
    borderColor === 'accent' ? 'border-l-4 border-l-accent/30' : 'border-l-4 border-l-primary/30';

  return (
    <Card
      variant="glass"
      className={`hover:shadow-xl hover:shadow-primary/10 transition-all cursor-pointer group ${borderClass} ${className} flex flex-col`}
      onClick={onClick}
    >
      <CardHeader className="pb-1 pt-2.5 px-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {badges && <div className="flex items-center gap-2 mb-1">{badges}</div>}
            <CardTitle className="text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1 text-white">
              {title}
            </CardTitle>
            <CardDescription className="line-clamp-1 text-sm text-white/60 min-h-5">
              {description || ''}
            </CardDescription>
          </div>
          {header}
        </div>
      </CardHeader>

      <CardContent className="py-2.5 px-3.5 flex-1 flex flex-col">
        <div className="flex-1">{content}</div>
        {footer && <div className="flex items-center justify-between pt-2 border-t border-white/10 mt-auto">{footer}</div>}
      </CardContent>
    </Card>
  );
};

export default ItemCard;
