import Image from 'next/image';
import { Card, CardContent } from '@/elements/card';

interface Feature {
  image: string;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    image: '/icons/project-support.svg',
    title: 'Multi-Project Support',
    description: 'Manage multiple projects with role-based access control. Keep everything organized in one place.',
  },
  {
    image: '/icons/002-hierarchy.svg',
    title: 'Hierarchical Tests',
    description: 'Organize tests in hierarchical suites. Create detailed test cases with steps and expected results.',
  },
  {
    image: '/icons/defect.svg',
    title: 'Defect Management',
    description: 'Run tests and track results in real-time. Monitor progress with comprehensive dashboards.',
  },
  {
    image: '/icons/traceability.svg',
    title: 'Traceability',
    description: 'Link test cases to requirements. Ensure complete coverage and maintain audit trails.',
  },
  {
    image: '/icons/collaboration.svg',
    title: 'Collaboration',
    description: 'Add comments, attach files, and collaborate with your team. Everything in context.',
  },
  {
    image: '/icons/lightweight.svg',
    title: 'Lightweight',
    description: 'Runs efficiently on minimal hardware. 1 core, 2GB RAM is all you need to get started.',
  },
];

export const FeaturesGrid = () => {
  return (
    <Card variant="glass" className="mb-24">
      <CardContent className="py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Powerful Features</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => {
            return (
              <Card
                key={feature.title}
                variant="glass"
                className="border-l-4 border-l-primary/30 hover:shadow-xl hover:shadow-primary/10 transition-all group"
              >
                <CardContent className="py-6 px-5">
                  <div className="flex flex-col items-center text-center">
                    {/* Icon */}
                    <div className="mb-3 flex items-center justify-center w-14 h-14 group-hover:scale-110 transition-transform">
                      <Image
                        src={feature.image}
                        alt={feature.title}
                        width={56}
                        height={56}
                        className="object-contain"
                        priority
                      />
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-white/70 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
