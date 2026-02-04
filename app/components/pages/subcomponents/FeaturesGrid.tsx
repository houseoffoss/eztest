import Image from 'next/image';
import { Card, CardContent } from '@/frontend/reusable-elements/cards/Card';

interface Feature {
  image: string;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    image: '/icons/End to end tarceability.png',
    title: 'Unified Traceability',
    description: 'Link test cases to defects, test runs, and modules for complete end-to-end traceability across your testing lifecycle.',
  },
  {
    image: '/icons/bug.svg',
    title: 'Defect Management',
    description: 'Track bugs with severity, priority, status, and file attachments. Link defects directly to test cases.',
  },
  {
    image: '/icons/Data migration.png',
    title: 'Built-in Migration Support',
    description: 'Import test cases and defects in bulk using CSV or Excel files. Auto-create modules and test suites during import.',
  },
  {
    image: '/icons/Manual and automation testing.png',
    title: 'Fully Customizable',
    description: 'Open-source and self-hosted platform. Full source code access allows complete customization to fit your team\'s needs.',
  },
  {
    image: '/icons/shield-check.svg',
    title: 'AuthN + AuthZ',
    description: 'Secure authentication with email/password, JWT sessions, and role-based access control with 27 granular permissions.',
  },
];

export const FeaturesGrid = () => {
  return (
    <div className="mb-24">
      <div className="py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Why Choose EZTest?</h2>
          <p className="text-base text-white/60">Powerful features that make test management simple</p>
        </div>
        <div className="flex flex-wrap gap-6 justify-center">
          {features.map((feature) => {
            return (
              <Card
                key={feature.title}
                variant="glass"
                className="border-l-4 border-l-primary/30 hover:shadow-xl hover:shadow-primary/10 transition-all group w-full md:w-[calc(33.333%-1rem)]"
              >
                <CardContent className="py-6 px-5">
                  <div className="flex flex-col items-center text-center">
                    {/* Icon */}
                    <div className="mb-3 flex items-center justify-center w-14 h-14 group-hover:scale-110 transition-transform">
                      <Image
                        src={feature.image}
                        alt={feature.title}
                        width={feature.title === 'Defect Management' || feature.title === 'AuthN + AuthZ' ? 40 : 56}
                        height={feature.title === 'Defect Management' || feature.title === 'AuthN + AuthZ' ? 40 : 56}
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
      </div>
    </div>
  );
};

