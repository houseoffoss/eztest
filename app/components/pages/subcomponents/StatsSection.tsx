import { Card, CardContent } from '@/frontend/reusable-elements/cards/Card';

interface Stat {
  value: string;
  label: string;
}

const stats: Stat[] = [
  { value: '100%', label: 'Open Source' },
  { value: '2GB', label: 'RAM Required' },
  { value: '∞', label: 'Projects & Users' },
];

export const StatsSection = () => {
  return (
    <Card variant="glass" className="mb-12">
      <CardContent className="py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Why Choose EZTest? 🤔</h2>
          <p className="text-white/90 text-lg max-w-2xl mx-auto">
            Built for teams who value simplicity, control, and open-source freedom
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {stats.map((stat) => (
            <div key={stat.label} className="group text-center">
              <div className="text-5xl font-bold mb-3 group-hover:scale-110 transition-transform">
                {stat.value}
              </div>
              <div className="text-white/80 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
