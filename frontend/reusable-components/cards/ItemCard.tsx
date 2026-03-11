'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/frontend/reusable-elements/cards/Card';
import { ReactNode } from 'react';

interface ItemCardProps {
  title: string;
  description?: string;
  descriptionClassName?: string;
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
  descriptionClassName,
  badges,
  header,
  content,
  footer,
  onClick,
  className = '',
  borderColor = 'primary',
}: ItemCardProps) => {
  const gradientStyle = borderColor === 'accent'
    ? 'conic-gradient(from 45deg, rgba(139, 92, 246, 0.2) 0deg, rgba(139, 92, 246, 0.8) 90deg, rgba(139, 92, 246, 0.2) 180deg, rgba(139, 92, 246, 0.8) 270deg, rgba(139, 92, 246, 0.2) 360deg)'
    : 'conic-gradient(from 45deg, rgba(255, 255, 255, 0.1) 0deg, rgba(255, 255, 255, 0.4) 90deg, rgba(255, 255, 255, 0.1) 180deg, rgba(255, 255, 255, 0.4) 270deg, rgba(255, 255, 255, 0.1) 360deg)';

  return (
    <div
      className={`
        rounded-3xl
        relative
        transition-all 
        cursor-pointer 
        group 
        p-[1px]
        ${className}
      `}
      onClick={onClick}
      style={{
        background: gradientStyle,
      }}
    >
      {/* Inner container with page background color to block gradient */}
      <div className="relative rounded-3xl h-full" style={{ backgroundColor: '#0a1628' }}>
        <Card
          variant="glass"
          className="!border-0 !rounded-3xl !bg-transparent before:!bg-none overflow-hidden hover:shadow-xl hover:shadow-primary/10 transition-all flex flex-col h-full"
        >
        <CardHeader className="pb-1 pt-2.5 px-3.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {badges && <div className="flex items-center flex-wrap gap-1.5 mb-1">{badges}</div>}
              <div className="overflow-hidden">
                <CardTitle 
                  className="text-lg mb-1 group-hover:text-primary transition-colors line-clamp-2 break-words text-white"
                  style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
                >
                  {title}
                </CardTitle>
                <CardDescription className={descriptionClassName || "line-clamp-1 text-sm text-white/60 min-h-5"}>
                  {description || ''}
                </CardDescription>
              </div>
            </div>
            {header}
          </div>
        </CardHeader>

        <CardContent className="py-2.5 px-3.5 flex-1 flex flex-col">
          <div className="flex-1">{content}</div>
          {footer && <div className="flex items-center justify-between pt-2 border-t border-white/10 mt-auto">{footer}</div>}
        </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ItemCard;

