interface Stat {
  value: string;
  label: string;
  description?: string;
}

const stats: Stat[] = [
  {
    value: '100%',
    label: 'Open Source',
    description: 'Full source code access',
  },
  {
    value: '27',
    label: 'Granular Permissions',
    description: 'Fine-grained access control',
  },
  {
    value: 'Self-Hosted',
    label: 'Your Data, Your Control',
    description: 'Deploy on your infrastructure',
  },
  {
    value: 'Zero',
    label: 'Vendor Lock-in',
    description: 'No proprietary formats',
  },
];

export const StatsSection = () => {
  const gradientStyle = 'conic-gradient(from 45deg, rgba(255, 255, 255, 0.1) 0deg, rgba(255, 255, 255, 0.4) 90deg, rgba(255, 255, 255, 0.1) 180deg, rgba(255, 255, 255, 0.4) 270deg, rgba(255, 255, 255, 0.1) 360deg)';

  return (
    <div className="mb-32">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Built for teams that value
          <br />
          <span className="text-primary">freedom and control</span>
        </h2>
        <p className="text-xl text-white/70 max-w-2xl mx-auto">
          Open source, self-hosted, and fully customizable test management
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-3xl relative transition-all group p-[1px] hover:shadow-xl hover:shadow-primary/10"
            style={{ background: gradientStyle }}
          >
            <div className="relative rounded-3xl h-full" style={{ backgroundColor: '#0a1628' }}>
              <div className="rounded-3xl border-0 bg-transparent overflow-visible flex flex-col h-full py-8 px-6 text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform">
                  {stat.value}
                </div>
                <div className="text-xl font-semibold text-white mb-2">{stat.label}</div>
                {stat.description && (
                  <div className="text-sm text-white/60">{stat.description}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Social Proof */}
      <div className="text-center">
        <p className="text-white/60 mb-6">Join teams that prefer shipping over configuring</p>
        <div className="flex flex-wrap items-center justify-center gap-8 text-white/40">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">Open Source</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm">Self-Hosted</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">Production Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};

