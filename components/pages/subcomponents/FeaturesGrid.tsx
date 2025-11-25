import { FeatureCard } from '@/components/design/FeatureCard';
import { DetailCard } from '@/components/design/DetailCard';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: '📊',
    title: 'Multi-Project Support',
    description: 'Manage multiple projects with role-based access control. Keep everything organized in one place.',
  },
  {
    icon: '🗂️',
    title: 'Hierarchical Tests',
    description: 'Organize tests in hierarchical suites. Create detailed test cases with steps and expected results.',
  },
  {
    icon: '▶️',
    title: 'Test Execution',
    description: 'Run tests and track results in real-time. Monitor progress with comprehensive dashboards.',
  },
  {
    icon: '🔗',
    title: 'Traceability',
    description: 'Link test cases to requirements. Ensure complete coverage and maintain audit trails.',
  },
  {
    icon: '💬',
    title: 'Collaboration',
    description: 'Add comments, attach files, and collaborate with your team. Everything in context.',
  },
  {
    icon: '⚡',
    title: 'Lightweight',
    description: 'Runs efficiently on minimal hardware. 1 core, 2GB RAM is all you need to get started.',
  },
];

export const FeaturesGrid = () => {
  return (
    <DetailCard 
      title=""
      className="mb-24" 
      contentClassName="py-8 px-2"
      headerClassName="flex justify-center"
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white">Powerful Features</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div key={feature.title} className="transform transition-all duration-300 hover:scale-105">
            <FeatureCard
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          </div>
        ))}
      </div>
    </DetailCard>
  );
};
