import Image from 'next/image';
import { Card } from '@/frontend/reusable-elements/cards/Card';

interface Feature {
  image: string;
  title: string;
  description: string;
  highlight?: string;
}

const features: Feature[] = [
  {
    image: '/icons/End to end tarceability.png',
    title: 'Unified Traceability',
    description: 'Link test cases to defects, test runs, and modules for complete end-to-end traceability across your testing lifecycle.',
    highlight: 'End-to-end visibility',
  },
  {
    image: '/icons/bug.svg',
    title: 'Defect Management',
    description: 'Track bugs with severity, priority, status, and file attachments. Link defects directly to test cases.',
    highlight: 'Complete bug lifecycle',
  },
  {
    image: '/icons/Data migration.png',
    title: 'Built-in Migration Support',
    description: 'Import test cases and defects in bulk using CSV or Excel files. Auto-create modules and test suites during import.',
    highlight: 'Easy data import',
  },
  {
    image: '/icons/circle-play.svg',
    title: 'Manual & Automation Testing',
    description: 'Support both manual and automated test cases. Track execution results, attach evidence, and maintain comprehensive test history.',
    highlight: 'Unified workflow',
  },
  {
    image: '/icons/Manual and automation testing.png',
    title: 'Fully Customizable',
    description: 'Open-source and self-hosted platform. Full source code access allows complete customization to fit your team\'s needs.',
    highlight: 'Complete customization',
  },
  {
    image: '/icons/shield-check.svg',
    title: 'AuthN + AuthZ',
    description: 'Secure authentication with email/password, JWT sessions, and role-based access control with 27 granular permissions.',
    highlight: '27 granular permissions',
  },
];

export const FeaturesGrid = () => {
  const gradientStyle = 'conic-gradient(from 45deg, rgba(255, 255, 255, 0.1) 0deg, rgba(255, 255, 255, 0.4) 90deg, rgba(255, 255, 255, 0.1) 180deg, rgba(255, 255, 255, 0.4) 270deg, rgba(255, 255, 255, 0.1) 360deg)';

  return (
    <div className="mb-32">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Everything you need to
          <br />
          <span className="text-primary">manage your tests</span>
        </h2>
        <p className="text-xl text-white/70 max-w-2xl mx-auto">
          Powerful features that make test management simple, without the complexity
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => {
          return (
            <div
              key={feature.title}
              className="rounded-3xl relative transition-all group p-[1px] hover:shadow-xl hover:shadow-primary/10"
              style={{ background: gradientStyle }}
            >
              <div className="relative rounded-3xl h-full" style={{ backgroundColor: '#0a1628' }}>
                <Card
                  variant="glass"
                  className="!border-0 !rounded-3xl !bg-transparent before:!bg-none !overflow-visible hover:shadow-xl hover:shadow-primary/10 transition-all flex flex-col h-full"
                >
                  <div className="rounded-3xl overflow-visible flex flex-col h-full py-8 px-6 group-hover:scale-[1.02] transition-transform">
                    <div className="flex flex-col items-center text-center">
                      {/* Icon */}
                      <div className="mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <div className="p-3 rounded-xl bg-white/5 border border-white/10 group-hover:border-primary/50 transition-colors">
                          <Image
                            src={feature.image}
                            alt={feature.title}
                            width={40}
                            height={40}
                            className="object-contain"
                            priority
                          />
                        </div>
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      
                      {/* Highlight */}
                      {feature.highlight && (
                        <div className="mb-3">
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30">
                            {feature.highlight}
                          </span>
                        </div>
                      )}
                      
                      {/* Description */}
                      <p className="text-white/70 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

