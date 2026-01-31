'use client';

import { Card, CardHeader, CardTitle, CardDescription } from '@/frontend/reusable-elements/cards/Card';
import { ReactNode } from 'react';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
  borderColor?: 'primary' | 'accent';
}

/**
 * Reusable FeatureCard component for displaying feature information
 * Shows icon, title, and full description with glassmorphism styling
 * Used for features grid and similar feature showcase components
 */
export const FeatureCard = ({
  icon,
  title,
  description,
  className = '',
  borderColor = 'primary',
}: FeatureCardProps) => {
  const borderClass =
    borderColor === 'accent' ? 'border-l-4 border-l-accent/30' : 'border-l-4 border-l-primary/30';

  return (
    <Card
      variant="glass"
      className={`${borderClass} hover:shadow-xl hover:shadow-primary/10 transition-all group hover:scale-105 ${className} flex flex-col`}
    >
      <CardHeader>
        <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{icon}</div>
        <CardTitle className="text-white group-hover:text-primary transition-colors">
          {title}
        </CardTitle>
        <CardDescription className="text-white/80 text-base mt-2">{description}</CardDescription>
      </CardHeader>
    </Card>
  );
};

export default FeatureCard;

