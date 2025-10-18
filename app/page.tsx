import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function Home() {
  const session = await getServerSession(authOptions);

  // If user is already logged in, redirect to dashboard
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] to-white">
      {/* Header with Glass Effect */}
      <header className="border-b border-white/20 bg-white/70 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧪</span>
              <span className="text-xl font-bold text-[#033977]">EZTest</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/auth/login"
                className="text-[#656c79] hover:text-[#033977] font-medium text-sm transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className="bg-[#f34923] text-white px-6 py-2.5 rounded-lg hover:bg-[#d63f1f] transition-all font-medium text-sm shadow-lg shadow-[#f34923]/20"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <div className="text-center mb-24 relative">
          {/* Simple Gradient Orb */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#033977]/5 rounded-full blur-3xl -z-10"></div>

          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8 shadow-sm">
            <span className="text-sm font-medium text-[#033977]">✨ Open Source & Self-Hosted</span>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
            Test Management,
            <br />
            <span className="text-[#033977]">Made Simple</span>
          </h1>
          <p className="text-xl text-[#656c79] mb-12 max-w-2xl mx-auto leading-relaxed">
            Lightweight, powerful test management platform that runs on minimal hardware.
            Perfect for teams who want control without complexity.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/auth/register"
              className="bg-[#f34923] text-white px-8 py-4 rounded-xl hover:bg-[#d63f1f] transition-all font-semibold text-base shadow-xl shadow-[#f34923]/30 hover:shadow-2xl hover:shadow-[#f34923]/40 hover:scale-105 transform"
            >
              Start Testing 🚀
            </Link>
            <Link
              href="/auth/login"
              className="bg-white/70 backdrop-blur-sm text-[#656c79] px-8 py-4 rounded-xl hover:bg-white transition-all font-semibold text-base border border-white/20 shadow-lg"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          <div className="group bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/80 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📊</div>
            <h3 className="text-lg font-semibold text-[#033977] mb-2">Multi-Project Support</h3>
            <p className="text-[#656c79] text-sm leading-relaxed">
              Manage multiple projects with role-based access control. Keep everything organized in one place.
            </p>
          </div>

          <div className="group bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/80 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🗂️</div>
            <h3 className="text-lg font-semibold text-[#033977] mb-2">Hierarchical Tests</h3>
            <p className="text-[#656c79] text-sm leading-relaxed">
              Organize tests in hierarchical suites. Create detailed test cases with steps and expected results.
            </p>
          </div>

          <div className="group bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/80 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">▶️</div>
            <h3 className="text-lg font-semibold text-[#033977] mb-2">Test Execution</h3>
            <p className="text-[#656c79] text-sm leading-relaxed">
              Run tests and track results in real-time. Monitor progress with comprehensive dashboards.
            </p>
          </div>

          <div className="group bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/80 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🔗</div>
            <h3 className="text-lg font-semibold text-[#033977] mb-2">Traceability</h3>
            <p className="text-[#656c79] text-sm leading-relaxed">
              Link test cases to requirements. Ensure complete coverage and maintain audit trails.
            </p>
          </div>

          <div className="group bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/80 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">💬</div>
            <h3 className="text-lg font-semibold text-[#033977] mb-2">Collaboration</h3>
            <p className="text-[#656c79] text-sm leading-relaxed">
              Add comments, attach files, and collaborate with your team. Everything in context.
            </p>
          </div>

          <div className="group bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/80 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">⚡</div>
            <h3 className="text-lg font-semibold text-[#033977] mb-2">Lightweight</h3>
            <p className="text-[#656c79] text-sm leading-relaxed">
              Runs efficiently on minimal hardware. 1 core, 2GB RAM is all you need to get started.
            </p>
          </div>
        </div>

        {/* Stats Section with Simple Gradient */}
        <div className="relative rounded-3xl p-12 md:p-16 text-white text-center overflow-hidden bg-gradient-to-br from-[#033977] to-[#044a99]">
          {/* Content */}
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose EZTest? 🤔</h2>
            <p className="text-white/90 text-lg mb-12 max-w-2xl mx-auto">
              Built for teams who value simplicity, control, and open-source freedom
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="group">
                <div className="text-5xl font-bold mb-3 group-hover:scale-110 transition-transform">100%</div>
                <div className="text-white/80 text-sm">Open Source</div>
              </div>
              <div className="group">
                <div className="text-5xl font-bold mb-3 group-hover:scale-110 transition-transform">2GB</div>
                <div className="text-white/80 text-sm">RAM Required</div>
              </div>
              <div className="group">
                <div className="text-5xl font-bold mb-3 group-hover:scale-110 transition-transform">∞</div>
                <div className="text-white/80 text-sm">Projects & Users</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with Glass Effect */}
      <footer className="border-t border-white/20 bg-white/60 backdrop-blur-md mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🧪</span>
              <span className="font-semibold text-[#033977]">EZTest</span>
            </div>
            <p className="text-sm text-[#656c79]">
              Self-hostable test management platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
