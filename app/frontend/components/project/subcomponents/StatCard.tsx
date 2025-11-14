'use client';

import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  borderColor: string;
}

export const StatCard = ({ icon, label, value, borderColor }: StatCardProps) => {
  return (
    <Card variant="glass" className={`border-l-4 ${borderColor}`}>
      <CardHeader className="pb-3">
        <CardDescription className="flex items-center gap-2 text-white/70">
          {icon}
          {label}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-white">{value}</div>
      </CardContent>
    </Card>
  );
};
