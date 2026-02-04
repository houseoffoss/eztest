import { Card, CardContent } from '@/frontend/reusable-elements/cards/Card';

const features = [
  {
    title: 'Unified Traceability',
    description: 'Link test cases to defects, test runs, and modules for complete end-to-end traceability across your testing lifecycle.',
  },
  {
    title: 'Defect Management',
    description: 'Track bugs with severity, priority, status, and file attachments. Link defects directly to test cases.',
  },
  {
    title: 'Built-in Migration Support',
    description: 'Import test cases and defects in bulk using CSV or Excel files. Auto-create modules and test suites during import.',
  },
  {
    title: 'Fully Customizable',
    description: 'Open-source and self-hosted platform. Full source code access allows complete customization to fit your team\'s needs.',
  },
  {
    title: 'AuthN + AuthZ',
    description: 'Secure authentication with email/password, JWT sessions, and role-based access control with 27 granular permissions.',
  },
];

export const StatsSection = () => {
  return (
    <Card variant="glass" className="mb-12">
      <CardContent className="py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Why Choose EZTest? 🤔</h2>
          <p className="text-base text-white/60">Powerful features that make test management simple</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/50 transition-all group cursor-pointer"
            >
              <div className="text-white/90 font-semibold text-sm md:text-base group-hover:text-primary transition-colors mb-3">
                {feature.title}
              </div>
              <div className="text-white/70 text-xs md:text-sm leading-relaxed">
                {feature.description}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
