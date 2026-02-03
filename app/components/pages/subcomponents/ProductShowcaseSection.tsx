import Image from 'next/image';

interface ShowcaseItem {
  title: string;
  description: string;
  features: string[];
  image: string;
  imageAlt: string;
}

const showcases: ShowcaseItem[] = [
  {
    title: 'Test Case Management',
    description: 'Organize and manage your test cases with ease. Create, edit, and track test cases across modules and test suites.',
    features: [
      'Hierarchical module structure',
      'Test suite organization',
      'Rich text descriptions',
      'Attachment support',
    ],
    image: '/screenshots/TestCase_Detail_Page.png',
    imageAlt: 'Test Case Management Interface',
  },
  {
    title: 'Test Run Execution',
    description: 'Execute test runs efficiently with real-time status tracking, progress monitoring, and detailed results.',
    features: [
      'Real-time execution tracking',
      'Progress visualization',
      'Status management',
      'Result history',
    ],
    image: '/screenshots/TestRun_Detail_Page.png',
    imageAlt: 'Test Run Execution Dashboard',
  },
  {
    title: 'Defect Tracking',
    description: 'Link defects to test cases, track severity and priority, and manage the complete defect lifecycle.',
    features: [
      'Defect-test case linking',
      'Severity and priority tracking',
      'File attachments',
      'Status workflow',
    ],
    image: '/screenshots/Defects_Detail_Page.png',
    imageAlt: 'Defect Tracking Interface',
  },
  {
    title: 'Automation Integration',
    description: 'Integrate your automation test runs with EZTest. Simply configure your test framework, and test run results will automatically update in EZTest after execution.',
    features: [
      'Simple configuration setup',
      'Automatic result updates',
      'Real-time test run sync',
      'No manual intervention needed',
    ],
    image: '/screenshots/Automation_Setup_Wizard_For_Selenium.png',
    imageAlt: 'Automation Integration Setup',
  },
];

export const ProductShowcaseSection = () => {
  return (
    <div className="mb-32 space-y-32">
      {showcases.map((showcase, index) => {
        const isEven = index % 2 === 0;
        return (
          <div
            key={showcase.title}
            className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-16`}
          >
            {/* Content */}
            <div className="flex-1 space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                {showcase.title}
              </h2>
              <p className="text-xl text-white/80 leading-relaxed">
                {showcase.description}
              </p>
              <ul className="space-y-3">
                {showcase.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <svg
                      className="w-6 h-6 text-primary mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-white/90 text-lg">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Screenshot */}
            <div className="flex-1 relative">
              <div className="relative rounded-2xl border border-white/20 bg-white/5 backdrop-blur-xl p-4 shadow-2xl">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-2xl blur opacity-50"></div>
                <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-[#0a1628] to-[#0b1028] border border-white/10">
                  <Image
                    src={showcase.image}
                    alt={showcase.imageAlt}
                    width={1920}
                    height={1080}
                    className="w-full h-auto"
                    priority={index === 0}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

