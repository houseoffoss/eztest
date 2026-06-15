'use client';

import { Card, CardContent, CardDescription, CardHeader } from '@/frontend/reusable-elements/cards/Card';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  borderColor: string;
}

export const StatCard = ({ icon, label, value, borderColor }: StatCardProps) => {
  const gradientStyle = 'conic-gradient(from 45deg, rgba(148, 163, 184, 0.14) 0deg, rgba(148, 163, 184, 0.35) 90deg, rgba(148, 163, 184, 0.14) 180deg, rgba(148, 163, 184, 0.35) 270deg, rgba(148, 163, 184, 0.14) 360deg)';

  return (
    <div
      className="rounded-3xl relative transition-all p-[1px]"
      style={{ background: gradientStyle }}
    >
      <div className="relative rounded-3xl h-full" style={{ backgroundColor: 'var(--item-card-bg)' }}>
        <Card 
          variant="glass" 
          className={`!border-0 !rounded-3xl !bg-transparent before:!bg-none !overflow-visible transition-all flex flex-col h-full border-l-4 ${borderColor}`}
        >
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2 text-muted-foreground">
              {icon}
              {label}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{value}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
