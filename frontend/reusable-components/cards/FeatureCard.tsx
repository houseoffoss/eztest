'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/frontend/reusable-elements/cards/Card';
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
  const gradientStyle = 'conic-gradient(from 45deg, rgba(255, 255, 255, 0.1) 0deg, rgba(255, 255, 255, 0.4) 90deg, rgba(255, 255, 255, 0.1) 180deg, rgba(255, 255, 255, 0.4) 270deg, rgba(255, 255, 255, 0.1) 360deg)';
  const borderClass =
    borderColor === 'accent' ? 'border-l-4 border-l-accent/30' : 'border-l-4 border-l-primary/30';

  return (
    <div
      className={`rounded-3xl relative transition-all p-[1px] group hover:scale-105 ${className}`}
      style={{ background: gradientStyle }}
    >
      <div className="relative rounded-3xl h-full" style={{ backgroundColor: '#0a1628' }}>
        <Card
          variant="glass"
          className={`!border-0 !rounded-3xl !bg-transparent before:!bg-none !overflow-visible hover:shadow-xl hover:shadow-primary/10 transition-all flex flex-col h-full ${borderClass}`}
        >
      <CardHeader>
        <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{icon}</div>
        <CardTitle className="text-white group-hover:text-primary transition-colors">
          {title}
        </CardTitle>
        <CardDescription className="text-white/80 text-base mt-2">{description}</CardDescription>
      </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default FeatureCard;

